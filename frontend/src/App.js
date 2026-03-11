import React, { useState } from 'react';
import './App.css';
import Navbar        from './components/Navbar';
import Hero          from './components/Hero';
import ProductGrid   from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import Cart          from './components/Cart';

function App() {
  const [page,          setPage]          = useState('home');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cartItems,     setCartItems]     = useState([]);
  const [userId,        setUserId]        = useState(1);
  const [searchQuery,   setSearchQuery]   = useState('');

  const addToCart = (movie) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.movieId === movie.movieId);
      if (exists) return prev;
      return [...prev, { ...movie, qty: 1 }];
    });
  };

  const removeFromCart = (movieId) => {
    setCartItems(prev => prev.filter(i => i.movieId !== movieId));
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setPage('detail');
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <Navbar
        cartCount    = {cartItems.length}
        onCartClick  = {() => setPage('cart')}
        onLogoClick  = {() => { setPage('home'); setSearchQuery(''); }}
        onSearch     = {(q) => { setSearchQuery(q); setPage('home'); }}
        userId       = {userId}
        onUserChange = {setUserId}
      />

      {page === 'home' && (
        <>
          <Hero onShopNow={() =>
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
          } />
          <ProductGrid
            userId        = {userId}
            searchQuery   = {searchQuery}
            onSelectMovie = {handleSelectMovie}
            onAddToCart   = {addToCart}
          />
        </>
      )}

      {page === 'detail' && selectedMovie && (
        <ProductDetail
          movie         = {selectedMovie}
          onBack        = {() => setPage('home')}
          onAddToCart   = {addToCart}
          onSelectMovie = {handleSelectMovie}
        />
      )}

      {page === 'cart' && (
        <Cart
          items      = {cartItems}
          onRemove   = {removeFromCart}
          onContinue = {() => setPage('home')}
        />
      )}
    </div>
  );
}

export default App;