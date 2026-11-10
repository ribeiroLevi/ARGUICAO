import type { FlashcardData } from '../types';
import { HighlightedText } from './HighlightedText';
import { cardSources } from '../progress';

export interface FlashcardProps { card: FlashcardData; flipped: boolean; personal?: boolean }

export function Flashcard({ card, flipped, personal = false }: FlashcardProps) {
  const sources = cardSources(card);

  return (
    <article className="flashcard" aria-label={flipped ? 'Resposta do cartão' : 'Pergunta do cartão'}>
      <span className="eyebrow">{flipped ? 'RESPOSTA' : 'PERGUNTA'}</span>
      {personal && <p className="personal-card-label">QUESTÃO PESSOAL · criada por você (não aprovada)</p>}
      {flipped
        ? <p className="card-answer"><HighlightedText text={card.answer} /></p>
        : <h2 className="card-question"><HighlightedText text={card.question} /></h2>}
      <footer className="card-source">
        {flipped ? (
          <>
            <h2 className="source-heading">Trechos das fontes</h2>
            {sources.map(({ articleId, source }) => (
              <section className="source-reference" key={articleId} aria-label={`Fonte: ${source.title}`}>
                <h3>{source.title}</h3>
                <p className="source-file">{source.file}</p>
                <p className="source-location">{[
                  source.pages.length ? `${source.pages.length === 1 ? 'Página' : 'Páginas'} ${source.pages.join(', ')}` : '',
                  ...source.sections,
                ].filter(Boolean).join(' · ')}</p>
                {source.evidence.map((evidence, index) => <blockquote key={index}>{evidence}</blockquote>)}
              </section>
            ))}
          </>
        ) : sources.map(({ articleId, source }) => <p key={articleId}>{source.title}</p>)}
      </footer>
    </article>
  );
}
