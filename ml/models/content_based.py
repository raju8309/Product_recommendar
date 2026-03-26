import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import json
from pathlib import Path

def train_content_based():
    """
    Train TF-IDF content-based filtering model on MovieLens 1M dataset
    Saves the trained model components to backend/saved_models/
    """
    print("Training TF-IDF Content-Based Filtering Model...")
    
    # Load data
    base_dir = Path(__file__).parent.parent.parent / "Data"
    movies_path = base_dir / "processed" / "movies.csv"
    
    movies_df = pd.read_csv(movies_path)
    print(f"Loaded {len(movies_df)} movies")
    
    # Preprocess genres - create a combined text feature
    movies_df['genres'] = movies_df['genres'].fillna('')
    movies_df['combined_features'] = movies_df['title'] + ' ' + movies_df['genres']
    
    # Create TF-IDF vectorizer
    print("Creating TF-IDF features...")
    tfidf = TfidfVectorizer(
        stop_words='english',
        max_features=5000,
        ngram_range=(1, 2)
    )
    
    # Fit and transform the combined features
    tfidf_matrix = tfidf.fit_transform(movies_df['combined_features'])
    print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
    
    # Compute cosine similarity matrix
    print("Computing cosine similarity matrix...")
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    print(f"Cosine similarity matrix shape: {cosine_sim.shape}")
    
    # Create movie title to index mapping
    movie_indices = pd.Series(
        movies_df.index, 
        index=movies_df['title']
    ).drop_duplicates()
    
    # Save model components
    models_dir = Path(__file__).parent.parent.parent / "backend" / "saved_models"
    models_dir.mkdir(exist_ok=True)
    
    # Save all components
    joblib.dump(tfidf, models_dir / "tfidf_vectorizer.pkl")
    joblib.dump(tfidf_matrix, models_dir / "tfidf_matrix.pkl")
    joblib.dump(cosine_sim, models_dir / "cosine_sim.pkl")
    joblib.dump(movie_indices, models_dir / "movie_indices.pkl")
    
    # Save movie data for reference
    movies_df.to_csv(models_dir / "movies_data.csv", index=False)
    
    print(f"Model components saved to {models_dir}")
    
    # Test the model with a sample movie
    test_movie_title = movies_df['title'].iloc[0]
    if test_movie_title in movie_indices:
        idx = movie_indices[test_movie_title]
        sim_scores = list(enumerate(cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        top_similar = sim_scores[1:6]  # Top 5 similar movies (excluding itself)
        
        print(f"\n=== Sample Recommendations for: {test_movie_title} ===")
        for i, (movie_idx, score) in enumerate(top_similar, 1):
            similar_movie_title = movies_df.iloc[movie_idx]['title']
            print(f"{i}. {similar_movie_title} (similarity: {score:.3f})")
    
    print("\n=== Model Info ===")
    print(f"TF-IDF features: {tfidf_matrix.shape[1]}")
    print(f"Movies in dataset: {len(movies_df)}")
    print(f"Average non-zero features per movie: {tfidf_matrix.nnz / len(movies_df):.1f}")
    
    return tfidf, tfidf_matrix, cosine_sim, movie_indices, movies_df

if __name__ == "__main__":
    tfidf, tfidf_matrix, cosine_sim, movie_indices, movies_df = train_content_based()
    print("Content-based filtering training completed! ✅")