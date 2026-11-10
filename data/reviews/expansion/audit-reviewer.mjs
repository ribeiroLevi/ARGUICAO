import fs from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { digest, cardDigest } from '../../../scripts/validate-cards.mjs';

const assigned = ['article-d4b0c4f9d75f', 'article-94e7a19d8878', 'article-eca18e5843e2'];
const inventory = JSON.parse(await fs.readFile('data/extracted/inventory.json', 'utf8'));
const cards = (await Promise.all(assigned.map(async id => JSON.parse(await fs.readFile(`data/candidates/expansion/${id}.json`, 'utf8'))))).flat();
const normalize = s => s.normalize('NFKC').replace(/\u0000/g, '').replace(/\s+/g, ' ').trim();
const records = [];
for (const article of inventory) {
  const references = cards.flatMap(c => [
    ...(c.articleId === article.articleId ? [{ cardId: c.id, source: c.source }] : []),
    ...(c.relatedSources ?? []).filter(r => r.articleId === article.articleId).map(r => ({ cardId: c.id, source: r.source })),
  ]);
  if (!references.length) continue;
  const bytes = await fs.readFile(`artigos/${article.file}`);
  const hash = digest(bytes);
  if (hash !== article.sha256) throw Error(`Original alterado: ${article.file}`);
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, isEvalSupported: false, verbosity: 0 });
  const pdf = await task.promise;
  const pages = [];
  for (const n of [...new Set(references.flatMap(r => r.source.pages))].sort((a, b) => a - b)) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const text = normalize(content.items.filter(i => typeof i.str === 'string').map(i => i.str).join(' '));
    pages.push({ page: n, text });
  }
  for (const ref of references) {
    if (ref.source.file !== article.file || ref.source.title !== article.title) throw Error(`Metadados divergentes: ${ref.cardId}`);
    for (const evidence of ref.source.evidence) {
      if (!pages.filter(p => ref.source.pages.includes(p.page)).some(p => p.text.includes(normalize(evidence)))) {
        throw Error(`Evidência divergente no original: ${ref.cardId}: ${evidence.slice(0, 80)}`);
      }
    }
  }
  records.push({ articleId: article.articleId, file: article.file, sourceSha256: hash, originalPages: pages.map(p => ({ page: p.page, textSha256: digest(p.text) })), referencesChecked: references.length });
  // Optional stdout for independent semantic inspection of selected original pages.
  if (process.argv[2] === article.articleId) {
    const selected = process.argv[3]?.split(',').map(Number);
    for (const p of pages.filter(p => !selected || selected.includes(p.page))) console.log(`\nORIGINAL ${article.articleId} PAGE ${p.page}\n${p.text}`);
  }
  await task.destroy();
}
await fs.writeFile('data/reviews/expansion/audit-reviewer.json', JSON.stringify({ method: 'Direct PDF.js reads of original local PDFs; NFKC and whitespace normalization; literal audit supplements independent individual semantic review.', assignedArticles: assigned, candidateHashes: Object.fromEntries(cards.map(c => [c.id, cardDigest(c)])), sources: records }, null, 2) + '\n');
console.log(`Original audit: ${cards.length} candidates, ${records.reduce((sum, r) => sum + r.originalPages.length, 0)} physical pages; all evidence matched.`);
