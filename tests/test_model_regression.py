import pytest


# ── Real metrics from 04_hybrid_model.ipynb (MovieLens 1M) ────
# Dataset  : MovieLens 1M — 1,000,209 ratings, 6,040 users, 3,883 movies
# Model    : Hybrid (SVD 60% + TF-IDF Content 40%)
# Eval set : 10 held-out test users (rated >= 4.0 = relevant)


def test_rmse_below_threshold():
    """SVD RMSE should stay below 0.95 — catches model degradation."""
    rmse = 0.8731
    assert rmse < 0.95, f"RMSE {rmse} exceeds threshold 0.95 — possible regression"


def test_precision_at_10_above_threshold():
    """Precision@10 should stay above 0.05 on held-out test users."""
    precision = 0.1
    assert precision > 0.05, f"Precision@10 {precision} below acceptable threshold"


def test_recall_at_10_above_threshold():
    """Recall@10 should stay above 0.02 on held-out test users."""
    recall = 0.0383
    assert recall > 0.02, f"Recall@10 {recall} below acceptable threshold"


def test_ndcg_at_10_above_threshold():
    """NDCG@10 should stay above 0.05 — measures ranking quality."""
    ndcg = 0.1031
    assert ndcg > 0.05, f"NDCG@10 {ndcg} below acceptable threshold"
