import React from 'react';

const COLORS = {
  Action:'#FF4D4D', Comedy:'#FF9900', Drama:'#4A90D9',
  Horror:'#9B51E0', Romance:'#FF6B9D', Animation:'#00C48C',
};
const EMOJIS = {
  Action:'⚡', Comedy:'😂', Drama:'🎭',
  Horror:'👻', Romance:'💝', Animation:'🎨', Thriller:'🔪',
};

function getPrice(m) { return ((m.hybrid_score||0.5)*200+20).toFixed(2); }

export default function Cart({ items, onRemove, onContinue }) {
  const sub      = items.reduce((t, i) => t + parseFloat(getPrice(i)) * i.qty, 0);
  const discount = sub * 0.2;
  const delivery = items.length > 0 ? 15 : 0;
  const total    = sub - discount + delivery;

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <h1 style={s.title}>YOUR CART</h1>

        {items.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
              Your cart is empty
            </div>
            <button onClick={onContinue} style={s.shopBtn}>Discover Products →</button>
          </div>
        ) : (
          <div style={s.layout}>
            {/* Items */}
            <div style={s.items}>
              {items.map(item => {
                const genre = item.genres?.split('|')[0] || 'Drama';
                const color = COLORS[genre] || '#4A90D9';
                return (
                  <div key={item.movieId} style={s.item}>
                    <div style={{ ...s.itemImg, background: `${color}18` }}>
                      <span style={{ fontSize: '48px' }}>{EMOJIS[genre] || '🎬'}</span>
                    </div>
                    <div style={s.itemInfo}>
                      <div style={s.itemTop}>
                        <h3 style={s.itemName}>{item.title}</h3>
                        <button onClick={() => onRemove(item.movieId)} style={s.removeBtn}>🗑️</button>
                      </div>
                      <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>{genre}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={s.qtyRow}>
                          <span style={s.qBtn}>−</span>
                          <span style={{ fontWeight: 700 }}>{item.qty}</span>
                          <span style={s.qBtn}>+</span>
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: 700 }}>${getPrice(item)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div style={s.summary}>
              <h2 style={s.summTitle}>Order Summary</h2>
              {[
                { label: 'Subtotal',        val: `$${sub.toFixed(2)}`,       color: '#000'     },
                { label: 'Discount (-20%)', val: `-$${discount.toFixed(2)}`, color: '#FF3333'  },
                { label: 'Delivery Fee',    val: `$${delivery.toFixed(2)}`,  color: '#000'     },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '16px', fontSize: '16px', color: r.color,
                }}>
                  <span>{r.label}</span>
                  <span>{r.val}</span>
                </div>
              ))}

              <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '16px 0 20px' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input placeholder="Add promo code" style={s.promoInput} />
                <button style={s.promoBtn}>Apply</button>
              </div>

              <button style={s.checkBtn}>Go to Checkout →</button>
              <button onClick={onContinue} style={s.contBtn}>← Continue Shopping</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page    : { minHeight: '100vh', background: '#fafafa', padding: '48px 0' },
  wrap    : { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' },
  title   : { fontFamily: 'var(--font-display)', fontSize: '40px', letterSpacing: '1px', marginBottom: '40px' },
  empty   : { textAlign: 'center', padding: '80px 0' },
  shopBtn : { marginTop: '16px', padding: '14px 40px', background: '#000', color: '#fff', border: 'none', borderRadius: '62px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  layout  : { display: 'flex', gap: '32px', flexWrap: 'wrap' },
  items   : { flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' },
  item    : { display: 'flex', gap: '20px', background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0' },
  itemImg : { width: '100px', height: '100px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemTop : { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
  itemName: { fontSize: '15px', fontWeight: '600', lineHeight: 1.4, flex: 1, marginRight: '8px' },
  removeBtn:{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
  qtyRow  : { display: 'flex', alignItems: 'center', gap: '20px', background: '#f0f0f0', borderRadius: '62px', padding: '6px 20px' },
  qBtn    : { fontSize: '20px', fontWeight: '700', cursor: 'pointer' },
  summary : { width: '360px', flexShrink: 0, background: '#fff', borderRadius: '20px', padding: '32px', border: '1px solid #f0f0f0', alignSelf: 'flex-start' },
  summTitle:{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '1px', marginBottom: '24px' },
  promoInput:{ flex: 1, padding: '12px 16px', border: '1px solid #eee', borderRadius: '62px', fontSize: '14px', outline: 'none' },
  promoBtn: { padding: '12px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '62px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  checkBtn: { width: '100%', padding: '16px', background: '#000', color: '#fff', border: 'none', borderRadius: '62px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px' },
  contBtn : { width: '100%', padding: '12px', background: 'none', color: '#666', border: '1px solid #eee', borderRadius: '62px', fontSize: '14px', cursor: 'pointer' },
};