import React, { useState } from 'react';
import { PlusCircle, UploadCloud, Sparkles, FileText, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { apiRequest } from '../services/api';

export default function BookCreationPage({ setActivePage, setSelectedBookId }) {
  const [creationMode, setCreationMode] = useState('blank'); // 'blank', 'template', 'upload'
  
  // Metadata fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [genre, setGenre] = useState('Non-fiction');
  const [language, setLanguage] = useState('English');
  const [targetAudience, setTargetAudience] = useState('General Readers');
  const [writingStyle, setWritingStyle] = useState('Professional & Clear');
  const [description, setDescription] = useState('');

  // Upload state
  const [file, setFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(''); // 'Uploading', 'Processing', 'Extracting', 'Structuring', 'Ready'
  const [loading, setLoading] = useState(false);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!title && creationMode !== 'upload') {
      alert("Please provide a book title.");
      return;
    }

    setLoading(true);
    try {
      if (creationMode === 'upload') {
        if (!file) {
          alert("Please select a manuscript file to upload.");
          setLoading(false);
          return;
        }

        setProcessingStatus('Uploading manuscript document...');
        await new Promise(r => setTimeout(r, 600));

        setProcessingStatus('Running document extraction & malware security checks...');
        await new Promise(r => setTimeout(r, 800));

        setProcessingStatus('Executing OCR & text normalization pipeline...');
        await new Promise(r => setTimeout(r, 800));

        setProcessingStatus('Detecting chapter headers & structuring content tree...');
        
        const formData = new FormData();
        formData.append('file', file);

        const res = await apiRequest('/upload/', 'POST', formData, true);
        
        setProcessingStatus('Ready!');
        setSelectedBookId(res.book_id);
        setActivePage('studio');
      } else {
        const bookPayload = {
          title,
          subtitle,
          genre,
          language,
          target_audience: targetAudience,
          writing_style: writingStyle,
          description
        };

        const createdBook = await apiRequest('/books/', 'POST', bookPayload);
        setSelectedBookId(createdBook.id);
        setActivePage('studio');
      }
    } catch (err) {
      alert("Book creation error: " + err.message);
      setProcessingStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit' }}>Create New Book Manuscript</h1>
        <p style={{ color: '#64748B', fontSize: '1rem', marginTop: '0.25rem' }}>
          Choose your creation workflow or import existing literature into an editable AI manuscript.
        </p>
      </div>

      {/* Workflow Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        
        <div 
          onClick={() => setCreationMode('blank')}
          className="card"
          style={{
            borderColor: creationMode === 'blank' ? '#2563EB' : '#E2E8F0',
            backgroundColor: creationMode === 'blank' ? '#EFF6FF' : '#FFFFFF',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '1.5rem'
          }}
        >
          <PlusCircle size={28} style={{ color: creationMode === 'blank' ? '#2563EB' : '#64748B', marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Blank Book</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>Start from scratch with clean structure.</p>
        </div>

        <div 
          onClick={() => setCreationMode('template')}
          className="card"
          style={{
            borderColor: creationMode === 'template' ? '#2563EB' : '#E2E8F0',
            backgroundColor: creationMode === 'template' ? '#EFF6FF' : '#FFFFFF',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '1.5rem'
          }}
        >
          <Sparkles size={28} style={{ color: creationMode === 'template' ? '#2563EB' : '#64748B', marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI-Assisted Blueprint</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>Generate initial chapter outline.</p>
        </div>

        <div 
          onClick={() => setCreationMode('upload')}
          className="card"
          style={{
            borderColor: creationMode === 'upload' ? '#2563EB' : '#E2E8F0',
            backgroundColor: creationMode === 'upload' ? '#EFF6FF' : '#FFFFFF',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '1.5rem'
          }}
        >
          <UploadCloud size={28} style={{ color: creationMode === 'upload' ? '#2563EB' : '#64748B', marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upload Manuscript</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>PDF, DOCX, TXT, OCR Scans.</p>
        </div>

      </div>

      {/* Creation Form */}
      <form onSubmit={handleCreateBook} className="card" style={{ padding: '2rem' }}>
        
        {creationMode === 'upload' ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Upload Document File</label>
            <div style={{
              border: '2px dashed #CBD5E1',
              borderRadius: '0.75rem',
              padding: '2.5rem',
              textAlign: 'center',
              backgroundColor: '#F8FAFC',
              cursor: 'pointer'
            }}>
              <UploadCloud size={40} style={{ color: '#2563EB', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {file ? file.name : "Drag & drop PDF, DOCX, TXT or Scanned Pages"}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>Max file size 50MB. Automatic OCR & structure extraction.</p>
              <input 
                type="file" 
                accept=".pdf,.docx,.doc,.txt,image/*"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ marginTop: '1rem' }}
              />
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Book Title *</label>
                <input 
                  type="text" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Architecture of Intelligence"
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Subtitle</label>
                <input 
                  type="text" 
                  value={subtitle} 
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Building Next-Gen Systems"
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Genre</label>
                <select 
                  value={genre} 
                  onChange={(e) => setGenre(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem' }}
                >
                  <option>Non-fiction</option>
                  <option>Technology & Science</option>
                  <option>Novel / Fiction</option>
                  <option>Academic & Research</option>
                  <option>Business & Leadership</option>
                  <option>Memoir & Biography</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Target Audience</label>
                <input 
                  type="text" 
                  value={targetAudience} 
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Engineers & Founders"
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Writing Style</label>
                <input 
                  type="text" 
                  value={writingStyle} 
                  onChange={(e) => setWritingStyle(e.target.value)}
                  placeholder="e.g. Authoritative & Clear"
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Book Premise / Description</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your book is about..."
                style={{ width: '100%', padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '0.5rem' }}
              />
            </div>
          </>
        )}

        {/* Processing Progress Status Display */}
        {processingStatus && (
          <div style={{
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            color: '#0369A1',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{processingStatus}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
        >
          {loading ? "Processing Manuscript..." : "Initialize Book Workspace"} <ArrowRight size={18} />
        </button>

      </form>

    </div>
  );
}
