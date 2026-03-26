# REC.AI — Hybrid ML Product Recommendation System

> AI-powered e-commerce recommendation engine using SVD Collaborative Filtering + TF-IDF Content-Based filtering

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)
![React](https://img.shields.io/badge/React-18-blue)
![RMSE](https://img.shields.io/badge/RMSE-0.87-orange)

## 🤖 ML Model Performance
| Metric   | Score  |
|----------|--------|
| RMSE     | 0.8736 |
| MAE      | 0.6858 |
| CV Folds | 5      |
| Std Dev  | 0.0011 |

## 🛠 Tech Stack
| Layer    | Tech                                  |
|----------|---------------------------------------|
| ML       | scikit-surprise, scikit-learn, pandas |
| Backend  | FastAPI, Python 3.11, cachetools      |
| Frontend | React 18, Axios                       |

## 📁 Project Structure
```
product-recommender/
├── ml/
│   ├── notebooks/       ← EDA, collaborative, content-based, hybrid notebooks
│   ├── models/          ← collaborative.py, content_based.py, hybrid.py
│   └── utils/           ← preprocess.py, evaluate.py
├── backend/
│   ├── main.py
│   ├── routers/         ← recommendations.py, movies.py
│   ├── schemas/         ← recommendation.py
│   └── services/        ← recommender_service.py
└── frontend/
    └── src/
        ├── api/         ← recommender.js
        └── components/  ← Navbar, Hero, ProductGrid, ProductCard, ProductDetail, Cart
```

## 🚀 Run Locally

### Backend
```bash
python -m venv product-recommender-env
source product-recommender-env/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📡 API Endpoints
| Method | Endpoint                  | Description                    |
|--------|---------------------------|--------------------------------|
| GET    | /recommend/{user_id}?n=20 | Hybrid top-N recommendations   |
| GET    | /similar/{movie_id}?n=4   | Content-based similar items    |
| GET    | /movies/search?query=     | Search movies                  |
| GET    | /health                   | Health check                   |

## 🏗 Architecture
```
User Request
     ↓
React Frontend (port 3000)
     ↓ axios
FastAPI Backend (port 8000)
     ↓ cache check (cachetools TTL 1hr)
     ↓ cache miss → compute
SVD Model + TF-IDF Cosine Similarity
     ↓
Hybrid Score = 0.6 × collab + 0.4 × content
     ↓
Top-N Results → cached → returned
```

## 💡 Key Features
- Hybrid ML engine combining collaborative and content-based filtering
- TTL caching for fast repeated requests (~50ms cache hits)
- Startup warmup for users 1-20
- E-commerce UI with category filters, cart, product detail page
- 6,040 user profiles, 3,883 products, 1M+ ratings
