import React, { useState } from 'react';

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
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
  ],
  Lifestyle: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop',
  ],
  Gaming: [
    'https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
  ],
  Beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=400&fit=crop',
  ],
  'Toys & Kids': [
    'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530325553241-4f50e6f59cfd?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=400&fit=crop',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
  ],
  'Tech Gadgets': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
  ],
  Outdoors: [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=400&h=400&fit=crop',
  ],
  Collectibles: [
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop',
  ],
  'Military Gear': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1591086429449-4ae29e593b0b?w=400&h=400&fit=crop',
  ],
  'Mystery Box': [
    'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
  ],
  Education: [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop',
  ],
  'Music & Audio': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
  ],
};

function getCategory(genres) {
  const first = genres?.split('|')[0] || 'Drama';
  return GENRE_TO_CATEGORY[first] || 'Lifestyle';
}

function getImage(category, movieId) {
  const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Lifestyle'];
  return imgs[movieId % imgs.length];
}

function getPrice(m)   { return ((m.hybrid_score||0.5)*200+20).toFixed(2); }
function getOld(price) { return (parseFloat(price)*1.3).toFixed(2); }
function getDisc(p,o)  { return Math.round((1-p/o)*100); }
function getRating(s)  { return Math.min(5, Math.max(3, Math.round((s||0.7)*5*10)/10)); }

export default function ProductCard({ product, onSelect, onAddToCart }) {
  const [hovered,  setHovered]  = useState(false);
  const [added,    setAdded]    = useState(false);
  const [imgError, setImgError] = useState(false);

  const category = getCategory(product.genres);
  const color    = CATEGORY_COLORS[category] || '#4A90D9';
  const imgUrl   = getImage(category, product.movieId);
  const price    = getPrice(product);
  const old      = getOld(price);
  const disc     = getDisc(price, old);
  const stars    = getRating(product.hybrid_score);
  const name     = product.title?.replace(/\s*\(\d{4}\)\s*$/, '') || product.title;

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      onClick      = {() => onSelect(product)}
      onMouseEnter = {() => setHovered(true)}
      onMouseLeave = {() => setHovered(false)}
      style        = {{
        ...s.card,
        transform : hovered ? 'translateY(-6px)' : 'none',
        boxShadow : hovered ? '0 16px 48px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image */}
      <div style={s.imgWrap}>
        {!imgError ? (
          <img
            src       = {imgUrl}
            alt       = {name}
            onError   = {() => setImgError(true)}
            style     = {{
              ...s.img,
              filter: hovered ? 'brightness(0.85)' : 'brightness(1)',
            }}
          />
        ) : (
          <div style={{ ...s.imgFallback, background: `${color}18` }}>
            <span style={{ fontSize: '64px' }}>📦</span>
          </div>
        )}

        <span style={s.discBadge}>-{disc}%</span>
        <span style={{ ...s.catBadge, background: color }}>{category}</span>

        {hovered && (
          <button
            onClick = {handleAdd}
            style   = {{ ...s.addBtn, background: added ? '#00C48C' : '#000' }}
          >
            {added ? '✓ Added!' : 'Add to Cart'}
          </button>
        )}
      </div>

      {/* Info */}
      <div style={s.info}>
        <div style={{ fontSize: '11px', color: color, fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {category}
        </div>
        <h3 style={s.name}>{name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '6px 0' }}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{ color: i <= Math.floor(stars) ? '#FFC633' : '#e5e5e5', fontSize: '13px' }}>★</span>
          ))}
          <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px' }}>{stars}/5</span>
        </div>

        <div style={s.priceRow}>
          <span style={s.price}>${price}</span>
          <span style={s.oldPrice}>${old}</span>
          <span style={s.discTag}>-{disc}%</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  card    : { background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s ease', border: '1px solid #f0f0f0' },
  imgWrap : { position: 'relative', height: '220px', overflow: 'hidden' },
  img     : { width: '100%', height: '100%', objectFit: 'cover', transition: 'filter 0.25s ease, transform 0.25s ease' },
  imgFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  discBadge : { position: 'absolute', top: '12px', left: '12px', background: '#FF3333', color: '#fff', padding: '3px 10px', borderRadius: '50px', fontSize: '11px', fontWeight: '700' },
  catBadge  : { position: 'absolute', top: '12px', right: '12px', color: '#fff', padding: '3px 10px', borderRadius: '50px', fontSize: '10px', fontWeight: '700' },
  addBtn    : { position: 'absolute', bottom: '12px', left: '12px', right: '12px', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
  info      : { padding: '14px 16px 16px' },
  name      : { fontSize: '14px', fontWeight: '600', lineHeight: '1.4', marginBottom: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  priceRow  : { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
  price     : { fontSize: '18px', fontWeight: '700' },
  oldPrice  : { fontSize: '13px', color: '#aaa', textDecoration: 'line-through' },
  discTag   : { fontSize: '11px', fontWeight: '700', color: '#FF3333', background: '#FFF0F0', padding: '2px 8px', borderRadius: '50px' },
};