import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createPersonalId, emptySourceDraft, sourceFromDraft, validatePersonalCard } from '../personal-cards';
import type { SourceDraft } from '../personal-cards';
import type { FlashcardData, RelatedSource } from '../types';

function SourceEditor({ draft, onChange, knownSources, label, prefix }: {
  draft: SourceDraft;
  onChange: (value: SourceDraft) => void;
  knownSources: RelatedSource[];
  label: string;
  prefix: string;
}) {
  const selectedSource = knownSources.findIndex((item) => item.articleId === draft.articleId && item.source.file === draft.file && item.source.title === draft.title);
  const update = (key: keyof SourceDraft, value: string) => onChange({ ...draft, [key]: value });
  return (
    <fieldset className="source-editor">
      <legend>{label}</legend>
      <label htmlFor={`${prefix}-known`}>Fonte conhecida</label>
      <select id={`${prefix}-known`} value={selectedSource < 0 ? '' : selectedSource} onChange={(event) => {
        const known = event.target.value === '' ? undefined : knownSources[Number(event.target.value)];
        onChange(known ? { ...emptySourceDraft(), articleId: known.articleId, file: known.source.file, title: known.source.title } : emptySourceDraft());
      }}>
        <option value="">Nova fonte pessoal — preencher manualmente</option>
        {knownSources.map((item, index) => <option key={item.articleId} value={index}>{item.source.title}</option>)}
      </select>
      <label htmlFor={`${prefix}-article`}>ID do artigo</label>
      <input id={`${prefix}-article`} value={draft.articleId} onChange={(event) => update('articleId', event.target.value)} />
      <label htmlFor={`${prefix}-file`}>Arquivo relativo a artigos/</label>
      <input id={`${prefix}-file`} value={draft.file} onChange={(event) => update('file', event.target.value)} />
      <label htmlFor={`${prefix}-title`}>Título da fonte</label>
      <input id={`${prefix}-title`} value={draft.title} onChange={(event) => update('title', event.target.value)} />
      <label htmlFor={`${prefix}-pages`}>Páginas (separadas por vírgula)</label>
      <input id={`${prefix}-pages`} value={draft.pages} placeholder="1, 3" aria-describedby={`${prefix}-pages-help`} onChange={(event) => update('pages', event.target.value)} />
      <p id={`${prefix}-pages-help`} className="form-help">Números inteiros a partir de 1. Obrigatório para PDF; sem intervalos.</p>
      <label htmlFor={`${prefix}-sections`}>Seções (uma por linha)</label>
      <textarea id={`${prefix}-sections`} value={draft.sections} rows={2} onChange={(event) => update('sections', event.target.value)} />
      <p className="form-help">Seções são opcionais. Cole cada trecho completo em seu próprio campo de citação, preservando suas quebras de linha.</p>
      {draft.evidence.map((quote, index) => (
        <div className="quote-editor" key={index}>
          <label htmlFor={`${prefix}-quote-${index}`}>Citação {index + 1}</label>
          <textarea id={`${prefix}-quote-${index}`} rows={4} value={quote} onChange={(event) => onChange({ ...draft, evidence: draft.evidence.map((old, position) => position === index ? event.target.value : old) })} />
          <button type="button" onClick={() => onChange({ ...draft, evidence: draft.evidence.filter((_, position) => position !== index) })}>Remover citação {index + 1}</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ ...draft, evidence: [...draft.evidence, ''] })}>Adicionar citação</button>
    </fieldset>
  );
}

export function PersonalCardDialog({ reservedIds, knownSources, onClose, onSave, returnFocus }: {
  reservedIds: string[];
  knownSources: RelatedSource[];
  onClose: () => void;
  onSave: (card: FlashcardData) => void;
  returnFocus: HTMLElement | null;
}) {
  const [id, setId] = useState(() => createPersonalId(reservedIds));
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [kind, setKind] = useState<'direct' | 'synthesis'>('direct');
  const [primary, setPrimary] = useState(emptySourceDraft);
  const [related, setRelated] = useState<SourceDraft[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    idRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [returnFocus]);

  useEffect(() => { if (errors.length > 0) errorRef.current?.focus(); }, [errors]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const card: FlashcardData = {
      id: id.trim(), articleId: primary.articleId.trim(), question: question.trim(), answer: answer.trim(), kind,
      source: sourceFromDraft(primary),
      ...(related.length ? { relatedSources: related.map((draft) => ({ articleId: draft.articleId.trim(), source: sourceFromDraft(draft) })) } : {}),
    };
    const nextErrors = validatePersonalCard(card, reservedIds, knownSources);
    setErrors(nextErrors);
    if (nextErrors.length === 0) onSave(card);
  }

  return (
    <div className="modal-backdrop">
      <div ref={dialogRef} className="personal-dialog" role="dialog" aria-modal="true" aria-labelledby="personal-dialog-title" aria-describedby="personal-dialog-description" onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
        if (event.key === 'Tab') {
          const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') ?? []);
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
        <div className="dialog-heading">
          <h2 id="personal-dialog-title">Nova questão pessoal</h2>
          <button type="button" onClick={onClose} aria-label="Fechar nova questão">FECHAR ×</button>
        </div>
        <p id="personal-dialog-description">Criada por você, sem aprovação acadêmica. Ao salvar, a questão entra imediatamente no seu baralho pessoal deste navegador.</p>
        <form onSubmit={submit} noValidate>
          {errors.length > 0 && <div ref={errorRef} className="form-errors" role="alert" tabIndex={-1}><p>Revise os campos antes de salvar:</p><ul>{errors.map((error, index) => <li key={index}>{error}</li>)}</ul></div>}
          <label htmlFor="personal-id">ID da questão</label>
          <input ref={idRef} id="personal-id" value={id} onChange={(event) => setId(event.target.value)} />
          <label htmlFor="personal-question">Pergunta</label>
          <textarea id="personal-question" value={question} rows={3} onChange={(event) => setQuestion(event.target.value)} />
          <label htmlFor="personal-answer">Resposta</label>
          <textarea id="personal-answer" value={answer} rows={5} onChange={(event) => setAnswer(event.target.value)} aria-describedby="personal-highlights-help" />
          <p id="personal-highlights-help" className="form-help">Use [[texto]] para destacar trechos na pergunta ou resposta.</p>
          <label htmlFor="personal-kind">Tipo da questão</label>
          <select id="personal-kind" value={kind} onChange={(event) => setKind(event.target.value as 'direct' | 'synthesis')}>
            <option value="direct">Direta</option><option value="synthesis">Síntese entre fontes</option>
          </select>
          <SourceEditor draft={primary} onChange={setPrimary} knownSources={knownSources} label="Fonte principal" prefix="primary" />
          {related.map((draft, index) => (
            <div key={index} className="related-source-editor">
              <SourceEditor draft={draft} onChange={(value) => setRelated((current) => current.map((old, position) => position === index ? value : old))} knownSources={knownSources} label={`Fonte relacionada ${index + 1}`} prefix={`related-${index}`} />
              <button type="button" onClick={() => setRelated((current) => current.filter((_, position) => position !== index))}>Remover fonte relacionada {index + 1}</button>
            </div>
          ))}
          <button type="button" onClick={() => setRelated((current) => [...current, emptySourceDraft()])}>Adicionar fonte relacionada</button>
          <div className="dialog-actions"><button type="button" onClick={onClose}>Cancelar</button><button type="submit" className="save-personal">Salvar no baralho pessoal</button></div>
        </form>
      </div>
    </div>
  );
}
