import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowLeft, ArrowRight, BookOpen, Maximize2, Minimize2, 
  Lightbulb, FileText, HelpCircle, Send, X 
} from 'lucide-react';
import { apiRequest } from '../services/api';

export default function ReaderModePage({ selectedBookId, setActivePage }) {
  const [book, setBook] = useState(null);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  
  // Theme settings: 'light', 'sepia', 'dark'
  const [theme, setTheme] = useState('sepia');
  const [fontSize, setFontSize] = useState(19);
  const [fontFamily, setFontFamily] = useState('Merriweather');
  const [studyToolActive, setStudyToolActive] = useState(false);
  const [aiStudyExplanation, setAiStudyExplanation] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Default to Full View Mode immediately upon viewing reading section
  const [isFullView, setIsFullView] = useState(true);

  // Auto-reset full view mode when unmounting or navigating away to another section
  useEffect(() => {
    setIsFullView(true);
    return () => {
      setIsFullView(false);
    };
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      loadBook(selectedBookId);
    } else {
      loadSamplePublicBook();
    }
  }, [selectedBookId]);

  const toggleFullView = () => {
    setIsFullView(prev => !prev);
  };

  const loadBook = async (id) => {
    try {
      const data = await apiRequest(`/books/${id}`);
      setBook(data);
    } catch (err) {
      console.error("Failed to load book for reading:", err);
    }
  };

  const loadSamplePublicBook = async () => {
    try {
      const publicBooks = await apiRequest('/books/public');
      if (publicBooks.length > 0) {
        setBook(publicBooks[0]);
      }
    } catch (err) {
      console.error("Failed to load public book:", err);
    }
  };

  const activeChapter = book?.chapters?.[currentChapterIdx];

  const handleAIExplain = async (modePrompt = "Explain this section simply with key takeaways for study mode.") => {
    if (!activeChapter) return;
    setAiLoading(true);
    setAiStudyExplanation("AI Analyzing section...");
    try {
      const secContent = activeChapter.sections?.[0]?.content || "";
      const res = await apiRequest('/ai/assistant-chat', 'POST', {
        book_id: book.id,
        chapter_id: activeChapter.id,
        user_prompt: modePrompt,
        selected_text: secContent.slice(0, 400)
      });
      setAiStudyExplanation(res.response);
    } catch (err) {
      setAiStudyExplanation("Failed to fetch AI study notes. Please check connection.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskCustomQuestion = async (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    handleAIExplain(customQuestion);
    setCustomQuestion('');
  };

  if (!book) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
        No public book available to read. Select a manuscript from your dashboard.
      </div>
    );
  }

  // High-Contrast Theme System
  const themeClasses = {
    light: { 
      bg: '#FFFFFF', 
      text: '#1E293B', 
      heading: '#020617', 
      card: '#F8FAFC', 
      border: '#E2E8F0',
      accent: '#2563EB',
      aiCardBg: '#EFF6FF',
      aiCardBorder: '#93C5FD'
    },
    sepia: { 
      bg: '#FBF0D9', 
      text: '#2C1A0E', 
      heading: '#1A0C05', 
      card: '#F3E2BD', 
      border: '#E4CF9E',
      accent: '#D97706',
      aiCardBg: '#F5E6C4',
      aiCardBorder: '#D97706'
    },
    dark: { 
      bg: '#0F172A', 
      text: '#F1F5F9', 
      heading: '#FFFFFF', 
      card: '#1E293B', 
      border: '#334155',
      accent: '#38BDF8',
      aiCardBg: '#1E293B',
      aiCardBorder: '#38BDF8'
    }
  }[theme];

  return (
    <div 
      className={`reader-mode-container ${isFullView ? 'full-view-active' : ''}`}
      style={isFullView ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        overflowY: 'auto',
        backgroundColor: themeClasses.bg,
        color: themeClasses.text,
        transition: 'background-color 0.25s ease, color 0.25s ease',
        fontFamily: fontFamily === 'Merriweather' ? 'Merriweather, Georgia, serif' : 'Inter, sans-serif',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0
      } : { 
        backgroundColor: themeClasses.bg, 
        color: themeClasses.text, 
        minHeight: '100%', 
        transition: 'background-color 0.25s ease, color 0.25s ease',
        fontFamily: fontFamily === 'Merriweather' ? 'Merriweather, Georgia, serif' : 'Inter, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      
      {/* 1. Reader Controls Sticky Header Toolbar */}
      <div style={{
        padding: '0.75rem 1.5rem',
        borderBottom: `1px solid ${themeClasses.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        backgroundColor: themeClasses.bg,
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        backdropFilter: 'blur(8px)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Left Side: Exit Button & Book Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <button 
            onClick={() => {
              if (isFullView) setIsFullView(false);
              setActivePage('dashboard');
            }}
            style={{ 
              background: 'transparent', 
              border: `1px solid ${themeClasses.border}`, 
              color: themeClasses.text, 
              padding: '0.35rem 0.75rem',
              borderRadius: '0.45rem',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              fontWeight: 700, 
              fontSize: '0.8rem',
              whiteSpace: 'nowrap'
            }}
          >
            <ArrowLeft size={15} /> Exit
          </button>
          <span style={{ 
            fontWeight: 800, 
            fontSize: '0.875rem', 
            color: themeClasses.heading, 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            maxWidth: '220px' 
          }}>
            {book.title}
          </span>
        </div>

        {/* Right Side: Toolbar Customization Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          
          {/* Theme Switcher */}
          <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: themeClasses.card, padding: '0.15rem', borderRadius: '0.45rem', border: `1px solid ${themeClasses.border}` }}>
            <button 
              onClick={() => setTheme('light')}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '0.3rem', border: 'none', cursor: 'pointer', backgroundColor: theme === 'light' ? '#2563EB' : 'transparent', color: theme === 'light' ? '#FFF' : themeClasses.text, fontSize: '0.75rem', fontWeight: 700 }}
            >
              Light
            </button>
            <button 
              onClick={() => setTheme('sepia')}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '0.3rem', border: 'none', cursor: 'pointer', backgroundColor: theme === 'sepia' ? '#D97706' : 'transparent', color: theme === 'sepia' ? '#FFF' : themeClasses.text, fontSize: '0.75rem', fontWeight: 700 }}
            >
              Sepia
            </button>
            <button 
              onClick={() => setTheme('dark')}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '0.3rem', border: 'none', cursor: 'pointer', backgroundColor: theme === 'dark' ? '#2563EB' : 'transparent', color: theme === 'dark' ? '#FFF' : themeClasses.text, fontSize: '0.75rem', fontWeight: 700 }}
            >
              Dark
            </button>
          </div>

          {/* Font Size Adjusters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: themeClasses.card, padding: '0.15rem 0.35rem', borderRadius: '0.45rem', border: `1px solid ${themeClasses.border}` }}>
            <button 
              onClick={() => setFontSize(f => Math.max(15, f - 2))} 
              style={{ padding: '0.15rem 0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: themeClasses.text, fontWeight: 800 }}
              title="Decrease font size"
            >
              A-
            </button>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>{fontSize}px</span>
            <button 
              onClick={() => setFontSize(f => Math.min(28, f + 2))} 
              style={{ padding: '0.15rem 0.35rem', background: 'transparent', border: 'none', cursor: 'pointer', color: themeClasses.text, fontWeight: 800 }}
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Full View Reading Mode Button (In-App Expand) */}
          <button 
            onClick={toggleFullView}
            style={{
              backgroundColor: isFullView ? themeClasses.accent : 'transparent',
              color: isFullView ? '#FFFFFF' : themeClasses.text,
              border: `1px solid ${themeClasses.border}`,
              padding: '0.35rem 0.75rem',
              borderRadius: '0.45rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: isFullView ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            title={isFullView ? "Exit Full View" : "Enter In-App Full View Reading Mode"}
          >
            {isFullView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullView ? 'Normal View' : 'Full View'}
          </button>

          {/* AI Study Mode Button */}
          <button 
            onClick={() => setStudyToolActive(!studyToolActive)}
            style={{
              backgroundColor: studyToolActive ? themeClasses.accent : 'transparent',
              color: studyToolActive ? '#FFFFFF' : themeClasses.text,
              border: `1px solid ${studyToolActive ? themeClasses.accent : themeClasses.border}`,
              padding: '0.35rem 0.75rem',
              borderRadius: '0.45rem',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
              boxShadow: studyToolActive ? '0 0 10px rgba(37, 99, 235, 0.35)' : 'none'
            }}
          >
            <Sparkles size={14} /> AI Study {studyToolActive && '✓'}
          </button>

        </div>
      </div>

      {/* 2. Interactive AI Study Assistant Panel */}
      {studyToolActive && (
        <div style={{ 
          maxWidth: isFullView ? '860px' : '780px', 
          margin: '1.25rem auto 0 auto', 
          padding: '0 1.5rem',
          boxSizing: 'border-box',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            backgroundColor: themeClasses.aiCardBg, 
            border: `1.5px solid ${themeClasses.aiCardBorder}`, 
            padding: '1.25rem', 
            borderRadius: '0.85rem', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: themeClasses.accent, fontFamily: 'Outfit, sans-serif' }}>
                <Sparkles size={17} /> Interactive AI Study Assistant & Smart Notes
              </span>
              <button 
                onClick={() => setStudyToolActive(false)} 
                style={{ background: 'transparent', border: 'none', color: themeClasses.text, cursor: 'pointer', opacity: 0.7 }}
                title="Close AI Study Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Action Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button 
                onClick={() => handleAIExplain("Give me 3 bullet key takeaways from this section.")} 
                className="btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Lightbulb size={13} color="#D97706" /> Key Takeaways
              </button>

              <button 
                onClick={() => handleAIExplain("Summarize this chapter simply for quick revision.")} 
                className="btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <FileText size={13} color="#2563EB" /> Simple Summary
              </button>

              <button 
                onClick={() => handleAIExplain("Ask me 2 study questions to test my understanding of this section.")} 
                className="btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <HelpCircle size={13} color="#059669" /> Quiz Questions
              </button>
            </div>

            {/* AI Response Output */}
            <div style={{ 
              backgroundColor: themeClasses.bg, 
              border: `1px solid ${themeClasses.border}`, 
              borderRadius: '0.6rem', 
              padding: '0.85rem 1rem',
              marginBottom: '0.85rem',
              minHeight: '75px'
            }}>
              {aiLoading ? (
                <div style={{ fontSize: '0.85rem', color: themeClasses.accent, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Sparkles size={16} className="spin-icon" /> AI is generating study insights...
                </div>
              ) : aiStudyExplanation ? (
                <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: themeClasses.text, whiteSpace: 'pre-line' }}>
                  {aiStudyExplanation}
                </div>
              ) : (
                <p style={{ fontSize: '0.825rem', opacity: 0.8, color: themeClasses.text, margin: 0 }}>
                  Select a quick action chip above or ask any custom study question below to analyze this chapter in real time.
                </p>
              )}
            </div>

            {/* Custom Question Form */}
            <form onSubmit={handleAskCustomQuestion} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Ask AI anything about this chapter..." 
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '0.45rem 0.75rem', 
                  borderRadius: '0.45rem', 
                  border: `1px solid ${themeClasses.border}`, 
                  backgroundColor: themeClasses.bg, 
                  color: themeClasses.text,
                  fontSize: '0.825rem' 
                }}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Send size={13} /> Ask AI
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Main Manuscript Reader Canvas - Zero Cut-off Layout */}
      <div style={{ 
        maxWidth: isFullView ? '860px' : '780px', 
        margin: '0 auto', 
        padding: '2rem 1.5rem 8rem 1.5rem', 
        boxSizing: 'border-box',
        width: '100%',
        transition: 'max-width 0.25s ease' 
      }}>
        
        {/* Book Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: `2px solid ${themeClasses.border}`, paddingBottom: '2rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: themeClasses.accent, marginBottom: '0.5rem' }}>
            {book.genre || 'TECHNOLOGY & PUBLISHING'}
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            fontFamily: 'Outfit, sans-serif', 
            marginTop: '0.5rem', 
            marginBottom: '0.75rem',
            color: themeClasses.heading,
            lineHeight: 1.15,
            wordBreak: 'break-word'
          }}>
            {book.title}
          </h1>
          {book.subtitle && (
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', opacity: 0.9, color: themeClasses.text, marginTop: '0.5rem', wordBreak: 'break-word' }}>
              {book.subtitle}
            </p>
          )}
        </div>

        {/* Live Chapter Content */}
        <div key={currentChapterIdx} className="page-transition-wrapper">
          {activeChapter ? (
            <div>
              <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '0.35rem', backgroundColor: themeClasses.card, border: `1px solid ${themeClasses.border}`, fontSize: '0.75rem', fontWeight: 800, color: themeClasses.accent, marginBottom: '0.75rem' }}>
                CHAPTER {currentChapterIdx + 1} OF {book.chapters?.length || 1}
              </div>
              <h2 style={{ fontSize: '1.95rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '2rem', color: themeClasses.heading, lineHeight: 1.25, wordBreak: 'break-word' }}>
                {activeChapter.title}
              </h2>

              {activeChapter.sections?.map(sec => (
                <div key={sec.id} style={{ marginBottom: '2.5rem' }}>
                  {sec.title && (
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.1rem', color: themeClasses.accent, fontFamily: 'Outfit, sans-serif', wordBreak: 'break-word' }}>
                      {sec.title}
                    </h3>
                  )}
                  <div style={{
                    fontSize: `${fontSize}px`,
                    fontFamily: fontFamily === 'Merriweather' ? 'Merriweather, Georgia, serif' : 'Inter, sans-serif',
                    lineHeight: 1.85,
                    color: themeClasses.text,
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    letterSpacing: '0.01em'
                  }}>
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>No chapters found in this book.</div>
          )}
        </div>

        {/* Chapter Turning Navigation Footer */}
        <div style={{ 
          display: 'flex', 
          justify: 'space-between', 
          alignItems: 'center', 
          marginTop: '3.5rem', 
          paddingTop: '1.75rem', 
          borderTop: `2px solid ${themeClasses.border}`,
          gap: '1rem'
        }}>
          <button 
            disabled={currentChapterIdx === 0}
            onClick={() => setCurrentChapterIdx(c => Math.max(0, c - 1))}
            className="btn-secondary"
            style={{ 
              opacity: currentChapterIdx === 0 ? 0.4 : 1,
              cursor: currentChapterIdx === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: themeClasses.card,
              color: themeClasses.text,
              borderColor: themeClasses.border,
              padding: '0.5rem 1rem'
            }}
          >
            <ArrowLeft size={16} /> Previous Chapter
          </button>

          <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, color: themeClasses.text, whiteSpace: 'nowrap' }}>
            Page {currentChapterIdx + 1} / {book.chapters?.length || 1}
          </span>

          <button 
            disabled={!book.chapters || currentChapterIdx >= book.chapters.length - 1}
            onClick={() => setCurrentChapterIdx(c => c + 1)}
            className="btn-primary"
            style={{ 
              opacity: !book.chapters || currentChapterIdx >= book.chapters.length - 1 ? 0.4 : 1,
              cursor: !book.chapters || currentChapterIdx >= book.chapters.length - 1 ? 'not-allowed' : 'pointer',
              padding: '0.5rem 1rem'
            }}
          >
            Next Chapter <ArrowRight size={16} />
          </button>
        </div>

      </div>

    </div>
  );
}
