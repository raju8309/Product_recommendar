import React, { useState, useEffect } from 'react';
import { getRecommendations, searchMovies } from '../api/recommender';
import ProductCard from './ProductCard';

const FILTERS = [
  { label: 'All',          genre: 'All'         },
  { label: 'Electronics',  genre: 'Action'      },
  { label: 'Fashion',      genre: 'Drama'       },
  { label: 'Gaming',       genre: 'Horror'      },
  { label: 'Lifestyle',    genre: 'Comedy'      },
  { label: 'Beauty',       genre: 'Romance'     },
  { label: 'Toys & Kids',  genre: 'Animation'  },
  { label: 'Sports',       genre: 'Thriller'   },
  { label: 'Tech Gadgets', genre: 'Sci-Fi'     },
  { label: 'Outdoors',     genre: 'Adventure'  },
];

const GENRE_TO_CATEGORY = {
  Action: 'Electronics', Comedy: 'Lifestyle', Drama: 'Fashion',
  Horror: 'Gaming', Romance: 'Beauty', Animation: 'Toys & Kids',
  Thriller: 'Sports', 'Sci-Fi': 'Tech Gadgets', Adventure: 'Outdoors',
  Fantasy: 'Collectibles', War: 'Military Gear', Crime: 'Mystery Box',
  Documentary: 'Education', Musical: 'Music & Audio',
};

export default function ProductGrid({ userId, searchQuery, onSelectMovie, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [filter,   setFilter]   = useState('All');
  const [sort,     setSort]     = useState('recommended');

  useEffect(() => {
    // Show cached instantly
    const cached = localStorage.getItem(`recs_${userId}`);
    if (cached) {
      setProducts(JSON.parse(cached));
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Always fetch fresh in background
    getRecommendations(userId, 20)
      .then(res => {
        setProducts(res.data.recommendations);
        localStorage.setItem(`recs_${userId}`, JSON.stringify(res.data.recommendations));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  // Prefetch adjacent users silently
  useEffect(() => {
    [userId - 1, userId + 1].forEach(id => {
      if (id >= 1 && id <= 610 && !localStorage.getItem(`recs_${id}`)) {
        getRecommendations(id, 20)
          .then(res => localStorage.setItem(`recs_${id}`, JSON.stringify(res.data.recommendations)))
          .catch(() => {});
      }
    });
  }, [userId]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) return;
    setLoading(true);
    searchMovies(searchQuery)
      .then(res => {
        setProducts(res.data.map(m => ({ ...m, hybrid_score: 0.75 })));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchQuery]);

  const getPrice = (m) => ((m.hybrid_score||0.5)*200+20);

  const activeGenre = FILTERS.find(f => f.label === filter)?.genre || 'All';

  const displayed = [...products]
    .filter(p => {
      if (activeGenre === 'All') return true;
      const primaryGenre = p.genres?.split('|')[0] || '';
      return primaryGenre === activeGenre;
    })
    .sort((a, b) => {
      if (sort === 'price-asc')  return getPrice(a) - getPrice(b);
      if (sort === 'price-desc') return getPrice(b) - getPrice(a);
      return (b.hybrid_score||0) - (a.hybrid_score||0);
    });

  return (
    <section id="products" style={s.section}>
      <div style={s.wrap}>

        <div style={s.header}>
          <div>
            <h2 style={s.title}>
              {searchQuery ? `Results for "${searchQuery}"` : 'AI Picks For You'}
            </h2>
            <p style={s.sub}>Hybrid ML Engine · User #{userId} · {displayed.length} products</p>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={s.sort}>
            <option value="recommended">Best Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <div style={s.chips}>
          {FILTERS.map(f => (
            <button
              key     = {f.label}
              onClick = {() => setFilter(f.label)}
              style   = {{
                ...s.chip,
                background : filter === f.label ? '#000' : '#f0f0f0',
                color      : filter === f.label ? '#fff' : '#000',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.grid}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={s.skeleton}>
                <div style={s.skelImg} />
                <div style={{ padding: '16px' }}>
                  <div style={{ ...s.skelLine, width: '60%', marginBottom: '8px' }} />
                  <div style={{ ...s.skelLine, width: '40%', marginBottom: '8px' }} />
                  <div style={{ ...s.skelLine, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No products found</div>
            <div style={{ fontSize: '14px', color: '#888' }}>Try a different category or switch users</div>
          </div>
        ) : (
          <div style={s.grid}>
            {displayed.map(p => (
              <ProductCard
                key         = {p.movieId}
                product     = {p}
                onSelect    = {onSelectMovie}
                onAddToCart = {onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const style = document.createElement('style');
style.innerHTML = shimmer;
document.head.appendChild(style);

const s = {
  section  : { background: '#fafafa', padding: '64px 0' },
  wrap     : { maxWidth: '1400px', margin: '0 auto', padding: '0 40px' },
  header   : {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: '28px',
    flexWrap: 'wrap', gap: '16px',
  },
  title    : { fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '1px' },
  sub      : { fontSize: '14px', color: '#888', marginTop: '6px' },
  sort     : {
    padding: '10px 16px', border: '1px solid #e5e5e5',
    borderRadius: '8px', fontSize: '14px',
    background: '#fff', cursor: 'pointer', outline: 'none',
  },
  chips    : { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' },
  chip     : {
    border: 'none', borderRadius: '62px', padding: '8px 20px',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
  },
  grid     : {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '24px',
  },
  skeleton : {
    background: '#fff', borderRadius: '16px',
    overflow: 'hidden', border: '1px solid #f0f0f0',
  },
  skelImg  : {
    height: '220px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  skelLine : {
    height: '12px', borderRadius: '6px',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  empty    : {
    textAlign: 'center', padding: '80px 0',
    gridColumn: '1 / -1',
  },
};