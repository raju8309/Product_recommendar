const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function getRecommendations(userId, limit = 20) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/recommendations?userId=${userId}&limit=${limit}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}

export async function searchMovies(query) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/search?q=${encodeURIComponent(query)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
}

export async function getMovieDetails(movieId) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/movies/${movieId}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}

export async function rateMovie(userId, movieId, rating) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/users/${userId}/ratings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, rating, timestamp: new Date().toISOString() }),
      }
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error rating movie:', error);
    throw error;
  }
}

export async function markMovieWatched(userId, movieId) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/users/${userId}/watched`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, timestamp: new Date().toISOString() }),
      }
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error marking movie as watched:', error);
    throw error;
  }
}
