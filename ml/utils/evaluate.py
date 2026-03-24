import numpy as np
import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate, KFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import time
from pathlib import Path

def precision_at_k(recommended, relevant, k=10):
    recommended_k = recommended[:k]
    hits = len(set(recommended_k) & set(relevant))
    return hits / k

def recall_at_k(recommended, relevant, k=10):
    recommended_k = recommended[:k]
    hits = len(set(recommended_k) & set(relevant))
    return hits / len(relevant) if relevant else 0

def ndcg_at_k(recommended, relevant, k=10):
    recommended_k = recommended[:k]
    dcg = sum([
        1 / np.log2(i + 2)
        for i, movie in enumerate(recommended_k)
        if movie in relevant
    ])
    idcg = sum([1 / np.log2(i + 2) for i in range(min(len(relevant), k))])
    return dcg / idcg if idcg > 0 else 0

def _get_trainset_rated_items(trainset, uid):
    """Return raw itemIds rated by `uid` in the Surprise trainset."""
    inner_uid = trainset.to_inner_uid(uid)
    return {trainset.to_raw_iid(inner_iid) for inner_iid, _ in trainset.ur[inner_uid]}

def _get_trainset_liked_items(trainset, uid, rating_threshold):
    """Return raw itemIds with rating >= threshold in the Surprise trainset."""
    inner_uid = trainset.to_inner_uid(uid)
    return {
        trainset.to_raw_iid(inner_iid)
        for inner_iid, r_ui in trainset.ur[inner_uid]
        if r_ui >= rating_threshold
    }

def _get_testset_relevant_items(testset, uid, rating_threshold):
    """Return raw itemIds in testset where rating >= threshold."""
    relevant = []
    for u, iid, r_ui in testset:
        if u == uid and r_ui >= rating_threshold:
            relevant.append(iid)
    return relevant

def evaluate_collaborative_model(data_path, k=10, cv_folds=5):
    """
    Evaluate collaborative filtering model with comprehensive metrics
    """
    print("Evaluating Collaborative Filtering Model...")
    
    # Load data
    ratings_df = pd.read_csv(data_path)
    rating_min = float(ratings_df["rating"].min())
    rating_max = float(ratings_df["rating"].max())
    reader = Reader(rating_scale=(rating_min, rating_max))
    data = Dataset.load_from_df(ratings_df[['userId', 'movieId', 'rating']], reader)
    
    # Initialize SVD model
    svd = SVD(
        n_factors=100,
        n_epochs=20,
        lr_all=0.005,
        reg_all=0.02,
        random_state=42
    )
    
    # Traditional cross-validation for RMSE/MAE
    print("Running 5-fold cross-validation for RMSE/MAE...")
    cv_results = cross_validate(
        svd, data, measures=['RMSE', 'MAE'], 
        cv=cv_folds, verbose=False
    )
    
    # Custom cross-validation for ranking metrics
    print(f"Running {cv_folds}-fold cross-validation for ranking metrics...")
    kf = KFold(n_splits=cv_folds, random_state=42)
    
    precision_scores = []
    recall_scores = []
    ndcg_scores = []
    
    all_movie_ids = ratings_df["movieId"].unique().tolist()
    rating_threshold = 4.0

    for trainset, testset in kf.split(data):
        # Train model on fold-specific trainset
        svd.fit(trainset)

        # Calculate ranking metrics for each user in the testset
        test_users = {uid for uid, _, _ in testset}
        for uid in test_users:
            relevant_items = _get_testset_relevant_items(testset, uid, rating_threshold)
            if not relevant_items:
                continue

            watched_train = _get_trainset_rated_items(trainset, uid)
            candidates = [mid for mid in all_movie_ids if mid not in watched_train]
            if not candidates:
                continue

            # Score all unseen items and take top-k
            scored = [(mid, svd.predict(uid, mid).est) for mid in candidates]
            scored.sort(key=lambda x: x[1], reverse=True)
            recommended_items = [mid for mid, _ in scored[:k]]

            precision_scores.append(precision_at_k(recommended_items, relevant_items, k))
            recall_scores.append(recall_at_k(recommended_items, relevant_items, k))
            ndcg_scores.append(ndcg_at_k(recommended_items, relevant_items, k))
    
    # Aggregate results
    results = {
        'rmse_mean': cv_results['test_rmse'].mean(),
        'rmse_std': cv_results['test_rmse'].std(),
        'mae_mean': cv_results['test_mae'].mean(),
        'mae_std': cv_results['test_mae'].std(),
        'precision_at_k': np.mean(precision_scores),
        'precision_std': np.std(precision_scores),
        'recall_at_k': np.mean(recall_scores),
        'recall_std': np.std(recall_scores),
        'ndcg_at_k': np.mean(ndcg_scores),
        'ndcg_std': np.std(ndcg_scores)
    }
    
    return results

