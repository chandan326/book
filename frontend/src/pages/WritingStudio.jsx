import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, Download, Eye, Plus, Check, X, Undo, RefreshCw, 
  HelpCircle, MessageSquare, AlertTriangle, Image as ImageIcon, BookOpen, 
  Layers, CheckCircle2, ChevronRight, Trash2, Type, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Bold, Italic, Underline, Strikethrough, Globe, 
  Highlighter, Palette, Sliders, FileText, Clock
} from 'lucide-react';
import { apiRequest } from '../services/api';

export default function WritingStudio({ selectedBookId, setActivePage }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Editor content state
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionContent, setSectionContent] = useState('');

  // Right Panel Tab state: 'formatting', 'audit', 'chat'
  const [rightTab, setRightTab] = useState('formatting');

  // Text Formatting State Controls
  const [editorFontFamily, setEditorFontFamily] = useState('Merriweather');
  const [editorFontSize, setEditorFontSize] = useState(18);
  const [editorTextColor, setEditorTextColor] = useState('#1E293B');
  const [editorBgHighlight, setEditorBgHighlight] = useState('transparent');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState('normal');
  const [textTransform, setTextTransform] = useState('none');
  const [targetLanguage, setTargetLanguage] = useState('Hindi');
  const [translating, setTranslating] = useState(false);

  // AI & Audit state
  const [auditData, setAuditData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [auditing, setAuditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedBookId) {
      loadBookDetails(selectedBookId);
    } else {
      autoSelectDefaultBook();
    }
  }, [selectedBookId]);

  const autoSelectDefaultBook = async () => {
    try {
      setLoading(true);
      // Try user books first
      const myBooks = await apiRequest('/books/');
      if (myBooks && myBooks.length > 0) {
        await loadBookDetails(myBooks[0].id);
        return;
      }
      // Try public books fallback
      const publicBooks = await apiRequest('/books/public');
      if (publicBooks && publicBooks.length > 0) {
        await loadBookDetails(publicBooks[0].id);
        return;
      }
    } catch (err) {
      console.error("Failed auto selecting default book:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookDetails = async (id) => {
    try {
      setLoading(true);
      const data = await apiRequest(`/books/${id}`);
      setBook(data);
      if (data && data.chapters && data.chapters.length > 0) {
        const ch = data.chapters[activeChapterIndex] || data.chapters[0];
        if (ch && ch.sections && ch.sections.length > 0) {
          const sec = ch.sections[activeSectionIndex] || ch.sections[0];
          setSectionTitle(sec.title || '');
          setSectionContent(sec.content || '');
        } else {
          setSectionTitle(ch.title || 'Chapter 1');
          setSectionContent('');
        }
      }
      loadSuggestions(id);
    } catch (err) {
      console.error("Failed to load book details:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (id) => {
    try {
      const sugs = await apiRequest(`/ai/suggestions/${id}`);
      setSuggestions(sugs || []);
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    }
  };

  const activeChapter = book?.chapters?.[activeChapterIndex];
  const activeSection = activeChapter?.sections?.[activeSectionIndex];

  const handleSelectSection = (chIdx, secIdx) => {
    setActiveChapterIndex(chIdx);
    setActiveSectionIndex(secIdx);
    const targetSec = book?.chapters?.[chIdx]?.sections?.[secIdx];
    if (targetSec) {
      setSectionTitle(targetSec.title || '');
      setSectionContent(targetSec.content || '');
    }
  };

  const handleSaveSection = async () => {
    if (!activeSection) return;
    setSaving(true);
    try {
      await apiRequest(`/books/sections/${activeSection.id}`, 'PUT', {
        title: sectionTitle,
        content: sectionContent,
        order_index: activeSection.order_index
      });
      const updatedBook = await apiRequest(`/books/${book.id}`);
      setBook(updatedBook);
    } catch (err) {
      alert("Failed to save section: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddChapter = async () => {
    const title = prompt("Enter new chapter title:", `Chapter ${(book?.chapters?.length || 0) + 1}: New Chapter`);
    if (!title) return;
    try {
      await apiRequest(`/books/${book.id}/chapters`, 'POST', {
        title,
        order_index: book?.chapters?.length || 0
      });
      loadBookDetails(book.id);
    } catch (err) {
      alert("Failed to add chapter: " + err.message);
    }
  };

  const handleDeleteChapter = async (chId, chTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${chTitle}"? This will delete all its sections/pages.`)) return;
    try {
      await apiRequest(`/books/chapters/${chId}`, 'DELETE');
      setActiveChapterIndex(0);
      setActiveSectionIndex(0);
      loadBookDetails(book.id);
    } catch (err) {
      alert("Failed to delete chapter: " + err.message);
    }
  };

  const handleAddSection = async (chId, e) => {
    e.stopPropagation();
    const title = prompt("Enter new section/page title:", "New Section");
    if (!title) return;
    try {
      await apiRequest(`/books/chapters/${chId}/sections`, 'POST', {
        title,
        content: "Write content here...",
        order_index: 0
      });
      loadBookDetails(book.id);
    } catch (err) {
      alert("Failed to add section: " + err.message);
    }
  };

  const handleDeleteSection = async (secId, secTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete section/page "${secTitle}"?`)) return;
    try {
      await apiRequest(`/books/sections/${secId}`, 'DELETE');
      setActiveSectionIndex(0);
      loadBookDetails(book.id);
    } catch (err) {
      alert("Failed to delete section: " + err.message);
    }
  };

  const handleRunAIAudit = async () => {
    if (!book) return;
    setAuditing(true);
    try {
      const result = await apiRequest('/ai/audit-chapter', 'POST', {
        book_id: book.id,
        chapter_id: activeChapter?.id
      });
      setAuditData(result);
      loadSuggestions(book.id);
    } catch (err) {
      alert("AI Audit failed: " + err.message);
    } finally {
      setAuditing(false);
    }
  };

  const handleAITranslate = async () => {
    if (!sectionContent.trim()) return;
    setTranslating(true);
    try {
      const res = await apiRequest('/ai/assistant-chat', 'POST', {
        book_id: book.id,
        chapter_id: activeChapter?.id,
        section_id: activeSection?.id,
        user_prompt: `Translate the following text accurately into ${targetLanguage}. Return ONLY the translated text without extra commentary.`,
        selected_text: sectionContent
      });
      setSectionContent(res.response);
    } catch (err) {
      alert("Translation failed: " + err.message);
    } finally {
      setTranslating(false);
    }
  };

  const handleAcceptSuggestion = async (sugId) => {
    try {
      await apiRequest(`/ai/suggestions/${sugId}/accept`, 'POST');
      loadSuggestions(book.id);
      loadBookDetails(book.id);
    } catch (err) {
      alert("Error accepting suggestion: " + err.message);
    }
  };

  const handleRejectSuggestion = async (sugId) => {
    try {
      await apiRequest(`/ai/suggestions/${sugId}/reject`, 'POST');
      loadSuggestions(book.id);
    } catch (err) {
      alert("Error rejecting suggestion: " + err.message);
    }
  };

  const handleSendAIChat = async (e) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userMsg = chatPrompt;
    setChatPrompt('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);

    try {
      const res = await apiRequest('/ai/assistant-chat', 'POST', {
        book_id: book.id,
        chapter_id: activeChapter?.id,
        section_id: activeSection?.id,
        user_prompt: userMsg,
        selected_text: sectionContent.slice(0, 300)
      });

      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: res.response,
        suggestions: res.suggestions 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', text: "Error fetching AI response: " + err.message }]);
    }
  };

  // Live Statistics
  const wordCount = sectionContent.trim() ? sectionContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = sectionContent.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', backgroundColor: '#F8FAFC' }}>
        <RefreshCw size={32} className="spin-icon" style={{ color: '#2563EB', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Outfit', color: '#0F172A' }}>Loading AI Writing Studio...</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>Setting up manuscript hierarchy & typography canvas...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', backgroundColor: '#F8FAFC', padding: '2rem', textAlign: 'center' }}>
        <BookOpen size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: '#0F172A' }}>No Manuscript Selected</h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0', maxWidth: '460px' }}>
          Please select an existing manuscript from your Author Dashboard or create a new book to open the writing studio.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActivePage('create')} className="btn-primary">
            <Plus size={16} /> Create New Manuscript
          </button>
          <button onClick={() => setActivePage('dashboard')} className="btn-secondary">
            Go to Author Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Top Studio Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit', color: '#0F172A' }}>{book.title}</h2>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Genre: {book.genre} | Preset: <strong>{book.formatting_preset}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={handleSaveSection}
            disabled={saving}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Manuscript"}
          </button>

          <button 
            onClick={() => window.open(`http://localhost:8000/api/v1/export/pdf/${book.id}`, '_blank')}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            <Download size={16} /> Export PDF
          </button>

          <button 
            onClick={() => setActivePage('reader')}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
          >
            <Eye size={16} /> Reader Preview
          </button>
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: Book Structure Tree with Chapter & Page Delete Buttons */}
        <div style={{
          width: '280px',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          borderRight: '1px solid #1E293B',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', color: '#94A3B8', textTransform: 'uppercase' }}>
              MANUSCRIPT HIERARCHY
            </span>
            <button 
              onClick={handleAddChapter}
              style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600 }}
              title="Add Chapter"
            >
              <Plus size={14} /> Chapter
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {book.chapters?.map((ch, chIdx) => (
              <div key={ch.id} style={{ marginBottom: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                
                {/* Chapter Header with Delete Chapter and Add Page Buttons */}
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: activeChapterIndex === chIdx ? '#38BDF8' : '#E2E8F0',
                  marginBottom: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.title}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button 
                      onClick={(e) => handleAddSection(ch.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                      title="Add Page / Section"
                    >
                      <Plus size={13} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteChapter(ch.id, ch.title, e)}
                      style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                      title="Delete Chapter"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Sections / Pages List */}
                <div style={{ paddingLeft: '0.3rem' }}>
                  {ch.sections?.map((sec, secIdx) => {
                    const isSelected = activeChapterIndex === chIdx && activeSectionIndex === secIdx;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleSelectSection(chIdx, secIdx)}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '0.35rem',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#2563EB' : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#94A3B8',
                          marginTop: '0.15rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.35rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <ChevronRight size={12} /> {sec.title}
                        </div>
                        <button 
                          onClick={(e) => handleDeleteSection(sec.id, sec.title, e)}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: isSelected ? '#FFE4E6' : '#F87171', 
                            cursor: 'pointer', 
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: isSelected ? 1 : 0.7 
                          }}
                          title="Delete Page / Section"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE COLUMN: Main Manuscript Editor & Reversible Diff Viewer */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', overflowY: 'auto', padding: '2rem' }}>
          
          <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
            
            <input 
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Section Title..."
              style={{
                width: '100%',
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                border: 'none',
                outline: 'none',
                marginBottom: '1.25rem',
                color: '#0F172A'
              }}
            />

            {/* Live Interactive Manuscript Textarea */}
            <textarea 
              rows={16}
              value={sectionContent}
              onChange={(e) => setSectionContent(e.target.value)}
              placeholder="Write your chapter manuscript section here..."
              style={{
                width: '100%',
                fontSize: `${editorFontSize}px`,
                fontFamily: editorFontFamily === 'Merriweather' ? 'Merriweather, Georgia, serif' : 
                            editorFontFamily === 'Inter' ? 'Inter, sans-serif' : 
                            editorFontFamily === 'Georgia' ? 'Georgia, serif' : 
                            editorFontFamily === 'Roboto' ? 'Roboto, sans-serif' : 'Outfit, sans-serif',
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isUnderline && isStrikethrough ? 'underline line-through' : isUnderline ? 'underline' : isStrikethrough ? 'line-through' : 'none',
                color: editorTextColor,
                backgroundColor: editorBgHighlight,
                textAlign: textAlign,
                lineHeight: lineHeight,
                letterSpacing: letterSpacing,
                textTransform: textTransform,
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            />

            {/* Reversible Diff Suggestions Box */}
            {suggestions.length > 0 && (
              <div style={{ marginTop: '2rem', borderTop: '2px solid #E2E8F0', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="#2563EB" /> AI Pending Diff Suggestions ({suggestions.length})
                </h3>

                {suggestions.map((sug) => (
                  <div key={sug.id} className="card" style={{ marginBottom: '1rem', backgroundColor: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Category: {sug.category}
                    </div>

                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                      <div style={{ marginBottom: '0.35rem' }}>
                        <strong style={{ color: '#64748B' }}>Original:</strong> <span className="diff-original">{sug.original_text}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#64748B' }}>Suggested:</strong> <span className="diff-suggested">{sug.suggested_text}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                      Why: {sug.explanation}
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleAcceptSuggestion(sug.id)}
                        className="btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      >
                        <Check size={14} /> Accept Diff
                      </button>
                      <button 
                        onClick={() => handleRejectSuggestion(sug.id)}
                        className="btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: AI Assistant & Text Formatting Studio */}
        <div style={{
          width: '340px',
          backgroundColor: '#F8FAFC',
          borderLeft: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Right Panel Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <button 
              onClick={() => setRightTab('formatting')}
              style={{ flex: 1, padding: '0.65rem 0.3rem', fontSize: '0.75rem', fontWeight: 700, border: 'none', borderBottom: rightTab === 'formatting' ? '2px solid #2563EB' : 'none', color: rightTab === 'formatting' ? '#2563EB' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
            >
              <Type size={14} /> Text Editor
            </button>
            <button 
              onClick={() => setRightTab('audit')}
              style={{ flex: 1, padding: '0.65rem 0.3rem', fontSize: '0.75rem', fontWeight: 700, border: 'none', borderBottom: rightTab === 'audit' ? '2px solid #2563EB' : 'none', color: rightTab === 'audit' ? '#2563EB' : '#64748B', cursor: 'pointer' }}
            >
              AI Audit
            </button>
            <button 
              onClick={() => setRightTab('chat')}
              style={{ flex: 1, padding: '0.65rem 0.3rem', fontSize: '0.75rem', fontWeight: 700, border: 'none', borderBottom: rightTab === 'chat' ? '2px solid #2563EB' : 'none', color: rightTab === 'chat' ? '#2563EB' : '#64748B', cursor: 'pointer' }}
            >
              Chat
            </button>
          </div>

          {/* TAB 1: FULL FEATURED TEXT FORMATTING & TYPOGRAPHY STUDIO */}
          {rightTab === 'formatting' && (
            <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
              
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Type size={16} color="#2563EB" /> Typography & Style Studio
              </div>

              {/* 1. Writing / Font Family Selector */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Font Family (Writing Style)
                </label>
                <select 
                  value={editorFontFamily}
                  onChange={(e) => setEditorFontFamily(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '0.4rem', border: '1px solid #CBD5E1', fontSize: '0.825rem', fontWeight: 600, color: '#0F172A' }}
                >
                  <option value="Merriweather">Merriweather (Classic Serif)</option>
                  <option value="Inter">Inter (Modern Sans-Serif)</option>
                  <option value="Georgia">Georgia (Editorial Serif)</option>
                  <option value="Roboto">Roboto (Clean Neutral)</option>
                  <option value="Outfit">Outfit (Bold Display)</option>
                </select>
              </div>

              {/* 2. Font Size Control */}
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Font Size</label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB' }}>{editorFontSize}px</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setEditorFontSize(s => Math.max(12, s - 1))}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', background: '#FFF', fontWeight: 800, cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <input 
                    type="range" 
                    min={12} 
                    max={36} 
                    value={editorFontSize}
                    onChange={(e) => setEditorFontSize(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#2563EB' }}
                  />
                  <button 
                    onClick={() => setEditorFontSize(s => Math.min(36, s + 1))}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', background: '#FFF', fontWeight: 800, cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 3. Text Formatting Weights & Styles (B, I, U, S) */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Text Styles & Emphasis
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button 
                    onClick={() => setIsBold(!isBold)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: isBold ? '#2563EB' : '#FFF', color: isBold ? '#FFF' : '#0F172A', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    title="Bold"
                  >
                    <Bold size={15} />
                  </button>
                  <button 
                    onClick={() => setIsItalic(!isItalic)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: isItalic ? '#2563EB' : '#FFF', color: isItalic ? '#FFF' : '#0F172A', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    title="Italic"
                  >
                    <Italic size={15} />
                  </button>
                  <button 
                    onClick={() => setIsUnderline(!isUnderline)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: isUnderline ? '#2563EB' : '#FFF', color: isUnderline ? '#FFF' : '#0F172A', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    title="Underline"
                  >
                    <Underline size={15} />
                  </button>
                  <button 
                    onClick={() => setIsStrikethrough(!isStrikethrough)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: isStrikethrough ? '#2563EB' : '#FFF', color: isStrikethrough ? '#FFF' : '#0F172A', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    title="Strikethrough"
                  >
                    <Strikethrough size={15} />
                  </button>
                </div>
              </div>

              {/* 4. Text Alignment */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Text Alignment
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button 
                    onClick={() => setTextAlign('left')}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: textAlign === 'left' ? '#2563EB' : '#FFF', color: textAlign === 'left' ? '#FFF' : '#0F172A', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                  >
                    <AlignLeft size={15} />
                  </button>
                  <button 
                    onClick={() => setTextAlign('center')}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: textAlign === 'center' ? '#2563EB' : '#FFF', color: textAlign === 'center' ? '#FFF' : '#0F172A', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                  >
                    <AlignCenter size={15} />
                  </button>
                  <button 
                    onClick={() => setTextAlign('right')}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: textAlign === 'right' ? '#2563EB' : '#FFF', color: textAlign === 'right' ? '#FFF' : '#0F172A', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                  >
                    <AlignRight size={15} />
                  </button>
                  <button 
                    onClick={() => setTextAlign('justify')}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', backgroundColor: textAlign === 'justify' ? '#2563EB' : '#FFF', color: textAlign === 'justify' ? '#FFF' : '#0F172A', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                  >
                    <AlignJustify size={15} />
                  </button>
                </div>
              </div>

              {/* 5. Text Color Palette */}
              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Text Color</label>
                  <input 
                    type="color" 
                    value={editorTextColor}
                    onChange={(e) => setEditorTextColor(e.target.value)}
                    style={{ width: '24px', height: '24px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                    title="Custom Color Picker"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['#0F172A', '#2563EB', '#059669', '#DC2626', '#D97706', '#7C3AED', '#475569'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setEditorTextColor(c)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: editorTextColor === c ? '2px solid #0F172A' : '1px solid #CBD5E1',
                        cursor: 'pointer',
                        transform: editorTextColor === c ? 'scale(1.15)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 6. Background Highlight Color */}
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  Text Highlight Marker
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { name: 'None', color: 'transparent' },
                    { name: 'Yellow', color: '#FEF08A' },
                    { name: 'Green', color: '#BBF7D0' },
                    { name: 'Blue', color: '#BFDBFE' },
                    { name: 'Pink', color: '#FBCFE8' },
                    { name: 'Orange', color: '#FED7AA' }
                  ].map(h => (
                    <button 
                      key={h.name}
                      onClick={() => setEditorBgHighlight(h.color)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.3rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: h.color === 'transparent' ? '#F1F5F9' : h.color,
                        border: editorBgHighlight === h.color ? '2px solid #2563EB' : '1px solid #CBD5E1',
                        color: '#0F172A',
                        cursor: 'pointer'
                      }}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Line Spacing & Letter Spacing */}
              <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Line Spacing</label>
                  <select 
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    <option value={1.4}>1.4 (Tight)</option>
                    <option value={1.8}>1.8 (Normal)</option>
                    <option value={2.2}>2.2 (Relaxed)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Case Transform</label>
                  <select 
                    value={textTransform}
                    onChange={(e) => setTextTransform(e.target.value)}
                    style={{ width: '100%', padding: '0.35rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    <option value="none">Normal Case</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="capitalize">Capitalize Words</option>
                  </select>
                </div>
              </div>

              {/* 8. AI Language Translator */}
              <div style={{ marginBottom: '1.2rem', backgroundColor: '#FFFFFF', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
                  <Globe size={14} /> AI Language Translator
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select 
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    style={{ flex: 1, padding: '0.35rem', borderRadius: '0.35rem', border: '1px solid #CBD5E1', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                  </select>
                  <button 
                    onClick={handleAITranslate}
                    disabled={translating}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  >
                    {translating ? "Translating..." : "Translate"}
                  </button>
                </div>
              </div>

              {/* 9. Live Word & Reading Time Stats */}
              <div style={{ backgroundColor: '#F1F5F9', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#475569', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{wordCount}</div>
                  <div>Words</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{charCount}</div>
                  <div>Chars</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#2563EB', fontSize: '0.9rem' }}>{readingTime}m</div>
                  <div>Read Time</div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AI AUDIT */}
          {rightTab === 'audit' && (
            <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
              
              <button 
                onClick={handleRunAIAudit}
                disabled={auditing}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '1.25rem', fontSize: '0.85rem' }}
              >
                <Sparkles size={16} /> {auditing ? "Auditing Chapter..." : "Run AI Chapter Audit"}
              </button>

              {auditData ? (
                <div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Readability TEMPO</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{auditData.readability_score} / 100</div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Problems Detected</h4>
                    {auditData.problems_detected.map((prob, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: '#B91C1C', backgroundColor: '#FEF2F2', padding: '0.4rem', borderRadius: '0.25rem', marginBottom: '0.35rem' }}>
                        • {prob}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Transition Recommendation</h4>
                    <p style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>{auditData.transition_recommendation}</p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem', marginTop: '2rem' }}>
                  Click "Run AI Chapter Audit" to receive professional editorial feedback.
                </div>
              )}

            </div>
          )}

          {/* TAB 3: AI CONTEXTUAL CHAT */}
          {rightTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div style={{ fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '0.5rem', borderRadius: '0.4rem' }}>
                  💡 <strong>Contextual Prompt Ideas:</strong>
                  <div>• "Simplify this section"</div>
                  <div>• "Give a practical example"</div>
                  <div>• "Suggest 3 better chapter titles"</div>
                </div>

                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === 'user' ? '#2563EB' : '#FFFFFF',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    maxWidth: '90%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    border: msg.sender === 'ai' ? '1px solid #E2E8F0' : 'none'
                  }}>
                    {msg.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendAIChat} style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Ask AI Assistant..."
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem', border: '1px solid #CBD5E1', borderRadius: '0.35rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
                  Send
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
