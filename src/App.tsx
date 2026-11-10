import { useState } from 'react';
import importedCards from './data/cards.json';
import { useEffect, useRef } from 'react';
import { Flashcard } from './components/Flashcard';
import { TopicFilter } from './components/TopicFilter';
import { StudyMenu } from './components/StudyMenu';
import { AssessmentControls } from './components/AssessmentControls';
import { PersonalCardDialog } from './components/PersonalCardDialog';
import { readPersonalCards, writePersonalCards } from './personal-cards';
import { belongsToArticle, cardSources, readProgress, writeProgress } from './progress';
import type { Assessment } from './progress';
import { shuffle } from './shuffle';
import type { FlashcardData } from './types';

export type { FlashcardData } from './types';
export { shuffle } from './shuffle';

const publishedCards = importedCards as FlashcardData[];
export interface AppProps { cards?: FlashcardData[] }

export function App({ cards = publishedCards }: AppProps) {
  const reservedPublishedIds = Array.from(new Set([...publishedCards, ...cards].map((item) => item.id)));
  const canonicalSources = Array.from(new Map([...cards, ...publishedCards].flatMap((item) => cardSources(item)).map((reference) => [reference.articleId, reference])).values());
  const [personalCards, setPersonalCards] = useState(() => readPersonalCards(reservedPublishedIds, canonicalSources));
  const [selected, setSelected] = useState('all');
  const [allSequence, setAllSequence] = useState(() => shuffle(Array.from(new Map([...cards, ...personalCards].map((card) => [card.id, card])).values())));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(readProgress);
  const [storageFailed, setStorageFailed] = useState(false);
  const [personalStorageFailed, setPersonalStorageFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pageRef = useRef<HTMLElement>(null);
  const sequence = selected === 'all' ? allSequence : allSequence.filter((item) => belongsToArticle(item, selected));
  const topics = Array.from(new Map(allSequence.flatMap((card) => cardSources(card).map(({ articleId, source }) => [articleId, { id: articleId, title: source.title }] as const))).values());
  const knownSources = Array.from(new Map([...allSequence.flatMap(cardSources), ...canonicalSources].map((reference) => [reference.articleId, reference])).values());
  const personalIds = new Set(personalCards.map((item) => item.id));
  const card = sequence[index];
  const count = (value: number) => String(value).padStart(2, '0');

  function selectTopic(articleId: string) {
    setSelected(articleId);
    setIndex(0);
    setFlipped(false);
  }

  function navigate(direction: -1 | 1) {
    if (!card) return;
    const nextIndex = Math.min(Math.max(index + direction, 0), sequence.length - 1);
    if (nextIndex === index) return;
    setIndex(nextIndex);
    setFlipped(false);
  }

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing || menuOpen || modalOpen || document.querySelector('[role="dialog"][aria-modal="true"], dialog[open]')) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]')) return;
      if (target && target !== document.body && target !== document.documentElement && !pageRef.current?.contains(target)) return;
      if (event.key === ' ') {
        // Buttons retain their native Space activation; never flip twice.
        if (!card || target?.closest('button, [role="button"]')) return;
        event.preventDefault();
        setFlipped((current) => !current);
      } else if (event.key.toLowerCase() === 'a') navigate(-1);
      else if (event.key.toLowerCase() === 'd') navigate(1);
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  });

  function assess(value: Assessment) {
    if (!card) return;
    const nextProgress = { ...progress, [card.id]: value };
    setProgress(nextProgress);
    setStorageFailed(!writeProgress(nextProgress));
  }

  function savePersonalCard(newCard: FlashcardData) {
    const nextPersonal = [...personalCards, newCard];
    setPersonalCards(nextPersonal);
    setAllSequence((current) => [...current, newCard]);
    setPersonalStorageFailed(!writePersonalCards(nextPersonal));
    setSelected('all');
    setIndex(allSequence.length);
    setFlipped(false);
    setModalOpen(false);
  }

  return (
    <>
    <main className="page" ref={pageRef} inert={modalOpen || undefined}>
      <header className="page-header">
        <div className="title-row">
          <h1>ARGUIÇÃO.</h1>
          <StudyMenu cards={allSequence} topics={topics} progress={progress} open={menuOpen} onOpenChange={setMenuOpen} onNewQuestion={(returnFocus) => {
            returnFocusRef.current = returnFocus;
            setMenuOpen(false);
            setModalOpen(true);
          }} />
        </div>
        <TopicFilter topics={topics} selected={selected} onSelect={selectTopic} />
      </header>
      {personalStorageFailed && <p className="personal-storage-message" role="status">Questão adicionada ao baralho apenas nesta sessão. O navegador não permitiu salvar; copie seu conteúdo antes de sair.</p>}
      <section className="study" aria-label="Flashcards" aria-describedby="keyboard-shortcuts">
        <div className="card-content" aria-live="polite" aria-atomic="true">
          {card ? <Flashcard card={card} flipped={flipped} personal={personalIds.has(card.id)} /> : (
            <article className="flashcard empty-state">
              <span className="eyebrow">NENHUM CARTÃO APROVADO</span>
              <h2>Os artigos são o ponto de partida.</h2>
              <p>Adicione documentos à pasta artigos e conclua a extração e a revisão acadêmica para começar.</p>
            </article>
          )}
        </div>
        {card && flipped && (
          <>
            <AssessmentControls value={Object.hasOwn(progress, card.id) ? progress[card.id] : undefined} onAssess={assess} />
            {storageFailed && <p className="storage-message" role="status">Avaliação mantida nesta sessão. O navegador não permitiu salvar para o próximo acesso.</p>}
          </>
        )}
        <div className="controls" aria-label="Controles do cartão">
          <button type="button" disabled={!card || index === 0} aria-keyshortcuts="A" onClick={() => navigate(-1)}>← ANTERIOR</button>
          <button type="button" className="flip-control" disabled={!card} aria-keyshortcuts="Space" aria-pressed={flipped} onClick={() => setFlipped((current) => !current)}>VIRAR</button>
          <button type="button" disabled={!card || index === sequence.length - 1} aria-keyshortcuts="D" onClick={() => navigate(1)}>PRÓXIMO →</button>
        </div>
        <p className="counter" aria-label="Posição na sequência">{count(card ? index + 1 : 0)} / {count(sequence.length)}</p>
        <p id="keyboard-shortcuts" className="keyboard-shortcuts">Atalhos: A anterior · Espaço virar · D próximo.</p>
      </section>
    </main>
    {modalOpen && <PersonalCardDialog reservedIds={[...reservedPublishedIds, ...allSequence.map((item) => item.id)]} knownSources={knownSources} onClose={() => setModalOpen(false)} onSave={savePersonalCard} returnFocus={returnFocusRef.current} />}
    </>
  );
}

export default App;
