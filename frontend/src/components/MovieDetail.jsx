import React, { useState } from 'react';

export default function MovieDetail({
  movie,
  isInWatchlist,
  onClose,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}) {
  const [userRating, setUserRating] = useState(null);

  const genres = Array.isArray(movie.genres)
    ? movie.genres
    : (movie.genres?.split('|') || []);

  const rating = Math.min(5, Math.max(1, (movie.hybrid_score || 0.7) * 5));
  const year = movie.releaseYear || (movie.title.match(/\((\d{4})\)/) || [])[1];

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>

        <div style={s.container}>
          <div style={s.leftSection}>
            <div style={s.poster}>
              {movie.poster && (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={s.posterImage}
                />
              )}
            </div>

            <div style={s.actions}>
              {!isInWatchlist ? (
                <button style={s.primaryBtn} onClick={() => onAddToWatchlist(movie)}>
                  + Add to Watchlist
                </button>
              ) : (
                <button style={{ ...s.primaryBtn, background: '#EF4444' }}
                  onClick={() => onRemoveFromWatchlist(movie.movieId)}>
                  − Remove
                </button>
              )}
            </div>
          </div>

          <div style={s.rightSection}>
            <h1 style={s.title}>{movie.title}</h1>

            <div style={s.meta}>
              <span>{year}</span>
              {movie.runtime && <span>• {movie.runtime} min</span>}
              {movie.director && <span>• Dir: {movie.director}</span>}
            </div>

            {movie.plot && (
              <div>
                <div style={s.label}>Plot</div>
                <p style={s.plot}>{movie.plot}</p>
              </div>
            )}

            <div style={s.ratingSection}>
              <div>
                <div style={s.label}>AI Rating</div>
                <div style={s.stars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} style={{
                      fontSize: '24px',
                      color: i <= Math.floor(rating) ? '#FCD34D' : '#E5E7EB',
                    }}>
                      ★
                    </span>
                  ))}
                  <span style={s.ratingText}>{rating.toFixed(1)}/5</span>
                </div>
              </div>

              <div>
                <div style={s.label}>Your Rating</div>
                <div style={s.userStars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} onClick={() => setUserRating(i)} style={{
                      fontSize: '24px',
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      color: userRating && i <= userRating ? '#FCD34D' : '#D1D5DB',
                      padding: 0,
                    }}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={s.label}>Genres</div>
              <div style={s.genreList}>
                {genres.map(genre => (
                  <span key={genre} style={s.genreTag}>{genre}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', overflowY: 'auto' },
  modal: { background: '#fff', borderRadius: '20px', maxWidth: '900px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
  closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#9CA3AF', zIndex: 10 },
  container: { display: 'flex', gap: '40px', padding: '40px' },
  leftSection: { flex: '0 0 280px' },
  poster: { width: '100%', aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden', background: '#F3F4F6', marginBottom: '24px' },
  posterImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  actions: { display: 'flex', flexDirection: 'column', gap: '12px' },
  primaryBtn: { padding: '12px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  rightSection: { flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0 },
  meta: { fontSize: '14px', color: '#6B7280', display: 'flex', gap: '12px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' },
  plot: { fontSize: '14px', color: '#4B5563', lineHeight: 1.6, margin: 0 },
  ratingSection: { display: 'flex', gap: '32px' },
  stars: { display: 'flex', alignItems: 'center', gap: '4px' },
  userStars: { display: 'flex', alignItems: 'center', gap: '4px' },
  ratingText: { fontSize: '12px', color: '#9CA3AF', marginLeft: '8px' },
  genreList: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  genreTag: { fontSize: '12px', fontWeight: '600', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '6px 12px' },
};
