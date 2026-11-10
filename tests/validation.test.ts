// Synthetic fixtures are isolated in temporary directories and never published.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
// @ts-expect-error The validator is also a standalone Node command.
import { validateCards, digest, cardDigest } from '../scripts/validate-cards.mjs';
import type { FlashcardData } from '../src/types';

let root: string;
let card: FlashcardData;
let hash: string;
let secondaryHash: string | undefined;
const write = (file: string, value: unknown) => fs.writeFile(path.join(root, file), JSON.stringify(value), 'utf8');
const publish = () => write('src/data/cards.json', [card]);
const approve = () => write('data/reviews/reviews.json', [{ cardId: card.id, status: 'approved', reason: 'Revisão da fixture isolada.', cardSha256: cardDigest(card), sourceSha256: hash, ...(secondaryHash ? { relatedSourceSha256: { secondary: secondaryHash } } : {}) }]);
const errors = async () => (await validateCards(root)).errors as string[];

async function addRelatedSource() {
  const text = 'Segunda fonte de teste, distinta da primeira.';
  secondaryHash = digest(text);
  const entry = { articleId: 'secondary', file: 'secondary.txt', title: 'Secondary', sha256: secondaryHash, status: 'ok', outputFile: 'secondary.json' };
  const inventory = JSON.parse(await fs.readFile(path.join(root, 'data/extracted/inventory.json'), 'utf8'));
  await write('data/extracted/inventory.json', [...inventory, entry]);
  await fs.writeFile(path.join(root, 'artigos/secondary.txt'), text);
  await write('data/extracted/secondary.json', { ...entry, pages: [{ page: 1, text }] });
  const relation = { articleId: 'secondary', source: { file: 'secondary.txt', title: 'Secondary', pages: [1], sections: [], evidence: [text] } };
  Object.assign(card, { kind: 'synthesis', relatedSources: [relation] });
  return relation;
}

beforeEach(async () => {
  secondaryHash = undefined;
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'arguicao-validation-'));
  for (const dir of ['src/data', 'data/extracted', 'data/reviews', 'artigos']) await fs.mkdir(path.join(root, dir), { recursive: true });
  const text = 'Trecho de teste para conferir a origem.';
  hash = digest(text);
  await fs.writeFile(path.join(root, 'artigos/fixture.txt'), text);
  card = { id: 'fixture-01', articleId: 'fixture', question: 'Pergunta de teste?', answer: '[[Trecho de teste]].', source: { file: 'fixture.txt', title: 'Fixture', pages: [1], sections: [], evidence: [text] } };
  await write('data/extracted/inventory.json', [{ articleId: 'fixture', file: 'fixture.txt', sha256: hash, status: 'ok', outputFile: 'fixture.json' }]);
  await write('data/extracted/fixture.json', { articleId: 'fixture', file: 'fixture.txt', title: 'Fixture', sha256: hash, status: 'ok', pages: [{ page: 1, text }] });
  await publish();
  await approve();
});

describe('correlações entre fontes', () => {
  it('aceita síntese com evidência e hash de cada fonte', async () => {
    await addRelatedSource(); await publish(); await approve();
    expect(await errors()).toEqual([]);
  });
  it('exige aprovação adicional, mesmo quando a fonte principal está aprovada', async () => {
    await addRelatedSource(); await publish();
    secondaryHash = undefined;
    await approve();
    expect((await errors()).join(' ')).toContain('Falta aprovação atual de todas as fontes relacionadas');
  });
  it('rejeita modificação na fonte secundária após revisão', async () => {
    await addRelatedSource(); await publish(); await approve();
    await fs.writeFile(path.join(root, 'artigos/secondary.txt'), 'Outra versão');
    expect((await errors()).join(' ')).toContain('Fonte mudou');
  });
  it('rejeita evidência inventada na fonte secundária', async () => {
    const relation = await addRelatedSource();
    relation.source.evidence = ['Trecho que não existe'];
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Evidência não encontrada');
  });
  it('rejeita título incorreto na referência secundária', async () => {
    const relation = await addRelatedSource();
    relation.source.title = 'Título incorreto';
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Título difere');
  });
  it('rejeita a mesma fonte secundária repetida', async () => {
    const relation = await addRelatedSource();
    Object.assign(card, { relatedSources: [relation, relation] });
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Fonte relacionada duplicada');
  });
  it('rejeita síntese sem segunda fonte', async () => {
    Object.assign(card, { kind: 'synthesis' });
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Síntese exige ao menos duas fontes');
  });
  it('rejeita referência adicional disfarçada de conteúdo direto', async () => {
    await addRelatedSource();
    Object.assign(card, { kind: 'direct' });
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Fontes relacionadas exigem cartão de síntese');
  });
  it('rejeita relação adicionada sem nova revisão do cartão inteiro', async () => {
    await addRelatedSource(); await publish();
    expect((await errors()).join(' ')).toContain('Falta aprovação semântica atual');
  });
});

