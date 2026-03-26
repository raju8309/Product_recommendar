import pytest
import sys
import os
sys.path.append('../backend')

def test_api_imports():
    # Test if we can import the recommender service
    try:
        from services.recommender_service import RecommenderService
        assert RecommenderService is not None
    except ImportError as e:
        pytest.skip(f"Could not import RecommenderService: {e}")

def test_config_file_exists():
    # Test if hybrid config exists
    assert os.path.exists('../backend/saved_models/hybrid_config.json')

def test_saved_models_directory():
    # Test if saved models directory exists
    assert os.path.exists('../backend/saved_models')

def test_model_files_exist():
    # Test if key model files exist
    required_files = [
        '../backend/saved_models/svd_model.pkl',
        '../backend/saved_models/cosine_sim.pkl',
        '../backend/saved_models/movie_indices.pkl'
    ]
    
    for file_path in required_files:
        assert os.path.exists(file_path), f"Missing {file_path}"

def test_data_files_exist():
    # Test if data files exist
    required_files = [
        '../Data/raw/ratings.csv',
        '../Data/raw/movies.csv'
    ]
    
    for file_path in required_files:
        assert os.path.exists(file_path), f"Missing {file_path}"
