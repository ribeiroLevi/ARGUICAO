import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPersonalId, emptySourceDraft, PERSONAL_CARDS_KEY, readPersonalCards, sourceFromDraft, validatePersonalCard, writePersonalCards } from '../src/personal-cards';
import type { FlashcardData } from '../src/types';

// Synthetic fixtures exercise user authoring, never the academic dataset.
const card: FlashcardData = {
  id: 'personal-test', articleId: 'test-article', question: 'Minha pergunta de teste?', answer: 'Resposta [[com destaque]].', kind: 'direct',
  source: { file: 'test.pdf', title: 'Fonte de teste', pages: [1], sections: [], evidence: ['Citação de teste.\nSegunda linha integral.'] },
};

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('validação de autoria pessoal', () => {
  it('aceita o contrato completo e bloqueia IDs publicados sem substituição', () => {
    expect(validatePersonalCard(card)).toEqual([]);
    expect(validatePersonalCard(card, [card.id]).join(' ')).toContain('já existe');
  });

  it.each(['../test.pdf', '/test.pdf', 'C:\\test.pdf', '\\\\server\\test.pdf', 'dir/../test.pdf', './test.pdf', 'https://test/file.pdf'])('recusa caminho não relativo ou com travessia: %s', (file) => {
    expect(validatePersonalCard({ ...card, source: { ...card.source, file } }).join(' ')).toContain('caminho relativo');
  });

  it.each([{ pages: [] }, { pages: [0] }, { pages: [-1] }, { pages: [1.5] }, { pages: ['2'] }, { pages: [NaN] }])('recusa localização PDF inválida: %j', ({ pages }) => {
    expect(validatePersonalCard({ ...card, source: { ...card.source, pages } }).join(' ')).toMatch(/página/);
  });

  it.each(['', '[[aberto', 'fechado]]', '[[ ]]', '[[fora [[dentro]]]]'])('recusa resposta vazia ou destaques inválidos: %s', (answer) => {
    expect(validatePersonalCard({ ...card, answer }).length).toBeGreaterThan(0);
  });

  it('exige citação, pergunta, identificadores e fontes distintas na síntese', () => {
    const invalid = { ...card, articleId: 'all', question: '', kind: 'synthesis', source: { ...card.source, evidence: [] } };
    const errors = validatePersonalCard(invalid).join(' ');
    expect(errors).toContain('Pergunta');
    expect(errors).toContain('all');
    expect(errors).toContain('citação');
    expect(errors).toContain('fonte relacionada');
    expect(validatePersonalCard({ ...card, kind: 'synthesis', relatedSources: [{ articleId: card.articleId, source: card.source }] }).join(' ')).toContain('repetido');
    expect(validatePersonalCard({ ...card, kind: 'synthesis', relatedSources: [{ articleId: 'other', source: { ...card.source, file: 'other.pdf', title: 'Outra fonte' } }] })).toEqual([]);
  });

  it('preserva identidade canônica de uma fonte conhecida', () => {
    const known = [{ articleId: card.articleId, source: card.source }];
    expect(validatePersonalCard(card, [], known)).toEqual([]);
    expect(validatePersonalCard({ ...card, source: { ...card.source, title: 'Outro título' } }, [], known).join(' ')).toContain('fonte conhecida');
    expect(validatePersonalCard({ ...card, articleId: 'other-article' }, [], known).join(' ')).toContain('fonte conhecida');
  });

  it('exige tipo síntese para fontes adicionais no formulário e em dados armazenados', () => {
    const directWithRelated = { ...card, relatedSources: [{ articleId: 'other', source: { ...card.source, file: 'other.pdf', title: 'Outra fonte' } }] };
    expect(validatePersonalCard(directWithRelated).join(' ')).toContain('tipo Síntese');
    window.localStorage.setItem(PERSONAL_CARDS_KEY, JSON.stringify({ version: 1, cards: [directWithRelated] }));
    expect(readPersonalCards()).toEqual([]);
  });

  it('converte campos de listas sem truncar citações e recusa páginas ambíguas', () => {
    const draft = { ...emptySourceDraft(), file: 'test.pdf', pages: '1, 3, 12', sections: 'Seção A\nSeção B', evidence: ['Linha 1\nLinha 2', 'Outro trecho'] };
    expect(sourceFromDraft(draft)).toMatchObject({ pages: [1, 3, 12], sections: ['Seção A', 'Seção B'], evidence: draft.evidence });
    expect(sourceFromDraft({ ...draft, pages: '1-3' }).pages[0]).toBeNaN();
    expect(sourceFromDraft({ ...draft, pages: '1;3' }).pages[0]).toBeNaN();
  });
});

describe('armazenamento pessoal separado e versionado', () => {
  it.each(['{', 'null', '[]', '42', '{"version":2,"cards":[]}', '{"version":1,"cards":{}}'])('ignora envelope inválido: %s', (raw) => {
    window.localStorage.setItem(PERSONAL_CARDS_KEY, raw);
    expect(readPersonalCards()).toEqual([]);
  });

  it('ignora cartões inválidos, duplicados e colisões com publicados, preservando os válidos', () => {
    const publishedCollision = { ...card, id: 'published' };
    window.localStorage.setItem(PERSONAL_CARDS_KEY, JSON.stringify({ version: 1, cards: [null, publishedCollision, { ...card, id: 'bad', answer: '' }, card, card] }));
    expect(readPersonalCards(['published'])).toEqual([card]);
  });

  it('salva cartões e tolera armazenamento bloqueado na leitura e escrita', () => {
    expect(writePersonalCards([card])).toBe(true);
    expect(readPersonalCards()).toEqual([card]);
    expect(JSON.parse(window.localStorage.getItem(PERSONAL_CARDS_KEY)!)).toEqual({ version: 1, cards: [card] });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Bloqueado'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado'); });
    expect(readPersonalCards()).toEqual([]);
    expect(writePersonalCards([card])).toBe(false);
  });

  it('gera IDs pessoais sem colidir mesmo com gerador determinístico', () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000000');
    const first = createPersonalId([]);
    expect(createPersonalId([first])).toBe(`${first}-1`);
  });
});
