import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieGrid from './components/MovieGrid';
import Watchlist from './components/Watchlist';
import MovieDetail from './components/MovieDetail';
import './App.css';

export default function App() {
  const [userId, setUserId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [currentPage, setCurrentPage] = useState('explore');

  const handleAddToWatchlist = useCallback((movie) => {
    setWatchlistItems(prev => {
      if (prev.find(item => item.movieId === movie.movieId)) return prev;
      return [...prev, { ...movie, watched: false, addedToWatchlistDate: new Date().toISOString(), rating: null, notes: '' }];
    });
  }, []);

  const handleRemoveFromWatchlist = useCallback((movieId) => {
    setWatchlistItems(prev => prev.filter(item => item.movieId !== movieId));
  }, []);

  const handleToggleWatched = useCallback((movieId) => {
    setWatchlistItems(prev => prev.map(item => item.movieId === movieId ? { ...item, watched: !item.watched } : item));
  }, []);

  const handleSelectMovie = useCallback((movie) => {
    setSelectedMovie(movie);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  const handleGoToWatchlist = useCallback(() => {
    setCurrentPage('watchlist');
  }, []);

  const handleContinueExploring = useCallback(() => {
    setCurrentPage('explore');
    setSearchQuery('');
  }, []);

  const handleUserChange = useCallback((newUserId) => {
    setUserId(newUserId);
    setSearchQuery('');
    setSelectedMovie(null);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage('explore');
  }, []);

  const handleLogoClick = useCallback(() => {
    setCurrentPage('explore');
    setSearchQuery('');
    setSelectedMovie(null);
  }, []);

  return (
    <div className="app">
      <Navbar
        cartCount={watchlistItems.length}
        onCartClick={handleGoToWatchlist}
        onLogoClick={handleLogoClick}
        onSearch={handleSearch}
        userId={userId}
        onUserChange={handleUserChange}
      />

      {currentPage === 'explore' ? (
        <>
          <Hero onShopNow={handleContinueExploring} />
          <MovieGrid
            userId={userId}
            searchQuery={searchQuery}
            onSelectMovie={handleSelectMovie}
            onAddToWatchlist={handleAddToWatchlist}
          />
        </>
      ) : (
        <Watchlist
          items={watchlistItems}
          onRemove={handleRemoveFromWatchlist}
          onToggleWatched={handleToggleWatched}
          onContinue={handleContinueExploring}
        />
      )}

      {selectedMovie && (
        <MovieDetail
          movie={selectedMovie}
          isInWatchlist={watchlistItems.some(item => item.movieId === selectedMovie.movieId)}
          onClose={handleCloseDetail}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
        />
      )}
    </div>
  );
}
