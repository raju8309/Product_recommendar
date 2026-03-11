import React, { useState, useEffect } from 'react';
import { getSimilarMovies } from '../api/recommender';
import ProductCard from './ProductCard';

const GENRE_TO_CATEGORY = {
  Action: 'Electronics', Comedy: 'Lifestyle', Drama: 'Fashion',
  Horror: 'Gaming', Romance: 'Beauty', Animation: 'Toys & Kids',
  Thriller: 'Sports', 'Sci-Fi': 'Tech Gadgets', Adventure: 'Outdoors',
  Fantasy: 'Collectibles', War: 'Military Gear', Crime: 'Mystery Box',
  Documentary: 'Education', Musical: 'Music & Audio',
};

const CATEGORY_COLORS = {
  Electronics: '#0EA5E9', Lifestyle: '#FF9900', Fashion: '#FF6B9D',
  Gaming: '#9B51E0', Beauty: '#F43F5E', 'Toys & Kids': '#00C48C',
  Sports: '#F97316', 'Tech Gadgets': '#4A90D9', Outdoors: '#10B981',
  Collectibles: '#8B5CF6', 'Military Gear': '#64748B',
  'Mystery Box': '#EF4444', Education: '#0284C7', 'Music & Audio': '#EC4899',
};

const CATEGORY_IMAGES = {
  Electronics: [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
  ],
  Lifestyle: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop',
  ],
  Gaming: [
    'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
  ],
  Beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&h=600&fit=crop',
  ],
  'Toys & Kids': [
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1530325553241-4f50e6f59cfd?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=600&fit=crop',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
  ],
  'Tech Gadgets': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
  ],
  Outdoors: [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&h=600&fit=crop',
  ],
  Collectibles: [
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
  ],
  'Military Gear': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1591086429449-4ae29e593b0b?w=600&h=600&fit=crop',
  ],
  'Mystery Box': [
    'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
  ],
  Education: [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=600&fit=crop',
  ],
  'Music & Audio': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
  ],
};

const CATEGORY_DESCRIPTIONS = {
  Electronics   : 'Top-rated electronics product, highly recommended based on your browsing and purchase history.',
  Lifestyle     : 'A lifestyle essential curated for you based on your preference profile and similar users.',
  Fashion       : 'Trending fashion item matched to your style profile using collaborative filtering.',
  Gaming        : 'Highly rated gaming product recommended by users with similar taste to yours.',
  Beauty        : 'Beauty and personal care product with a strong match score from our hybrid ML engine.',
  'Toys & Kids' : 'Beloved toys & kids product recommended by thousands of users with similar tastes.',
  Sports        : 'Sports & fitness product curated for your activity level and preferences.',
  'Tech Gadgets': 'Cutting-edge tech gadget that scored high on both collaborative and content signals.',
  Outdoors      : 'Outdoor and adventure gear matched to your exploration style.',
  Collectibles  : 'Rare collectible item that aligns strongly with your interest profile.',
  'Military Gear':'Specialist gear recommended based on your preference for tactical items.',
  'Mystery Box' : 'Mystery and discovery product — curated by AI for your unique taste profile.',
  Education     : 'Educational resource highly rated by users with your learning profile.',
  'Music & Audio':'Top audio product matched to your music and entertainment preferences.',
};

function getImage(category, movieId) {
  const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Lifestyle'];
  return imgs[movieId % imgs.length];
}

