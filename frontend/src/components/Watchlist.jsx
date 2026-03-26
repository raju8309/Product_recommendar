import React, { useState } from 'react';

const GENRE_COLORS = {
  Action: '#EF4444', Comedy: '#FBBF24', Drama: '#3B82F6', Horror: '#7C3AED', Romance: '#F43F5E', Adventure: '#F97316', 'Sci-Fi': '#06B6D4', Thriller: '#8B5CF6',
};

export default function Watchlist({ items, onRemove, onToggleWatched, onContinue }) {
  const [filterStatus, setFilterStatus] = useState('all');

  const totalRuntime = items.reduce((sum, item) => sum + (item.runtime || 0), 0);
  const watchedCount = items.filter(item => item.watched).length;
  const unwatchedCount = items.filter(item => !item.watched).length;

  const filteredItems = items.filter(item => {
    if (filterStatus === 'watched') return item.watched;
    if (filterStatus === 'unwatched') return !item.watched;
    return true;
  });

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.headerSection}>
          <h1 style={s.title}>My Watchlist</h1>
          <p style={s.subtitle}>
            {items.length} movie{items.length !== 1 ? 's' : ''} • {Math.floor(totalRuntime / 60)}h {totalRuntime % 60}m
          </p>
        </div>

        {items.length === 0 ? (
          <div style={s.emptyState}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🍿</div>
            <h2 style={s.emptyTitle}>Your watchlist is empty</h2>
            <button onClick={onContinue} style={s.discoverBtn}>
              ← Explore Movies
            </button>
          </div>
        ) : (
          <div style={s.layout}>
            <div style={s.mainSection}>
              <div style={s.controlsBar}>
                <div style={s.filterGroup}>
                  <label style={s.label}>Status:</label>
                  <div style={s.buttonGroup}>
                    {[
                      { value: 'all', label: `All (${items.length})` },
                      { value: 'unwatched', label: `To Watch (${unwatchedCount})` },
                      { value: 'watched', label: `Watched (${watchedCount})` },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFilterStatus(option.value)}
                        style={{
                          ...s.filterBtn,
                          background: filterStatus === option.value ? '#000' : '#f3f4f6',
                          color: filterStatus === option.value ? '#fff' : '#000',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={s.itemsList}>
                {filteredItems.map((movie, index) => {
                  const primaryGenre = Array.isArray(movie.genres)
                    ? movie.genres[0]
                    : movie.genres?.split('|')[0] || 'Drama';
                  const color = GENRE_COLORS[primaryGenre] || '#3B82F6';

                  return (
                    <div key={movie.movieId} style={{
                      ...s.watchlistItem,
                      opacity: movie.watched ? 0.65 : 1,
                    }}>
                      <div style={s.position}>{index + 1}</div>

                      <div style={{ ...s.thumbnail, borderColor: color }}>
                        <img 
                          src={`https://picsum.photos/seed/movie${movie.movieId}/80/120.jpg`}
                          alt={movie.title}
                          style={s.thumbnailImage}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <span style={{ fontSize: '48px', display: 'none' }}>🎬</span>
                      </div>

                      <div style={s.itemInfo}>
                        <div style={s.itemHeader}>
                          <h3 style={{
                            ...s.itemTitle,
                            textDecoration: movie.watched ? 'line-through' : 'none'
                          }}>
                            {movie.title.replace(/\s*\(\d{4}\)\s*$/, '')}
                          </h3>
                          <button
                            onClick={() => onRemove(movie.movieId)}
                            style={s.removeBtn}
                          >
                            ✕
                          </button>
                        </div>
                        <div style={s.itemMeta}>
                          <span>{primaryGenre}</span>
                          {movie.releaseYear && <span>• {movie.releaseYear}</span>}
                          {movie.runtime && <span>• {movie.runtime} min</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleWatched(movie.movieId)}
                        style={{
                          ...s.statusBtn,
                          background: movie.watched ? '#10b981' : '#e5e7eb',
                          color: movie.watched ? '#fff' : '#6b7280',
                        }}
                      >
                        {movie.watched ? '✓ Watched' : 'Mark Watched'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={s.sidebar}>
              <div style={s.summaryCard}>
                <h2 style={s.summaryTitle}>Summary</h2>
                <div style={s.statItem}>
                  <div style={s.statLabel}>Total Movies</div>
                  <div style={s.statValue}>{items.length}</div>
                </div>
                <div style={s.statItem}>
                  <div style={s.statLabel}>To Watch</div>
                  <div style={s.statValue}>{unwatchedCount}</div>
                </div>
                <div style={s.statItem}>
                  <div style={s.statLabel}>Watched</div>
                  <div style={s.statValue}>{watchedCount}</div>
                </div>
                <hr style={s.divider} />
                <div style={s.statItem}>
                  <div style={s.statLabel}>Total Runtime</div>
                  <div style={s.statValue}>{Math.floor(totalRuntime / 60)}h {totalRuntime % 60}m</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#fafafa', padding: '48px 0' },
  wrap: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' },
  headerSection: { marginBottom: '40px' },
  title: { fontFamily: 'Georgia, serif', fontSize: '40px', margin: '0 0 8px 0', fontWeight: '700' },
  subtitle: { fontSize: '14px', color: '#6b7280', margin: 0 },
  emptyState: { textAlign: 'center', padding: '120px 40px' },
  emptyTitle: { fontSize: '28px', fontWeight: '700', marginBottom: '12px' },
  discoverBtn: { padding: '14px 40px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  layout: { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  mainSection: { flex: 1, minWidth: '0' },
  controlsBar: { background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e5e7eb' },
  filterGroup: { display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' },
  label: { fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  buttonGroup: { display: 'flex', gap: '8px' },
  filterBtn: { padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  watchlistItem: { display: 'flex', gap: '16px', padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', alignItems: 'flex-start' },
  position: { fontSize: '20px', fontWeight: '800', color: '#d1d5db', minWidth: '32px', textAlign: 'center' },
  thumbnail: { width: '80px', height: '120px', borderRadius: '8px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid' },
  thumbnailImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  itemTitle: { fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0' },
  itemMeta: { fontSize: '13px', color: '#6b7280', display: 'flex', gap: '8px' },
  removeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af', padding: '4px 8px' },
  statusBtn: { padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  sidebar: { width: '300px', flexShrink: 0 },
  summaryCard: { background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' },
  summaryTitle: { fontSize: '16px', fontWeight: '700', margin: '0 0 20px 0' },
  statItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  statLabel: { fontSize: '13px', color: '#6b7280', fontWeight: '500' },
  statValue: { fontSize: '18px', fontWeight: '800' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' },
};
