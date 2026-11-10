import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const digest = value => createHash('sha256').update(value).digest('hex');
export const cardDigest = card => digest(JSON.stringify(card));
const normalize = value => value.normalize('NFKC').replace(/\s+/g, ' ').trim();
const readJSON = async file => JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const inside = (base, relative) => typeof relative === 'string' && !path.isAbsolute(relative) && !path.relative(base, path.resolve(base, relative)).startsWith('..');

export async function validateCards(root = defaultRoot) {
  const errors = [];
  let cards, inventory, reviews;
  try {
    cards = await readJSON(path.join(root, 'src/data/cards.json'));
    inventory = await readJSON(path.join(root, 'data/extracted/inventory.json'));
    reviews = await readJSON(path.join(root, 'data/reviews/reviews.json'));
  } catch (error) { return { errors: [`Não foi possível ler dados, inventário e decisões: ${error.message}`], count: 0 }; }
  if (!Array.isArray(cards) || !Array.isArray(inventory) || !Array.isArray(reviews)) return { errors: ['Cartões, inventário e revisões devem ser arrays.'], count: 0 };
  const sourceCache = new Map();
  async function checkSource(articleId, source, fail) {
    if (!source || !nonempty(source.title) || !nonempty(source.file) || !Array.isArray(source.pages) || source.pages.some(p => !Number.isInteger(p) || p < 1) || !Array.isArray(source.sections) || source.sections.some(s => !nonempty(s)) || !Array.isArray(source.evidence) || !source.evidence.length || source.evidence.some(e => !nonempty(e))) {
      fail('Fonte, páginas, seções ou evidências inválidas.'); return;
    }
    const articles = path.join(root, 'artigos');
    if (!inside(articles, source.file)) { fail('Caminho de fonte fora de artigos/.'); return; }
    const entry = inventory.find(item => item?.articleId === articleId && item.file === source.file && item.status === 'ok');
    if (!entry || !inside(path.join(root, 'data/extracted'), entry.outputFile)) { fail('Fonte não consta no inventário legível atual.'); return; }
    try {
      const key = `${articleId}:${source.file}`;
      let cached = sourceCache.get(key);
      if (!cached) {
        cached = {
          originalHash: digest(await fs.readFile(path.join(articles, source.file))),
          extracted: await readJSON(path.join(root, 'data/extracted', entry.outputFile)),
        };
        sourceCache.set(key, cached);
      }
      const { originalHash, extracted } = cached;
      if (originalHash !== entry.sha256 || extracted.sha256 !== originalHash || extracted.articleId !== articleId || extracted.file !== source.file || extracted.status !== 'ok') fail('Fonte mudou ou extração não corresponde ao original. Reextraia e revise.');
      if (source.title !== extracted.title) fail('Título difere do título verificado na extração.');
      if (source.file.toLowerCase().endsWith('.pdf') && source.pages.length === 0) fail('PDF exige localização por página física.');
      const pages = extracted.pages.filter(page => source.pages.length === 0 || source.pages.includes(page.page));
      if (source.pages.some(p => !extracted.pages.some(page => page.page === p))) fail('Página inexistente.');
      for (const evidence of source.evidence) if (!pages.some(page => normalize(page.text).includes(normalize(evidence)))) fail('Evidência não encontrada nas páginas citadas.');
      return originalHash;
    } catch (error) { fail(`Fonte/extração inacessível: ${error.message}`); }
  }
  const ids = new Set(), questions = new Set();
  for (const card of cards) {
    const fail = message => errors.push(`${card?.id ?? '(sem id)'}: ${message}`);
    if (!card || !nonempty(card.id) || !nonempty(card.articleId) || !nonempty(card.question) || !nonempty(card.answer)) { fail('ID, artigo, pergunta e resposta são obrigatórios.'); continue; }
    if (ids.has(card.id)) fail('ID duplicado.');
    ids.add(card.id);
    const key = normalize(card.question).toLocaleLowerCase('pt-BR');
    if (questions.has(key)) fail('Pergunta duplicada.');
    questions.add(key);
    for (const text of [card.question, card.answer]) {
      const plain = text.replace(/\[\[[^\[\]]+\]\]/g, '');
      if (plain.includes('[[') || plain.includes(']]')) fail('Marcação de destaque inválida.');
    }
    if (card.kind !== undefined && !['direct', 'synthesis'].includes(card.kind)) fail('Tipo de cartão inválido.');
    if (card.relatedSources !== undefined && !Array.isArray(card.relatedSources)) { fail('Fontes relacionadas devem ser um array.'); continue; }
    const related = card.relatedSources ?? [];
    if (card.kind === 'synthesis' && !related.length) fail('Síntese exige ao menos duas fontes.');
    if (related.length && card.kind !== 'synthesis') fail('Fontes relacionadas exigem cartão de síntese.');
    const originalHash = await checkSource(card.articleId, card.source, fail);
    const relatedHashes = Object.create(null);
    const sourceIds = new Set([card.articleId]);
    for (const item of related) {
      if (!item || !nonempty(item.articleId)) { fail('Artigo relacionado inválido.'); continue; }
      if (sourceIds.has(item.articleId)) fail('Fonte relacionada duplicada ou igual à principal.');
      sourceIds.add(item.articleId);
      relatedHashes[item.articleId] = await checkSource(item.articleId, item.source, message => fail(`${item.articleId}: ${message}`));
    }
    const decisions = reviews.filter(item => item?.cardId === card.id);
    if (decisions.length > 1) fail('Mais de uma decisão atual para o cartão. Consolide a revisão.');
    const review = decisions[0];
    if (!review || review.status !== 'approved' || !nonempty(review.reason) || review.cardSha256 !== cardDigest(card) || !originalHash || review.sourceSha256 !== originalHash) fail('Falta aprovação semântica atual com hashes do cartão e da fonte.');
    if (related.length || review?.relatedSourceSha256 !== undefined) {
      const approvedHashes = review?.relatedSourceSha256;
      if (!approvedHashes || typeof approvedHashes !== 'object' || Array.isArray(approvedHashes) || Object.keys(approvedHashes).length !== Object.keys(relatedHashes).length || Object.entries(relatedHashes).some(([id, hash]) => !hash || approvedHashes[id] !== hash)) fail('Falta aprovação atual de todas as fontes relacionadas.');
    }
  }
  return { errors, count: cards.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateCards();
  if (result.errors.length) { console.error(result.errors.join('\n')); process.exitCode = 1; }
  else console.log(`${result.count} cartões válidos: fontes, páginas, evidências e aprovações conferidas. A revisão semântica é registrada pelo Academic Reviewer.`);
}
