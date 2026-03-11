from fastapi import APIRouter, HTTPException
from typing import List
from backend.schemas.recommendation import MovieSearchResult
from backend.services.recommender_service import recommender

router = APIRouter()

@router.get("/movies/search", response_model=List[MovieSearchResult])
def search_movies(query: str, n: int = 10):
    if not query or len(query) < 2:
        raise HTTPException(
            status_code=400,
            detail="Query must be at least 2 characters"
        )
    results = recommender.search_movies(query, n)
    return [MovieSearchResult(**r) for r in results]


@router.get("/movies/{movie_id}", response_model=MovieSearchResult)
def get_movie(movie_id: int):
    movie = recommender.movies[
        recommender.movies['movieId'] == movie_id
    ]
    if movie.empty:
        raise HTTPException(status_code=404, detail="Movie not found")

    row = movie.iloc[0]
    return MovieSearchResult(
        movieId = int(row['movieId']),
        title   = row['title'],
        genres  = row['genres']
    )