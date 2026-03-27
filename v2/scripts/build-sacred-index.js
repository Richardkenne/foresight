/**
 * Build a condensed sacred patterns index from all batch files.
 * This creates a single lightweight JSON that the API can load quickly.
 *
 * Run: node scripts/build-sacred-index.js
 * Output: data/sacred-index.json (~500KB instead of ~12MB)
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const outputFile = path.join(dataDir, 'sacred-index.json');

// Load all sacred pattern files
const files = fs.readdirSync(dataDir).filter(f =>
  f.startsWith('sacred-') && f.endsWith('.json')
  && f !== 'sacred-index.json'
);

console.log(`Processing ${files.length} sacred files...`);

const allPatterns = [];

for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));

  let entries = [];
  if (Array.isArray(raw)) {
    entries = raw;
  } else if (raw.patterns && Array.isArray(raw.patterns)) {
    entries = raw.patterns;
  } else if (raw.sections) {
    for (const section of Object.values(raw.sections)) {
      if (Array.isArray(section)) entries.push(...section);
    }
  }

  for (const entry of entries) {
    // Extract the data/stat text
    const stat = entry.data_entry || entry.pattern || entry.metric
      || (entry.value ? `${entry.metric_name || ''}: ${entry.value}` : '');
    if (!stat) continue;

    // Extract sacred references
    const bible = entry.sacred_source_bible || entry.bible_ref || '';
    const quran = entry.sacred_source_quran || entry.quran_ref || '';
    if (!bible && !quran) continue;

    // Extract category
    const category = entry.category || entry.section || 'general';

    // Extract source
    const source = entry.data_source || entry.source || '';

    // Extract keywords from the stat text
    const text = `${stat} ${entry.human_nature_cause || ''} ${entry.data_file || ''}`.toLowerCase();
    const keywords = extractKeywords(text);

    if (keywords.length === 0) continue;

    allPatterns.push({
      s: stat.slice(0, 200),           // stat (truncated)
      b: bible.slice(0, 50),           // bible ref
      q: quran.slice(0, 50),           // quran ref
      c: category,                      // category
      src: source.slice(0, 80),        // data source
      k: keywords,                      // keywords
    });
  }
}

function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by', 'about',
    'and', 'but', 'or', 'not', 'so', 'that', 'this', 'it', 'its', 'they',
    'who', 'which', 'what', 'where', 'when', 'why', 'how', 'all', 'each',
    'every', 'any', 'more', 'most', 'other', 'some', 'than', 'too', 'very',
    'just', 'because', 'between', 'per', 'year', 'data', 'report', 'study',
    'average', 'total', 'number', 'rate', 'percent', 'million', 'billion',
  ]);

  return [...new Set(
    text.replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 12)
  )];
}

// Deduplicate by stat text (keep first occurrence)
const seen = new Set();
const unique = allPatterns.filter(p => {
  const key = p.s.slice(0, 100);
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

console.log(`Total patterns: ${allPatterns.length}`);
console.log(`After dedup: ${unique.length}`);

// Build keyword index for fast lookup
const keywordIndex = {};
for (let i = 0; i < unique.length; i++) {
  for (const kw of unique[i].k) {
    if (!keywordIndex[kw]) keywordIndex[kw] = [];
    keywordIndex[kw].push(i);
  }
}

const output = {
  _meta: {
    total: unique.length,
    built: new Date().toISOString(),
    source_files: files.length,
    description: 'Condensed sacred patterns index. Every behavioral data point mapped to Bible + Quran.',
  },
  patterns: unique,
  keywordIndex,
};

fs.writeFileSync(outputFile, JSON.stringify(output));
const sizeMB = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);
console.log(`Written: ${outputFile} (${sizeMB} MB)`);