afterEach(async () => {
  const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(root));
  if (!relative.startsWith('arguicao-validation-') || relative.includes(path.sep) || path.isAbsolute(relative)) {
    throw new Error('Recusa de limpeza fora do diretório temporário do teste.');
  }
  await fs.rm(root, { recursive: true, force: true });
});

describe('integridade da publicação', () => {
  it('aceita evidência localizada com aprovação atual', async () => {
    expect(await validateCards(root)).toEqual({ count: 1, errors: [] });
  });
  it('rejeita publicação sem revisão semântica', async () => {
    await write('data/reviews/reviews.json', []);
    expect((await errors()).join(' ')).toContain('Falta aprovação semântica');
  });
  it('rejeita alteração no cartão depois da revisão', async () => {
    card.answer = 'Resposta alterada';
    await publish();
    expect((await errors()).join(' ')).toContain('Falta aprovação semântica');
  });
  it('rejeita alteração do arquivo original', async () => {
    await fs.writeFile(path.join(root, 'artigos/fixture.txt'), 'Texto modificado');
    expect((await errors()).join(' ')).toContain('Fonte mudou');
  });
  it('rejeita evidência ausente mesmo com hash aprovado', async () => {
    card.source.evidence = ['Este trecho não está na fonte'];
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Evidência não encontrada');
  });
  it('rejeita páginas inexistentes', async () => {
    card.source.pages = [2];
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Página inexistente');
  });
  it('rejeita travessia fora de artigos', async () => {
    card.source.file = '../externo.txt';
    await publish();
    expect((await errors()).join(' ')).toContain('Caminho de fonte fora');
  });
  it('rejeita IDs e perguntas duplicados', async () => {
    await write('src/data/cards.json', [card, card]);
    expect((await errors()).join(' ')).toContain('ID duplicado');
    expect((await errors()).join(' ')).toContain('Pergunta duplicada');
  });
  it('rejeita marcação desequilibrada na pergunta', async () => {
    card.question = '[[Pergunta incompleta';
    await publish(); await approve();
    expect((await errors()).join(' ')).toContain('Marcação de destaque inválida');
  });
  it('rejeita decisões conflitantes', async () => {
    const approved = JSON.parse(await fs.readFile(path.join(root, 'data/reviews/reviews.json'), 'utf8'))[0];
    await write('data/reviews/reviews.json', [approved, { ...approved, status: 'rejected' }]);
    expect((await errors()).join(' ')).toContain('Mais de uma decisão');
  });
  it('rejeita fonte retirada do inventário atual', async () => {
    await write('data/extracted/inventory.json', []);
    expect((await errors()).join(' ')).toContain('Fonte não consta');
  });
  it('retorna diagnóstico para JSON inválido', async () => {
    await fs.writeFile(path.join(root, 'src/data/cards.json'), '{');
    expect((await errors()).join(' ')).toContain('Não foi possível ler');
  });
  it('retorna diagnóstico para entrada nula no inventário', async () => {
    await write('data/extracted/inventory.json', [null]);
    expect((await errors()).join(' ')).toContain('Fonte não consta');
  });
});
