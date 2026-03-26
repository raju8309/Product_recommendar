import pandas as pd
import os
from pathlib import Path

def load_movielens_1m():
    """
    Load MovieLens 1M dataset from .dat files with :: separator
    Returns: ratings_df, movies_df, users_df
    """
    # Define paths
    base_dir = Path(__file__).parent.parent.parent / "Data"
    raw_dir = base_dir / "raw"
    processed_dir = base_dir / "processed"
    
    # Create processed directory if it doesn't exist
    processed_dir.mkdir(exist_ok=True)
    
    print("Loading MovieLens 1M dataset...")
    
    # Load movies.dat
    print("Loading movies...")
    movies_cols = ['movieId', 'title', 'genres']
    movies_df = pd.read_csv(
        raw_dir / 'movies.dat',
        sep='::',
        engine='python',
        names=movies_cols,
        encoding='latin-1'
    )
    print(f"Loaded {len(movies_df)} movies")
    
    # Load ratings.dat
    print("Loading ratings...")
    ratings_cols = ['userId', 'movieId', 'rating', 'timestamp']
    ratings_df = pd.read_csv(
        raw_dir / 'ratings.dat',
        sep='::',
        engine='python',
        names=ratings_cols,
        encoding='latin-1'
    )
    print(f"Loaded {len(ratings_df)} ratings")
    
    # Load users.dat
    print("Loading users...")
    users_cols = ['userId', 'gender', 'age', 'occupation', 'zipcode']
    users_df = pd.read_csv(
        raw_dir / 'users.dat',
        sep='::',
        engine='python',
        names=users_cols,
        encoding='latin-1'
    )
    print(f"Loaded {len(users_df)} users")
    
    # Basic data cleaning and validation
    print("Cleaning data...")
    
    # Ensure data types are correct
    movies_df['movieId'] = movies_df['movieId'].astype(int)
    ratings_df['userId'] = ratings_df['userId'].astype(int)
    ratings_df['movieId'] = ratings_df['movieId'].astype(int)
    ratings_df['rating'] = ratings_df['rating'].astype(float)
    users_df['userId'] = users_df['userId'].astype(int)
    
    # Remove any potential duplicates
    movies_df = movies_df.drop_duplicates(subset=['movieId'])
    ratings_df = ratings_df.drop_duplicates(subset=['userId', 'movieId'])
    users_df = users_df.drop_duplicates(subset=['userId'])
    
    # Save processed files
    print("Saving processed files...")
    movies_df.to_csv(processed_dir / 'movies.csv', index=False)
    ratings_df.to_csv(processed_dir / 'ratings.csv', index=False)
    users_df.to_csv(processed_dir / 'users.csv', index=False)
    
    # Also save to raw directory for backward compatibility with existing code
    movies_df.to_csv(raw_dir / 'movies.csv', index=False)
    ratings_df.to_csv(raw_dir / 'ratings.csv', index=False)
    users_df.to_csv(raw_dir / 'users.csv', index=False)
    
    print(f"Processed files saved to {processed_dir}")
    print(f"Also saved to {raw_dir} for backward compatibility")
    
    # Print dataset statistics
    print("\n=== Dataset Statistics ===")
    print(f"Users: {ratings_df['userId'].nunique()}")
    print(f"Movies: {ratings_df['movieId'].nunique()}")
    print(f"Ratings: {len(ratings_df)}")
    print(f"Rating range: {ratings_df['rating'].min()} - {ratings_df['rating'].max()}")
    print(f"Sparsity: {(1 - len(ratings_df) / (ratings_df['userId'].nunique() * ratings_df['movieId'].nunique())) * 100:.1f}%")
    
    return movies_df, ratings_df, users_df

if __name__ == "__main__":
    movies, ratings, users = load_movielens_1m()
    print("Preprocessing completed successfully! ✅")