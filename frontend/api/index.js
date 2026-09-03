import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import epubPackage from 'epub-gen-memory';

const epub = epubPackage.default || epubPackage;

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

let connectPromise;
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!connectPromise) {
    connectPromise = mongoose.connect(requiredEnv('MONGO_URI'), {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10
    }).catch((error) => {
      connectPromise = null;
      throw error;
    });
  }
  await connectPromise;
}

const sectionSchema = new mongoose.Schema({
  title: { type: String, default: 'Section 1' },
  content: { type: String, default: 'Start writing here...' },
  order_index: { type: Number, default: 0 }
}, { _id: true });

const chapterSchema = new mongoose.Schema({
  title: { type: String, default: 'Chapter 1: Introduction' },
  summary: { type: String, default: '' },
  order_index: { type: Number, default: 0 },
  readability_score: { type: Number, default: 88 },
  sections: { type: [sectionSchema], default: [] }
}, { _id: true });

const versionSchema = new mongoose.Schema({
  label: { type: String, default: 'Manual snapshot' },
  chapters: { type: [chapterSchema], default: [] },
  createdBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const commentSchema = new mongoose.Schema({
  author_name: String, author_email: String, message: { type: String, maxlength: 1000 },
  resolved: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now }
}, { _id: true });

const submissionSchema = new mongoose.Schema({
  publisher_name: String, publisher_email: String, status: { type: String, default: 'Prepared' },
  note: { type: String, maxlength: 1200 }, createdAt: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  full_name: { type: String, required: true, trim: true, maxlength: 100 },
  role: { type: String, enum: ['User', 'Admin', 'Super Admin'], default: 'User' },
  bio: { type: String, default: '', maxlength: 500 },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PannaBook' }],
  googleId: { type: String, sparse: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  resetTokenHash: { type: String, default: '' },
  resetTokenExpiresAt: { type: Date }
}, { timestamps: true });

const complaintSchema = new mongoose.Schema({
  sender_name: { type: String, default: 'Anonymous Author', maxlength: 100 },
  sender_email: { type: String, default: '', maxlength: 180 },
  subject: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 5000 },
  status: { type: String, enum: ['Pending', 'In Review', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  subtitle: { type: String, default: '', maxlength: 240 },
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PannaUser', required: true, index: true },
  author_name: { type: String, default: 'PANNA Author' },
  genre: { type: String, default: 'Non-fiction' },
  language: { type: String, default: 'English' },
  target_audience: { type: String, default: 'General Readers' },
  writing_style: { type: String, default: 'Professional & Clear' },
  description: { type: String, default: '', maxlength: 3000 },
  status: { type: String, enum: ['Draft', 'Public', 'Private'], default: 'Draft', index: true },
  access_type: { type: String, enum: ['free', 'paid'], default: 'free', index: true },
  price: { type: Number, min: 0, default: 0 },
  currency: { type: String, default: 'INR' },
  views_count: { type: Number, default: 0 },
  downloads_count: { type: Number, default: 0 },
  cover_url: { type: String, default: '' },
  manuscript_url: { type: String, default: '' },
  formatting_preset: { type: String, default: 'Non-fiction' },
  front_matter_json: { type: mongoose.Schema.Types.Mixed, default: {} },
  back_matter_json: { type: mongoose.Schema.Types.Mixed, default: {} },
  style_guide_json: { type: mongoose.Schema.Types.Mixed, default: {} },
  chapters: { type: [chapterSchema], default: [] }
  ,versions: { type: [versionSchema], default: [] }
  ,comments: { type: [commentSchema], default: [] }
  ,collaborators: { type: [String], default: [] }
  ,publisher_submissions: { type: [submissionSchema], default: [] }
  ,reading_completions: { type: Number, default: 0 }
}, { timestamps: true });

bookSchema.index({ title: 'text', description: 'text', genre: 'text' });

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PannaUser', required: true, index: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PannaBook', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  provider_order_id: { type: String, default: '' }
}, { timestamps: true });

orderSchema.index({ user_id: 1, book_id: 1, status: 1 });

const User = mongoose.models.PannaUser || mongoose.model('PannaUser', userSchema);
const Book = mongoose.models.PannaBook || mongoose.model('PannaBook', bookSchema);
const Order = mongoose.models.PannaOrder || mongoose.model('PannaOrder', orderSchema);
const Complaint = mongoose.models.PannaComplaint || mongoose.model('PannaComplaint', complaintSchema);

const googleClient = new OAuth2Client();
let mailTransport;
function getMailTransport() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!mailTransport) {
    mailTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
    });
  }
  return mailTransport;
}