def evaluate_content_based_model(movies_path, ratings_path, k=10, cv_folds=5):
    """
    Evaluate content-based filtering model with comprehensive metrics
    """
    print("Evaluating Content-Based Filtering Model...")
    
    # Load data
    movies_df = pd.read_csv(movies_path)
    ratings_df = pd.read_csv(ratings_path)
    
    # Prepare features
    movies_df['genres'] = movies_df['genres'].fillna('')
    movies_df['combined_features'] = movies_df['title'] + ' ' + movies_df['genres']
    
    # Create TF-IDF features
    tfidf = TfidfVectorizer(
        stop_words='english',
        max_features=5000,
        ngram_range=(1, 2)
    )
    tfidf_matrix = tfidf.fit_transform(movies_df['combined_features'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    # For fast lookup: MovieId -> cosine_sim row index
    movie_id_to_sim_index = pd.Series(
        movies_df.index.values,
        index=movies_df["movieId"],
    ).drop_duplicates()

    # Cross-validation setup (hold out ratings, not users)
    rating_min = float(ratings_df["rating"].min())
    rating_max = float(ratings_df["rating"].max())
    reader = Reader(rating_scale=(rating_min, rating_max))
    data = Dataset.load_from_df(ratings_df[['userId', 'movieId', 'rating']], reader)
    kf = KFold(n_splits=cv_folds, random_state=42)
    
    precision_scores = []
    recall_scores = []
    ndcg_scores = []
    
    rating_threshold = 4.0
    all_movie_ids = ratings_df["movieId"].unique().tolist()
    n_movies = len(movies_df)

    for trainset, testset in kf.split(data):
        test_users = {uid for uid, _, _ in testset}
        for uid in test_users:
            relevant_items = _get_testset_relevant_items(testset, uid, rating_threshold)
            if not relevant_items:
                continue

            watched_train = _get_trainset_rated_items(trainset, uid)
            liked_train = _get_trainset_liked_items(trainset, uid, rating_threshold)
            if not liked_train:
                # No known preferences in training fold -> skip (can't build content profile)
                continue

            # Score candidates by maximum similarity to any train-liked movie
            content_scores = {}
            for liked_movie_id in liked_train:
                if liked_movie_id not in movie_id_to_sim_index:
                    continue

                idx = movie_id_to_sim_index[liked_movie_id]
                sim_row = cosine_sim[idx]

                # Update scores for all unseen movies
                # (still reasonably fast for ~3700 movies)
                for movie_idx in range(n_movies):
                    rec_movie_id = movies_df.iloc[movie_idx]["movieId"]
                    if rec_movie_id in watched_train:
                        continue
                    score = float(sim_row[movie_idx])
                    content_scores[rec_movie_id] = max(content_scores.get(rec_movie_id, 0.0), score)

            if not content_scores:
                continue

            recommended = sorted(content_scores.keys(), key=lambda x: content_scores[x], reverse=True)[:k]

            precision_scores.append(precision_at_k(recommended, relevant_items, k))
            recall_scores.append(recall_at_k(recommended, relevant_items, k))
            ndcg_scores.append(ndcg_at_k(recommended, relevant_items, k))
    
    results = {
        'precision_at_k': np.mean(precision_scores),
        'precision_std': np.std(precision_scores),
        'recall_at_k': np.mean(recall_scores),
        'recall_std': np.std(recall_scores),
        'ndcg_at_k': np.mean(ndcg_scores),
        'ndcg_std': np.std(ndcg_scores)
    }
    
    return results

def evaluate_hybrid_model(svd_model, cosine_sim, movie_indices, movies_df, ratings_df, config, k=10, cv_folds=5):
    """
    Evaluate hybrid model with comprehensive metrics
    """
    print("Evaluating Hybrid Model...")

    # Cross-validation setup (hold out ratings, not users)
    rating_min = float(ratings_df["rating"].min())
    rating_max = float(ratings_df["rating"].max())
    reader = Reader(rating_scale=(rating_min, rating_max))
    data = Dataset.load_from_df(ratings_df[['userId', 'movieId', 'rating']], reader)
    kf = KFold(n_splits=cv_folds, random_state=42)

    precision_scores = []
    recall_scores = []
    ndcg_scores = []
    
    cw = config['collab_weight']
    ctw = config['content_weight']

    rating_threshold = config.get("rating_threshold", 4.0)
    all_movie_ids = ratings_df["movieId"].unique().tolist()
    n_movies = len(movies_df)

    # For fast lookup: MovieId -> cosine_sim row index
    movie_id_to_sim_index = pd.Series(
        movies_df.index.values,
        index=movies_df["movieId"],
    ).drop_duplicates()

    for trainset, testset in kf.split(data):
        # Train collaborative model on fold-specific train ratings
        svd_model.fit(trainset)

        test_users = {uid for uid, _, _ in testset}
        for uid in test_users:
            relevant_items = _get_testset_relevant_items(testset, uid, rating_threshold)
            if not relevant_items:
                continue

            watched_train = _get_trainset_rated_items(trainset, uid)
            liked_train = _get_trainset_liked_items(trainset, uid, rating_threshold)
            if not liked_train:
                continue

            candidates = [mid for mid in all_movie_ids if mid not in watched_train]
            if not candidates:
                continue

            # Collaborative: score all unseen items
            collab_scores = {mid: float(svd_model.predict(uid, mid).est) for mid in candidates}

            # Content: score unseen items from the fold's train-liked history
            content_scores = {}
            for liked_movie_id in liked_train:
                if liked_movie_id not in movie_id_to_sim_index:
                    continue
                idx = movie_id_to_sim_index[liked_movie_id]
                sim_row = cosine_sim[idx]

                for movie_idx in range(n_movies):
                    rec_movie_id = movies_df.iloc[movie_idx]["movieId"]
                    if rec_movie_id in watched_train:
                        continue
                    score = float(sim_row[movie_idx])
                    content_scores[rec_movie_id] = max(content_scores.get(rec_movie_id, 0.0), score)

            if not content_scores:
                continue

            # Normalize both score sets to [0, 1] using fold-specific min/max
            collab_vals = np.array(list(collab_scores.values()), dtype=float)
            content_vals = np.array(list(content_scores.values()), dtype=float)
            collab_min, collab_max = float(collab_vals.min()), float(collab_vals.max())
            content_min, content_max = float(content_vals.min()), float(content_vals.max())

            def _norm(val, vmin, vmax):
                return 0.0 if vmax <= vmin else (val - vmin) / (vmax - vmin)

            hybrid_scores = {}
            for mid in candidates:
                c_score = collab_scores.get(mid, 0.0)
                t_score = content_scores.get(mid, 0.0)
                hybrid_scores[mid] = (
                    cw * _norm(c_score, collab_min, collab_max) +
                    ctw * _norm(t_score, content_min, content_max)
                )

            recommended = sorted(hybrid_scores.keys(), key=lambda x: hybrid_scores[x], reverse=True)[:k]

            precision_scores.append(precision_at_k(recommended, relevant_items, k))
            recall_scores.append(recall_at_k(recommended, relevant_items, k))
            ndcg_scores.append(ndcg_at_k(recommended, relevant_items, k))
    
    results = {
        'precision_at_k': np.mean(precision_scores),
        'precision_std': np.std(precision_scores),
        'recall_at_k': np.mean(recall_scores),
        'recall_std': np.std(recall_scores),
        'ndcg_at_k': np.mean(ndcg_scores),
        'ndcg_std': np.std(ndcg_scores)
    }
    
    return results

def print_evaluation_results(model_name, results, k=10):
    """
    Print evaluation results in a formatted way
    """
    print(f"\n=== {model_name} Performance ===")
    
    if 'rmse_mean' in results:
        print(f"RMSE: {results['rmse_mean']:.4f} ± {results['rmse_std']:.4f}")
        print(f"MAE:  {results['mae_mean']:.4f} ± {results['mae_std']:.4f}")
    
    print(f"Precision@{k}: {results['precision_at_k']:.4f} ± {results['precision_std']:.4f}")
    print(f"Recall@{k}:    {results['recall_at_k']:.4f} ± {results['recall_std']:.4f}")
    print(f"NDCG@{k}:     {results['ndcg_at_k']:.4f} ± {results['ndcg_std']:.4f}")
    print()

if __name__ == "__main__":
    # Test the evaluation functions
    print("Testing evaluation functions...")
    
    # Example usage
    recommended = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    relevant = [1, 3, 5, 7, 9]
    
    print(f"Precision@10: {precision_at_k(recommended, relevant, 10):.4f}")
    print(f"Recall@10: {recall_at_k(recommended, relevant, 10):.4f}")
    print(f"NDCG@10: {ndcg_at_k(recommended, relevant, 10):.4f}")