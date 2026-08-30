import type { Evidence } from '../../store/types';

interface EvidenceCardProps {
  evidence: Evidence[];
}

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  return (
    <div className="evidence-card animate-fade-in-up">
      <div className="evidence-card__header">
        <span className="evidence-card__title">Evidence</span>
        <span className="evidence-card__count mono">{evidence.length} sources</span>
      </div>
      <div className="evidence-card__grid">
        {evidence.map((ev, i) => (
          <div
            key={ev.id}
            className={`evidence-card__item animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
            style={{ borderLeftColor: ev.supportsRootCause ? 'var(--accent)' : 'var(--border-default)' }}
          >
            <div className="evidence-card__item-header">
              <span className="evidence-card__item-category">{ev.category.toUpperCase()}</span>
              {ev.supportsRootCause && <span className="evidence-card__item-support badge badge-accent">Supports root cause</span>}
            </div>
            <div className="evidence-card__item-label">{ev.label}</div>
            <div className="evidence-card__item-value mono">{ev.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
