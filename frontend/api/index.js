import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

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

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  full_name: { type: String, required: true, trim: true, maxlength: 100 },
  role: { type: String, enum: ['User', 'Admin', 'Super Admin'], default: 'User' },
  bio: { type: String, default: '', maxlength: 500 },
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PannaBook' }]
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
  role: user.role, bio: user.bio || ''
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
  res.status(201).json({ access_token: signToken(user), token_type: 'bearer', user: publicUser(user) });
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
  const response = prompt.toLowerCase().includes('translate')
    ? 'Translation requires a configured language-model provider. Your original text has been preserved.'
    : sentences.slice(0, 2).join(' ') || 'Add chapter content to receive a grounded response.';
  res.json({ response, suggestions: [], category: 'assistant' });
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

app.get('/api/v1/analytics/dashboard', requireAuth, async (req, res) => {
  const books = await Book.find({ author_id: req.user._id }).lean();
  res.json({
    total_books: books.length,
    published_books: books.filter((book) => book.status === 'Public').length,
    total_views: books.reduce((sum, book) => sum + (book.views_count || 0), 0),
    ai_editing_usage_hours: 0
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ detail: 'Invalid resource ID' });
  if (error?.code === 11000) return res.status(409).json({ detail: 'This record already exists' });
  res.status(500).json({ detail: 'Unexpected server error' });
});

export default app;
