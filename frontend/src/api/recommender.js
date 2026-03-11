import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export const getRecommendations = (userId, n = 20) =>
  API.get(`/recommend/${userId}?n=${n}`);

export const getSimilarMovies = (movieId, n = 4) =>
  API.get(`/similar/${movieId}?n=${n}`);

export const searchMovies = (query) =>
  API.get(`/movies/search?query=${query}`);