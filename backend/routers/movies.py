from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sys
import os

# ============================================
# FIX: Add parent directory to path
# ============================================
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Now try to import your backend modules
try:
    from backend.routers import recommendations, movies
    from backend.services import recommender_service
    BACKEND_AVAILABLE = True
    print("✅ Backend modules loaded successfully")
except ImportError as e:
    print(f"⚠️  Backend modules not available: {e}")
    BACKEND_AVAILABLE = False

app = FastAPI(
    title="Movie Recommender API",
    description="Movie recommendation system with hybrid ML engine",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# PYDANTIC MODELS
# ============================================

class Movie(BaseModel):
    movieId: int
    title: str
    genres: str
    releaseYear: Optional[int] = None
    runtime: Optional[int] = None
    director: Optional[str] = None
    plotSummary: Optional[str] = None
    imdbScore: Optional[float] = None
    imdbVotes: Optional[int] = None
    hybrid_score: Optional[float] = None

class UserRating(BaseModel):
    movieId: int
    rating: float
    timestamp: Optional[str] = None

class WatchedMovie(BaseModel):
    movieId: int
    timestamp: Optional[str] = None

# ============================================
# FALLBACK SAMPLE DATA
# ============================================

FALLBACK_MOVIES = [
    {
        "movieId": 1,
        "title": "The Shawshank Redemption",
        "genres": "Drama|Crime",
        "releaseYear": 1994,
        "runtime": 142,
        "director": "Frank Darabont",
        "plotSummary": "Two imprisoned men bond over years, finding redemption through acts of common decency.",
        "imdbScore": 9.3,
        "imdbVotes": 2500000,
        "hybrid_score": 0.95
    },
    {
        "movieId": 2,
        "title": "The Godfather",
        "genres": "Drama|Crime",
        "releaseYear": 1972,
        "runtime": 175,
        "director": "Francis Ford Coppola",
        "plotSummary": "The aging patriarch of an organized crime dynasty transfers control to his youngest son.",
        "imdbScore": 9.2,
        "imdbVotes": 1800000,
        "hybrid_score": 0.93
    },
    {
        "movieId": 3,
        "title": "The Dark Knight",
        "genres": "Action|Crime|Drama",
        "releaseYear": 2008,
        "runtime": 152,
        "director": "Christopher Nolan",
        "plotSummary": "When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests.",
        "imdbScore": 9.0,
        "imdbVotes": 2600000,
        "hybrid_score": 0.92
    },
    {
        "movieId": 4,
        "title": "Pulp Fiction",
        "genres": "Crime|Drama",
        "releaseYear": 1994,
        "runtime": 154,
        "director": "Quentin Tarantino",
        "plotSummary": "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine.",
        "imdbScore": 8.9,
        "imdbVotes": 1900000,
        "hybrid_score": 0.90
    },
    {
        "movieId": 5,
        "title": "Forrest Gump",
        "genres": "Drama|Romance",
        "releaseYear": 1994,
        "runtime": 142,
        "director": "Robert Zemeckis",
        "plotSummary": "Kennedy and Johnson presidencies unfold from an Alabama man's perspective.",
        "imdbScore": 8.8,
        "imdbVotes": 1800000,
        "hybrid_score": 0.88
    },
]

# In-memory storage
user_ratings = {}
user_watched = {}

# ============================================
# HEALTH CHECK ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Movie Recommender API is running",
        "version": "1.0.0",
        "status": "healthy",
        "backend_status": "connected" if BACKEND_AVAILABLE else "using fallback",
        "endpoints": {
            "health": "/health",
            "recommendations": "/api/recommendations",
            "search": "/api/search",
            "movies": "/api/movies",
            "top_rated": "/api/movies/top-rated",
            "genres": "/api/genres",
            "stats": "/api/stats"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "API is running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "backend_available": BACKEND_AVAILABLE
    }

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_movies_data():
    """Get movies from backend or fallback"""
    if BACKEND_AVAILABLE:
        try:
            return recommender_service.get_all_movies()
        except Exception as e:
            print(f"Error loading from backend: {e}")
            return FALLBACK_MOVIES
    return FALLBACK_MOVIES

def get_movie_recommendations(user_id: int, limit: int = 20):
    """Get recommendations from backend or fallback"""
    if BACKEND_AVAILABLE:
        try:
            return recommender_service.get_recommendations(user_id, limit)
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            movies = get_movies_data()
            return sorted(movies, key=lambda x: x.get('hybrid_score', 0), reverse=True)[:limit]
    
    movies = get_movies_data()
    return sorted(movies, key=lambda x: x.get('hybrid_score', 0), reverse=True)[:limit]

# ============================================
# RECOMMENDATION ENDPOINTS
# ============================================

@app.get("/api/recommendations")
async def get_recommendations(userId: int = Query(1, ge=1, le=6040), limit: int = Query(20, ge=1, le=100)):
    """Get personalized movie recommendations for a user"""
    try:
        recommendations = get_movie_recommendations(userId, limit)
        
        return {
            "data": {
                "userId": userId,
                "recommendations": recommendations,
                "count": len(recommendations),
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search")
async def search_movies(q: str = Query("", min_length=1)):
    """Search movies by title"""
    try:
        if not q:
            return {"data": []}
        
        query = q.lower().strip()
        movies = get_movies_data()
        results = [
            movie for movie in movies
            if query in movie["title"].lower()
        ]
        
        return {
            "data": results,
            "count": len(results),
            "query": q
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# MOVIE ENDPOINTS
# ============================================

@app.get("/api/movies")
async def get_all_movies(limit: int = Query(100, ge=1, le=1000)):
    """Get all movies"""
    try:
        movies = get_movies_data()
        return {
            "data": movies[:limit],
            "count": len(movies[:limit]),
            "total": len(movies)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/movies/{movie_id}")
async def get_movie_details(movie_id: int):
    """Get details for a specific movie"""
    try:
        movies = get_movies_data()
        movie = next((m for m in movies if m.get("movieId") == movie_id), None)
        if not movie:
            raise HTTPException(status_code=404, detail=f"Movie {movie_id} not found")
        return {"data": movie}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/movies/top-rated")
async def get_top_rated(limit: int = Query(20, ge=1, le=100)):
    """Get top-rated movies"""
    try:
        movies = get_movies_data()
        sorted_movies = sorted(
            movies,
            key=lambda x: x.get('imdbScore', 0),
            reverse=True
        )
        return {
            "data": sorted_movies[:limit],
            "count": len(sorted_movies[:limit])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/movies/new-releases")
async def get_new_releases(limit: int = Query(20, ge=1, le=100)):
    """Get newest releases"""
    try:
        movies = get_movies_data()
        sorted_movies = sorted(
            movies,
            key=lambda x: x.get('releaseYear', 0),
            reverse=True
        )
        return {
            "data": sorted_movies[:limit],
            "count": len(sorted_movies[:limit])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# GENRE ENDPOINTS
# ============================================

@app.get("/api/genres")
async def get_genres():
    """Get all available genres"""
    try:
        movies = get_movies_data()
        genres_set = set()
        for movie in movies:
            if "genres" in movie:
                genres = movie["genres"].split("|")
                genres_set.update(genres)
        
        return {
            "data": sorted(list(genres_set)),
            "count": len(genres_set)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/movies/by-genre/{genre}")
async def get_movies_by_genre(genre: str, limit: int = Query(20, ge=1, le=100)):
    """Get movies by specific genre"""
    try:
        genre_lower = genre.lower()
        movies = get_movies_data()
        results = [
            m for m in movies
            if genre_lower in m.get("genres", "").lower()
        ]
        
        return {
            "data": results[:limit],
            "count": len(results[:limit]),
            "total": len(results),
            "genre": genre
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# USER RATING ENDPOINTS
# ============================================

@app.post("/api/users/{user_id}/ratings")
async def rate_movie(user_id: int, rating: UserRating):
    """Rate a movie"""
    try:
        if user_id not in user_ratings:
            user_ratings[user_id] = {}
        
        user_ratings[user_id][rating.movieId] = {
            "rating": rating.rating,
            "timestamp": rating.timestamp or datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": f"Rated movie {rating.movieId} with {rating.rating} stars",
            "data": {
                "userId": user_id,
                "movieId": rating.movieId,
                "rating": rating.rating
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}/ratings")
async def get_user_ratings(user_id: int):
    """Get all ratings for a user"""
    try:
        ratings = user_ratings.get(user_id, {})
        return {
            "data": {
                "userId": user_id,
                "ratings": ratings,
                "count": len(ratings)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# USER WATCHED ENDPOINTS
# ============================================

@app.post("/api/users/{user_id}/watched")
async def mark_watched(user_id: int, watched: WatchedMovie):
    """Mark a movie as watched"""
    try:
        if user_id not in user_watched:
            user_watched[user_id] = []
        
        if watched.movieId not in [m["movieId"] for m in user_watched[user_id]]:
            user_watched[user_id].append({
                "movieId": watched.movieId,
                "timestamp": watched.timestamp or datetime.now().isoformat()
            })
        
        return {
            "success": True,
            "message": f"Marked movie {watched.movieId} as watched",
            "data": {
                "userId": user_id,
                "movieId": watched.movieId
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}/watched")
async def get_watched_movies(user_id: int):
    """Get all watched movies for a user"""
    try:
        watched = user_watched.get(user_id, [])
        return {
            "data": {
                "userId": user_id,
                "watched": watched,
                "count": len(watched)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# STATS ENDPOINTS
# ============================================

@app.get("/api/stats")
async def get_stats():
    """Get API statistics"""
    try:
        movies = get_movies_data()
        genres_set = set()
        for movie in movies:
            if "genres" in movie:
                genres = movie["genres"].split("|")
                genres_set.update(genres)
        
        return {
            "data": {
                "totalMovies": len(movies),
                "totalGenres": len(genres_set),
                "totalUsers": len(user_ratings),
                "totalRatings": sum(len(ratings) for ratings in user_ratings.values()),
                "totalWatched": sum(len(watched) for watched in user_watched.values()),
                "timestamp": datetime.now().isoformat(),
                "backendStatus": "connected" if BACKEND_AVAILABLE else "fallback"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# INCLUDE ROUTERS (if available)
# ============================================

if BACKEND_AVAILABLE:
    try:
        app.include_router(movies.router, prefix="/api", tags=["movies"])
        print("✅ Movies router included")
    except Exception as e:
        print(f"⚠️  Could not include movies router: {e}")
    
    try:
        app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])
        print("✅ Recommendations router included")
    except Exception as e:
        print(f"⚠️  Could not include recommendations router: {e}")

# ============================================
# RUN
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )