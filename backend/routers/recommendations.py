from fastapi import APIRouter, HTTPException
from backend.schemas.recommendation import (
    RecommendationResponse,
    SimilarMoviesResponse,
    MovieRecommendation
)
from backend.services.recommender_service import recommender

router = APIRouter()

@router.get("/recommend/{user_id}", response_model=RecommendationResponse)
def get_recommendations(user_id: int, n: int = 20):
    try:
        recs = recommender.get_hybrid_recommendations(user_id, n)
        return RecommendationResponse(
            user_id         = user_id,
            recommendations = [MovieRecommendation(**r) for r in recs],
            total           = len(recs)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/similar/{movie_id}", response_model=SimilarMoviesResponse)
def get_similar_movies(movie_id: int, n: int = 10):
    try:
        movie_row = recommender.movies[
            recommender.movies['movieId'] == movie_id
        ]
        if movie_row.empty:
            raise HTTPException(status_code=404, detail="Movie not found")

        similar = recommender.get_similar_movies(movie_id, n)
        return SimilarMoviesResponse(
            movie_id       = movie_id,
            title          = movie_row.iloc[0]['title'],
            similar_movies = [MovieRecommendation(**m) for m in similar],
            total          = len(similar)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))