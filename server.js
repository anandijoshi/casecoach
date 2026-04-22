const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const CASEBOOKS_FILE = path.join(DATA_DIR, 'casebooks.json');

[DATA_DIR, UPLOADS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
if (!fs.existsSync(CASEBOOKS_FILE)) fs.writeFileSync(CASEBOOKS_FILE, JSON.stringify({ casebooks: [] }));

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Buffer.from(file.originalname, 'latin1').toString('utf8')}`)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readCasebooks() { return JSON.parse(fs.readFileSync(CASEBOOKS_FILE, 'utf8')); }
function writeCasebooks(data) { fs.writeFileSync(CASEBOOKS_FILE, JSON.stringify(data, null, 2)); }

async function callClaude(apiKey, system, userMessage, maxTokens = 1024) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, system, messages: [{ role: 'user', content: userMessage }] })
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `API error ${res.status}`); }
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function parseJSON(text) {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) try { return JSON.parse(m[0]); } catch {}
  return null;
}

// POST /api/feedback
app.post('/api/feedback', async (req, res) => {
  const { apiKey, caseType, casePrompt, userResponse } = req.body;
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(400).json({ error: 'NO_KEY' });

  const system = `You are a senior McKinsey partner with 20 years of experience conducting case interviews. Give candid, specific feedback exactly as you would in a real post-interview debrief. Be direct and honest.

Return ONLY valid JSON — no markdown, no backticks, no surrounding text:
{
  "overall_score": <1-10>,
  "framework_score": <1-10>,
  "communication_score": <1-10>,
  "hypothesis_score": <1-10>,
  "strengths": ["<specific 1-sentence strength>", "<specific 1-sentence strength>"],
  "improvements": ["<specific, actionable 1-2 sentence improvement>", "<specific, actionable 1-2 sentence improvement>", "<specific, actionable 1-2 sentence improvement>"],
  "overall_feedback": "<3-4 sentences of direct, honest assessment as a senior partner would give>",
  "ideal_framework": "<2-3 sentences on the optimal framework and approach for this specific case>",
  "pass": <true if overall_score >= 7, false otherwise>
}`;

  try {
    const text = await callClaude(key, system, `Case Type: ${caseType}\n\nCase Prompt:\n${casePrompt}\n\nCandidate Response:\n${userResponse}`);
    const feedback = parseJSON(text);
    if (feedback) res.json(feedback);
    else res.status(500).json({ error: 'Could not parse AI feedback response.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/casebooks
app.get('/api/casebooks', (req, res) => {
  const { casebooks } = readCasebooks();
  res.json(casebooks.map(b => ({ id: b.id, name: b.name, firm: b.firm, caseCount: b.caseCount, topics: b.topics, uploadedAt: b.uploadedAt, pages: b.pages })));
});

// POST /api/casebooks/upload
app.post('/api/casebooks/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const apiKey = req.body.apiKey || process.env.ANTHROPIC_API_KEY;

  let text = '', pages = 0;
  try {
    const pdf = require('pdf-parse');
    const buf = fs.readFileSync(req.file.path);
    const parsed = await pdf(buf);
    text = parsed.text;
    pages = parsed.numpages;
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(422).json({ error: 'Could not parse PDF. Make sure it is a text-based PDF, not a scanned image.' });
  }

  if (!text || text.trim().length < 200) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(422).json({ error: 'PDF appears image-based or empty. Please use a digital/text-based PDF.' });
  }

  let metadata = { title: req.file.originalname.replace(/\.pdf$/i, ''), firm: 'Unknown', caseCount: null, topics: [] };

  if (apiKey) {
    try {
      const excerpt = text.slice(0, 3000);
      const metaSystem = `Analyze this consulting case book excerpt and return ONLY valid JSON with no markdown:
{"title":"<descriptive title>","firm":"<consulting firm name or Unknown>","caseCount":<estimated number of cases as integer or null>,"topics":["<topic>"]}
Topics must be from: Profitability, Market Entry, Market Sizing, M&A, Operations, Pricing, Competitive, Growth`;
      const metaText = await callClaude(apiKey, metaSystem, excerpt, 256);
      const parsed = parseJSON(metaText);
      if (parsed) metadata = { ...metadata, ...parsed };
    } catch {}
  }

  const id = `book_${Date.now()}`;
  const casebook = { id, name: metadata.title, firm: metadata.firm, caseCount: metadata.caseCount, topics: metadata.topics, pages, uploadedAt: new Date().toISOString(), filename: req.file.originalname, storedFile: req.file.filename, excerpt: text.slice(0, 8000) };

  const data = readCasebooks();
  data.casebooks.push(casebook);
  writeCasebooks(data);

  res.json({ id: casebook.id, name: casebook.name, firm: casebook.firm, caseCount: casebook.caseCount, topics: casebook.topics, pages, uploadedAt: casebook.uploadedAt });
});

// POST /api/casebooks/generate
app.post('/api/casebooks/generate', async (req, res) => {
  const { bookId, difficulty, apiKey } = req.body;
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(400).json({ error: 'NO_KEY' });

  const data = readCasebooks();
  const book = data.casebooks.find(b => b.id === bookId);
  if (!book) return res.status(404).json({ error: 'Case book not found.' });

  const diffGuide = {
    Beginner: 'Simple, clear problem statement. Single main driver. Obvious framework. Include 2 helpful hints.',
    Intermediate: 'Moderate complexity, standard MBB format, some ambiguity, one solid follow-up question.',
    Hard: 'Complex, multi-dimensional problem requiring cross-framework synthesis. Significant ambiguity. Multiple challenging follow-up questions.'
  }[difficulty] || 'Standard case difficulty.';

  const system = `You are a case interview coach generating practice cases based on a consulting firm's casebook. Match the firm's style and complexity.

Difficulty: ${difficulty} — ${diffGuide}

Return ONLY valid JSON:
{
  "company": "<realistic company name>",
  "type": "<Profitability|Market Entry|Market Sizing|M&A|Operations|Pricing|Competitive>",
  "difficulty": "${difficulty}",
  "prompt": "<full realistic case prompt, 120-200 words>",
  "followup": "<one follow-up question the interviewer would ask>",
  "hints": ["<hint>", "<hint>"]
}`;

  try {
    const text = await callClaude(key, system, `Casebook content (excerpt):\n${book.excerpt}\n\nGenerate a ${difficulty} case matching this firm's style.`, 768);
    const caseData = parseJSON(text);
    if (!caseData) return res.status(500).json({ error: 'Could not generate case. Try again.' });
    res.json({ ...caseData, id: `gen_${Date.now()}`, source: book.name, bookId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/casebooks/:id
app.delete('/api/casebooks/:id', (req, res) => {
  const data = readCasebooks();
  const idx = data.casebooks.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found.' });
  const book = data.casebooks[idx];
  const fp = path.join(UPLOADS_DIR, book.storedFile);
  if (fs.existsSync(fp)) try { fs.unlinkSync(fp); } catch {}
  data.casebooks.splice(idx, 1);
  writeCasebooks(data);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n✓ Case Coach → http://localhost:${PORT}\n`));
