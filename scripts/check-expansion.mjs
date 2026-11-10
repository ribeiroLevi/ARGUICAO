import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cardDigest, digest } from './validate-cards.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async relative => JSON.parse((await fs.readFile(path.join(root, relative), 'utf8')).replace(/^\uFEFF/, ''));
const baselineFile = path.join(root, 'data/research/baseline.json');
const cards = await read('src/data/cards.json');
const reviews = await read('data/reviews/reviews.json');
const inventory = await read('data/extracted/inventory.json');

if (process.argv.includes('--capture')) {
  await fs.mkdir(path.dirname(baselineFile), { recursive: true });
  const baseline = {
    cards: Object.fromEntries(cards.map(card => [card.id, cardDigest(card)])),
    reviews: Object.fromEntries(reviews.map(review => [review.cardId, digest(JSON.stringify(review))])),
    sources: Object.fromEntries(inventory.map(entry => [entry.articleId, entry.sha256])),
  };
  // Exclusive creation prevents accidentally replacing the pre-expansion baseline.
  await fs.writeFile(baselineFile, JSON.stringify(baseline, null, 2) + '\n', { flag: 'wx' });
  console.log(`Baseline preservada: ${cards.length} cartões, ${reviews.length} revisões, ${inventory.length} fontes.`);
} else {
  const baseline = await read('data/research/baseline.json');
  const errors = [];
  for (const [id, hash] of Object.entries(baseline.cards)) {
    const card = cards.find(item => item.id === id);
    if (!card || cardDigest(card) !== hash) errors.push(`Cartão anterior alterado ou ausente: ${id}`);
  }
  for (const [id, hash] of Object.entries(baseline.reviews)) {
    const review = reviews.find(item => item.cardId === id);
    if (!review || digest(JSON.stringify(review)) !== hash) errors.push(`Revisão anterior alterada ou ausente: ${id}`);
  }
  const added = cards.filter(card => !Object.hasOwn(baseline.cards, card.id));
  for (const [articleId, hash] of Object.entries(baseline.sources)) {
    const entry = inventory.find(item => item.articleId === articleId);
    if (!entry || entry.sha256 !== hash || digest(await fs.readFile(path.join(root, 'artigos', entry.file))) !== hash) errors.push(`Fonte mudou: ${articleId}`);
    const count = added.filter(card => card.articleId === articleId).length;
    if (count !== 50) errors.push(`${articleId}: ${count} novos cartões principais; esperado 50.`);
  }
  const unknown = added.filter(card => !Object.hasOwn(baseline.sources, card.articleId));
  if (unknown.length) errors.push('Há cartões novos com fonte principal desconhecida.');
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log(`${cards.length} cartões: ${Object.keys(baseline.cards).length} anteriores idênticos e ${added.length} novos (50 por documento), incluindo ${added.filter(card => card.kind === 'synthesis').length} sínteses. Revisões anteriores e fontes preservadas.`);
}
