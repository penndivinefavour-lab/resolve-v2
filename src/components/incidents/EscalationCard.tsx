import { Button } from '../ui/Button';

interface EscalationCardProps {
  metric: string;
  failedChecks: Array<{ name: string; passed: boolean; value: string | number }>;
}

export function EscalationCard({ metric, failedChecks }: EscalationCardProps) {
  return (
    <div className="escalation-card">
      <div className="escalation-card__header">
        <span className="escalation-card__title" style={{ color: 'var(--danger)' }}>VERIFICATION FAILED</span>
        <span className="badge badge-danger">ESCALATED</span>
      </div>
      <p className="escalation-card__message">
        RESOLVE could not verify recovery. {metric === 'paymentFailureRate' ? 'Payment failure rate' : metric} remains above baseline.
        Further human intervention is required.
      </p>
      <div className="escalation-card__checks">
        {failedChecks.map((check, idx) => (
          <div key={idx} className="escalation-card__check">
            <span className="escalation-card__check-icon escalation-card__check-icon--fail">✗</span>
            <span className="escalation-card__check-name">{check.name}</span>
            <span className="escalation-card__check-value mono">{check.value}</span>
          </div>
        ))}
      </div>
      <div className="escalation-card__actions">
        <Button variant="danger" onClick={() => {}}>
          View Escalation Report
        </Button>
      </div>
    </div>
  );
}
