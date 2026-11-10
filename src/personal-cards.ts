import type { FlashcardData, RelatedSource, SourceReference } from './types';

export const PERSONAL_CARDS_KEY = 'arguicao.personal-cards.v1';
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const identifier = (value: unknown): value is string => text(value) && !/[\s\u0000]/u.test(value);
const fileKey = (file: string) => file.replace(/\\/g, '/').toLowerCase();

export function validHighlights(value: string): boolean {
  const marks = value.match(/\[\[[^\[\]]*\]\]/g) ?? [];
  const remainder = value.replace(/\[\[[^\[\]]*\]\]/g, '');
  return !remainder.includes('[[') && !remainder.includes(']]') && marks.every((mark) => mark.slice(2, -2).trim().length > 0);
}

function relativeFile(file: string): boolean {
  const normalized = file.replace(/\\/g, '/');
  return !/^[\/]|[:\u0000]/u.test(normalized) && normalized.split('/').every((part) => !!part && part !== '.' && part !== '..');
}

function sourceErrors(value: unknown, label: string): string[] {
  if (!record(value)) return [`${label}: informe a referência da fonte.`];
  const errors: string[] = [];
  if (!text(value.file) || !relativeFile(value.file)) errors.push(`${label}: arquivo deve ser um caminho relativo, sem travessia de pastas.`);
  if (!text(value.title)) errors.push(`${label}: título é obrigatório.`);
  if (!Array.isArray(value.pages) || value.pages.some((page) => !Number.isSafeInteger(page) || Number(page) < 1)) errors.push(`${label}: páginas devem ser números inteiros a partir de 1.`);
  else if (typeof value.file === 'string' && /\.pdf$/i.test(value.file) && value.pages.length === 0) errors.push(`${label}: arquivos PDF exigem ao menos uma página.`);
  if (!Array.isArray(value.sections) || value.sections.some((section) => !text(section))) errors.push(`${label}: cada seção deve conter texto.`);
  if (!Array.isArray(value.evidence) || value.evidence.length === 0 || value.evidence.some((quote) => !text(quote))) errors.push(`${label}: informe ao menos uma citação completa; nenhuma citação pode estar vazia.`);
  return errors;
}

/** Human-authored cards remain separate from the academically reviewed dataset. */
export function validatePersonalCard(value: unknown, reservedIds: Iterable<string> = [], knownSources: RelatedSource[] = []): string[] {
  if (!record(value)) return ['Questão pessoal inválida.'];
  const errors: string[] = [];
  if (!identifier(value.id)) errors.push('ID da questão é obrigatório e não pode conter espaços.');
  else if (new Set(reservedIds).has(value.id)) errors.push('ID da questão já existe. Escolha outro ID; questões existentes não serão substituídas.');
  for (const [key, label] of [['question', 'Pergunta'], ['answer', 'Resposta']] as const) {
    if (!text(value[key])) errors.push(`${label} é obrigatória.`);
    else if (!validHighlights(value[key])) errors.push(`${label}: use destaques balanceados e não vazios no formato [[texto]].`);
  }
  if (value.kind !== undefined && value.kind !== 'direct' && value.kind !== 'synthesis') errors.push('Tipo da questão deve ser direto ou síntese.');
  const related = value.relatedSources === undefined ? [] : value.relatedSources;
  if (!Array.isArray(related)) errors.push('Fontes relacionadas devem ser uma lista.');
  if (Array.isArray(related) && related.length > 0 && value.kind !== 'synthesis') errors.push('Questões com fontes relacionadas devem usar o tipo Síntese entre fontes.');
  if (value.kind === 'synthesis' && (!Array.isArray(related) || related.length === 0)) errors.push('Uma síntese exige a fonte principal e ao menos uma fonte relacionada.');
  const references = [value, ...(Array.isArray(related) ? related : [])];
  const seenArticles = new Set<string>();
  const seenFiles = new Set<string>();
  references.forEach((reference, index) => {
    const label = index === 0 ? 'Fonte principal' : `Fonte relacionada ${index}`;
    if (!record(reference)) { errors.push(`${label}: referência inválida.`); return; }
    if (!identifier(reference.articleId) || reference.articleId === 'all') errors.push(`${label}: ID do artigo é obrigatório, sem espaços, e não pode ser "all".`);
    else {
      if (seenArticles.has(reference.articleId)) errors.push(`${label}: artigo repetido entre as fontes.`);
      seenArticles.add(reference.articleId);
    }
    const referenceErrors = sourceErrors(reference.source, label);
    errors.push(...referenceErrors);
    if (record(reference.source) && text(reference.source.file)) {
      const file = fileKey(reference.source.file);
      if (seenFiles.has(file)) errors.push(`${label}: arquivo repetido entre as fontes.`);
      seenFiles.add(file);
      const known = knownSources.find((item) => item.articleId === reference.articleId || fileKey(item.source.file) === file);
      if (known && (known.articleId !== reference.articleId || fileKey(known.source.file) !== file || known.source.title !== reference.source.title)) errors.push(`${label}: ID, arquivo e título devem corresponder à fonte conhecida. Para uma nova fonte, informe outro ID e arquivo.`);
    }
  });
  return errors;
}

export function readPersonalCards(reservedIds: Iterable<string> = [], knownSources: RelatedSource[] = []): FlashcardData[] {
  try {
    const raw = window.localStorage.getItem(PERSONAL_CARDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!record(parsed) || parsed.version !== 1 || !Array.isArray(parsed.cards)) return [];
    const result: FlashcardData[] = [];
    const used = new Set(reservedIds);
    const sources = [...knownSources];
    for (const candidate of parsed.cards) {
      if (validatePersonalCard(candidate, used, sources).length > 0) continue;
      const card = candidate as FlashcardData;
      result.push(card);
      used.add(card.id);
      sources.push({ articleId: card.articleId, source: card.source }, ...(card.relatedSources ?? []));
    }
    return result;
  } catch { return []; }
}

export function writePersonalCards(cards: FlashcardData[]): boolean {
  try {
    window.localStorage.setItem(PERSONAL_CARDS_KEY, JSON.stringify({ version: 1, cards }));
    return true;
  } catch { return false; }
}

export function createPersonalId(reservedIds: Iterable<string>): string {
  const reserved = new Set(reservedIds);
  const base = `personal-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
  let candidate = base;
  let suffix = 1;
  while (reserved.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

export interface SourceDraft {
  articleId: string;
  file: string;
  title: string;
  pages: string;
  sections: string;
  evidence: string[];
}

export const emptySourceDraft = (): SourceDraft => ({ articleId: '', file: '', title: '', pages: '', sections: '', evidence: [''] });

export function sourceFromDraft(draft: SourceDraft): SourceReference {
  return {
    file: draft.file.trim(), title: draft.title.trim(),
    // Deliberately reject ranges/ambiguous separators instead of coercing them.
    pages: draft.pages.trim() === '' ? [] : /^\s*\d+\s*(,\s*\d+\s*)*$/.test(draft.pages) ? draft.pages.split(',').map((page) => Number(page.trim())) : [NaN],
    sections: draft.sections.split(/\r?\n/).map((section) => section.trim()).filter(Boolean),
    evidence: draft.evidence,
  };
}