async function sendEmail({ to, subject, text, replyTo }) {
  const transport = getMailTransport();
  if (!transport) {
    console.warn('Gmail is not configured; email event recorded without delivery.');
    return false;
  }
  await transport.sendMail({
    from: `PANNA.AI <${process.env.GMAIL_USER}>`, to, subject, text, replyTo
  });
  return true;
}

let catalogChecked = false;
async function ensureStarterCatalog() {
  if (catalogChecked) return;
  catalogChecked = true;
  if (await Book.exists({ status: 'Public' })) return;
  const passwordHash = await bcrypt.hash(jwt.sign({ seed: true }, requiredEnv('JWT_SECRET')), 10);
  const author = await User.findOneAndUpdate(
    { email: 'library@panna.ai' },
    { $setOnInsert: { full_name: 'PANNA Learning Library', passwordHash, role: 'Admin' } },
    { upsert: true, new: true }
  );
  await Book.create([
    {
      title: "The AI Learner's Blueprint", subtitle: 'Understand machine learning through clear mental models',
      author_id: author._id, author_name: author.full_name, genre: 'Technology & Science', status: 'Public', access_type: 'free',
      description: 'A practical introduction to learning systems, evaluation, and responsible AI.', views_count: 1240,
      chapters: [{ title: 'Chapter 1: How Machines Learn', summary: 'Patterns, data, and generalization.', sections: [{ title: 'From examples to predictions', content: 'Machine learning helps computers learn patterns from examples instead of following only fixed instructions. A model is trained on data and evaluated on unseen examples. Evaluation matters because a model can memorize its training data without learning a general pattern, a problem called overfitting. Validation and regularization help reduce overfitting.' }] }]
    },
    {
      title: 'Deep Focus for Students', subtitle: 'A practical guide to attention and active recall',
      author_id: author._id, author_name: author.full_name, genre: 'Self-Improvement', status: 'Public', access_type: 'free',
      description: 'Build sustainable study habits with focused sessions, retrieval practice, and useful feedback.', views_count: 860,
      chapters: [{ title: 'Chapter 1: Active Learning', summary: 'Why recall is stronger than rereading.', sections: [{ title: 'Retrieval practice', content: 'Active recall strengthens learning by asking the brain to retrieve an idea without seeing the answer first. Short quizzes provide useful feedback and reveal which concepts need revision. Spaced practice revisits those concepts over time instead of concentrating all study in one session.' }] }]
    },
    {
      title: 'Building Responsible AI', subtitle: 'Fairness, privacy, and human oversight',
      author_id: author._id, author_name: author.full_name, genre: 'Technology & Science', status: 'Public', access_type: 'paid', price: 149,
      description: 'A project-focused guide to responsible data and AI decisions.', views_count: 540,
      chapters: [{ title: 'Chapter 1: Responsible Foundations', summary: 'Core principles for trustworthy systems.', sections: [{ title: 'Human-centred safeguards', content: 'Responsible AI requires teams to examine data quality, fairness, privacy, transparency, and human oversight throughout a system lifecycle.' }] }]
    }
  ]);
}

const publicUser = (user) => ({
  id: user._id.toString(), email: user.email, full_name: user.full_name,
  role: user.role, bio: user.bio || '', email_verified: Boolean(user.emailVerified)
});

