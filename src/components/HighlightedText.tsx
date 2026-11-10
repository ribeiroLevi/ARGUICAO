import { Fragment } from 'react';

export interface HighlightedTextProps { text: string }

/** Only balanced [[text]] markers become marks; article text remains escaped. */
export function HighlightedText({ text }: HighlightedTextProps) {
  return <>{text.split(/(\[\[[\s\S]+?\]\])/g).map((part, index) =>
    part.startsWith('[[') && part.endsWith(']]')
      ? <mark key={index}>{part.slice(2, -2)}</mark>
      : <Fragment key={index}>{part}</Fragment>,
  )}</>;
}
