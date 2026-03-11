from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import recommendations, movies

app = FastAPI(
    title       = "Product Recommender API",
    description = "Hybrid ML recommendation system",
    version     = "1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["http://localhost:3000"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

app.include_router(recommendations.router, tags=["Recommendations"])
app.include_router(movies.router,          tags=["Movies"])

@app.get("/")
def root():
    return {
        "status" : "running ✅",
        "message": "Product Recommender API"
    }

@app.get("/health")
def health():
    return {"status": "healthy ✅"}