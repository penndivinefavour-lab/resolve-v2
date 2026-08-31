import { useCallback, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PolicyBadge } from '../components/ui/PolicyBadge';
import { useToast } from '../components/ui/Toast';
import type { AgentActivity } from '../store/types';

export function Decision() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const proposal = state.proposals[0];
  const policyDecision = state.policyDecisions[0];

  const [_activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout (94%)' },
    { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'rollback_gateway_config' },
  ]);

  const handleContinue = useCallback(() => {
    if (!incident) return;
    dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'execution' });
    setActivity((prev) => [
      ...prev,
      { agent: 'DecisionAgent', action: 'Action proposed', timestamp: new Date().toISOString(), status: 'completed' as const, detail: proposal?.action ?? 'rollback_gateway_config' },
      { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed' as const, detail: policyDecision?.authorization ?? 'AUTONOMOUS' },
      { agent: 'ActionAgent', action: 'Preparing execution', timestamp: new Date().toISOString(), status: 'in_progress' as const, detail: 'Awaiting authorization' },
    ]);
    addToast({
      type: policyDecision?.authorization === 'AUTONOMOUS' ? 'success' : 'warning',
      title: policyDecision?.authorization === 'AUTONOMOUS' ? 'Autonomous Execution Authorized' : 'Human Approval Required',
      message: `Policy ${policyDecision?.authorization} — ${proposal?.action}`,
    });
  }, [incident, dispatch, proposal, policyDecision, addToast]);

  const handleBack = useCallback(() => dispatch({ type: 'NAVIGATE', screen: 'investigation' }), [dispatch]);

  if (!incident || !proposal || !policyDecision) {
    return <div className="empty-state"><p>No decision data available.</p></div>;
  }

  return (
    <div className="decision-view animate-fade-in">
      <div className="investigation-header">
        <div>
          <h2 className="investigation-title">AI Decision — {incident.id}</h2>
          <p className="investigation-subtitle mono">{incident.title} · Recommended remediation</p>
        </div>
        <Badge variant="status" status={incident.status}>{incident.status.replace(/_/g, ' ')}</Badge>
      </div>

      <div className="decision-layout">
        {/* Left: Recommendation */}
        <div>
          <div className="recommendation-box">
            <div className="recommendation-box__header">
              <span className="recommendation-box__title">Recommended Action</span>
              <Badge variant={proposal.risk === 'low' ? 'success' : proposal.risk === 'medium' ? 'warning' : 'danger'}>{proposal.risk.toUpperCase()} RISK</Badge>
            </div>
            <div className="recommendation-action">
              <span className="recommendation-action__icon">⚙️</span>
              <div>
                <span className="recommendation-action__label">Action</span>
                <span className="recommendation-action__value mono">{proposal.action.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
            </div>
            <div className="recommendation-meta">
              {[
                { label: 'Expected Outcome', value: proposal.expectedOutcome },
                { label: 'Est. Recovery', value: `${proposal.estimatedRecoveryMinutes} min` },
                { label: 'Reversible', value: proposal.reversible ? 'Yes' : 'No' },
                { label: 'Confidence', value: `${Math.round(proposal.confidence * 100)}%`, cls: 'meta-item__value--high' },
              ].map(({ label, value, cls }) => (
                <div key={label} className="meta-item">
                  <span className="meta-item__label">{label}</span>
                  <span className={`meta-item__value ${cls ?? ''}`}>{value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{proposal.reason}</p>
          </div>

          {/* Policy Gate */}
          <div className="policy-panel" style={{ marginTop: 'var(--space-5)' }}>
            <div className="policy-panel__header">
              <span className="policy-panel__title">Policy Gate</span>
              <PolicyBadge authorization={policyDecision.authorization} risk={policyDecision.risk} />
            </div>
            <div className="policy-rows">
              {[
                { label: 'Authorization', value: policyDecision.authorization.replace('_', ' ').toUpperCase() },
                { label: 'Policy', value: policyDecision.policy },
                { label: 'Risk', value: policyDecision.risk.toUpperCase() },
                { label: 'Status', value: 'VERIFIED' },
              ].map(({ label, value }) => (
                <div key={label} className="policy-row">
                  <span className="policy-row__label">{label}</span>
                  <Badge variant={label === 'Risk' ? (policyDecision.risk as any) : label === 'Authorization' ? (policyDecision.authorization === 'AUTONOMOUS' ? 'success' : policyDecision.authorization === 'HUMAN_APPROVAL' ? 'warning' : 'danger') : 'success'}>{value}</Badge>
                </div>
              ))}
            </div>
            <p className="policy-message">
              {policyDecision.authorization === 'AUTONOMOUS'
                ? 'RESOLVE is authorized to execute this action autonomously.'
                : policyDecision.authorization === 'HUMAN_APPROVAL'
                ? 'This action requires human approval before execution.'
                : 'This action is blocked by policy and cannot be executed.'}
            </p>
          </div>
        </div>

        {/* Right: Activity */}
        <div className="decision-sidebar">
          <div className="card">
            <div className="panel-header"><span className="panel-title">Agent Activity</span></div>
            <div className="pipeline-list">
              {[
                { agent: 'DetectionAgent', status: 'completed', label: 'Incident detected' },
                { agent: 'InvestigationAgent', status: 'completed', label: 'Root cause identified' },
                { agent: 'DecisionAgent', status: 'in_progress', label: 'Evaluating remediation' },
                { agent: 'PolicyEngine', status: 'completed', label: 'Policy evaluated' },
              ].map(({ agent, status }) => (
                <div key={agent} className={`pipeline-item pipeline-item--${status}`}>
                  <span className="pipeline-icon" style={{ background: 'var(--text-muted)' }}>●</span>
                  <span className="pipeline-label">{agent}</span>
                  <span className="pipeline-status">{status === 'completed' ? <span style={{ color: 'var(--success)' }}>✓</span> : <span className="pipeline-dot pipeline-dot--active" />}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="decision-actions">
            <Button variant="primary" size="lg" disabled={policyDecision.authorization === 'BLOCKED'} onClick={handleContinue}>
              {policyDecision.authorization === 'BLOCKED' ? 'Action Blocked' : 'Execute Remediation →'}
            </Button>
            <Button variant="ghost" onClick={handleBack}>Back to Investigation</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
