import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Eye, Download, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { apiRequest } from '../services/api';

export default function BookDiscovery({ setActivePage, setSelectedBookId, addToCart, toggleFavorite, favoriteItems = [], user, openAuthModal, initialGenre = 'All' }) {
  const [publicBooks, setPublicBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicBooks();
  }, []);

  const loadPublicBooks = async () => {
    try {
      setLoading(true);
      const books = await apiRequest('/books/public');
      setPublicBooks(books || []);
    } catch (err) {
      console.error("Failed to load public books:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = publicBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (book.description && book.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (book.author_name && book.author_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleReadBook = (bookId) => {
    if (setSelectedBookId) setSelectedBookId(bookId);
    if (setActivePage) setActivePage('reader');
  };

  const genres = [...new Set(publicBooks.map(book => book.genre).filter(Boolean))].sort();

  const handleBookAction = (book) => {
    if (book.access_type === 'paid') {
      if (!user) {
        openAuthModal?.('signin');
        return;
      }
      addToCart?.(book);
      return;
    }
    handleReadBook(book.id);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit' }}>Public Book Discovery Library</h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '0.25rem' }}>
          Explore world-class literature created and published using AI assistance.
        </p>
      </div>

      {/* Search & Genre Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books by title, keyword, or author..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.95rem' }}
          />
        </div>

        <select 
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          style={{ padding: '0.75rem 1rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem', fontSize: '0.95rem' }}
        >
          <option value="All">All Genres</option>
          {genres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
        </select>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Loading public catalog...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
          <h3>No books found matching criteria</h3>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredBooks.map(book => {
            const isFav = favoriteItems.some(f => f.id === book.id);
            return (
              <div key={book.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '80px',
                      height: '110px',
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '0.35rem',
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.55rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>{book.genre}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, lineHeight: 1.2, fontFamily: 'Outfit' }}>{book.title}</span>
                      <span style={{ fontSize: '0.55rem', color: '#94A3B8' }}>{book.chapters?.length || 1} Chapters</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
                          {book.status}
                        </span>
                        
                        <button 
                          onClick={() => toggleFavorite && toggleFavorite(book)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.2rem'
                          }}
                          title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Heart size={18} color="#EF4444" fill={isFav ? "#EF4444" : "none"} />
                        </button>
                      </div>
                      
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.35rem', lineHeight: 1.3 }}>{book.title}</h3>
                      {book.subtitle && <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>{book.subtitle}</p>}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {book.description ? book.description.slice(0, 140) + "..." : "Intelligent literature manuscript."}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', gap: '0.75rem' }}>
                    <span><Eye size={12} /> {book.views_count}</span>
                    <span><Download size={12} /> {book.downloads_count}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                      onClick={() => handleBookAction(book)}
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      {book.access_type === 'paid' ? <><ShoppingBag size={14} /> Buy ₹{book.price}</> : 'Read Free'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
