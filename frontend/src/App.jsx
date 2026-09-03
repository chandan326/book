import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import SidebarNav from './components/SidebarNav';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import BookCreationPage from './pages/BookCreationPage';
import WritingStudio from './pages/WritingStudio';
import ReaderModePage from './pages/ReaderModePage';
import BookDiscovery from './pages/BookDiscovery';
import PublisherFinder from './pages/PublisherFinder';
import RaiseComplaintPage from './pages/RaiseComplaintPage';
import AdminDashboard from './pages/AdminDashboard';
import AuthModal from './pages/AuthModal';
import CartDrawer from './components/CartDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import LearningLab from './pages/LearningLab';
import CompetitionSuite from './pages/CompetitionSuite';

const VALID_PAGES = ['landing', 'dashboard', 'create', 'studio', 'reader', 'learn', 'suite', 'discover', 'publishers', 'complaint', 'admin'];

const getPageUrl = (page) => page === 'landing' ? '/' : `#/${page}`;

const getInitialPage = () => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  return VALID_PAGES.includes(hash) ? hash : 'landing';
};

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePageState] = useState(getInitialPage);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  
  // 1. Saved Cart State
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('panna_cart_items') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('panna_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed saving cart:", e);
    }
  }, [cartItems]);

  const addToCart = (book) => {
    setCartItems(prev => {
      if (prev.some(item => item.id === book.id)) return prev;
      return [...prev, book];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (bookId) => {
    setCartItems(prev => prev.filter(item => item.id !== bookId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // 2. Saved Favorites & Wishlist State
  const [favoriteItems, setFavoriteItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('panna_favorite_items') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('panna_favorite_items', JSON.stringify(favoriteItems));
    } catch (e) {
      console.error("Failed saving favorites:", e);
    }
  }, [favoriteItems]);

  const toggleFavorite = (book) => {
    setFavoriteItems(prev => {
      const exists = prev.some(item => item.id === book.id);
      if (exists) {
        return prev.filter(item => item.id !== book.id);
      } else {
        return [...prev, book];
      }
    });
  };

  const removeFromFavorites = (bookId) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== bookId));
  };

  const clearFavorites = () => {
    setFavoriteItems([]);
  };

  // Auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');

  // Navigate with browser history support (Back/Forward arrows C, <-, ->)
  const setActivePage = (newPage, pushHistory = true) => {
    if (!VALID_PAGES.includes(newPage)) return;
    setActivePageState(newPage);
    if (pushHistory) {
      window.history.pushState({ page: newPage }, '', getPageUrl(newPage));
    }
  };

  // Sync with browser Back/Forward navigation buttons
  useEffect(() => {
    const handlePopState = (e) => {
      const page = e.state?.page || getInitialPage();
      setActivePageState(page);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    window.history.replaceState({ page: activePage }, '', getPageUrl(activePage));

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const openAuthModal = (tab = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setActivePage('dashboard');
  };

  useEffect(() => {
    const protectedPages = ['dashboard', 'create', 'studio', 'admin'];
    if (!user && protectedPages.includes(activePage)) {
      setActivePage('landing', false);
      openAuthModal(activePage === 'create' ? 'signup' : 'signin');
    }
  }, [activePage, user]);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
      
      {/* Main SaaS Shell: Left Sidebar + Right Page Canvas */}
      <div className="saas-layout-shell">
        
        <SidebarNav 
          activePage={activePage}
          setActivePage={setActivePage}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          openAuthModal={openAuthModal}
        />

        <main className="saas-main-content">
          <div key={activePage} className="page-transition-wrapper">
            {activePage === 'landing' && (
              <LandingPage 
                setActivePage={setActivePage} 
                openAuthModal={openAuthModal}
                user={user}
                setSelectedBookId={setSelectedBookId}
                cartItems={cartItems}
                addToCart={addToCart}
                setIsCartOpen={setIsCartOpen}
                favoriteItems={favoriteItems}
                toggleFavorite={toggleFavorite}
                setIsFavoritesOpen={setIsFavoritesOpen}
              />
            )}

            {activePage === 'dashboard' && (
              <UserDashboard 
                setActivePage={setActivePage}
                setSelectedBookId={setSelectedBookId}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                favoriteItems={favoriteItems}
              />
            )}

            {activePage === 'create' && (
              <BookCreationPage 
                setActivePage={setActivePage}
                setSelectedBookId={setSelectedBookId}
              />
            )}

            {activePage === 'studio' && (
              <WritingStudio 
                selectedBookId={selectedBookId}
                setActivePage={setActivePage}
              />
            )}

            {activePage === 'reader' && (
              <ReaderModePage 
                selectedBookId={selectedBookId}
                setActivePage={setActivePage}
              />
            )}

            {activePage === 'learn' && <LearningLab />}

            {activePage === 'suite' && <CompetitionSuite user={user} openAuthModal={openAuthModal} setActivePage={setActivePage} setSelectedBookId={setSelectedBookId} />}

            {activePage === 'discover' && (
              <BookDiscovery 
                setActivePage={setActivePage}
                setSelectedBookId={setSelectedBookId}
                addToCart={addToCart}
                toggleFavorite={toggleFavorite}
                favoriteItems={favoriteItems}
                user={user}
                openAuthModal={openAuthModal}
              />
            )}

            {activePage === 'publishers' && (
              <PublisherFinder 
                selectedBookId={selectedBookId}
              />
            )}

            {activePage === 'complaint' && (
              <RaiseComplaintPage />
            )}

            {activePage === 'admin' && (
              <AdminDashboard />
            )}
          </div>
        </main>

      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onAuthSuccess={handleAuthSuccess}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        setActivePage={setActivePage}
        setSelectedBookId={setSelectedBookId}
      />

      <FavoritesDrawer 
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoriteItems={favoriteItems}
        removeFromFavorites={removeFromFavorites}
        clearFavorites={clearFavorites}
        addToCart={addToCart}
        setActivePage={setActivePage}
        setSelectedBookId={setSelectedBookId}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
