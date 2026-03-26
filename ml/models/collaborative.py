import pandas as pd
import numpy as np
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate, train_test_split
import joblib
import os
from pathlib import Path

def train_collaborative_filtering():
    """
    Train SVD collaborative filtering model on MovieLens 1M dataset
    Saves the trained model to backend/saved_models/
    """
    print("Training SVD Collaborative Filtering Model...")
    
    # Load data
    base_dir = Path(__file__).parent.parent.parent / "Data"
    ratings_path = base_dir / "processed" / "ratings.csv"
    
    ratings_df = pd.read_csv(ratings_path)
    print(f"Loaded {len(ratings_df)} ratings")
    
    # Prepare data for Surprise
    reader = Reader(rating_scale=(1, 5))
    data = Dataset.load_from_df(ratings_df[['userId', 'movieId', 'rating']], reader)
    
    # Train SVD model
    print("Training SVD model...")
    svd = SVD(
        n_factors=100,
        n_epochs=20,
        lr_all=0.005,
        reg_all=0.02,
        random_state=42
    )
    
    # Cross-validation
    print("Performing cross-validation...")
    cv_results = cross_validate(
        svd, data, measures=['RMSE', 'MAE'], 
        cv=5, verbose=True
    )
    
    # Train on full dataset
    print("Training on full dataset...")
    trainset = data.build_full_trainset()
    svd.fit(trainset)
    
    # Save model
    models_dir = Path(__file__).parent.parent.parent / "backend" / "saved_models"
    models_dir.mkdir(exist_ok=True)
    
    model_path = models_dir / "svd_model.pkl"
    joblib.dump(svd, model_path)
    print(f"Model saved to {model_path}")
    
    # Print results
    print("\n=== Model Performance ===")
    print(f"RMSE: {cv_results['test_rmse'].mean():.4f} ± {cv_results['test_rmse'].std():.4f}")
    print(f"MAE:  {cv_results['test_mae'].mean():.4f} ± {cv_results['test_mae'].std():.4f}")
    
    return svd, cv_results

if __name__ == "__main__":
    model, results = train_collaborative_filtering()
    print("Collaborative filtering training completed! ✅")