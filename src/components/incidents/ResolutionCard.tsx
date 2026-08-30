import { Button } from '../ui/Button';

interface ResolutionCardProps {
  recovery: number;
}

export function ResolutionCard({ recovery }: ResolutionCardProps) {
  return (
    <div className="resolution-card">
      <div className="resolution-card__header">
        <span className="resolution-card__title" style={{ color: 'var(--success)' }}>INCIDENT RESOLVED</span>
        <span className="badge badge-success">VERIFIED</span>
      </div>
      <p className="resolution-card__message">
        RESOLVE verified that the remediation restored the system to normal operating conditions.
      </p>
      <div className="resolution-card__stats">
        <div className="resolution-card__stat">
          <div className="resolution-card__stat-value mono" style={{ color: 'var(--success)' }}>{recovery.toFixed(1)} pp</div>
          <div className="resolution-card__stat-label">Failure-rate reduction</div>
        </div>
        <div className="resolution-card__stat">
          <div className="resolution-card__stat-value mono">5 min</div>
          <div className="resolution-card__stat-label">Resolution time</div>
        </div>
        <div className="resolution-card__stat">
          <div className="resolution-card__stat-value mono">0</div>
          <div className="resolution-card__stat-label">Human interventions</div>
        </div>
      </div>
      <Button variant="ghost" onClick={() => {}}>
        View Resolution Report
      </Button>
    </div>
  );
}
