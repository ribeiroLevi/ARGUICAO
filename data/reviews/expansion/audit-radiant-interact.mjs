import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const ids = ['article-39adb0cfa84e', 'article-48bdcebcffc6'];
const read = async file => JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
const norm = text => text.normalize('NFKC').replace(/\s+/g, ' ').trim();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const cards = (await Promise.all(ids.map(id => read(`data/candidates/expansion/${id}.json`)))).flat();
const inventory = await read('data/extracted/inventory.json');
const requests = new Map();
for (const card of cards) for (const reference of [{ articleId: card.articleId, source: card.source }, ...(card.relatedSources ?? [])]) {
  if (!requests.has(reference.articleId)) requests.set(reference.articleId, new Set());
  for (const page of reference.source.pages) requests.get(reference.articleId).add(page);
}
function textOf(items) {
  let result = '', previous;
  for (const item of items) {
    if (typeof item.str !== 'string') continue;
    if (previous && Math.abs(item.transform[5] - previous.transform[5]) > 3 && !result.endsWith('\n')) result += '\n';
    else if (result && !/\s$/.test(result) && item.str && !/^\s/.test(item.str)) result += ' ';
    result += item.str;
    if (item.hasEOL) result += '\n';
    previous = item;
  }
  return result.replace(/\u0000/g, '').replace(/\r\n?/g, '\n').trim();
}
const sources = [];
for (const [articleId, pageSet] of requests) {
  const entry = inventory.find(item => item.articleId === articleId);
  const bytes = await fs.readFile(`artigos/${entry.file}`);
  if (hash(bytes) !== entry.sha256) throw Error(`Changed original: ${entry.file}`);
  const loader = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, isEvalSupported: false, verbosity: 0 });
  const pdf = await loader.promise;
  const pages = [];
  try {
    for (const pageNumber of [...pageSet].sort((a, b) => a - b)) {
      const page = await pdf.getPage(pageNumber);
      const text = textOf((await page.getTextContent()).items);
      pages.push({ page: pageNumber, text, normalizedTextSha256: hash(norm(text)) });
      page.cleanup();
    }
  } finally { await loader.destroy(); }
  sources.push({ articleId, file: entry.file, sourceSha256: entry.sha256, pages });
}
const failures = [], cardChecks = [];
let evidenceCount = 0;
for (const card of cards) {
  const checked = [];
  for (const reference of [{ articleId: card.articleId, source: card.source }, ...(card.relatedSources ?? [])]) {
    const source = sources.find(item => item.articleId === reference.articleId);
    for (const evidence of reference.source.evidence) {
      evidenceCount++;
      const found = source.pages.find(page => reference.source.pages.includes(page.page) && norm(page.text).includes(norm(evidence)));
      if (!found) failures.push({ cardId: card.id, articleId: reference.articleId, evidence });
    }
    checked.push({ articleId: reference.articleId, pages: reference.source.pages, evidenceCount: reference.source.evidence.length });
  }
  cardChecks.push({ cardId: card.id, references: checked });
}
await fs.writeFile('data/reviews/expansion/original-pages-radiant-interact.json', JSON.stringify(sources, null, 2) + '\n');
const audit = { reviewer: 'review_radiant_interact', method: 'Direct PDF.js text extraction from original PDFs; literal check complements individual semantic review.', candidateCount: cards.length, evidenceCount, originalPagesRead: sources.reduce((sum, source) => sum + source.pages.length, 0), sourceHashes: Object.fromEntries(sources.map(source => [source.articleId, source.sourceSha256])), cards: cardChecks, failures };
await fs.writeFile('data/reviews/expansion/audit-radiant-interact.json', JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify({ cards: cards.length, evidenceCount, originalPagesRead: audit.originalPagesRead, failures: failures.length }));
if (failures.length) process.exitCode = 1;
