import type { FlashcardData, RelatedSource } from './types';

export type Assessment = 'correct' | 'incorrect' | 'incomplete';
export type Progress = Record<string, Assessment>;
export const PROGRESS_KEY = 'arguicao.progress.v1';
export const assessmentLabels: Record<Assessment, string> = {
  correct: 'Acertei', incorrect: 'Errei', incomplete: 'Incompleto',
};

const isAssessment = (value: unknown): value is Assessment =>
  value === 'correct' || value === 'incorrect' || value === 'incomplete';

export function readProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1 || !('evaluations' in parsed)) return {};
    const values = parsed.evaluations;
    if (!values || typeof values !== 'object' || Array.isArray(values)) return {};
    return Object.fromEntries(Object.entries(values).filter(([id, value]) => id.length > 0 && isAssessment(value)));
  } catch { return {}; }
}

/** Saving is optional: private browsing and quota errors must not block study. */
export function writeProgress(evaluations: Progress): boolean {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, evaluations }));
    return true;
  } catch { return false; }
}

export function cardSources(card: FlashcardData): RelatedSource[] {
  return [{ articleId: card.articleId, source: card.source }, ...(card.relatedSources ?? [])];
}

export function belongsToArticle(card: FlashcardData, articleId: string): boolean {
  return cardSources(card).some((reference) => reference.articleId === articleId);
}

export interface Statistics {
  total: number;
  correct: number;
  incorrect: number;
  incomplete: number;
  unassessed: number;
}

export function getStatistics(cards: readonly FlashcardData[], progress: Progress): Statistics {
  const uniqueCards = Array.from(new Map(cards.map((card) => [card.id, card])).values());
  const result: Statistics = { total: uniqueCards.length, correct: 0, incorrect: 0, incomplete: 0, unassessed: 0 };
  for (const card of uniqueCards) {
    const status = Object.hasOwn(progress, card.id) ? progress[card.id] : undefined;
    if (isAssessment(status)) result[status] += 1;
    else result.unassessed += 1;
  }
  return result;
}
