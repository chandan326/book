import React from 'react';
import { Heart, X, Trash2, BookOpen, ArrowRight, ShoppingBag } from 'lucide-react';
import './CartDrawer.css';

export default function FavoritesDrawer({ isOpen, onClose, favoriteItems, removeFromFavorites, clearFavorites, addToCart, setActivePage, setSelectedBookId }) {
  if (!isOpen) return null;

  const handleReadNow = (bookId) => {
    if (setSelectedBookId) setSelectedBookId(bookId);
    if (setActivePage) setActivePage('reader');
    onClose();
  };

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cart-drawer-header" style={{ backgroundColor: '#FEF2F2' }}>
          <div className="cart-header-title">
            <Heart size={20} color="#EF4444" fill="#EF4444" />
            <span>My Saved Favorites</span>
            <span className="cart-item-count-pill" style={{ backgroundColor: '#FEE2E2', color: '#DC2626', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              {favoriteItems.length} saved
            </span>
          </div>
          <button className="cart-close-btn" onClick={onClose} title="Close Favorites">
            <X size={18} />
          </button>
        </div>

        {/* Body Items List */}
        <div className="cart-drawer-body">
          {favoriteItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-icon-circle" style={{ backgroundColor: '#FEF2F2' }}>
                <Heart size={38} color="#EF4444" />
              </div>
              <h3>No Favorites Saved Yet</h3>
              <p>Click the Heart icon on any book card to save it to your personal wishlist.</p>
              <button 
                className="btn-primary" 
                style={{ marginTop: '1.25rem', fontSize: '0.875rem', padding: '0.6rem 1.2rem', backgroundColor: '#EF4444' }}
                onClick={() => { setActivePage && setActivePage('discover'); onClose(); }}
              >
                <BookOpen size={16} /> Discover Favorite Books
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {favoriteItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img 
                    src={item.coverUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=200&q=80'} 
                    alt={item.title} 
                    className="cart-item-cover"
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-badge" style={{ color: '#DC2626' }}>{item.genre || 'Favorite'}</span>
                    <h4 className="cart-item-title">{item.title}</h4>
                    <p className="cart-item-author">{item.author || 'PANNA.AI Author'}</p>
                    <div className="cart-item-price-row">
                      <span className="cart-item-price" style={{ color: '#2563EB' }}>Saved in Favorites</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button 
                      onClick={() => {
                        if (addToCart) addToCart(item);
                      }}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: '0.4rem', whiteSpace: 'nowrap' }}
                      title="Move to Shopping Cart"
                    >
                      <ShoppingBag size={12} /> + Cart
                    </button>
                    <button 
                      onClick={() => handleReadNow(item.id)}
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: '0.4rem', whiteSpace: 'nowrap' }}
                      title="Read Book Now"
                    >
                      Read
                    </button>
                    <button 
                      onClick={() => removeFromFavorites(item.id)}
                      className="cart-remove-btn"
                      title="Remove from Favorites"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {favoriteItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span className="summary-label">Total Wishlist Books</span>
              <span className="summary-val">{favoriteItems.length} Favorites</span>
            </div>

            <div className="cart-footer-buttons">
              <button 
                onClick={() => { setActivePage && setActivePage('discover'); onClose(); }}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
              >
                Discover More <ArrowRight size={16} />
              </button>
              <button 
                onClick={clearFavorites}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', color: '#DC2626', padding: '0.6rem 1rem' }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