export default function ProductDetail({ movie, onBack, onAddToCart, onSelectMovie }) {
  const [similar,  setSimilar]  = useState([]);
  const [qty,      setQty]      = useState(1);
  const [added,    setAdded]    = useState(false);
  const [selCat,   setSelCat]   = useState(null);
  const [selSize,  setSelSize]  = useState('M');
  const [selColor, setSelColor] = useState(0);
  const [imgError, setImgError] = useState(false);

  const primaryGenre     = movie.genres?.split('|')[0] || 'Drama';
  const category         = GENRE_TO_CATEGORY[primaryGenre] || 'Lifestyle';
  const color            = CATEGORY_COLORS[category] || '#4A90D9';
  const imgUrl           = getImage(category, movie.movieId);
  const price            = ((movie.hybrid_score||0.5)*200+20).toFixed(2);
  const old              = (parseFloat(price)*1.3).toFixed(2);
  const productName      = movie.title?.replace(/\s*\(\d{4}\)\s*$/, '') || movie.title;
  const allCategories    = movie.genres?.split('|').map(g => GENRE_TO_CATEGORY[g] || g) || [];
  const uniqueCategories = [...new Set(allCategories)];

  useEffect(() => {
    setSelCat(category);
    getSimilarMovies(movie.movieId, 4)
      .then(res => setSimilar(res.data.similar_movies))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.movieId]);

  const handleAdd = () => {
    onAddToCart({ ...movie, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const swatchColors = ['#1a1a1a', '#4A90D9', '#FF6B9D', '#00C48C', '#FF9900'];

  return (
    <div style={s.page}>
      <div style={s.wrap}>

        {/* Breadcrumb */}
        <div style={s.crumb}>
          <span onClick={onBack} style={s.crumbLink}>Home</span>
          <span style={{ color: '#ccc' }}> › </span>
          <span style={{ color: '#ccc' }}>{category}</span>
          <span style={{ color: '#ccc' }}> › </span>
          <span style={{ fontWeight: 600 }}>{productName}</span>
        </div>

        <div style={s.main}>

          {/* Image */}
          <div style={s.imgBox}>
            {!imgError ? (
              <img
                src     = {imgUrl}
                alt     = {productName}
                onError = {() => setImgError(true)}
                style   = {s.img}
              />
            ) : (
              <div style={{ ...s.imgFallback, background: `${color}15` }}>
                <span style={{ fontSize: '120px' }}>📦</span>
              </div>
            )}
            <div style={{ ...s.matchPill, background: color }}>
              🤖 {((movie.hybrid_score||0.8)*100).toFixed(0)}% Match
            </div>
          </div>

          {/* Info */}
          <div style={s.info}>
            <div style={{ fontSize: '12px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              {category}
            </div>

            <h1 style={s.title}>{productName}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
              {'★★★★★'.split('').map((_, i) => (
                <span key={i} style={{ color: '#FFC633', fontSize: '20px' }}>★</span>
              ))}
              <span style={{ color: '#888', marginLeft: '8px', fontSize: '14px' }}>4.5/5 · 2,341 reviews</span>
            </div>

            <div style={s.priceRow}>
              <span style={s.price}>${price}</span>
              <span style={s.old}>${old}</span>
              <span style={s.disc}>-30%</span>
            </div>

            <p style={s.desc}>
              {CATEGORY_DESCRIPTIONS[category] || 'Highly recommended based on your preference profile.'}
            </p>

            <hr style={s.hr} />

            {/* Categories */}
            <p style={s.label}>Categories</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {uniqueCategories.map(cat => (
                <button
                  key     = {cat}
                  onClick = {() => setSelCat(cat)}
                  style   = {{
                    border: 'none', borderRadius: '62px', padding: '8px 20px',
                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    background: selCat === cat ? '#000' : '#f0f0f0',
                    color: selCat === cat ? '#fff' : '#000',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Colors */}
            <p style={s.label}>Available Colors</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {swatchColors.map((c, i) => (
                <div
                  key     = {i}
                  onClick = {() => setSelColor(i)}
                  style   = {{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: c, cursor: 'pointer',
                    border: selColor === i ? `3px solid ${c}` : '2px solid #f0f0f0',
                    outline: selColor === i ? '2px solid #999' : 'none',
                    outlineOffset: '2px', transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>

            {/* Size */}
            <p style={s.label}>Size</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['XS','S','M','L','XL','XXL'].map(sz => (
                <button
                  key     = {sz}
                  onClick = {() => setSelSize(sz)}
                  style   = {{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
                    border: selSize === sz ? '2px solid #000' : '1px solid #e5e5e5',
                    background: selSize === sz ? '#000' : '#fff',
                    color: selSize === sz ? '#fff' : '#000',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>

            <hr style={s.hr} />

            {/* Qty + Add to Cart */}
            <div style={s.actions}>
              <div style={s.qty}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={s.qBtn}>−</button>
                <span style={{ fontWeight: 700, fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty(q => q+1)} style={s.qBtn}>+</button>
              </div>
              <button
                onClick = {handleAdd}
                style   = {{ ...s.addBtn, background: added ? '#00C48C' : '#000' }}
              >
                {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* AI Score */}
            <div style={s.scoreBox}>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#aaa', marginBottom: '14px' }}>
                AI RECOMMENDATION SCORE
              </p>
              {[
                { label: 'User Similarity Score', val: movie.collab_score||0.8,  color: '#4A90D9' },
                { label: 'Product Match Score',   val: movie.content_score||0.7, color: '#00C48C' },
                { label: 'Overall AI Match',       val: movie.hybrid_score||0.85, color: '#000', bold: true },
              ].map(row => (
                <div key={row.label} style={s.scoreRow}>
                  <span style={{ fontWeight: row.bold ? 700 : 400, minWidth: '170px', fontSize: '12px', color: row.bold ? '#000' : '#555' }}>
                    {row.label}
                  </span>
                  <div style={s.bar}>
                    <div style={{ width: `${row.val*100}%`, height: '100%', background: row.color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontWeight: row.bold ? 700 : 500, fontSize: '12px', minWidth: '36px', textAlign: 'right' }}>
                    {(row.val*100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '1px', marginBottom: '8px' }}>
              YOU MIGHT ALSO LIKE
            </h2>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '28px' }}>
              Based on your browsing and cart history
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
              {similar.map(m => (
                <ProductCard
                  key         = {m.movieId}
                  product     = {m}
                  onSelect    = {onSelectMovie}
                  onAddToCart = {onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page     : { minHeight: '100vh', background: '#fafafa', paddingBottom: '80px' },
  wrap     : { maxWidth: '1400px', margin: '0 auto', padding: '40px' },
  crumb    : { fontSize: '14px', marginBottom: '40px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  crumbLink: { cursor: 'pointer', textDecoration: 'underline' },
  main     : { display: 'flex', gap: '56px', flexWrap: 'wrap' },
  imgBox   : { flex: '1', minWidth: '300px', minHeight: '460px', borderRadius: '24px', overflow: 'hidden', position: 'relative', background: '#f5f5f5' },
  img      : { width: '100%', height: '100%', objectFit: 'cover' },
  imgFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  matchPill: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', color: '#fff', padding: '10px 24px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' },
  info     : { flex: '1', minWidth: '300px' },
  title    : { fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,3vw,40px)', letterSpacing: '0.5px', marginBottom: '12px', lineHeight: 1.1 },
  priceRow : { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  price    : { fontSize: '32px', fontWeight: '700' },
  old      : { fontSize: '20px', color: '#aaa', textDecoration: 'line-through' },
  disc     : { background: '#FFF0F0', color: '#FF3333', padding: '4px 14px', borderRadius: '50px', fontSize: '14px', fontWeight: '700' },
  desc     : { fontSize: '15px', color: '#555', lineHeight: 1.7 },
  hr       : { border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' },
  label    : { fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  actions  : { display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px' },
  qty      : { display: 'flex', alignItems: 'center', gap: '20px', background: '#f0f0f0', borderRadius: '62px', padding: '8px 24px' },
  qBtn     : { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', lineHeight: 1, fontWeight: '700' },
  addBtn   : { flex: 1, border: 'none', color: '#fff', borderRadius: '62px', padding: '16px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
  scoreBox : { background: '#f9f9f9', borderRadius: '16px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  scoreRow : { display: 'flex', alignItems: 'center', gap: '12px' },
  bar      : { flex: 1, height: '8px', background: '#e5e5e5', borderRadius: '4px', overflow: 'hidden' },
};