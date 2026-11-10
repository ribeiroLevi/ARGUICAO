import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App';
import { HighlightedText } from '../src/components/HighlightedText';
import type { FlashcardData } from '../src/types';
import { PROGRESS_KEY } from '../src/progress';
import { PERSONAL_CARDS_KEY } from '../src/personal-cards';

// Deliberately synthetic interface fixtures, never imported by production code.
const cards: FlashcardData[] = [
  { id: 'test-a1', articleId: 'test-a', question: 'Pergunta de teste A1?', answer: 'Resposta [[marcada]] A1.', source: { file: 'test-a.pdf', title: 'Artigo de teste A', pages: [2], sections: ['Seção de teste'], evidence: ['Evidência de teste'] } },
  { id: 'test-a2', articleId: 'test-a', question: 'Pergunta de teste A2?', answer: 'Resposta A2.', source: { file: 'test-a.pdf', title: 'Artigo de teste A', pages: [3], sections: [], evidence: ['Evidência de teste'] } },
  { id: 'test-b1', articleId: 'test-b', question: 'Pergunta de teste B1?', answer: 'Resposta B1.', source: { file: 'test-b.pdf', title: 'Artigo de teste B', pages: [4], sections: [], evidence: ['Evidência de teste'] } },
];

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('interface de estudo', () => {
  it('mostra estado vazio, TODOS e os três controles desabilitados', () => {
    render(<App cards={[]} />);
    expect(screen.getByRole('heading', { name: 'ARGUIÇÃO.' })).toBeInTheDocument();
    expect(screen.getByText('NENHUM CARTÃO APROVADO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'TODOS' })).toHaveAttribute('aria-pressed', 'true');
    const controls = screen.getByLabelText('Controles do cartão');
    expect(within(controls).getAllByRole('button')).toHaveLength(3);
    for (const control of within(controls).getAllByRole('button')) expect(control).toBeDisabled();
    expect(screen.getByLabelText('Posição na sequência')).toHaveTextContent('00 / 00');
  });

  it('vira por teclado, mostra evidência localizada e reseta frente na navegação e filtro', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const user = userEvent.setup();
    const { container } = render(<App cards={cards} />);
    expect(screen.getByRole('button', { name: '← ANTERIOR' })).toBeDisabled();
    const flip = screen.getByRole('button', { name: 'VIRAR' });
    flip.focus();
    await user.keyboard('{Enter}');
    expect(flip).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('mark')).toHaveTextContent('marcada');
    expect(screen.getByText('Página 2 · Seção de teste')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'PRÓXIMO →' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pergunta de teste A2?');
    expect(flip).toHaveAttribute('aria-pressed', 'false');
    await user.click(flip);
    await user.click(screen.getByRole('button', { name: 'Artigo de teste B' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pergunta de teste B1?');
    expect(flip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: '← ANTERIOR' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'PRÓXIMO →' })).toBeDisabled();
  });

  it('cria filtros automáticos e mantém TODOS sem repetição e sem novo sorteio ao retornar', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    render(<App cards={cards} />);
    expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(3);
    const callsAfterMount = random.mock.calls.length;
    const questions: string[] = [];
    for (let index = 0; index < cards.length; index += 1) {
      questions.push(screen.getByRole('heading', { level: 2 }).textContent!);
      if (index < cards.length - 1) await user.click(screen.getByRole('button', { name: 'PRÓXIMO →' }));
    }
    expect(new Set(questions).size).toBe(cards.length);
    expect(screen.getByRole('button', { name: 'PRÓXIMO →' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Artigo de teste A' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(questions.find((question) => question.includes('A'))!);
    await user.click(screen.getByRole('button', { name: 'TODOS' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(questions[0]!);
    await user.click(screen.getByRole('button', { name: 'PRÓXIMO →' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(questions[1]!);
    await user.click(screen.getByRole('button', { name: '← ANTERIOR' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(questions[0]!);
    expect(random.mock.calls.length).toBe(callsAfterMount);
  });
});

const sharedCard: FlashcardData = {
  ...cards[0]!, id: 'test-shared', question: 'Pergunta compartilhada de teste?', kind: 'synthesis',
  source: { ...cards[0]!.source, evidence: ['Trecho integral A.\nQualificação preservada. <script>não executar</script>'] },
  relatedSources: [
    { articleId: 'test-b', source: { ...cards[2]!.source, evidence: ['Trecho integral B sem cortes.'] } },
    { articleId: 'test-c', source: { file: 'test-c.pdf', title: 'Artigo de teste C', pages: [7, 8], sections: ['Detalhes C'], evidence: ['Primeiro trecho C.', 'Segundo trecho C.'] } },
  ],
};
const sharedCards = [cards[0]!, sharedCard, cards[2]!];

function metric(section: HTMLElement, label: string): string | null {
  return within(section).getByText(label, { exact: true }).parentElement!.querySelector('dd')!.textContent;
}

async function openStatistics(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Menu de estudo' }));
  await user.click(screen.getByRole('button', { name: 'Estatísticas' }));
}

describe('questões com várias fontes', () => {
  it('inclui o cartão em todos os temas, preserva a ordem global e exibe citações integrais somente no verso', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const user = userEvent.setup();
    const { container } = render(<App cards={sharedCards} />);
    expect(screen.queryByText('Trecho integral B sem cortes.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Artigo de teste C' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(sharedCard.question);
    expect(screen.getByLabelText('Posição na sequência')).toHaveTextContent('01 / 01');
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    const quotes = Array.from(container.querySelectorAll('blockquote'), (element) => element.textContent);
    expect(quotes).toEqual([...sharedCard.source.evidence, ...sharedCard.relatedSources!.flatMap(({ source }) => source.evidence)]);
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('test-c.pdf')).toBeInTheDocument();
    expect(screen.getByText('Páginas 7, 8 · Detalhes C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Artigo de teste B' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(sharedCard.question);
    expect(screen.getByLabelText('Posição na sequência')).toHaveTextContent('01 / 02');
    expect(screen.queryByRole('button', { name: 'Acertei' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'TODOS' }));
    expect(screen.getByLabelText('Posição na sequência')).toHaveTextContent('01 / 03');
  });

  it('gera nova ordem ao recarregar e deriva filtros da mesma ordem durante a sessão', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    const firstRender = render(<App cards={cards} />);
    const firstQuestion = screen.getByRole('heading', { level: 2 }).textContent;
    await user.click(screen.getByRole('button', { name: 'Artigo de teste A' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(cards[1]!.question);
    await user.click(screen.getByRole('button', { name: 'TODOS' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(firstQuestion!);
    firstRender.unmount();
    random.mockReturnValue(0.999);
    render(<App cards={cards} />);
    expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(firstQuestion);
  });
});

describe('autoavaliação e estatísticas', () => {
  it('substitui avaliações por ID sem inflar totais e conta fontes relacionadas em cada tema', async () => {
    const user = userEvent.setup();
    render(<App cards={sharedCards} />);
    await user.click(screen.getByRole('button', { name: 'Artigo de teste C' }));
    expect(screen.queryByRole('button', { name: 'Acertei' })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Avaliação:/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    await user.click(screen.getByRole('button', { name: 'Acertei' }));
    await user.click(screen.getByRole('button', { name: 'Acertei' }));
    await openStatistics(user);
    const general = screen.getByRole('region', { name: 'Estatísticas gerais' });
    expect(metric(general, 'Total')).toBe('3');
    expect(metric(general, 'Corretos')).toBe('1');
    expect(metric(general, 'Não avaliados')).toBe('2');
    for (const title of ['Artigo de teste A', 'Artigo de teste B']) {
      const topic = screen.getByRole('region', { name: `Estatísticas: ${title}` });
      expect(metric(topic, 'Total')).toBe('2');
      expect(metric(topic, 'Corretos')).toBe('1');
    }
    expect(metric(screen.getByRole('region', { name: 'Estatísticas: Artigo de teste C' }), 'Total')).toBe('1');
    expect(screen.getByText(/totais por artigo se sobrepõem/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Errei' }));
    expect(metric(general, 'Corretos')).toBe('0');
    expect(metric(general, 'Incorretos')).toBe('1');
    await user.click(screen.getByRole('button', { name: 'Incompleto' }));
    expect(metric(general, 'Incorretos')).toBe('0');
    expect(metric(general, 'Incompletos')).toBe('1');
    expect(screen.getByRole('button', { name: 'Incompleto' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Avaliação: Incompleto.')).toBeInTheDocument();
    expect(screen.getByText('Avaliação: Incompleto.')).toHaveClass('assessment-incomplete');
    const saved = JSON.parse(window.localStorage.getItem(PROGRESS_KEY)!);
    expect(saved).toEqual({ version: 1, evaluations: { 'test-shared': 'incomplete' } });
  });

  it('persiste ao remontar e revela status anterior apenas no verso', async () => {
    const user = userEvent.setup();
    const firstRender = render(<App cards={[cards[0]!]} />);
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    await user.click(screen.getByRole('button', { name: 'Acertei' }));
    firstRender.unmount();
    render(<App cards={[cards[0]!]} />);
    expect(screen.queryByText(/^Avaliação:/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acertei' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    expect(screen.getByText('Avaliação: Acertei.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acertei' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    expect(screen.queryByText(/^Avaliação:/)).not.toBeInTheDocument();
  });

  it('continua estudando com JSON inválido e mantém avaliação em sessão quando armazenamento falha', async () => {
    window.localStorage.setItem(PROGRESS_KEY, '{json inválido');
    const user = userEvent.setup();
    render(<App cards={[cards[0]!]} />);
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    expect(screen.getByText('Ainda não avaliado.')).toBeInTheDocument();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage bloqueado'); });
    await user.click(screen.getByRole('button', { name: 'Errei' }));
    expect(screen.getByText('Avaliação: Errei.')).toBeInTheDocument();
    expect(screen.getByText(/Avaliação mantida nesta sessão/)).toBeInTheDocument();
    await openStatistics(user);
    expect(metric(screen.getByRole('region', { name: 'Estatísticas gerais' }), 'Incorretos')).toBe('1');
  });

  it('abre menu e submenu por teclado, fecha com Escape e devolve foco ao botão', async () => {
    const user = userEvent.setup();
    render(<App cards={cards} />);
    const toggle = screen.getByRole('button', { name: 'Menu de estudo' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Estatísticas' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('region', { name: 'Estatísticas de estudo' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: 'Estatísticas de estudo' })).not.toBeInTheDocument();
  });
});

describe('texto seguro', () => {
  it('marca apenas colchetes balanceados e mantém HTML como texto', () => {
    const { container } = render(<HighlightedText text={'<script>alert(1)</script> [[destaque]] [[incompleto'} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('mark')).toHaveTextContent('destaque');
    expect(container).toHaveTextContent('<script>alert(1)</script> destaque [[incompleto');
  });
});

describe('atalhos de estudo', () => {
  it('navega com A/D, vira com Espaço e preserva o verso quando navegação é impossível', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    render(<App cards={cards.slice(0, 2)} />);
    const flip = screen.getByRole('button', { name: 'VIRAR' });
    expect(flip).toHaveAttribute('aria-keyshortcuts', 'Space');
    expect(screen.getByText(/Atalhos: A anterior/)).toBeInTheDocument();
    expect(fireEvent.keyDown(document.body, { key: ' ', cancelable: true })).toBe(false);
    expect(flip).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(document.body, { key: 'a' });
    expect(flip).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(document.body, { key: 'd' });
    expect(flip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(cards[1]!.question);
    fireEvent.keyDown(document.body, { key: ' ' });
    fireEvent.keyDown(document.body, { key: 'd' });
    expect(flip).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(document.body, { key: 'a' });
    expect(flip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(cards[0]!.question);
  });

  it('preserva Espaço nativo em botões sem disparar uma segunda virada', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const user = userEvent.setup();
    render(<App cards={cards.slice(0, 2)} />);
    const flip = screen.getByRole('button', { name: 'VIRAR' });
    flip.focus();
    await user.keyboard(' ');
    expect(flip).toHaveAttribute('aria-pressed', 'true');
    const next = screen.getByRole('button', { name: 'PRÓXIMO →' });
    next.focus();
    await user.keyboard(' ');
    expect(flip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(cards[1]!.question);
  });

  it('ignora modificadores, campos editáveis e menu aberto sem bloquear a digitação', async () => {
    const user = userEvent.setup();
    const { container } = render(<App cards={cards} />);
    const question = screen.getByRole('heading', { level: 2 }).textContent;
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
      fireEvent.keyDown(document.body, { key: 'd', [modifier]: true });
      expect(fireEvent.keyDown(document.body, { key: ' ', [modifier]: true, cancelable: true })).toBe(true);
    }
    const main = container.querySelector('main')!;
    for (const element of [document.createElement('input'), document.createElement('textarea'), document.createElement('select'), Object.assign(document.createElement('div'), { contentEditable: 'true' })]) {
      if (element.tagName === 'DIV') element.setAttribute('contenteditable', 'true');
      main.appendChild(element);
      fireEvent.keyDown(element, { key: 'd' });
      expect(fireEvent.keyDown(element, { key: ' ', cancelable: true })).toBe(true);
      element.remove();
    }
    await user.click(screen.getByRole('button', { name: 'Menu de estudo' }));
    fireEvent.keyDown(document.body, { key: 'd' });
    expect(fireEvent.keyDown(document.body, { key: ' ', cancelable: true })).toBe(true);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(question!);
    expect(screen.getByRole('button', { name: 'VIRAR' })).toHaveAttribute('aria-pressed', 'false');
  });
});

async function openPersonalDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Menu de estudo' }));
  await user.click(screen.getByRole('button', { name: 'Nova questão' }));
  return screen.getByRole('dialog', { name: 'Nova questão pessoal' });
}

function fillField(scope: HTMLElement, label: string, value: string) {
  fireEvent.change(within(scope).getByLabelText(label), { target: { value } });
}

function fillPersonalDialog(dialog: HTMLElement) {
  fillField(dialog, 'ID da questão', 'personal-ui-test');
  fillField(dialog, 'Pergunta', 'Pergunta escrita por mim para teste?');
  fillField(dialog, 'Resposta', 'Resposta pessoal [[destacada]].');
  const source = within(dialog).getByRole('group', { name: 'Fonte principal' });
  fillField(source, 'ID do artigo', 'personal-article-test');
  fillField(source, 'Arquivo relativo a artigos/', 'pasta/pessoal-test.pdf');
  fillField(source, 'Título da fonte', 'Fonte pessoal de teste');
  fillField(source, 'Páginas (separadas por vírgula)', '2, 4');
  fillField(source, 'Seções (uma por linha)', 'Seção pessoal\nOutra seção');
  fillField(source, 'Citação 1', 'Trecho pessoal completo.\nQualificação preservada.');
}

describe('criação manual de questões pessoais', () => {
  it('salva imediatamente, adiciona ao fim sem reembaralhar e persiste tema, rótulo e estatísticas', async () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.999);
    const user = userEvent.setup();
    const initialRender = render(<App cards={cards.slice(0, 2)} />);
    const randomCalls = random.mock.calls.length;
    const dialog = await openPersonalDialog(user);
    expect(within(dialog).getByLabelText('ID da questão')).toHaveFocus();
    fillPersonalDialog(dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Salvar no baralho pessoal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pergunta escrita por mim para teste?');
    expect(screen.getByText('QUESTÃO PESSOAL · criada por você (não aprovada)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'VIRAR' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('Posição na sequência')).toHaveTextContent('03 / 03');
    expect(random.mock.calls.length).toBe(randomCalls);
    expect(screen.getByRole('button', { name: 'Menu de estudo' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: '← ANTERIOR' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(cards[1]!.question);
    await user.click(screen.getByRole('button', { name: '← ANTERIOR' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(cards[0]!.question);
    await user.click(screen.getByRole('button', { name: 'Fonte pessoal de teste' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pergunta escrita por mim para teste?');
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    expect(screen.getByText('QUESTÃO PESSOAL · criada por você (não aprovada)')).toBeInTheDocument();
    expect(screen.getByRole('blockquote').textContent).toBe('Trecho pessoal completo.\nQualificação preservada.');
    await user.click(screen.getByRole('button', { name: 'Acertei' }));
    await openStatistics(user);
    expect(metric(screen.getByRole('region', { name: 'Estatísticas gerais' }), 'Total')).toBe('3');
    expect(metric(screen.getByRole('region', { name: 'Estatísticas: Fonte pessoal de teste' }), 'Corretos')).toBe('1');
    const saved = JSON.parse(window.localStorage.getItem(PERSONAL_CARDS_KEY)!);
    expect(saved.version).toBe(1);
    expect(saved.cards).toHaveLength(1);
    expect(saved.cards[0].source.sections).toEqual(['Seção pessoal', 'Outra seção']);
    initialRender.unmount();
    render(<App cards={cards.slice(0, 2)} />);
    await user.click(screen.getByRole('button', { name: 'Fonte pessoal de teste' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pergunta escrita por mim para teste?');
    expect(screen.queryByText(/^Avaliação:/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    expect(screen.getByText('Avaliação: Acertei.')).toBeInTheDocument();
  });

  it('mantém campos em erros, bloqueia ID existente e permite citações múltiplas e fontes relacionadas completas', async () => {
    const user = userEvent.setup();
    render(<App cards={cards} />);
    const dialog = await openPersonalDialog(user);
    fillPersonalDialog(dialog);
    fillField(dialog, 'ID da questão', cards[0]!.id);
    await user.selectOptions(within(dialog).getByLabelText('Tipo da questão'), 'synthesis');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar no baralho pessoal' }));
    expect(within(dialog).getByRole('alert')).toHaveFocus();
    expect(within(dialog).getByRole('alert')).toHaveTextContent('ID da questão já existe');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Uma síntese exige');
    expect(within(dialog).getByLabelText('Pergunta')).toHaveValue('Pergunta escrita por mim para teste?');
    fillField(dialog, 'ID da questão', 'personal-ui-test');
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar fonte relacionada' }));
    const related = within(dialog).getByRole('group', { name: 'Fonte relacionada 1' });
    const known = within(related).getByLabelText('Fonte conhecida');
    await user.selectOptions(known, within(known).getByRole('option', { name: 'Artigo de teste B' }));
    expect(within(related).getByLabelText('ID do artigo')).toHaveValue('test-b');
    expect(within(related).getByLabelText('Arquivo relativo a artigos/')).toHaveValue('test-b.pdf');
    expect(within(related).getByLabelText('Título da fonte')).toHaveValue('Artigo de teste B');
    fillField(related, 'Páginas (separadas por vírgula)', '4');
    fillField(related, 'Citação 1', 'Citação relacionada completa.');
    await user.click(within(related).getByRole('button', { name: 'Adicionar citação' }));
    fillField(related, 'Citação 2', 'Segunda citação relacionada.');
    await user.click(within(dialog).getByRole('button', { name: 'Salvar no baralho pessoal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Artigo de teste B' }));
    expect(screen.getByLabelText('Posição na sequência')).toHaveTextContent('01 / 02');
    const saved = JSON.parse(window.localStorage.getItem(PERSONAL_CARDS_KEY)!);
    expect(saved.cards[0].kind).toBe('synthesis');
    expect(saved.cards[0].relatedSources[0].source.evidence).toEqual(['Citação relacionada completa.', 'Segunda citação relacionada.']);
  });

  it('trava foco no modal, ignora atalhos durante digitação e devolve foco com Escape', async () => {
    const user = userEvent.setup();
    render(<App cards={cards} />);
    const dialog = await openPersonalDialog(user);
    const id = within(dialog).getByLabelText('ID da questão');
    const initialId = (id as HTMLInputElement).value;
    await user.type(id, ' a d ');
    expect(id).toHaveValue(`${initialId} a d `);
    const question = within(dialog).getByLabelText('Pergunta');
    await user.type(question, 'a d espaço');
    expect(question).toHaveValue('a d espaço');
    fireEvent.keyDown(document.body, { key: 'd' });
    const last = within(dialog).getByRole('button', { name: 'Salvar no baralho pessoal' });
    const first = within(dialog).getByRole('button', { name: 'Fechar nova questão' });
    last.focus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menu de estudo' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'VIRAR' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('mantém cartão criado em memória e avisa quando navegador bloqueia gravação', async () => {
    const user = userEvent.setup();
    render(<App cards={cards} />);
    const dialog = await openPersonalDialog(user);
    fillPersonalDialog(dialog);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado'); });
    await user.click(within(dialog).getByRole('button', { name: 'Salvar no baralho pessoal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pergunta escrita por mim para teste?');
    expect(screen.getByText(/Questão adicionada ao baralho apenas nesta sessão/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'VIRAR' }));
    expect(screen.getByRole('article', { name: 'Resposta do cartão' })).toHaveTextContent('Resposta pessoal destacada.');
  });

  it('ignora localStorage pessoal inválido sem afetar os cartões publicados', () => {
    window.localStorage.setItem(PERSONAL_CARDS_KEY, '{json quebrado');
    render(<App cards={cards} />);
    expect(screen.getByLabelText('Posição na sequência')).toHaveTextContent('01 / 03');
    expect(screen.queryByText(/QUESTÃO PESSOAL/)).not.toBeInTheDocument();
  });
});
