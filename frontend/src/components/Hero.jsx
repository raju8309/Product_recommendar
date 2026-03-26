import React from 'react';

function Hero({ onShopNow }) {
  return (
    <>
      <section style={s.hero}>
        <div style={s.left}>
          <h1 style={s.title}>
            DISCOVER MOVIES<br />
            TAILORED TO<br />
            YOUR TASTE
          </h1>
          <p style={s.sub}>
            Personalized recommendations powered by a hybrid ML engine —
            combining collaborative filtering and content-based analysis.
          </p>
          <button
            style={s.btn}
            onClick={onShopNow}
            onMouseEnter={e => (e.target.style.background = '#333')}
            onMouseLeave={e => (e.target.style.background = '#000')}
          >
            Explore Now →
          </button>
          <div style={s.stats}>
            {[
              { num: '10', label: 'Movies Available' },
              { num: '100K+', label: 'User Ratings' },
              { num: '0.87', label: 'Model RMSE Score' },
            ].map((st, i) => (
              <div key={i} style={s.stat}>
                <div style={s.statNum}>{st.num}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={s.right}>
          <img 
            src="https://picsum.photos/seed/movies/400/600.jpg" 
            alt="Movie collection" 
            style={s.heroImage}
          />
        </div>
      </section>
    </>
  );
}

const s = {
  hero: { display: 'flex', alignItems: 'center', padding: '60px 40px', gap: '60px', background: '#fff', minHeight: '500px' },
  left: { flex: 1, maxWidth: '600px' },
  title: { fontSize: '48px', fontWeight: '700', margin: 0, lineHeight: 1.1, color: '#000' },
  sub: { fontSize: '16px', color: '#666', margin: '16px 0', lineHeight: 1.5 },
  btn: {
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    marginTop: '24px',
  },
  stats: { display: 'flex', gap: '24px', marginTop: '32px' },
  stat: { textAlign: 'center' },
  statNum: { fontSize: '32px', fontWeight: '700', color: '#000', lineHeight: 1 },
  statLabel: { fontSize: '14px', color: '#666', marginTop: '4px' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' },
};

export default Hero;