const normalize = (value) => {
  const plain = value?.toObject ? value.toObject() : value;
  if (!plain) return plain;
  const convert = (item) => {
    if (Array.isArray(item)) return item.map(convert);
    if (item && typeof item === 'object') {
      const result = {};
      Object.entries(item).forEach(([key, child]) => {
        if (key === '_id') result.id = String(child);
        else if (key !== '__v' && key !== 'passwordHash') result[key] = convert(child);
      });
      return result;
    }
    return item;
  };
  return convert(plain);
};

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, requiredEnv('JWT_SECRET'), { expiresIn: '7d' });
}

function owns(book, user) {
  return String(book.author_id) === String(user._id) || book.collaborators.includes(user.email);
}

function manuscriptText(book) {
  return book.chapters.map((chapter) => `${chapter.title}\n${chapter.sections.map((section) => `${section.title}\n${section.content}`).join('\n\n')}`).join('\n\n');
}

async function askGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) return null;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.45, maxOutputTokens: 1200 } })
  });
  if (!response.ok) throw new Error('AI provider request failed');
  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') || null;
}

async function optionalAuth(req) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, requiredEnv('JWT_SECRET'));
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  const user = await optionalAuth(req);
  if (!user) return res.status(401).json({ detail: 'Sign in required' });
  req.user = user;
  next();
}

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    await ensureStarterCatalog();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(503).json({ detail: 'Database is not configured or temporarily unavailable' });
  }
});

app.get('/api/v1/health', (_req, res) => res.json({ status: 'online', database: 'connected' }));

app.post('/api/v1/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body || {};
  if (!email || !full_name || !password || password.length < 8) {
    return res.status(400).json({ detail: 'Name, valid email, and password of at least 8 characters are required' });
  }
  if (await User.exists({ email: email.toLowerCase() })) return res.status(400).json({ detail: 'Email is already registered' });
  const user = await User.create({ email, full_name, passwordHash: await bcrypt.hash(password, 12) });
  await sendEmail({
    to: user.email,
    subject: 'Welcome to PANNA.AI',
    text: `Hi ${user.full_name},\n\nYour PANNA.AI author workspace is ready. Start with an outline, import a manuscript, or explore the learning library.\n\n— PANNA.AI`
  }).catch((error) => console.error('Welcome email failed:', error.message));
  res.status(201).json({ access_token: signToken(user), token_type: 'bearer', user: publicUser(user) });
});

app.post('/api/v1/auth/google', async (req, res) => {
  const credential = String(req.body?.credential || '');
  const clientId = requiredEnv('GOOGLE_CLIENT_ID');
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: clientId });
  const profile = ticket.getPayload();
  if (!profile?.email || !profile.email_verified) return res.status(401).json({ detail: 'Google account could not be verified' });
  let user = await User.findOne({ email: profile.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      email: profile.email,
      full_name: profile.name || 'PANNA Author',
      googleId: profile.sub,
      emailVerified: true,
      passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12)
    });
    await sendEmail({ to: user.email, subject: 'Welcome to PANNA.AI', text: `Hi ${user.full_name},\n\nYour Google account is now connected to PANNA.AI.\n\n— PANNA.AI` }).catch(() => {});
  } else {
    user.googleId = user.googleId || profile.sub;
    user.emailVerified = true;
    await user.save();
  }
  res.json({ access_token: signToken(user), token_type: 'bearer', user: publicUser(user) });
});

app.post('/api/v1/auth/forgot-password', async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase();
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const origin = process.env.PUBLIC_APP_URL || 'https://panna-ai.vercel.app';
    await sendEmail({
      to: user.email,
      subject: 'Reset your PANNA.AI password',
      text: `Reset your password within 30 minutes:\n${origin}/#/reset-password?token=${token}\n\nIf you did not request this, ignore this email.`
    }).catch((error) => console.error('Reset email failed:', error.message));
  }
  res.json({ message: 'If that account exists, a secure reset link has been sent.' });
});

