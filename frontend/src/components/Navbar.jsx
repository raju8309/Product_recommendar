import React, { useState, useRef, useEffect } from 'react';
import { searchMovies } from '../api/recommender';

function Navbar({ cartCount, onCartClick, onLogoClick, onSearch, userId, onUserChange }) {
  const [searchVal, setSearchVal] = useState('');
  const [results, setResults] = useState([]);
  const [showUser, setShowUser] = useState(false);
  const [userInput, setUserInput] = useState(String(userId));
  const timerRef = useRef(null);

  useEffect(() => {
    setUserInput(String(userId));
  }, [userId]);

  useEffect(() => {
    if (!searchVal || searchVal.length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await searchMovies(searchVal);
        setResults(res.data.slice(0, 6));
      } catch (e) {
        console.error('Search error:', e);
      }
    }, 300);
  }, [searchVal]);

  return (
    <header>
      <div style={s.banner}>
        🎬 Personalized movie recommendations powered by Hybrid ML
      </div>

      <nav style={s.nav}>
        <div style={s.logo} onClick={onLogoClick}>REC.AI</div>

        <div style={s.links}>
          {['Discover', 'Top Rated', 'New Picks', 'Genres'].map(l => (
            <span key={l} style={s.link}>{l}</span>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
          <div style={s.searchBox}>
            <span style={{ opacity: 0.4 }}>🔍</span>
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onSearch(searchVal);
                  setResults([]);
                }
              }}
              placeholder="Search for movies..."
              style={s.searchInput}
            />
          </div>

          {results.length > 0 && (
            <div style={s.dropdown}>
              {results.map(m => (
                <div
                  key={m.movieId}
                  onClick={() => {
                    onSearch(m.title);
                    setSearchVal(m.title);
                    setResults([]);
                  }}
                  style={s.dropItem}
                >
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{m.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.icons}>
          <div style={{ position: 'relative' }}>
            <button style={s.iconBtn} onClick={() => setShowUser(!showUser)}>
              👤 #{userId}
            </button>
            {showUser && (
              <div style={s.userPanel}>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                  Switch User (1–6040)
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max="6040"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    style={s.userInput}
                  />
                  <button
                    onClick={() => {
                      const id = parseInt(userInput, 10);
                      const clamped = Number.isFinite(id)
                        ? Math.min(6040, Math.max(1, id))
                        : 1;
                      onUserChange(clamped);
                      setShowUser(false);
                    }}
                    style={s.applyBtn}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <button style={s.iconBtn} onClick={onCartClick}>
            📽️
            {cartCount > 0 && <span style={s.badge}>{cartCount}</span>}
          </button>
        </div>
      </nav>
    </header>
  );
}

const s = {
  banner: {
    background: '#000',
    color: '#fff',
    textAlign: 'center',
    padding: '10px 20px',
    fontSize: '13px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '16px 40px',
    borderBottom: '1px solid #f0f0f0',
    position: 'sticky',
    top: 0,
    background: '#fff',
    zIndex: 1000,
  },
  logo: {
    fontFamily: 'Georgia, serif',
    fontSize: '26px',
    letterSpacing: '1px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontWeight: '700',
  },
  links: { display: 'flex', gap: '28px', whiteSpace: 'nowrap' },
  link: { fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#333' },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f0f0f0',
    borderRadius: '62px',
    padding: '10px 18px',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    zIndex: 200,
    overflow: 'hidden',
  },
  dropItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
  },
  icons: { display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' },
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    padding: '8px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#000',
    color: '#fff',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  userPanel: {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    zIndex: 200,
    minWidth: '220px',
  },
  userInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #eee',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  applyBtn: {
    padding: '8px 16px',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
  },
};

export default Navbar;