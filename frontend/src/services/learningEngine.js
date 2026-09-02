const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','been','being','but','by','for','from','had','has','have',
  'he','her','his','i','if','in','into','is','it','its','of','on','or','our','she','so','that',
  'the','their','them','there','these','they','this','those','to','was','we','were','what',
  'when','where','which','who','will','with','you','your','can','could','should','would'
]);

const cleanText = (text) => text.replace(/\s+/g, ' ').trim();

const words = (text) => (text.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [])
  .filter((word) => !STOP_WORDS.has(word));

export const splitSentences = (text) => cleanText(text)
  .match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [];

export function extractKeywords(text, limit = 8) {
  const counts = new Map();
  words(text).forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function summarize(text, maxSentences = 3) {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return sentences;
  const frequency = new Map(extractKeywords(text, 30).map(({ word, count }) => [word, count]));
  return sentences
    .map((sentence, index) => ({
      sentence,
      index,
      score: words(sentence).reduce((score, word) => score + (frequency.get(word) || 0), 0) /
        Math.max(words(sentence).length, 1)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)
    .map(({ sentence }) => sentence);
}

export function answerFromText(text, question) {
  const queryWords = new Set(words(question));
  const ranked = splitSentences(text).map((sentence) => {
    const sentenceWords = words(sentence);
    const overlap = sentenceWords.filter((word) => queryWords.has(word)).length;
    const keywordBoost = extractKeywords(text, 10)
      .filter(({ word }) => queryWords.has(word) && sentenceWords.includes(word)).length;
    return { sentence, score: overlap * 2 + keywordBoost };
  }).sort((a, b) => b.score - a.score);

  if (!ranked[0] || ranked[0].score === 0) {
    return {
      answer: "I couldn't find enough evidence in this chapter to answer that confidently.",
      confidence: 0,
      evidence: null
    };
  }

  const confidence = Math.min(96, 48 + ranked[0].score * 9);
  return {
    answer: ranked[0].sentence,
    confidence,
    evidence: ranked[1]?.score > 0 ? ranked[1].sentence : ranked[0].sentence
  };
}

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export function generateQuiz(text, limit = 4) {
  const keywords = extractKeywords(text, 12).map(({ word }) => word);
  const sentences = splitSentences(text).filter((sentence) => words(sentence).length >= 6);
  const questions = [];

  for (const keyword of keywords) {
    const sentence = sentences.find((item) => words(item).includes(keyword));
    if (!sentence) continue;
    const distractors = keywords.filter((item) => item !== keyword).slice(0, 3);
    if (distractors.length < 3) continue;
    const options = [keyword, ...distractors]
      .sort((a, b) => (a.charCodeAt(0) + keyword.length) % 7 - (b.charCodeAt(0) + keyword.length) % 7)
      .map(capitalize);
    questions.push({
      prompt: sentence.replace(new RegExp(`\\b${keyword}\\b`, 'i'), '_____'),
      options,
      answer: capitalize(keyword),
      explanation: sentence
    });
    if (questions.length === limit) break;
  }
  return questions;
}

export function analyzeReading(text) {
  const sentenceList = splitSentences(text);
  const wordList = cleanText(text).split(' ').filter(Boolean);
  const averageSentenceLength = wordList.length / Math.max(sentenceList.length, 1);
  const readingMinutes = Math.max(1, Math.ceil(wordList.length / 210));
  const difficulty = averageSentenceLength > 23 ? 'Advanced' : averageSentenceLength > 16 ? 'Intermediate' : 'Beginner';
  return { wordCount: wordList.length, readingMinutes, difficulty };
}
