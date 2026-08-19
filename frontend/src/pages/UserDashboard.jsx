import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Eye, Download, Plus, Edit3, Trash2, FileText, CheckCircle, BarChart2, HardDrive, Clock } from 'lucide-react';
import { apiRequest } from '../services/api';

export default function UserDashboard({ setActivePage, setSelectedBookId }) {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userBooks = await apiRequest('/books/');
      const analytics = await apiRequest('/analytics/dashboard');
      setBooks(userBooks);
      setStats(analytics);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this book manuscript?")) return;
    try {
      await apiRequest(`/books/${bookId}`, 'DELETE');
      loadDashboardData();
    } catch (err) {
      alert("Failed to delete book: " + err.message);
    }
  };

  const handleExportPDF = async (bookId, e) => {
    e.stopPropagation();
    window.open(`http://localhost:8000/api/v1/export/pdf/${bookId}`, '_blank');
  };

  const handleOpenStudio = (bookId) => {
    setSelectedBookId(bookId);
    setActivePage('studio');
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
        Loading your personal dashboard...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit' }}>Author Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>Manage your manuscripts, track reader engagement, and audit literature.</p>
        </div>
        <button 
          onClick={() => setActivePage('create')}
          className="btn-primary"
        >
          <Plus size={18} /> Create New Book
        </button>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.total_books || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Books</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#ECFDF5', color: '#10B981', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.published_books || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Published Books</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <Eye size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.total_views?.toLocaleString() || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Reader Views</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#F0F9FF', color: '#0EA5E9', padding: '0.75rem', borderRadius: '0.5rem' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats?.ai_editing_usage_hours || 0}h</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>AI Audit Time</div>
          </div>
        </div>

      </div>

      {/* My Books Section */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', fontFamily: 'Outfit' }}>My Manuscripts & Books</h2>

        {books.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <BookOpen size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Books Created Yet</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0' }}>Start your first book manuscript or upload a PDF/DOCX document.</p>
            <button onClick={() => setActivePage('create')} className="btn-primary">
              <Plus size={18} /> Create Your First Book
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {books.map(book => (
              <div 
                key={book.id}
                className="card"
                onClick={() => handleOpenStudio(book.id)}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Book Mock Cover */}
                  <div style={{
                    width: '80px',
                    height: '110px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: '0.35rem',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>{book.genre}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, lineHeight: 1.2, fontFamily: 'Outfit' }}>{book.title}</span>
                    <span style={{ fontSize: '0.55rem', color: '#94A3B8' }}>{book.chapters?.length || 1} Chapters</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '1rem',
                        backgroundColor: book.status === 'Public' ? '#DCFCE7' : '#F1F5F9',
                        color: book.status === 'Public' ? '#166534' : '#475569'
                      }}>
                        {book.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.35rem' }}>{book.title}</h3>
                    {book.subtitle && <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem' }}>{book.subtitle}</p>}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={12} /> {book.views_count} views
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Download size={12} /> {book.downloads_count} downloads
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenStudio(book.id); }}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      <Edit3 size={14} /> Writing Studio
                    </button>
                    <button 
                      onClick={(e) => handleExportPDF(book.id, e)}
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>

                  <button 
                    onClick={(e) => handleDeleteBook(book.id, e)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