app.post('/api/v1/auth/reset-password', async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(String(req.body?.token || '')).digest('hex');
  const password = String(req.body?.password || '');
  if (password.length < 8) return res.status(400).json({ detail: 'Password must contain at least 8 characters' });
  const user = await User.findOne({ resetTokenHash: tokenHash, resetTokenExpiresAt: { $gt: new Date() } });
  if (!user) return res.status(400).json({ detail: 'Reset link is invalid or expired' });
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetTokenHash = '';
  user.resetTokenExpiresAt = undefined;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

app.post('/api/v1/auth/login', express.urlencoded({ extended: false }), async (req, res) => {
  const email = (req.body?.username || req.body?.email || '').toLowerCase();
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(req.body?.password || '', user.passwordHash))) {
    return res.status(400).json({ detail: 'Invalid email or password' });
  }
  res.json({ access_token: signToken(user), token_type: 'bearer', user: publicUser(user) });
});

app.get('/api/v1/auth/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

app.put('/api/v1/auth/profile', requireAuth, async (req, res) => {
  const allowed = ['full_name', 'bio'];
  allowed.forEach((key) => { if (req.body?.[key] !== undefined) req.user[key] = req.body[key]; });
  await req.user.save();
  res.json(publicUser(req.user));
});

app.get('/api/v1/books/public', async (req, res) => {
  const filter = { status: 'Public' };
  if (req.query.access_type) filter.access_type = req.query.access_type;
  const books = await Book.find(filter).sort({ views_count: -1, updatedAt: -1 }).limit(100).lean();
  res.json(normalize(books));
});

app.get('/api/v1/books', requireAuth, async (req, res) => {
  const books = await Book.find({ author_id: req.user._id }).sort({ updatedAt: -1 }).lean();
  res.json(normalize(books));
});

app.post('/api/v1/books', requireAuth, async (req, res) => {
  const book = await Book.create({
    ...req.body,
    author_id: req.user._id,
    author_name: req.user.full_name,
    price: req.body?.access_type === 'paid' ? Math.max(Number(req.body?.price) || 0, 1) : 0,
    chapters: [{ title: 'Chapter 1: Introduction & Foundation', summary: 'Overview of the book.', sections: [{ title: 'Section 1.1: Core Thesis', content: 'Start writing your chapter here.' }] }]
  });
  res.status(201).json(normalize(book));
});

app.get('/api/v1/books/:bookId', async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) return res.status(404).json({ detail: 'Book not found' });
  const user = await optionalAuth(req);
  const ownsBook = user && String(book.author_id) === String(user._id);
  const purchased = user && user.purchasedBooks.some((id) => String(id) === String(book._id));
  if (book.status !== 'Public' && !ownsBook) return res.status(404).json({ detail: 'Book not found' });
  if (book.access_type === 'paid' && !ownsBook && !purchased) {
    return res.status(user ? 402 : 401).json({ detail: user ? 'Purchase required to read this book' : 'Sign in to purchase and read this book' });
  }
  book.views_count += 1;
  await book.save();
  res.json(normalize(book));
});

app.put('/api/v1/books/:bookId', requireAuth, async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, author_id: req.user._id });
  if (!book) return res.status(404).json({ detail: 'Book not found or unauthorized' });
  const allowed = ['title','subtitle','genre','language','target_audience','writing_style','description','status','access_type','price','cover_url','manuscript_url','formatting_preset','front_matter_json','back_matter_json','style_guide_json'];
  allowed.forEach((key) => { if (req.body?.[key] !== undefined) book[key] = req.body[key]; });
  if (book.access_type === 'free') book.price = 0;
  await book.save();
  res.json(normalize(book));
});

app.delete('/api/v1/books/:bookId', requireAuth, async (req, res) => {
  const removed = await Book.findOneAndDelete({ _id: req.params.bookId, author_id: req.user._id });
  if (!removed) return res.status(404).json({ detail: 'Book not found or unauthorized' });
  res.status(204).end();
});

app.post('/api/v1/books/:bookId/chapters', requireAuth, async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, author_id: req.user._id });
  if (!book) return res.status(404).json({ detail: 'Book not found' });
  book.chapters.push({ ...req.body, sections: [{ title: 'Section 1', content: 'Start writing here...' }] });
  await book.save();
  res.status(201).json(normalize(book.chapters.at(-1)));
});

