import { useRef, useState } from 'react';
import { belongsToArticle, getStatistics } from '../progress';
import type { Progress, Statistics } from '../progress';
import type { FlashcardData } from '../types';
import type { ArticleTopic } from './TopicFilter';

function StatisticsValues({ value }: { value: Statistics }) {
  return (
    <dl className="statistics-values">
      <div><dt>Total</dt><dd>{value.total}</dd></div>
      <div><dt>Corretos</dt><dd>{value.correct}</dd></div>
      <div><dt>Incorretos</dt><dd>{value.incorrect}</dd></div>
      <div><dt>Incompletos</dt><dd>{value.incomplete}</dd></div>
      <div><dt>Não avaliados</dt><dd>{value.unassessed}</dd></div>
    </dl>
  );
}

export function StudyMenu({ cards, topics, progress, open, onOpenChange, onNewQuestion }: {
  cards: FlashcardData[]; topics: ArticleTopic[]; progress: Progress;
  open: boolean; onOpenChange: (value: boolean) => void;
  onNewQuestion: (returnFocus: HTMLButtonElement | null) => void;
}) {
  const [statisticsOpen, setStatisticsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="study-menu" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
        toggleRef.current?.focus();
      }
    }}>
      <button ref={toggleRef} type="button" className="menu-toggle" aria-label="Menu de estudo" aria-expanded={open} aria-controls="study-menu-content" onClick={() => onOpenChange(!open)}>
        <span aria-hidden="true">☰</span> MENU
      </button>
      {open && (
        <div id="study-menu-content" className="menu-content">
          <button type="button" className="statistics-toggle" aria-expanded={statisticsOpen} aria-controls="study-statistics" onClick={() => setStatisticsOpen((current) => !current)}>Estatísticas</button>
          <button type="button" className="new-question-toggle" onClick={() => onNewQuestion(toggleRef.current)}>Nova questão</button>
          {statisticsOpen && (
            <section id="study-statistics" className="statistics" aria-label="Estatísticas de estudo">
              <section aria-label="Estatísticas gerais">
                <h2>Geral</h2>
                <StatisticsValues value={getStatistics(cards, progress)} />
              </section>
              <p className="statistics-note">Cada questão conta uma vez no total geral. Questões relacionadas a vários artigos aparecem em cada tema; os totais por artigo se sobrepõem.</p>
              {topics.map((topic) => (
                <section key={topic.id} aria-label={`Estatísticas: ${topic.title}`}>
                  <h3>{topic.title}</h3>
                  <StatisticsValues value={getStatistics(cards.filter((card) => belongsToArticle(card, topic.id)), progress)} />
                </section>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
