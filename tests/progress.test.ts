import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getStatistics, PROGRESS_KEY, readProgress, writeProgress } from '../src/progress';
import type { FlashcardData } from '../src/types';

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('persistência versionada', () => {
  it.each(['{', 'null', '[]', '42', '"texto"', '{"version":2,"evaluations":{"a":"correct"}}', '{"version":1,"evaluations":[]}'])('descarta armazenamento inválido: %s', (raw) => {
    window.localStorage.setItem(PROGRESS_KEY, raw);
    expect(readProgress()).toEqual({});
  });

  it('recupera somente avaliações conhecidas e salva a versão do contrato', () => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, evaluations: { a: 'correct', b: 'incorrect', c: 'incomplete', d: 'other', e: null, '': 'correct' } }));
    expect(readProgress()).toEqual({ a: 'correct', b: 'incorrect', c: 'incomplete' });
    expect(writeProgress({ a: 'incomplete' })).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(PROGRESS_KEY)!)).toEqual({ version: 1, evaluations: { a: 'incomplete' } });
  });

  it('tolera bloqueio tanto na leitura como na gravação', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Bloqueado'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota'); });
    expect(readProgress()).toEqual({});
    expect(writeProgress({ a: 'correct' })).toBe(false);
  });
});

describe('estatísticas por ID', () => {
  it('ignora IDs ausentes do baralho e deduplica cartões repetidos', () => {
    const base: FlashcardData = { id: 'a', articleId: 'test', question: 'Teste?', answer: 'Teste.', source: { file: 'test.pdf', title: 'Teste', pages: [1], sections: [], evidence: ['Teste'] } };
    expect(getStatistics([base, base, { ...base, id: 'b' }], { a: 'correct', old: 'incorrect' })).toEqual({ total: 2, correct: 1, incorrect: 0, incomplete: 0, unassessed: 1 });
  });
});
