import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import type { FlashcardData } from '../src/types';

// Browser checks read only the approved production dataset. No test cards enter the app.
const cards: FlashcardData[] = JSON.parse(readFileSync(new URL('../src/data/cards.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
const plain = (value: string) => value.replace(/\[\[|\]\]/g, '').replace(/\s+/g, ' ').trim();
const sources = (card: FlashcardData) => [{ articleId: card.articleId, source: card.source }, ...(card.relatedSources ?? [])];
const inTopic = (card: FlashcardData, articleId: string) => sources(card).some(source => source.articleId === articleId);
const topics = [...new Map(cards.flatMap(card => sources(card).map(reference => [reference.articleId, reference.source.title] as const))).entries()];

test.setTimeout(180000);

test('estado publicado, controles e ausência de erros de runtime', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ARGUIÇÃO.' })).toBeVisible();
  const controls = page.getByLabel('Controles do cartão');
  await expect(controls.getByRole('button')).toHaveCount(3);
  await expect(page.getByRole('navigation').getByRole('button')).toHaveCount(topics.length + 1);
  await expect(page.getByRole('button', { name: '← ANTERIOR' })).toBeDisabled();
  if (cards.length === 0) {
    await expect(page.getByText('NENHUM CARTÃO APROVADO')).toBeVisible();
    await expect(page.getByRole('button', { name: 'VIRAR' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'PRÓXIMO →' })).toBeDisabled();
  } else {
    await expect(page.getByRole('article', { name: 'Pergunta do cartão' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'VIRAR' })).toBeEnabled();
  }
  expect(errors).toEqual([]);
});

test('TODOS mantém ordem no retorno, sem repetição, com limites e reset da frente', async ({ page }) => {
  test.skip(cards.length === 0, 'A publicação acadêmica ainda está vazia.');
  await page.goto('/');
  const questions: string[] = [];
  const next = page.getByRole('button', { name: 'PRÓXIMO →' });
  const flip = page.getByRole('button', { name: 'VIRAR' });
  for (let index = 0; index < cards.length; index++) {
    const question = page.getByRole('heading', { level: 2 });
    await expect(question).toBeVisible();
    questions.push(plain(await question.innerText()));
    await flip.click();
    await expect(flip).toHaveAttribute('aria-pressed', 'true');
    if (index < cards.length - 1) await next.click();
  }
  expect(new Set(questions).size).toBe(cards.length);
  expect(new Set(questions)).toEqual(new Set(cards.map(card => plain(card.question))));
  await expect(next).toBeDisabled();
  await page.getByRole('button', { name: topics[0]![1], exact: true }).click();
  await expect(flip).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'TODOS', exact: true }).click();
  for (let index = 0; index < cards.length; index++) {
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(questions[index]!);
    if (index < cards.length - 1) await next.click();
  }
  await page.getByRole('button', { name: '← ANTERIOR' }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(questions[cards.length - 2]!);
});

test('filtros exibem cartões corretos, fonte, destaques e navegação por teclado', async ({ page }) => {
  test.skip(cards.length === 0, 'A publicação acadêmica ainda está vazia.');
  await page.goto('/');
  for (const [articleId, title] of topics) {
    const expected = cards.filter(card => inTopic(card, articleId));
    await page.getByRole('button', { name: title, exact: true }).click();
    const first = plain(await page.getByRole('heading', { level: 2 }).innerText());
    const displayed = expected.find(card => plain(card.question) === first)!;
    expect(displayed).toBeTruthy();
    await expect(page.getByLabel('Posição na sequência')).toHaveText(`01 / ${String(expected.length).padStart(2, '0')}`);
    await expect(page.getByRole('button', { name: '← ANTERIOR' })).toBeDisabled();
    const flip = page.getByRole('button', { name: 'VIRAR' });
    await flip.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('article', { name: 'Resposta do cartão' })).toBeVisible();
    await expect(page.locator('.card-answer')).toHaveText(plain(displayed.answer));
    await expect(page.locator('.card-source')).toContainText(title);
    expect(await page.locator('.source-location').allTextContents()).toEqual(sources(displayed).map(({ source }) => [source.pages.length ? `${source.pages.length === 1 ? 'Página' : 'Páginas'} ${source.pages.join(', ')}` : '', ...source.sections].filter(Boolean).join(' · ')));
    expect(await page.locator('blockquote').allTextContents()).toEqual(sources(displayed).flatMap(({ source }) => source.evidence));
    const highlighted = [...displayed.answer.matchAll(/\[\[([^\[\]]+)\]\]/g)].map(match => match[1]);
    expect(await page.locator('.card-answer mark').allTextContents()).toEqual(highlighted);
    if (expected.length > 1) {
      await page.getByRole('button', { name: 'PRÓXIMO →' }).click();
      await expect(flip).toHaveAttribute('aria-pressed', 'false');
      const second = plain(await page.getByRole('heading', { level: 2 }).innerText());
      expect(second).not.toBe(first);
      expect(expected.some(card => plain(card.question) === second)).toBe(true);
    }
  }
});

