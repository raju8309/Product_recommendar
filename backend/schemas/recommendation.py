from pydantic import BaseModel
from typing import List, Optional

class MovieRecommendation(BaseModel):
    movieId       : int
    title         : str
    genres        : str
    hybrid_score  : Optional[float] = None
    collab_score  : Optional[float] = None
    content_score : Optional[float] = None

class RecommendationResponse(BaseModel):
    user_id         : int
    recommendations : List[MovieRecommendation]
    total           : int

class SimilarMoviesResponse(BaseModel):
    movie_id       : int
    title          : str
    similar_movies : List[MovieRecommendation]
    total          : int

class MovieSearchResult(BaseModel):
    movieId : int
    title   : str
    genres  : str