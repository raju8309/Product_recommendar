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
              <div
                key={st.label}
                style={{
                  ...s.stat,
                  borderLeft: i > 0 ? '1px solid #e5e5e5' : 'none',
                  paddingLeft: i > 0 ? '24px' : 0,
                }}
              >
                <div style={s.statNum}>{st.num}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.right}>
          <div style={s.heroCard}>
            <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎬</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', letterSpacing: '1px' }}>
              AI POWERED
            </div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '6px' }}>
              Hybrid Recommendation Engine
            </div>
            <div style={s.heroBadge}>✦ RMSE 0.87</div>
          </div>
        </div>
      </section>

      <div style={s.brandsBar}>
        {['SVD MODEL', 'TF-IDF', 'COSINE SIM', 'HYBRID ML', 'FASTAPI'].map(b => (
          <span key={b} style={s.brand}>{b}</span>
        ))}
      </div>
    </>
  );
}

const s = {
  hero: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '64px 40px', maxWidth: '1400px', margin: '0 auto', gap: '48px', minHeight: '500px', flexWrap: 'wrap' },
  left: { flex: 1, minWidth: '280px', maxWidth: '560px' },
  title: { fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 5.5vw, 68px)', lineHeight: 1.05, letterSpacing: '-1px', marginBottom: '24px', fontWeight: '700' },
  sub: { fontSize: '16px', color: '#666', lineHeight: 1.7, marginBottom: '32px', maxWidth: '400px' },
  btn: { background: '#000', color: '#fff', border: 'none', borderRadius: '62px', padding: '16px 40px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', marginBottom: '48px' },
  stats: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  stat: {},
  statNum: { fontFamily: 'Georgia, serif', fontSize: '32px', letterSpacing: '1px', fontWeight: '700' },
  statLabel: { fontSize: '13px', color: '#888', marginTop: '4px' },
  right: { flex: 1, minWidth: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '380px' },
  heroCard: { background: '#000', color: '#fff', borderRadius: '24px', padding: '48px 56px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' },
  heroBadge: { marginTop: '16px', display: 'inline-block', background: '#fff', color: '#000', borderRadius: '50px', padding: '6px 16px', fontSize: '12px', fontWeight: '700' },
  brandsBar: { background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '56px', padding: '28px 40px', flexWrap: 'wrap' },
  brand: { fontFamily: 'Georgia, serif', fontSize: '20px', letterSpacing: '3px', color: '#fff', opacity: 0.85 },
};

export default Hero;
