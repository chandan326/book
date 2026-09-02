import React, { useMemo, useState } from 'react';
import { BrainCircuit, BookOpenCheck, CheckCircle2, KeyRound, MessageCircleQuestion, RotateCcw, Sparkles } from 'lucide-react';
import { analyzeReading, answerFromText, extractKeywords, generateQuiz, summarize } from '../services/learningEngine';
import './LearningLab.css';

const SAMPLE = `Machine learning helps computers learn patterns from examples instead of following only fixed instructions. A model is trained on data, where it identifies relationships that can be used to make predictions. Supervised learning uses labelled examples, while unsupervised learning discovers structure in unlabelled data. The quality and diversity of training data strongly influence how well a model performs. Evaluation on unseen data is essential because a model can memorize training examples without learning a general pattern. This problem is called overfitting. Techniques such as validation, regularization, and careful feature selection can reduce overfitting. Responsible machine learning also requires attention to fairness, privacy, transparency, and human oversight.`;

export default function LearningLab() {
  const [sourceText, setSourceText] = useState(SAMPLE);
  const [analysisText, setAnalysisText] = useState(SAMPLE);
  const [question, setQuestion] = useState('What is overfitting?');
  const [answer, setAnswer] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => ({
    summary: summarize(analysisText),
    keywords: extractKeywords(analysisText),
    quiz: generateQuiz(analysisText),
    stats: analyzeReading(analysisText)
  }), [analysisText]);

  const runAnalysis = () => {
    if (sourceText.trim().length < 80) return;
    setAnalysisText(sourceText.trim());
    setAnswer(null);
    setQuizAnswers({});
    setSubmitted(false);
  };

  const askQuestion = (event) => {
    event.preventDefault();
    if (question.trim()) setAnswer(answerFromText(analysisText, question));
  };

  const score = result.quiz.reduce((total, item, index) => total + (quizAnswers[index] === item.answer ? 1 : 0), 0);

  return (
    <div className="learning-lab">
      <header className="lab-hero">
        <div>
          <span className="lab-kicker"><Sparkles size={15} /> PANNA Intelligence</span>
          <h1>Turn any chapter into an interactive learning experience.</h1>
          <p>On-device NLP finds key ideas, builds a concise study guide, answers from the supplied text, and creates a knowledge check—without sending your chapter anywhere.</p>
        </div>
        <div className="lab-hero-badge"><BrainCircuit size={38} /><strong>4 tools</strong><span>One learning loop</span></div>
      </header>

      <section className="lab-input-card">
        <div className="lab-section-title"><BookOpenCheck size={20} /><div><h2>Chapter workspace</h2><p>Paste course notes or a chapter (minimum 80 characters).</p></div></div>
        <textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} aria-label="Learning source text" />
        <div className="lab-input-footer"><span>{sourceText.trim().split(/\s+/).filter(Boolean).length} words</span><button onClick={runAnalysis} disabled={sourceText.trim().length < 80}><Sparkles size={17} /> Generate learning kit</button></div>
      </section>

      <div className="lab-stats">
        <div><strong>{result.stats.wordCount}</strong><span>Words analysed</span></div>
        <div><strong>{result.stats.readingMinutes} min</strong><span>Reading time</span></div>
        <div><strong>{result.stats.difficulty}</strong><span>Reading level</span></div>
        <div><strong>Private</strong><span>On-device analysis</span></div>
      </div>

      <div className="lab-grid">
        <section className="lab-card summary-card">
          <div className="lab-section-title"><Sparkles size={20} /><div><h2>Smart summary</h2><p>Important sentences ranked by concept density.</p></div></div>
          <ol>{result.summary.map((sentence, index) => <li key={index}>{sentence}</li>)}</ol>
        </section>

        <section className="lab-card">
          <div className="lab-section-title"><KeyRound size={20} /><div><h2>Key concepts</h2><p>High-signal terms from this chapter.</p></div></div>
          <div className="keyword-cloud">{result.keywords.map(({ word, count }) => <span key={word}>{word}<small>{count}</small></span>)}</div>
        </section>
      </div>

      <section className="lab-card qa-card">
        <div className="lab-section-title"><MessageCircleQuestion size={20} /><div><h2>Ask this chapter</h2><p>Answers are grounded in the provided content, with confidence and evidence.</p></div></div>
        <form onSubmit={askQuestion}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question about the chapter..." /><button>Find answer</button></form>
        {answer && <div className={`answer-box ${answer.confidence === 0 ? 'low' : ''}`}><div><strong>{answer.confidence ? `${answer.confidence}% grounded` : 'Not found in chapter'}</strong></div><p>{answer.answer}</p>{answer.evidence && <small>Evidence: “{answer.evidence}”</small>}</div>}
      </section>

      <section className="lab-card quiz-card">
        <div className="lab-section-title"><CheckCircle2 size={20} /><div><h2>Adaptive knowledge check</h2><p>Generated directly from the chapter's concepts.</p></div></div>
        {result.quiz.map((item, index) => <div className="quiz-question" key={`${item.answer}-${index}`}><h3>{index + 1}. {item.prompt}</h3><div className="quiz-options">{item.options.map((option) => <button className={submitted ? option === item.answer ? 'correct' : quizAnswers[index] === option ? 'wrong' : '' : quizAnswers[index] === option ? 'selected' : ''} onClick={() => !submitted && setQuizAnswers((current) => ({ ...current, [index]: option }))} key={option}>{option}</button>)}</div>{submitted && <p className="quiz-explanation">{item.explanation}</p>}</div>)}
        <div className="quiz-footer">{submitted ? <><strong>Score: {score}/{result.quiz.length}</strong><button onClick={() => { setQuizAnswers({}); setSubmitted(false); }}><RotateCcw size={16} /> Try again</button></> : <button disabled={Object.keys(quizAnswers).length !== result.quiz.length || !result.quiz.length} onClick={() => setSubmitted(true)}>Check my answers</button>}</div>
      </section>

      <footer className="lab-method"><strong>How it works:</strong> PANNA uses frequency-weighted sentence ranking, lexical relevance scoring, and concept-based question generation. Every answer stays traceable to the learner's source text.</footer>
    </div>
  );
}