app.put('/api/v1/books/sections/:sectionId', requireAuth, async (req, res) => {
  const book = await Book.findOne({ author_id: req.user._id, 'chapters.sections._id': req.params.sectionId });
  if (!book) return res.status(404).json({ detail: 'Section not found or unauthorized' });
  let section;
  book.chapters.forEach((chapter) => { const found = chapter.sections.id(req.params.sectionId); if (found) section = found; });
  ['title','content','order_index'].forEach((key) => { if (req.body?.[key] !== undefined) section[key] = req.body[key]; });
  await book.save();
  res.json(normalize(section));
});

app.post('/api/v1/books/chapters/:chapterId/sections', requireAuth, async (req, res) => {
  const book = await Book.findOne({ author_id: req.user._id, 'chapters._id': req.params.chapterId });
  if (!book) return res.status(404).json({ detail: 'Chapter not found or unauthorized' });
  const chapter = book.chapters.id(req.params.chapterId);
  chapter.sections.push({ title: req.body?.title || `Section ${chapter.sections.length + 1}`, content: req.body?.content || 'Start writing here...', order_index: chapter.sections.length });
  await book.save();
  res.status(201).json(normalize(chapter.sections.at(-1)));
});

app.delete('/api/v1/books/chapters/:chapterId', requireAuth, async (req, res) => {
  const book = await Book.findOne({ author_id: req.user._id, 'chapters._id': req.params.chapterId });
  if (!book) return res.status(404).json({ detail: 'Chapter not found or unauthorized' });
  book.chapters.pull(req.params.chapterId);
  await book.save();
  res.status(204).end();
});

app.delete('/api/v1/books/sections/:sectionId', requireAuth, async (req, res) => {
  const book = await Book.findOne({ author_id: req.user._id, 'chapters.sections._id': req.params.sectionId });
  if (!book) return res.status(404).json({ detail: 'Section not found or unauthorized' });
  book.chapters.forEach((chapter) => chapter.sections.pull(req.params.sectionId));
  await book.save();
  res.status(204).end();
});

app.get('/api/v1/ai/suggestions/:bookId', requireAuth, (_req, res) => res.json([]));

app.post('/api/v1/ai/assistant-chat', requireAuth, async (req, res) => {
  const selected = String(req.body?.selected_text || '').trim();
  const prompt = String(req.body?.user_prompt || '').trim();
  if (!selected && !prompt) return res.status(400).json({ detail: 'Text or a question is required' });
  const sentences = selected.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((value) => value.trim()) || [];
  const systemPrompt = `You are PANNA, a careful book editor. Follow the author's instruction, preserve meaning, and return only the improved text.\nInstruction: ${prompt}\nSelected manuscript text:\n${selected.slice(0, 12000)}`;
  const aiResponse = await askGemini(systemPrompt).catch(() => null);
  const response = aiResponse || sentences.slice(0, 2).join(' ') || 'Add chapter content to receive a grounded response.';
  res.json({ response, suggestions: [], category: 'assistant', provider: aiResponse ? 'gemini' : 'local' });
});

app.post('/api/v1/ai/originality-check', requireAuth, async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (text.length < 40) return res.status(400).json({ detail: 'Add at least 40 characters to run a useful check' });
  const sentences = text.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
  const repeated = sentences.filter((sentence, index) => sentences.indexOf(sentence) !== index);
  const citations = [...text.matchAll(/(?:https?:\/\/\S+|\[[0-9]+\]|\([A-Z][^)]*,\s*\d{4}\))/g)].map((match) => match[0]);
  res.json({
    originality_score: Math.max(55, 100 - repeated.length * 12),
    repeated_passages: [...new Set(repeated)].slice(0, 5), citations_found: citations.slice(0, 20),
    citation_note: citations.length ? 'Citations detected; verify every source before publishing.' : 'No citations detected. Add sources for factual claims.',
    disclaimer: 'This is an internal similarity and citation-quality scan, not a web-wide plagiarism verdict.'
  });
});