test('larguras de tela, cartão até 720px e foco visível', async ({ page }) => {
  await page.goto('/');
  if (cards.length > 0) {
    const size = (card: FlashcardData) => card.answer.length + sources(card).flatMap(({ source }) => source.evidence).join('').length;
    const longest = [...cards].sort((a, b) => size(b) - size(a))[0]!;
    await page.getByRole('button', { name: longest.source.title, exact: true }).click();
    for (let step = 0; step < cards.length; step++) {
      if (plain(await page.getByRole('heading', { level: 2 }).innerText()) === plain(longest.question)) break;
      await page.getByRole('button', { name: 'PRÓXIMO →' }).click();
    }
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(plain(longest.question));
  }
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const dimensions = await page.locator('.flashcard').evaluate(element => {
      const style = getComputedStyle(element);
      return { width: element.getBoundingClientRect().width, border: style.borderTopWidth, radius: style.borderRadius, shadow: style.boxShadow };
    });
    expect(dimensions.width).toBeLessThanOrEqual(720);
    expect(dimensions.border).toBe('2px');
    expect(dimensions.radius).toBe('0px');
    expect(dimensions.shadow).toBe('none');
    if (cards.length > 0) {
      await page.getByRole('button', { name: 'VIRAR' }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (width === 320 || width === 1440) {
        mkdirSync('docs/qa', { recursive: true });
        await page.screenshot({ path: `docs/qa/arguicao-resposta-${width}.png`, fullPage: true });
        if (width === 320) {
          await page.locator('.card-answer').evaluate(element => element.scrollIntoView({ block: 'start' }));
          await page.screenshot({ path: 'docs/qa/arguicao-resposta-viewport-320.png' });
          await page.locator('blockquote').first().evaluate(element => element.scrollIntoView({ block: 'start' }));
          await page.screenshot({ path: 'docs/qa/arguicao-citacao-viewport-320.png' });
        }
      }
      await page.getByRole('button', { name: 'VIRAR' }).click();
    }
    if (cards.length > 0 && (width === 320 || width === 1440)) {
      mkdirSync('docs/qa', { recursive: true });
      await page.screenshot({ path: `docs/qa/arguicao-${width}.png`, fullPage: true });
    }
  }
  await page.reload();
  await page.keyboard.press('Tab');
  // Explicitly focus a known control after entering keyboard modality; Edge can
  // retain focus in browser chrome after reload instead of on the document.
  await page.getByRole('button', { name: 'TODOS', exact: true }).focus();
  const focus = await page.locator(':focus').evaluate(element => {
    const style = getComputedStyle(element);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(focus).toEqual({ width: '3px', style: 'solid' });
});

test('axe WCAG 2 A/AA e 2.1 A/AA na frente e verso', async ({ page }) => {
  await page.goto('/');
  const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
  if (cards.length > 0) {
    await page.getByRole('button', { name: 'VIRAR' }).click();
    await page.getByRole('button', { name: 'Acertei', exact: true }).click();
    expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole('button', { name: 'Menu de estudo' }).click();
  await page.getByRole('button', { name: 'Estatísticas', exact: true }).click();
  expect((await new AxeBuilder({ page }).withTags(tags).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  mkdirSync('docs/qa', { recursive: true });
  await page.screenshot({ path: 'docs/qa/expansion-statistics-320.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'docs/qa/expansion-statistics-1440.png', fullPage: true });
});

test('avaliação persistente, reavaliação sem duplicação, menu e feedback somente no verso', async ({ page }) => {
  test.skip(!cards.length, 'Sem publicação.');
  await page.goto('/');
  const question = plain(await page.getByRole('heading', { level: 2 }).innerText());
  const card = cards.find(item => plain(item.question) === question)!;
  await expect(page.getByRole('button', { name: 'Acertei', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'VIRAR' }).click();
  await page.getByRole('button', { name: 'Acertei', exact: true }).click();
  await page.getByRole('button', { name: 'Acertei', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Acertei', exact: true })).toHaveCSS('background-color', 'rgb(167, 230, 181)');
  await expect(page.locator('.assessment-status')).toHaveCSS('background-color', 'rgb(167, 230, 181)');
  await expect(page.locator('.assessment-status')).toHaveText('Avaliação: Acertei.');
  await page.getByRole('button', { name: 'Menu de estudo' }).click();
  await page.getByRole('button', { name: 'Estatísticas', exact: true }).click();
  const general = page.getByRole('region', { name: 'Estatísticas gerais', exact: true });
  const metric = (name: string) => general.getByText(name, { exact: true }).locator('..').locator('dd');
  await expect(metric('Total')).toHaveText(String(cards.length));
  await expect(metric('Corretos')).toHaveText('1');
  await expect(metric('Não avaliados')).toHaveText(String(cards.length - 1));
  await page.getByRole('button', { name: 'Errei', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Errei', exact: true })).toHaveCSS('background-color', 'rgb(255, 179, 179)');
  await expect(page.locator('.assessment-status')).toHaveCSS('background-color', 'rgb(255, 179, 179)');
  await expect(metric('Corretos')).toHaveText('0');
  await expect(metric('Incorretos')).toHaveText('1');
  await page.getByRole('button', { name: 'Incompleto', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Incompleto', exact: true })).toHaveCSS('background-color', 'rgb(255, 227, 91)');
  await expect(page.locator('.assessment-status')).toHaveCSS('background-color', 'rgb(255, 227, 91)');
  await expect(metric('Incorretos')).toHaveText('0');
  await expect(metric('Incompletos')).toHaveText('1');
  await page.getByRole('button', { name: 'Menu de estudo' }).focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu de estudo' })).toHaveAttribute('aria-expanded', 'false');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('arguicao.progress.v1')!));
  expect(saved.evaluations).toEqual({ [card.id]: 'incomplete' });
  await page.reload();
  await expect(page.locator('.assessment-status')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Incompleto', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: card.source.title, exact: true }).click();
  for (let step = 0; step < cards.length; step++) {
    if (plain(await page.getByRole('heading', { level: 2 }).innerText()) === question) break;
    await page.getByRole('button', { name: 'PRÓXIMO →' }).click();
  }
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(question);
  await page.getByRole('button', { name: 'VIRAR' }).click();
  await expect(page.locator('.assessment-status')).toHaveText('Avaliação: Incompleto.');
  await expect(page.getByRole('button', { name: 'Incompleto', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('cartão de correlação participa de cada filtro e estatística sem duplicar o total geral', async ({ page }) => {
  test.skip(!cards.some(card => card.relatedSources?.length), 'Aguardando publicação de sínteses.');
  const card = cards.find(card => card.relatedSources?.length)!;
  await page.goto('/');
  for (const { articleId, source } of sources(card)) {
    await page.getByRole('button', { name: source.title, exact: true }).click();
    const expected = cards.filter(item => inTopic(item, articleId));
    const found: string[] = [];
    for (let index = 0; index < expected.length; index++) {
      found.push(plain(await page.getByRole('heading', { level: 2 }).innerText()));
      if (index < expected.length - 1) await page.getByRole('button', { name: 'PRÓXIMO →' }).click();
    }
    expect(found).toContain(plain(card.question));
    expect(new Set(found)).toEqual(new Set(expected.map(item => plain(item.question))));
    // Return through this filter to the same shared card for assessment.
    await page.getByRole('button', { name: source.title, exact: true }).click();
    for (let step = 0; step < found.indexOf(plain(card.question)); step++) await page.getByRole('button', { name: 'PRÓXIMO →' }).click();
    await page.getByRole('button', { name: 'VIRAR' }).click();
    await page.getByRole('button', { name: 'Errei', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Menu de estudo' }).click();
  await page.getByRole('button', { name: 'Estatísticas', exact: true }).click();
  const metric = (region: ReturnType<typeof page.getByRole>, name: string) => region.getByText(name, { exact: true }).locator('..').locator('dd');
  const general = page.getByRole('region', { name: 'Estatísticas gerais', exact: true });
  await expect(metric(general, 'Total')).toHaveText(String(cards.length));
  await expect(metric(general, 'Incorretos')).toHaveText('1');
  for (const { articleId, source } of sources(card)) {
    const topic = page.getByRole('region', { name: `Estatísticas: ${source.title}`, exact: true });
    await expect(metric(topic, 'Total')).toHaveText(String(cards.filter(item => inTopic(item, articleId)).length));
    await expect(metric(topic, 'Incorretos')).toHaveText('1');
  }
});

test('recarregar cria nova ordem mantendo o mesmo conjunto', async ({ page }) => {
  test.skip(cards.length < 8, 'Baralho pequeno.');
  await page.goto('/');
  async function sample() {
    const result: string[] = [];
    for (let index = 0; index < 8; index++) {
      result.push(plain(await page.getByRole('heading', { level: 2 }).innerText()));
      if (index < 7) await page.getByRole('button', { name: 'PRÓXIMO →' }).click();
    }
    return result;
  }
  const before = await sample();
  await page.reload();
  const after = await sample();
  expect(after).not.toEqual(before);
  const questions = new Set(cards.map(card => plain(card.question)));
  expect([...before, ...after].every(question => questions.has(question))).toBe(true);
  await expect(page.getByLabel('Posição na sequência')).toHaveText(`08 / ${String(cards.length).padStart(2, '0')}`);
});

test('A/D/Espaço navegam sem interferir em limites, botões ou digitação no modal', async ({ page }) => {
  test.skip(cards.length < 2, 'Baralho pequeno.');
  await page.goto('/');
  const first = plain(await page.getByRole('heading', { level: 2 }).innerText());
  await page.keyboard.press('d');
  await expect(page.getByLabel('Posição na sequência')).toHaveText(`02 / ${cards.length}`);
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'VIRAR' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('a');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(first);
  await page.keyboard.press('Space');
  await page.keyboard.press('a');
  await expect(page.getByRole('button', { name: 'VIRAR' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'VIRAR' }).focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'VIRAR' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Menu de estudo' }).click();
  await page.keyboard.press('d');
  await expect(page.locator('.counter')).toHaveText(`01 / ${cards.length}`);
  await page.getByRole('button', { name: 'Nova questão', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Nova questão pessoal' });
  await expect(modal).toBeVisible();
  await modal.getByLabel('Pergunta', { exact: true }).pressSequentially('a d a d ');
  await expect(modal.getByLabel('Pergunta', { exact: true })).toHaveValue('a d a d ');
  await expect(page.locator('.counter')).toHaveText(`01 / ${cards.length}`);
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Menu de estudo' })).toBeFocused();
});

test('modal cria questão pessoal com duas fontes, preserva citações e persiste após recarregar', async ({ page }) => {
  test.skip(topics.length < 2, 'Duas fontes necessárias.');
  const primary = cards[0]!;
  const secondary = cards.find(card => card.articleId !== primary.articleId)!;
  const question = `Questão pessoal de teste: ${plain(primary.question)}`;
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu de estudo' }).click();
  await page.getByRole('button', { name: 'Nova questão', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Nova questão pessoal' });
  await modal.getByRole('button', { name: 'Salvar no baralho pessoal' }).click();
  await expect(modal.getByRole('alert')).toBeVisible();
  await modal.getByLabel('ID da questão', { exact: true }).fill('personal-e2e');
  await modal.getByLabel('Pergunta', { exact: true }).fill(question);
  await modal.getByLabel('Resposta', { exact: true }).fill(`<script>texto de teste, não executar</script> ${primary.answer}`);
  await modal.getByLabel('Tipo da questão', { exact: true }).selectOption('synthesis');
  const fillSource = async (editor: ReturnType<typeof modal.getByRole>, source: FlashcardData['source']) => {
    await editor.getByLabel('Fonte conhecida', { exact: true }).selectOption({ label: source.title });
    await editor.getByLabel('Páginas (separadas por vírgula)', { exact: true }).fill(source.pages.join(', '));
    await editor.getByLabel('Seções (uma por linha)', { exact: true }).fill(source.sections.join('\n'));
    await editor.getByLabel('Citação 1', { exact: true }).fill(source.evidence[0]!);
  };
  await fillSource(modal.getByRole('group', { name: 'Fonte principal', exact: true }), primary.source);
  await modal.getByRole('button', { name: 'Adicionar fonte relacionada', exact: true }).click();
  await fillSource(modal.getByRole('group', { name: 'Fonte relacionada 1', exact: true }), secondary.source);
  for (const [label, reference] of [['Fonte principal', primary], ['Fonte relacionada 1', secondary]] as const) {
    const editor = modal.getByRole('group', { name: label, exact: true });
    await expect(editor.getByLabel('ID do artigo', { exact: true })).toHaveValue(reference.articleId);
    await expect(editor.getByLabel('Arquivo relativo a artigos/', { exact: true })).toHaveValue(reference.source.file);
    await expect(editor.getByLabel('Título da fonte', { exact: true })).toHaveValue(reference.source.title);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  mkdirSync('docs/qa', { recursive: true });
  await modal.evaluate(element => { element.scrollTop = 0; });
  await page.screenshot({ path: 'docs/qa/personal-question-modal-1440.png' });
  await page.setViewportSize({ width: 320, height: 900 });
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations).toEqual([]);
  expect(await modal.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  mkdirSync('docs/qa', { recursive: true });
  await modal.evaluate(element => { element.scrollTop = 0; });
  await page.screenshot({ path: 'docs/qa/personal-question-modal-320.png' });
  await modal.getByRole('button', { name: 'Salvar no baralho pessoal' }).click();
  await expect(modal).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(question);
  await expect(page.getByText('QUESTÃO PESSOAL · criada por você (não aprovada)', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Posição na sequência')).toHaveText(`${cards.length + 1} / ${cards.length + 1}`);
  await page.getByRole('button', { name: 'VIRAR' }).click();
  await expect(page.locator('.flashcard script')).toHaveCount(0);
  expect(await page.locator('blockquote').allTextContents()).toEqual([primary.source.evidence[0], secondary.source.evidence[0]]);
  await page.getByRole('button', { name: 'Acertei', exact: true }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('arguicao.personal-cards.v1')!));
  expect(saved.cards).toHaveLength(1);
  expect(saved.cards[0].id).toBe('personal-e2e');
  await page.reload();
  await page.getByRole('button', { name: primary.source.title, exact: true }).click();
  const expected = cards.filter(card => inTopic(card, primary.articleId)).length + 1;
  for (let step = 0; step < expected; step++) {
    if (plain(await page.getByRole('heading', { level: 2 }).innerText()) === question) break;
    await page.getByRole('button', { name: 'PRÓXIMO →' }).click();
  }
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(question);
  await expect(page.locator('.assessment-status')).toHaveCount(0);
  await page.getByRole('button', { name: 'VIRAR' }).click();
  await expect(page.getByRole('button', { name: 'Acertei', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: secondary.source.title, exact: true }).click();
  await expect(page.getByLabel('Posição na sequência')).toHaveText(`01 / ${String(cards.filter(card => inTopic(card, secondary.articleId)).length + 1).padStart(2, '0')}`);
});
