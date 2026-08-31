import { useCallback, useEffect } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export function ResolutionReport() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === 'PAY-2048');
  const verification = state.verifications[0];

  useEffect(() => {
    if (incident?.status === 'RESOLVED' && verification?.verified) {
      addToast({ type: 'success', title: 'Incident Resolved', message: `PAY-2048 successfully recovered — ${verification.recovery.toFixed(1)}pp reduction` });
    }
  }, [incident?.status, verification, addToast]);

  const handleBack = useCallback(() => {
    if (incident?.status === 'RESOLVED') dispatch({ type: 'NAVIGATE', screen: 'verification' });
    else dispatch({ type: 'NAVIGATE', screen: 'command-center' });
  }, [dispatch, incident]);

  if (!incident) return <div>No incident data.</div>;

  const isResolved = incident.status === 'RESOLVED';
  const isEscalated = incident.status === 'ESCALATED';

  return (
    <div className="resolution-view animate-fade-in">
      {/* Hero */}
      <div className={`resolution-hero ${isEscalated ? '' : ''}`}>
        <span className="resolution-hero__badge">{isResolved ? '✓ Incident Resolved' : isEscalated ? '✗ Incident Escalated' : 'Report'}</span>
        <h2 className="resolution-hero__title">{incident.id} — {incident.title}</h2>
        <p className="resolution-hero__subtitle mono">{incident.service} · Resolved {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : '—'}</p>
      </div>

      {/* Summary Cards */}
      <div className="resolution-grid">
        {[
          { label: 'Failure Rate', value: verification ? `${verification.before}% → ${verification.after}%` : '—', cls: 'summary-card__value--danger' },
          { label: 'Transactions', value: incident.affectedCount.toLocaleString(), cls: 'summary-card__value--accent' },
          { label: 'Confidence', value: `${Math.round((incident.rootCauseConfidence ?? 0.94) * 100)}%`, cls: 'summary-card__value--success' },
          { label: 'Status', value: isResolved ? 'VERIFIED' : isEscalated ? 'ESCALATED' : 'REPORT', cls: isResolved ? 'summary-card__value--success' : 'summary-card__value--danger' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="summary-card">
            <span className={`summary-card__value ${cls}`}>{value}</span>
            <span className="summary-card__label">{label}</span>
          </div>
        ))}
      </div>

      {/* Details Grid */}
      <div className="resolution-details">
        <div className="detail-card">
          <span className="detail-card__title">Root Cause</span>
          <span className="detail-card__value detail-card__value--mono">{incident.rootCause ?? 'Gateway A timeout configuration'}</span>
        </div>
        <div className="detail-card">
          <span className="detail-card__title">Action Executed</span>
          <span className="detail-card__value detail-card__value--mono detail-card__value--accent">rollback_gateway_config</span>
        </div>
        <div className="detail-card">
          <span className="detail-card__title">Policy Decision</span>
          <span className="detail-card__value detail-card__value--success">AUTONOMOUS</span>
        </div>
        <div className="detail-card">
          <span className="detail-card__title">Verification</span>
          <span className={`detail-card__value ${verification?.verified ? 'detail-card__value--success' : 'detail-card__value--danger'}`}>
            {verification?.verified ? 'PASSED' : 'FAILED'}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="panel-header"><span className="panel-title">Timeline</span></div>
        <div className="timeline-vertical">
          {[
            { time: '09:42', event: 'Incident detected', done: true },
            { time: '09:43', event: 'Investigation initiated', done: true },
            { time: '09:44', event: 'Root cause identified (94%)', done: true },
            { time: '09:45', event: 'Autonomous remediation authorized', done: true },
            { time: '09:45', event: 'Rollback executed', done: true },
            { time: '09:46', event: 'Recovery detected', done: true },
            { time: '09:47', event: 'Resolution verified', done: true },
          ].map(({ time, event }, i) => (
            <div key={i} className="timeline-vertical__item">
              <span className="timeline-vertical__dot timeline-vertical__dot--done" />
              <div className="timeline-vertical__content">
                <span className="timeline-vertical__time mono">{time}</span>
                <span className="timeline-vertical__event">{event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit */}
      <div className="card">
        <div className="panel-header"><span className="panel-title">Audit Trail ({state.audit.length} events)</span></div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {state.audit.slice(0, 8).map((event) => (
            <div key={event.id} className="activity-row">
              <span className="activity-time mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
              <span className="activity-agent">{event.agent ?? 'System'}</span>
              <span className="activity-msg">{event.action.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
        <Button variant="primary" onClick={() => dispatch({ type: 'RESET' })}>Run Demo Again</Button>
        <Button variant="ghost" onClick={handleBack}>Back to Command Center</Button>
      </div>
    </div>
  );
}
