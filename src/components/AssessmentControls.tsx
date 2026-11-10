import { assessmentLabels } from '../progress';
import type { Assessment } from '../progress';

export interface AssessmentControlsProps {
  value?: Assessment;
  onAssess: (value: Assessment) => void;
}

export function AssessmentControls({ value, onAssess }: AssessmentControlsProps) {
  return (
    <fieldset className="assessment">
      <legend>Como foi sua resposta?</legend>
      <div className="assessment-options">
        {(['correct', 'incorrect', 'incomplete'] as const).map((status) => (
          <button key={status} type="button" className={`assessment-${status}`} aria-pressed={value === status} onClick={() => onAssess(status)}>
            {assessmentLabels[status]}
          </button>
        ))}
      </div>
      <p className={`assessment-status${value ? ` assessment-${value}` : ''}`} role="status">{value ? `Avaliação: ${assessmentLabels[value]}.` : 'Ainda não avaliado.'}</p>
    </fieldset>
  );
}
