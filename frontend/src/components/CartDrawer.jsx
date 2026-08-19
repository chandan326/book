import React from 'react';
import { ShoppingBag, X, Trash2, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose, cartItems, removeFromCart, clearCart, setActivePage, setSelectedBookId }) {
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
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} color="#2563EB" />
            <span>My Shopping Cart</span>
            <span className="cart-item-count-pill">{cartItems.length} items</span>
          </div>
          <button className="cart-close-btn" onClick={onClose} title="Close Cart">
            <X size={18} />
          </button>
        </div>

        {/* Body Items List */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-icon-circle">
                <ShoppingBag size={38} color="#2563EB" />
              </div>
              <h3>Your Cart is Empty</h3>
              <p>Explore our public library and save your favorite books to read or purchase.</p>
              <button 
                className="btn-primary" 
                style={{ marginTop: '1.25rem', fontSize: '0.875rem', padding: '0.6rem 1.2rem' }}
                onClick={() => { setActivePage && setActivePage('discover'); onClose(); }}
              >
                <BookOpen size={16} /> Explore Public Books
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img 
                    src={item.coverUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=200&q=80'} 
                    alt={item.title} 
                    className="cart-item-cover"
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-badge">{item.genre || 'Literature'}</span>
                    <h4 className="cart-item-title">{item.title}</h4>
                    <p className="cart-item-author">{item.author || 'PANNA.AI Author'}</p>
                    <div className="cart-item-price-row">
                      <span className="cart-item-price">{item.price || 'Free Membership Read'}</span>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button 
                      onClick={() => handleReadNow(item.id)}
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '0.4rem', whiteSpace: 'nowrap' }}
                      title="Read Book Now"
                    >
                      Read Now
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="cart-remove-btn"
                      title="Remove from Cart"
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
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span className="summary-label">Total Cart Items</span>
              <span className="summary-val">{cartItems.length} Books</span>
            </div>

            <div className="cart-summary-row">
              <span className="summary-label">Access Status</span>
              <span className="summary-val status-free">
                <CheckCircle2 size={14} color="#10B981" /> Unlimited Free Access
              </span>
            </div>

            <div className="cart-footer-buttons">
              <button 
                onClick={() => { setActivePage && setActivePage('discover'); onClose(); }}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
              >
                Explore More Books <ArrowRight size={16} />
              </button>
              <button 
                onClick={clearCart}
                className="btn-secondary"
                style={{ fontSize: '0.85rem', color: '#DC2626', padding: '0.6rem 1rem' }}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
