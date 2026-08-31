import { useCallback, useEffect, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import type { AgentActivity } from '../store/types';

export function ApprovalCenter() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2051');

  const [_activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2051 · High-Value Refund Batch' },
    { agent: 'DecisionAgent', action: 'Refund analysis complete', timestamp: new Date().toISOString(), status: 'completed', detail: '$48,700 · 980 affected transactions · 91% confidence' },
    { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: 'HUMAN_APPROVAL required · exceeds autonomous threshold' },
    { agent: 'DecisionAgent', action: 'Human approval requested', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Awaiting human decision' },
  ]);

  useEffect(() => {
    if (incident?.humanDecision === 'approved') {
      setActivity((prev) => [
        ...prev.slice(0, -1),
        { agent: 'Human', action: 'Approved refund', timestamp: new Date().toISOString(), status: 'completed' as const, detail: 'Decision: Approve · $48,700 refund authorized' },
        { agent: 'ActionAgent', action: 'Refund workflow initiated', timestamp: new Date().toISOString(), status: 'in_progress' as const, detail: 'Processing 980 affected transactions' },
      ]);
      addToast({ type: 'success', title: 'Action Approved', message: 'PAY-2051 refund authorized and executing' });
    } else if (incident?.humanDecision === 'rejected') {
      setActivity((prev) => [
        ...prev.slice(0, -1),
        { agent: 'Human', action: 'Rejected refund', timestamp: new Date().toISOString(), status: 'completed' as const, detail: 'Decision: Reject · action blocked' },
        { agent: 'EscalationAgent', action: 'Incident escalated', timestamp: new Date().toISOString(), status: 'in_progress' as const, detail: 'Human review required' },
      ]);
      addToast({ type: 'error', title: 'Action Rejected', message: 'PAY-2051 escalated for human review' });
    }
  }, [incident?.humanDecision, addToast]);

  const handleBack = useCallback(() => dispatch({ type: 'NAVIGATE', screen: 'command-center' }), [dispatch]);
  const handleApprove = useCallback(() => {
    if (incident) dispatch({ type: 'SET_APPROVAL_DECISION', incidentId: incident.id, decision: 'approved' });
  }, [dispatch, incident]);
  const handleReject = useCallback(() => {
    if (incident) dispatch({ type: 'SET_APPROVAL_DECISION', incidentId: incident.id, decision: 'rejected' });
  }, [dispatch, incident]);

  if (!incident) {
    return (
      <div className="empty-state">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ color: 'var(--text-dim)' }}>
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
          <path d="M24 14V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h3>No approval actions pending</h3>
        <p>Launch the demo to see approval workflows.</p>
        <Button variant="secondary" onClick={() => dispatch({ type: 'START_DEMO' })}>Launch Demo</Button>
      </div>
    );
  }

  const isPending = incident.humanDecision === 'pending';
  const isApproved = incident.humanDecision === 'approved';
  const isRejected = incident.humanDecision === 'rejected';

  return (
    <div className="approval-view animate-fade-in">
      <div className="investigation-header">
        <div>
          <h2 className="investigation-title">Approval Center</h2>
          <p className="investigation-subtitle">Human-in-the-loop authorization for high-risk actions</p>
        </div>
        <Badge variant="warning">1 ACTION PENDING</Badge>
      </div>

      <div className="approval-hero">
        <div className="approval-hero__header">
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Badge variant="danger">HIGH RISK</Badge>
              <Badge variant="warning">HUMAN APPROVAL REQUIRED</Badge>
            </div>
            <h3 className="approval-hero__title">{incident.title}</h3>
            <span className="approval-hero__id mono">{incident.id}</span>
          </div>
        </div>

        <div className="approval-metrics">
          <div className="approval-metric">
            <span className="approval-metric__label">Refund Amount</span>
            <span className="approval-metric__value">${incident.metrics.disputedAmount?.toLocaleString() ?? '48,700'}</span>
          </div>
          <div className="approval-metric">
            <span className="approval-metric__label">Affected Transactions</span>
            <span className="approval-metric__value">{incident.affectedCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="approval-reason">
          <span className="approval-reason__label">Why human approval is required</span>
          <p className="approval-reason__text">
            This refund action exceeds RESOLVE's autonomous transaction authority of $10,000.
            The decision agent has determined that human authorization is required before execution.
          </p>
        </div>

        {isPending && (
          <div className="approval-actions">
            <Button variant="danger" onClick={handleReject}>Reject & Escalate</Button>
            <Button variant="success" onClick={handleApprove}>Approve Action</Button>
          </div>
        )}

        {isApproved && (
          <div className="completed-box">
            <span className="completed-box__title">✓ ACTION APPROVED</span>
            <span className="completed-box__subtitle">PAY-2051 refund authorized and executing. Processing 980 affected transactions.</span>
          </div>
        )}

        {isRejected && (
          <div className="escalation-card">
            <span className="escalation-card__title">ACTION REJECTED</span>
            <Badge variant="danger">ESCALATED</Badge>
            <p className="escalation-card__message">The refund has been blocked. Incident escalated for human review.</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <Button variant="ghost" onClick={handleBack}>Back to Command Center</Button>
        {isPending && <Button variant="ghost" onClick={() => dispatch({ type: 'RESET' })}>Reset Demo</Button>}
      </div>
    </div>
  );
}
