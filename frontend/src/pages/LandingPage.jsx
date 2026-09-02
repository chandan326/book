import React, { useState } from 'react';
import { 
  Sparkles, BookOpen, Headphones, Search, ShoppingBag, Heart,
  Star, Bookmark, MapPin, ChevronRight, Filter, PlusCircle
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ 
  setActivePage, 
  openAuthModal, 
  user, 
  setSelectedBookId, 
  cartItems = [], 
  addToCart, 
  setIsCartOpen,
  favoriteItems = [],
  toggleFavorite,
  setIsFavoritesOpen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookType, setSelectedBookType] = useState('all');

  const featuredBanners = [
    {
      id: 1,
      title: "Simple Lines",
      author: "Marina Diamond",
      buttonText: "Learn more",
      bgGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      imgUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      tag: "Editorial Pick"
    },
    {
      id: 2,
      title: "New Book",
      author: "from Angela Rickman",
      buttonText: "Learn more",
      bgGradient: "linear-gradient(135deg, #c2410c 0%, #7c2d12 100%)",
      imgUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      tag: "Best Seller"
    },
    {
      id: 3,
      title: "25% OFF Summer Reads",
      author: 'Use code "SUMMER25" at checkout',
      buttonText: "Claim Offer",
      bgGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
      imgUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      tag: "Special Offer"
    }
  ];

  const allRecommendations = [
    {
      id: 101,
      title: "The Silent Echo",
      author: "Elena Rostova",
      badge: "New",
      badgeType: "new",
      type: "mystery",
      coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
      rating: 4.9,
      genre: "Mystery & Fiction"
    },
    {
      id: 102,
      title: "Mastering AI Architecture",
      author: "Chandan Rai",
      badge: "New",
      badgeType: "new",
      type: "technology",
      coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80",
      rating: 5.0,
      genre: "Technology"
    },
    {
      id: 103,
      title: "Visions of Solitude",
      author: "Marcus Vance",
      badge: "New",
      badgeType: "new",
      type: "poetry",
      coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80",
      rating: 4.8,
      genre: "Poetry"
    },
    {
      id: 104,
      title: "Journeys Through Time",
      author: "Sophia Sterling",
      badge: "-5%",
      badgeType: "discount",
      type: "history",
      coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80",
      rating: 4.7,
      genre: "History"
    },
    {
      id: 105,
      title: "Beyond the Horizon",
      author: "David Chen",
      badge: "-10%",
      badgeType: "discount",
      type: "scifi",
      coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80",
      rating: 4.9,
      genre: "Sci-Fi"
    },
    {
      id: 106,
      title: "The AI Author's Blueprint",
      author: "Chandan Rai (Super Admin)",
      badge: "New",
      badgeType: "new",
      type: "business",
      coverUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80",
      rating: 5.0,
      genre: "Publishing & Business"
    }
  ];

  const filteredRecommendations = allRecommendations.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedBookType === 'all' || b.type === selectedBookType || b.genre.toLowerCase().includes(selectedBookType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="bookie-home-container">
      
      {/* 1. Top Sub-Navigation Category Bar with Uniform Button Spacing */}
      <div className="bookie-subnav-bar">
        <div className="subnav-left-categories">
          <button 
            className="subnav-tab active"
            onClick={() => setActivePage('landing')}
          >
            <BookOpen size={16} /> Home
          </button>

          <button 
            className="subnav-tab"
            onClick={() => setActivePage('discover')}
          >
            <Sparkles size={16} /> New releases
          </button>

          <button 
            className="subnav-tab"
            onClick={() => setActivePage('discover')}
          >
            <Bookmark size={16} /> Recommendations
          </button>

          <button
            className="subnav-tab ai-learning-tab"
            onClick={() => setActivePage('learn')}
          >
            <Sparkles size={16} /> AI Learning Lab
          </button>

          <button 
            className="subnav-tab"
            onClick={() => setActivePage('discover')}
            title="Open Public Book Discovery Library"
          >
            <BookOpen size={16} /> Books ▾
          </button>

          <button 
            className="subnav-tab"
            onClick={() => setActivePage('discover')}
          >
            <Headphones size={16} /> Audiobooks ▾
          </button>
        </div>

        <div className="subnav-right-search">
          
          {/* Famous Types of Books Dropdown Selector */}
          <div className="book-types-dropdown-box" title="Select Book Type / Genre">
            <Filter size={15} color="#EA580C" />
            <select 
              value={selectedBookType}
              onChange={(e) => setSelectedBookType(e.target.value)}
              className="book-types-select"
            >
              <option value="all">Types of Books (All 12)</option>
              <option value="fiction">📖 Fiction & Literature</option>
              <option value="non-fiction">📚 Non-Fiction</option>
              <option value="scifi">🚀 Sci-Fi & Fantasy</option>
              <option value="mystery">🕵️ Mystery & Thriller</option>
              <option value="selfhelp">💡 Self-Help & Mindset</option>
              <option value="biography">👤 Biography & Memoir</option>
              <option value="business">📈 Business & Finance</option>
              <option value="technology">💻 Technology & AI</option>
              <option value="romance">❤️ Romance & Drama</option>
              <option value="history">🏛️ History & Politics</option>
              <option value="poetry">🎨 Poetry & Art</option>
              <option value="audiobooks">🎧 Audiobooks & Audio</option>
            </select>
          </div>

          {/* Search Input Box */}
          <div className="search-input-box">
            <input 
              type="text" 
              placeholder="Search books, authors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn-accent" onClick={() => setActivePage('discover')}>
              <Search size={16} />
            </button>
          </div>
          
          {/* Favorites Icon Button (Positioned Left of Add to Cart with Uniform Gap & Size) */}
          <button 
            className="cart-icon-btn favorite-btn"
            onClick={() => setIsFavoritesOpen && setIsFavoritesOpen(true)}
            title="View My Favorites & Wishlist"
          >
            <Heart size={18} color="#EF4444" fill={favoriteItems.length > 0 ? "#EF4444" : "none"} />
            {favoriteItems.length > 0 && (
              <span className="cart-badge-count fav-count">{favoriteItems.length}</span>
            )}
          </button>

          {/* Shopping Cart Icon Button */}
          <button 
            className="cart-icon-btn"
            onClick={() => setIsCartOpen && setIsCartOpen(true)}
            title="View My Shopping Cart"
          >
            <ShoppingBag size={18} color="#2563EB" />
            {cartItems.length > 0 && (
              <span className="cart-badge-count">{cartItems.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Hero Section: 3 Featured Showcase Cards */}
      <section className="featured-showcase-section">
        <div className="showcase-cards-grid">
          {featuredBanners.map((card) => (
            <div key={card.id} className="showcase-card">
              <div className="showcase-card-text">
                <span className="showcase-tag">{card.tag}</span>
                <h2 className="showcase-card-title">{card.title}</h2>
                <p className="showcase-card-author">{card.author}</p>
                <button 
                  onClick={() => user ? setActivePage('create') : openAuthModal('signup')}
                  className="showcase-btn-outlined"
                >
                  {card.buttonText}
                </button>
              </div>

              <div className="showcase-card-artwork">
                <img src={card.imgUrl} alt={card.title} />
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-dots-row">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </section>

      {/* 3. Our Recommendations Grid Section */}
      <section className="recommendations-section">
        <div className="section-header-row">
          <h2 className="section-title">Our recommendations</h2>
          <button onClick={() => setActivePage('discover')} className="view-all-btn">
            View All Collection <ChevronRight size={16} />
          </button>
        </div>

        <div className="recommendations-grid">
          {(filteredRecommendations.length > 0 ? filteredRecommendations : allRecommendations).map((book) => {
            const isFav = favoriteItems.some(f => f.id === book.id);
            return (
              <div 
                key={book.id} 
                className="recommendation-book-card"
              >
                <div className="cover-wrapper">
                  <img src={book.coverUrl} alt={book.title} />
                  <span className={`badge-tag ${book.badgeType}`}>
                    {book.badge}
                  </span>
                  
                  {/* Heart Quick Favorite Button on Card Top Left */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (toggleFavorite) toggleFavorite(book);
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                    }}
                    title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart size={15} color="#EF4444" fill={isFav ? "#EF4444" : "none"} />
                  </button>

                  <div className="hover-overlay">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <button 
                        className="btn-read-preview"
                        onClick={() => {
                          if (setSelectedBookId) setSelectedBookId(book.id);
                          setActivePage('reader');
                        }}
                      >
                        Read Preview
                      </button>

                      <button 
                        className="btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.35rem 0.65rem' }}
                        onClick={() => addToCart && addToCart(book)}
                      >
                        + Add to Cart
                      </button>
                    </div>
                  </div>
                </div>

                <div className="book-card-info">
                  <h3 className="book-card-title">{book.title}</h3>
                  <p className="book-card-author">{book.author}</p>
                  <div className="book-card-meta">
                    <span className="book-rating"><Star size={12} fill="#D97706" /> {book.rating}</span>
                    <span className="book-genre">{book.genre}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. AI Platform Creation Callout Section */}
      <section className="ai-author-banner">
        <div className="banner-content">
          <span className="ai-badge-pill">
            <Sparkles size={16} /> PANNA.AI Author Studio
          </span>
          <h2 className="banner-heading">Create & Publish Your Book with Artificial Intelligence</h2>
          <p className="banner-desc">
            Transform raw outlines, DOCX, PDF, or handwritten notes into polished, published books with intelligent chapter auditing, reversible diff edits, and nearby publisher matching.
          </p>
          <div className="banner-actions">
            <button 
              onClick={() => user ? setActivePage('create') : openAuthModal('signup')}
              className="btn-primary"
            >
              <Sparkles size={18} /> Create Your Manuscript
            </button>
            <button 
              onClick={() => setActivePage('publishers')}
              className="btn-secondary"
            >
              <MapPin size={18} color="#EF4444" /> Discover Nearby Publishers
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
