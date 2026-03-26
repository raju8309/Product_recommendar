import json
from pathlib import Path

def create_hybrid_config():
    """
    Create hybrid model configuration file
    Saves configuration to backend/saved_models/
    """
    print("Creating hybrid model configuration...")
    
    # Hybrid model parameters
    config = {
        "collab_weight": 0.6,
        "content_weight": 0.4,
        "rating_threshold": 4.0,
        "default_n_recommendations": 20,
        "max_similar_movies": 10,
        "model_info": {
            "dataset": "MovieLens 1M",
            "collaborative_model": "SVD",
            "content_model": "TF-IDF + Cosine Similarity",
            "total_users": 6040,
            "total_movies": 3706,
            "total_ratings": 1000209
        }
    }
    
    # Save configuration
    models_dir = Path(__file__).parent.parent.parent / "backend" / "saved_models"
    models_dir.mkdir(exist_ok=True)
    
    config_path = models_dir / "hybrid_config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"Hybrid configuration saved to {config_path}")
    print(f"Configuration: {config}")
    
    return config

if __name__ == "__main__":
    config = create_hybrid_config()
    print("Hybrid configuration created! ✅")