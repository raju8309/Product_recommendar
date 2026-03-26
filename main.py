from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

app = FastAPI(title="Movie Recommender API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRating(BaseModel):
    movieId: int
    rating: float
    timestamp: Optional[str] = None

class WatchedMovie(BaseModel):
    movieId: int
    timestamp: Optional[str] = None

MOVIES = [
    {
        "movieId": 1,
        "title": "The Shawshank Redemption (1994)",
        "genres": "Drama|Crime",
        "releaseYear": 1994,
        "runtime": 142,
        "director": "Frank Darabont",
        "imdbScore": 9.3,
        "hybrid_score": 0.95,
        "poster": "https://picsum.photos/seed/shawshank/300/450.jpg",
        "plot": "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
    },
    {
        "movieId": 2,
        "title": "The Godfather (1972)",
        "genres": "Drama|Crime",
        "releaseYear": 1972,
        "runtime": 175,
        "director": "Francis Ford Coppola",
        "imdbScore": 9.2,
        "hybrid_score": 0.93,
        "poster": "https://picsum.photos/seed/godfather/300/450.jpg",
        "plot": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his youngest son."
    },
    {
        "movieId": 3,
        "title": "The Dark Knight (2008)",
        "genres": "Action|Crime|Drama",
        "releaseYear": 2008,
        "runtime": 152,
        "director": "Christopher Nolan",
        "imdbScore": 9.0,
        "hybrid_score": 0.92,
        "poster": "https://picsum.photos/seed/darkknight/300/450.jpg",
        "plot": "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests to fight injustice."
    },
    {
        "movieId": 4,
        "title": "Pulp Fiction (1994)",
        "genres": "Crime|Drama",
        "releaseYear": 1994,
        "runtime": 154,
        "director": "Quentin Tarantino",
        "imdbScore": 8.9,
        "hybrid_score": 0.90,
        "poster": "https://picsum.photos/seed/pulpfiction/300/450.jpg",
        "plot": "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption."
    },
    {
        "movieId": 5,
        "title": "Forrest Gump (1994)",
        "genres": "Drama|Romance",
        "releaseYear": 1994,
        "runtime": 142,
        "director": "Robert Zemeckis",
        "imdbScore": 8.8,
        "hybrid_score": 0.88,
        "poster": "https://picsum.photos/seed/forrestgump/300/450.jpg",
        "plot": "The presidencies of Kennedy and Johnson unfold from the perspective of an Alabama man with an IQ of 75."
    },
    {
        "movieId": 6,
        "title": "Inception (2010)",
        "genres": "Action|Sci-Fi|Thriller",
        "releaseYear": 2010,
        "runtime": 148,
        "director": "Christopher Nolan",
        "imdbScore": 8.8,
        "hybrid_score": 0.89,
        "poster": "https://picsum.photos/seed/inception/300/450.jpg",
        "plot": "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea."
    },
    {
        "movieId": 7,
        "title": "The Matrix (1999)",
        "genres": "Action|Sci-Fi",
        "releaseYear": 1999,
        "runtime": 136,
        "director": "The Wachowskis",
        "imdbScore": 8.7,
        "hybrid_score": 0.87,
        "poster": "https://picsum.photos/seed/matrix/300/450.jpg",
        "plot": "A computer programmer discovers that reality as he knows it is a simulation created by machines to distract humans."
    },
    {
        "movieId": 8,
        "title": "Goodfellas (1990)",
        "genres": "Crime|Drama",
        "releaseYear": 1990,
        "runtime": 146,
        "director": "Martin Scorsese",
        "imdbScore": 8.7,
        "hybrid_score": 0.86,
        "poster": "https://picsum.photos/seed/goodfellas/300/450.jpg",
        "plot": "The story of Henry Hill and his life in the mob, covering his relationship with his wife and his mob partners."
    },
    {
        "movieId": 9,
        "title": "The Silence of the Lambs (1991)",
        "genres": "Crime|Drama|Thriller",
        "releaseYear": 1991,
        "runtime": 118,
        "director": "Jonathan Demme",
        "imdbScore": 8.6,
        "hybrid_score": 0.85,
        "poster": "https://picsum.photos/seed/silencelambs/300/450.jpg",
        "plot": "A young FBI cadet must receive the help of an incarcerated cannibal killer to help catch another serial killer."
    },
    {
        "movieId": 10,
        "title": "Interstellar (2014)",
        "genres": "Adventure|Drama|Sci-Fi",
        "releaseYear": 2014,
        "runtime": 169,
        "director": "Christopher Nolan",
        "imdbScore": 8.7,
        "hybrid_score": 0.87,
        "poster": "https://picsum.photos/seed/interstellar/300/450.jpg",
        "plot": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    },
]

user_ratings = {}
user_watched = {}

@app.get("/")
def root():
    return {"message": "Movie Recommender API is running", "version": "1.0.0", "status": "healthy"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/recommendations")
def get_recommendations(userId: int = Query(1), limit: int = Query(20)):
    sorted_movies = sorted(MOVIES, key=lambda x: x.get('hybrid_score', 0), reverse=True)
    return {"data": {"userId": userId, "recommendations": sorted_movies[:limit], "count": len(sorted_movies[:limit])}}

@app.get("/api/search")
def search_movies(q: str = Query("")):
    if not q:
        return {"data": []}
    query = q.lower()
    results = [m for m in MOVIES if query in m["title"].lower()]
    return {"data": results, "count": len(results)}

@app.get("/api/movies")
def get_all_movies(limit: int = Query(100)):
    return {"data": MOVIES[:limit], "count": len(MOVIES[:limit]), "total": len(MOVIES)}

@app.get("/api/movies/{movie_id}")
def get_movie(movie_id: int):
    movie = next((m for m in MOVIES if m["movieId"] == movie_id), None)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return {"data": movie}

@app.get("/api/users/{user_id}/ratings")
def get_user_ratings(user_id: int):
    return {"data": user_ratings.get(user_id, [])}

@app.post("/api/users/{user_id}/ratings")
def add_user_rating(user_id: int, rating: UserRating):
    if user_id not in user_ratings:
        user_ratings[user_id] = []
    user_ratings[user_id].append({"movieId": rating.movieId, "rating": rating.rating, "timestamp": rating.timestamp})
    return {"message": "Rating added successfully", "data": {"userId": user_id, "movieId": rating.movieId, "rating": rating.rating}}

@app.get("/api/users/{user_id}/watched")
def get_user_watched(user_id: int):
    return {"data": user_watched.get(user_id, [])}

@app.post("/api/users/{user_id}/watched")
def add_user_watched(user_id: int, movie: WatchedMovie):
    if user_id not in user_watched:
        user_watched[user_id] = []
    user_watched[user_id].append({"movieId": movie.movieId, "timestamp": movie.timestamp})
    return {"message": "Movie marked as watched successfully", "data": {"userId": user_id, "movieId": movie.movieId}}

@app.get("/api/genres")
def get_genres():
    all_genres = set()
    for movie in MOVIES:
        genres = movie.get("genres", "").split("|")
        all_genres.update(genres)
    return {"data": sorted(list(all_genres))}

@app.get("/api/stats")
def get_stats():
    total_movies = len(MOVIES)
    avg_rating = sum(m.get("imdbScore", 0) for m in MOVIES) / total_movies
    return {
        "data": {
            "totalMovies": total_movies,
            "totalUsers": len(user_ratings) + len(user_watched),
            "totalRatings": sum(len(ratings) for ratings in user_ratings.values()),
            "avgRating": round(avg_rating, 2),
            "totalGenres": len(set(g.split("|") for m in MOVIES for g in m.get("genres", "").split("|")))
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