app.post('/api/v1/ai/cover-concept', requireAuth, async (req, res) => {
  const title = String(req.body?.title || 'Untitled Book');
  const genre = String(req.body?.genre || 'Non-fiction');
  const generated = await askGemini(`Create one concise professional book-cover art direction for "${title}" in ${genre}. Return a 2-sentence visual concept and a 5-word subtitle.`).catch(() => null);
  res.json({ title, genre, concept: generated || `A bold editorial cover using a deep navy field, warm orange focal shape, and confident modern typography. Keep the composition minimal and readable at thumbnail size.`, palette: ['#111827','#F97316','#FFF7ED'], status: generated ? 'AI generated' : 'Smart template' });
});

app.post('/api/v1/books/:bookId/versions', requireAuth, async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book || !owns(book, req.user)) return res.status(404).json({ detail: 'Book not found' });
  book.versions.push({ label: req.body?.label || 'Manual snapshot', chapters: book.chapters.map((c) => c.toObject()), createdBy: req.user.email });
  if (book.versions.length > 20) book.versions.shift();
  await book.save(); res.status(201).json(normalize(book.versions.at(-1)));
});

app.get('/api/v1/books/:bookId/versions', requireAuth, async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book || !owns(book, req.user)) return res.status(404).json({ detail: 'Book not found' });
  res.json(normalize(book.versions));
});

app.post('/api/v1/books/:bookId/versions/:versionId/restore', requireAuth, async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, author_id: req.user._id });
  if (!book) return res.status(404).json({ detail: 'Book not found' });
  const version = book.versions.id(req.params.versionId);
  if (!version) return res.status(404).json({ detail: 'Version not found' });
  book.versions.push({ label: 'Before restore', chapters: book.chapters.map((c) => c.toObject()), createdBy: req.user.email });
  book.chapters = version.chapters.map((c) => c.toObject()); await book.save(); res.json(normalize(book));
});

app.post('/api/v1/books/:bookId/collaborators', requireAuth, async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, author_id: req.user._id });
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!book) return res.status(404).json({ detail: 'Book not found' });
  if (!email.includes('@')) return res.status(400).json({ detail: 'Valid collaborator email required' });
  if (!book.collaborators.includes(email)) book.collaborators.push(email);
  await book.save();
  await sendEmail({ to: email, subject: `Invitation to collaborate on ${book.title}`, text: `${req.user.full_name} invited you to collaborate on "${book.title}" in PANNA.AI.\n\nOpen ${process.env.PUBLIC_APP_URL || 'PANNA.AI'} and sign in with this email.` }).catch(() => {});
  res.json({ collaborators: book.collaborators });
});

app.post('/api/v1/books/:bookId/comments', requireAuth, async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book || !owns(book, req.user)) return res.status(404).json({ detail: 'Book not found' });
  book.comments.push({ author_name: req.user.full_name, author_email: req.user.email, message: req.body?.message });
  await book.save(); res.status(201).json(normalize(book.comments.at(-1)));
});

app.get('/api/v1/books/:bookId/comments', requireAuth, async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book || !owns(book, req.user)) return res.status(404).json({ detail: 'Book not found' });
  res.json(normalize(book.comments));
});

app.post('/api/v1/books/:bookId/publisher-submissions', requireAuth, async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, author_id: req.user._id });
  if (!book) return res.status(404).json({ detail: 'Book not found' });
  const submission = { publisher_name: req.body?.publisher_name, publisher_email: req.body?.publisher_email, note: req.body?.note, status: 'Prepared' };
  book.publisher_submissions.push(submission); await book.save();
  res.status(201).json(normalize(book.publisher_submissions.at(-1)));
});

