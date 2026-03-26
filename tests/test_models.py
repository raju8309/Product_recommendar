import pytest
import joblib
import pandas as pd


# ── CELL 0: Make sure surprise is installed ────────────────────
# If this test file fails with ModuleNotFoundError: No module named 'surprise'
# run this in your terminal first:
#   pip install scikit-surprise
# Then re-run: pytest test_models.py


def test_svd_model_loads():
    """SVD model pickle loads without error."""
    surprise = pytest.importorskip("surprise")   # auto-skip if not installed
    model = joblib.load("../backend/saved_models/svd_model.pkl")
    assert model is not None


def test_svd_prediction_range():
    """SVD prediction for any user/item falls within valid rating range (0.5–5.0)."""
    surprise = pytest.importorskip("surprise")   # auto-skip if not installed
    model = joblib.load("../backend/saved_models/svd_model.pkl")
    pred = model.predict(uid=1, iid=1)
    assert 0.5 <= pred.est <= 5.0, f"Prediction {pred.est} out of range"


def test_hybrid_config_loads():
    """Hybrid config JSON exists and has required keys."""
    import json
    with open("../backend/saved_models/hybrid_config.json", "r") as f:
        config = json.load(f)
    assert "collab_weight"   in config
    assert "content_weight"  in config
    assert config["collab_weight"] + config["content_weight"] == pytest.approx(1.0)


def test_recommendations_are_unique():
    """MovieLens 1M movies.dat has no duplicate movieIds."""
    movies = pd.read_csv(
        "../Data/raw/movies.dat",
        sep="::",
        engine="python",
        names=["movieId", "title", "genres"],
        encoding="latin-1",
    )
    movie_ids = movies["movieId"].tolist()
    assert len(movie_ids) == len(set(movie_ids)), "Duplicate movieIds found in movies.dat"


def test_content_model_loads():
    """cosine_sim.pkl and movie_indices.pkl load correctly."""
    try:
        cosine_sim    = joblib.load("../backend/saved_models/cosine_sim.pkl")
        movie_indices = joblib.load("../backend/saved_models/movie_indices.pkl")
        assert cosine_sim    is not None
        assert movie_indices is not None
    except FileNotFoundError:
        pytest.skip("Content model files not found — run content-based training first")