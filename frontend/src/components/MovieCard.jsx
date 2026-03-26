import React, { useState } from 'react';

const GENRE_COLORS = {
  Action: '#EF4444', 
  Adventure: '#F97316', 
  Animation: '#10B981', 
  Comedy: '#FBBF24',
  Drama: '#3B82F6', 
  Horror: '#7C3AED', 
  Romance: '#F43F5E', 
  'Sci-Fi': '#06B6D4', 
  Thriller: '#8B5CF6', 
  Crime: '#8B5CF6',
};

export default function MovieCard({ product, onSelect, onAddToWatchlist }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryGenre = Array.isArray(product.genres)
    ? product.genres[0]
    : product.genres?.split('|')[0] || 'Drama';
  const genreColor = GENRE_COLORS[primaryGenre] || '#3B82F6';
  const rating = Math.min(5, Math.max(1, (product.hybrid_score || 0.7) * 5));
  const year = product.releaseYear || (product.title.match(/\((\d{4})\)/) || [, 'N/A'])[1];
  const cleanTitle = product.title.replace(/\s*\(\d{4}\)\s*$/, '');

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToWatchlist(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.card,
        transform: hovered ? 'translateY(-8px)' : 'none',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <div style={s.posterWrap}>
        {product.poster && (
          <img
            src={product.poster}
            alt={cleanTitle}
            style={s.posterImage}
            loading="lazy"
          />
        )}

        <div style={{ ...s.genreBadge, background: genreColor }}>
          {primaryGenre}
        </div>
        <div style={s.yearBadge}>{year}</div>

        {hovered && (
          <div style={s.hoverOverlay}>
            <button
              onClick={handleAdd}
              style={{
                ...s.watchlistBtn,
                background: added ? '#10B981' : '#000',
              }}
            >
              {added ? '✓ Added!' : '+ Add to Watchlist'}
            </button>
          </div>
        )}
      </div>

      <div style={s.info}>
        <h3 style={s.title}>{cleanTitle}</h3>
        <div style={s.metadata}>
          <span>{year}</span>
        </div>

        <div style={s.starsContainer}>
          {[1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ fontSize: '14px', color: i <= Math.floor(rating) ? '#FCD34D' : '#E5E7EB' }}>
              ★
            </span>
          ))}
          <span style={s.ratingText}>{rating.toFixed(1)}/5</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  card: { 
    background: '#fff', 
    borderRadius: '16px', 
    overflow: 'hidden', 
    cursor: 'pointer', 
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
    border: '1px solid #E5E7EB', 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%' 
  },
  posterWrap: { 
    position: 'relative', 
    width: '100%', 
    aspectRatio: '2/3', 
    overflow: 'hidden', 
    background: '#f3f4f6' 
  },
  posterImage: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover', 
    display: 'block',
    backgroundColor: '#f3f4f6',
  },
  genreBadge: { 
    position: 'absolute', 
    top: '10px', 
    left: '10px', 
    color: '#fff', 
    padding: '6px 12px', 
    borderRadius: '20px', 
    fontSize: '11px', 
    fontWeight: '700', 
    zIndex: 2, 
    textTransform: 'uppercase',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  yearBadge: { 
    position: 'absolute', 
    top: '10px', 
    right: '10px', 
    background: 'rgba(0, 0, 0, 0.8)', 
    color: '#fff', 
    padding: '4px 12px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '700', 
    zIndex: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  hoverOverlay: { 
    position: 'absolute', 
    inset: 0, 
    background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 3 
  },
  watchlistBtn: { 
    color: '#fff', 
    border: 'none', 
    borderRadius: '10px', 
    padding: '12px 20px', 
    fontSize: '13px', 
    fontWeight: '600', 
    cursor: 'pointer', 
    transition: 'all 0.2s ease' 
  },
  info: { 
    padding: '14px 12px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px', 
    flex: 1 
  },
  title: { 
    fontSize: '14px', 
    fontWeight: '700', 
    margin: 0, 
    display: '-webkit-box', 
    WebkitLineClamp: 2, 
    WebkitBoxOrient: 'vertical', 
    overflow: 'hidden' 
  },
  metadata: { 
    fontSize: '12px', 
    color: '#6B7280' 
  },
  starsContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '2px' 
  },
  ratingText: { 
    fontSize: '11px', 
    color: '#9CA3AF', 
    marginLeft: '4px' 
  },
};