app.post('/api/v1/ai/audit-chapter', requireAuth, async (req, res) => {
  const book = await Book.findOne({ _id: req.body?.book_id, author_id: req.user._id });
  if (!book) return res.status(404).json({ detail: 'Book not found' });
  const chapter = req.body?.chapter_id ? book.chapters.id(req.body.chapter_id) : book.chapters[0];
  const content = chapter?.sections.map((section) => section.content).join(' ') || '';
  const words = content.split(/\s+/).filter(Boolean);
  const average = words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1);
  res.json({ chapter_id: chapter?.id, chapter_title: chapter?.title, readability_score: Math.max(55, Math.min(96, Math.round(100 - average * 5))), problems_detected: words.length < 100 ? ['Chapter may need more supporting detail'] : [], transition_recommendation: 'Use clear topic sentences to connect each section.', fact_checks: [], visual_recommendations: [], suggestions: [] });
});

app.post('/api/v1/orders', requireAuth, async (req, res) => {
  const book = await Book.findOne({ _id: req.body?.book_id, status: 'Public', access_type: 'paid' });
  if (!book) return res.status(404).json({ detail: 'Paid book not found' });
  const existing = await Order.findOne({ user_id: req.user._id, book_id: book._id, status: 'paid' });
  if (existing) return res.json(normalize(existing));
  const order = await Order.create({ user_id: req.user._id, book_id: book._id, amount: book.price, currency: book.currency });
  res.status(201).json(normalize(order));
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
app.post('/api/v1/upload', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'File is required' });
  cloudinary.config({
    cloud_name: requiredEnv('CLOUDINARY_CLOUD_NAME'),
    api_key: requiredEnv('CLOUDINARY_API_KEY'),
    api_secret: requiredEnv('CLOUDINARY_API_SECRET'),
    secure: true
  });
  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: `panna/${req.user._id}`, resource_type: 'auto' }, (error, result) => error ? reject(error) : resolve(result));
    stream.end(req.file.buffer);
  });
  res.status(201).json({ url: uploaded.secure_url, public_id: uploaded.public_id, bytes: uploaded.bytes, resource_type: uploaded.resource_type });
});

app.post('/api/v1/manuscripts/import', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'Choose a PDF, DOCX, TXT, or Markdown file' });
  const extension = req.file.originalname.toLowerCase().split('.').pop();
  let text = '';
  if (extension === 'docx') text = (await mammoth.extractRawText({ buffer: req.file.buffer })).value;
  else if (extension === 'pdf') {
    const parser = new PDFParse({ data: req.file.buffer });
    try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
  } else if (['txt','md'].includes(extension)) text = req.file.buffer.toString('utf8');
  else return res.status(415).json({ detail: 'Supported formats: PDF, DOCX, TXT, MD' });
  text = text.replace(/\r/g, '').trim();
  if (!text) return res.status(400).json({ detail: 'No readable text was found in this file' });
  const title = String(req.body?.title || req.file.originalname.replace(/\.[^.]+$/, '')).slice(0, 180);
  const chunks = text.match(/[\s\S]{1,12000}(?:\n\n|$)/g) || [text.slice(0, 12000)];
  const book = await Book.create({ title, author_id: req.user._id, author_name: req.user.full_name, description: `Imported from ${req.file.originalname}`, chapters: chunks.slice(0, 30).map((content, index) => ({ title: `Chapter ${index + 1}`, order_index: index, sections: [{ title: 'Imported manuscript', content: content.trim() }] })) });
  res.status(201).json(normalize(book));
});

