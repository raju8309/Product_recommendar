import React, { useState, useEffect } from 'react';
import { getRecommendations, searchMovies } from '../api/recommender';
import MovieCard from './MovieCard';

const GENRE_FILTERS = [
  { label: 'All', value: 'All' },
  { label: 'Action', value: 'Action' },
  { label: 'Comedy', value: 'Comedy' },
  { label: 'Drama', value: 'Drama' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Sci-Fi', value: 'Sci-Fi' },
];

export default function MovieGrid({ userId, searchQuery, onSelectMovie, onAddToWatchlist }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genreFilter, setGenreFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    const cached = localStorage.getItem(`recs_${userId}`);
    if (cached) {
      setMovies(JSON.parse(cached));
      setLoading(false);
    } else {
      setLoading(true);
    }

    getRecommendations(userId, 50)
      .then(res => {
        setMovies(res.data.recommendations);
        localStorage.setItem(`recs_${userId}`, JSON.stringify(res.data.recommendations));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching recommendations:', err);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) return;
    setLoading(true);
    searchMovies(searchQuery)
      .then(res => {
        setMovies(res.data.map(m => ({ ...m, hybrid_score: 0.75 })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Search failed:', err);
        setLoading(false);
      });
  }, [searchQuery]);

  const filteredMovies = movies.filter(movie => {
    if (genreFilter !== 'All') {
      const genres = Array.isArray(movie.genres) ? movie.genres : (movie.genres?.split('|') || []);
      if (!genres.includes(genreFilter)) return false;
    }
    return true;
  });

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'rating') return (b.hybrid_score || 0) - (a.hybrid_score || 0);
    if (sortBy === 'year-new') return (b.releaseYear || 0) - (a.releaseYear || 0);
    if (sortBy === 'year-old') return (a.releaseYear || 0) - (b.releaseYear || 0);
    return 0;
  });

  return (
    <section style={s.section}>
      <div style={s.wrap}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Discover Movies'}
            </h2>
            <p style={s.subtitle}>
              {sortedMovies.length} movie{sortedMovies.length !== 1 ? 's' : ''} · User #{userId}
            </p>
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={s.sortSelect}>
            <option value="recommended">Best Match</option>
            <option value="rating">Top Rated</option>
            <option value="year-new">Newest</option>
            <option value="year-old">Oldest</option>
          </select>
        </div>

        <div style={s.chips}>
          {GENRE_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => setGenreFilter(filter.value)}
              style={{
                ...s.chip,
                background: genreFilter === filter.value ? '#000' : '#f3f4f6',
                color: genreFilter === filter.value ? '#fff' : '#000',
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.grid}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={s.skeleton} />
            ))}
          </div>
        ) : sortedMovies.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>No movies found</div>
          </div>
        ) : (
          <div style={s.grid}>
            {sortedMovies.map(p => (
              <MovieCard
                key={p.movieId}
                product={p}
                onSelect={onSelectMovie}
                onAddToWatchlist={onAddToWatchlist}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const s = {
  section: { background: '#fafafa', padding: '64px 0' },
  wrap: { maxWidth: '1400px', margin: '0 auto', padding: '0 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  title: { fontFamily: 'Georgia, serif', fontSize: '36px', letterSpacing: '1px', margin: 0 },
  subtitle: { fontSize: '14px', color: '#888', marginTop: '6px', margin: '6px 0 0 0' },
  sortSelect: { padding: '10px 16px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '13px', background: '#fff', cursor: 'pointer' },
  chips: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' },
  chip: { border: 'none', borderRadius: '20px', padding: '8px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  skeleton: { background: '#fff', borderRadius: '12px', aspectRatio: '2/3', border: '1px solid #e5e5eb' },
  empty: { textAlign: 'center', padding: '100px 40px' },
};
