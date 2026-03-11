import joblib
import json
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from cachetools import TTLCache
import os

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "saved_models")
DATA_DIR   = os.path.join(BASE_DIR, "..", "..", "Data", "raw")

# Cache: 610 users, 1 hour TTL
_rec_cache     = TTLCache(maxsize=610, ttl=3600)
_similar_cache = TTLCache(maxsize=1000, ttl=3600)

class RecommenderService:
    def __init__(self):
        print("Loading models... ⏳")
        self._load_models()
        self._load_data()
        print("All models loaded ✅")
        print("Warming up cache... 🔥")
        self._warmup()
        print("Cache warm ✅")

    def _load_models(self):
        self.svd_model     = joblib.load(f"{MODELS_DIR}/svd_model.pkl")
        self.cosine_sim    = joblib.load(f"{MODELS_DIR}/cosine_sim.pkl")
        self.movie_indices = joblib.load(f"{MODELS_DIR}/movie_indices.pkl")
        self.tfidf_matrix  = joblib.load(f"{MODELS_DIR}/tfidf_matrix.pkl")
        with open(f"{MODELS_DIR}/hybrid_config.json") as f:
            self.config = json.load(f)

    def _load_data(self):
        self.ratings = pd.read_csv(f"{DATA_DIR}/ratings.csv")
        self.movies  = pd.read_csv(f"{DATA_DIR}/movies.csv")

    def _warmup(self):
        # Pre-compute recs for first 10 users so first visitors are instant
        for uid in range(1, 11):
            try:
                result = self._compute_hybrid(uid, 20)
                _rec_cache[f"{uid}_20"] = result
            except Exception:
                pass

    def _normalize(self, df, column):
        scaler     = MinMaxScaler()
        df         = df.copy()
        df[column] = scaler.fit_transform(df[[column]])
        return df

    def _get_collaborative_scores(self, user_id):
        rated = self.ratings[
            self.ratings['userId'] == user_id
        ]['movieId'].tolist()

        predictions = []
        for _, row in self.movies.iterrows():
            movie_id = row['movieId']
            if movie_id not in rated:
                pred = self.svd_model.predict(user_id, movie_id).est
                predictions.append({
                    'movieId'     : movie_id,
                    'title'       : row['title'],
                    'collab_score': pred
                })
        return pd.DataFrame(predictions)

    def _get_content_scores(self, user_id):
        liked = (self.ratings[
            (self.ratings['userId'] == user_id) &
            (self.ratings['rating'] >= self.config['rating_threshold'])
        ].merge(self.movies, on='movieId')['title'].tolist())

        watched_ids = self.ratings[
            self.ratings['userId'] == user_id
        ]['movieId'].tolist()

        content_scores = {}
        for liked_title in liked:
            if liked_title not in self.movie_indices:
                continue
            idx        = self.movie_indices[liked_title]
            sim_scores = list(enumerate(self.cosine_sim[idx]))
            for movie_idx, score in sim_scores:
                movie_id = self.movies.iloc[movie_idx]['movieId']
                if movie_id in watched_ids:
                    continue
                if movie_id not in content_scores:
                    content_scores[movie_id] = score
                else:
                    content_scores[movie_id] = max(
                        content_scores[movie_id], score
                    )

        return pd.DataFrame(
            content_scores.items(),
            columns=['movieId', 'content_score']
        )

    def _compute_hybrid(self, user_id: int, n: int = 20):
        cw  = self.config['collab_weight']
        ctw = self.config['content_weight']

        collab  = self._get_collaborative_scores(user_id)
        collab  = self._normalize(collab, 'collab_score')
        content = self._get_content_scores(user_id)
        content = self._normalize(content, 'content_score')

        hybrid  = collab.merge(content, on='movieId', how='left')
        hybrid['content_score'] = hybrid['content_score'].fillna(0)
        hybrid['hybrid_score']  = (
            cw  * hybrid['collab_score'] +
            ctw * hybrid['content_score']
        )

        hybrid = hybrid.sort_values('hybrid_score', ascending=False).head(n)
        hybrid = hybrid.merge(self.movies[['movieId', 'genres']], on='movieId')

        return hybrid[[
            'movieId', 'title', 'genres',
            'collab_score', 'content_score', 'hybrid_score'
        ]].to_dict(orient='records')

    def get_hybrid_recommendations(self, user_id: int, n: int = 20):
        cache_key = f"{user_id}_{n}"
        if cache_key in _rec_cache:
            print(f"Cache HIT for user {user_id} ⚡")
            return _rec_cache[cache_key]

        print(f"Cache MISS for user {user_id} — computing...")
        result = self._compute_hybrid(user_id, n)
        _rec_cache[cache_key] = result
        return result

    def get_similar_movies(self, movie_id: int, n: int = 10):
        cache_key = f"sim_{movie_id}_{n}"
        if cache_key in _similar_cache:
            return _similar_cache[cache_key]

        movie_row = self.movies[self.movies['movieId'] == movie_id]
        if movie_row.empty:
            return []

        title = movie_row.iloc[0]['title']
        if title not in self.movie_indices:
            return []

        idx        = self.movie_indices[title]
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:n+1]

        results = []
        for movie_idx, score in sim_scores:
            row = self.movies.iloc[movie_idx]
            results.append({
                'movieId'     : int(row['movieId']),
                'title'       : row['title'],
                'genres'      : row['genres'],
                'hybrid_score': round(score, 3)
            })

        _similar_cache[cache_key] = results
        return results

    def search_movies(self, query: str, n: int = 10):
        mask    = self.movies['title'].str.contains(query, case=False, na=False)
        results = self.movies[mask].head(n)
        return results[['movieId', 'title', 'genres']].to_dict(orient='records')


# Single instance — loads + warms up on startup
recommender = RecommenderService()