app.get('/api/v1/export/:format/:bookId', requireAuth, async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book || !owns(book, req.user)) return res.status(404).json({ detail: 'Book not found' });
  const safeName = book.title.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'panna-book';
  const format = req.params.format.toLowerCase();
  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
    const doc = new PDFDocument({ margin: 64, info: { Title: book.title, Author: book.author_name } }); doc.pipe(res);
    doc.fontSize(26).text(book.title, { align: 'center' }).moveDown(.5).fontSize(12).fillColor('#64748b').text(`By ${book.author_name}`, { align: 'center' }).moveDown(2);
    book.chapters.forEach((chapter) => { doc.fillColor('#111827').fontSize(19).text(chapter.title).moveDown(.5); chapter.sections.forEach((section) => doc.fontSize(11).text(section.content, { lineGap: 4 }).moveDown()); });
    doc.end(); book.downloads_count += 1; await book.save(); return;
  }
  if (format === 'docx') {
    const document = new Document({ sections: [{ children: [new Paragraph({ text: book.title, heading: HeadingLevel.TITLE }), new Paragraph(`By ${book.author_name}`), ...book.chapters.flatMap((chapter) => [new Paragraph({ text: chapter.title, heading: HeadingLevel.HEADING_1 }), ...chapter.sections.map((section) => new Paragraph(section.content))])] }] });
    const buffer = await Packer.toBuffer(document); res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.document'); res.setHeader('Content-Disposition',`attachment; filename="${safeName}.docx"`); res.end(buffer); book.downloads_count += 1; await book.save(); return;
  }
  if (format === 'epub') {
    const buffer = await epub({ title: book.title, author: book.author_name }, book.chapters.map((chapter) => ({ title: chapter.title, content: `<h1>${chapter.title}</h1>${chapter.sections.map((section) => `<h2>${section.title}</h2><p>${section.content.replace(/\n/g,'</p><p>')}</p>`).join('')}` })));
    res.setHeader('Content-Type','application/epub+zip'); res.setHeader('Content-Disposition',`attachment; filename="${safeName}.epub"`); res.end(buffer); book.downloads_count += 1; await book.save(); return;
  }
  res.status(400).json({ detail: 'Supported export formats: PDF, DOCX, EPUB' });
});

app.get('/api/v1/analytics/dashboard', requireAuth, async (req, res) => {
  const books = await Book.find({ author_id: req.user._id }).lean();
  res.json({
    total_books: books.length,
    published_books: books.filter((book) => book.status === 'Public').length,
    total_views: books.reduce((sum, book) => sum + (book.views_count || 0), 0),
    total_downloads: books.reduce((sum, book) => sum + (book.downloads_count || 0), 0),
    total_completions: books.reduce((sum, book) => sum + (book.reading_completions || 0), 0),
    completion_rate: Math.round(books.reduce((sum, book) => sum + (book.reading_completions || 0), 0) / Math.max(books.reduce((sum, book) => sum + (book.views_count || 0), 0), 1) * 100),
    publisher_submissions: books.reduce((sum, book) => sum + (book.publisher_submissions?.length || 0), 0),
    ai_editing_usage_hours: 0
  });
});

app.post('/api/v1/books/:bookId/complete', async (req, res) => {
  const book = await Book.findOne({ _id: req.params.bookId, status: 'Public' });
  if (!book) return res.status(404).json({ detail: 'Book not found' });
  book.reading_completions += 1; await book.save(); res.json({ reading_completions: book.reading_completions });
});

app.post('/api/v1/complaints', async (req, res) => {
  const senderName = String(req.body?.sender_name || 'Anonymous Author').trim();
  const senderEmail = String(req.body?.sender_email || '').trim().toLowerCase();
  const subject = String(req.body?.subject || '').trim();
  const message = String(req.body?.message || '').trim();
  if (!subject || !message) return res.status(400).json({ detail: 'Subject and message are required' });
  const complaint = await Complaint.create({ sender_name: senderName, sender_email: senderEmail, subject, message });
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
  const delivered = adminEmail ? await sendEmail({
    to: adminEmail,
    replyTo: senderEmail || undefined,
    subject: `[PANNA Support #${complaint._id}] ${subject}`,
    text: `From: ${senderName}${senderEmail ? ` <${senderEmail}>` : ''}\n\n${message}`
  }).catch((error) => { console.error('Support email failed:', error.message); return false; }) : false;
  res.status(201).json({ id: complaint._id.toString(), message: 'Your request has been recorded.', email_delivered: delivered });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ detail: 'Invalid resource ID' });
  if (error?.code === 11000) return res.status(409).json({ detail: 'This record already exists' });
  res.status(500).json({ detail: 'Unexpected server error' });
});

export default app;
