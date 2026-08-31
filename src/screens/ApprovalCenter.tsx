import { useCallback, useEffect, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { PageHeader } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MetricCard } from '../components/incidents/MetricCard';
import { ApprovalActions } from '../components/incidents/ApprovalActions';
import { ResolutionReportContent } from '../components/incidents/ResolutionReportContent';
import type { AgentActivity } from '../store/types';

export function ApprovalCenter() {
  const { state, dispatch } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2051');

  const [activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2051 · High-Value Refund Batch' },
    { agent: 'DecisionAgent', action: 'Refund analysis complete', timestamp: new Date().toISOString(), status: 'completed', detail: '$48,700 · 980 affected transactions · 91% confidence' },
    { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: 'HUMAN_APPROVAL required · exceeds autonomous threshold' },
    { agent: 'DecisionAgent', action: 'Human approval requested', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Awaiting human decision' },
  ]);

  useEffect(() => {
    if (incident?.humanDecision === 'approved') {
      setActivity((prev) => [
        ...prev.slice(0, -1),
        { agent: 'Human', action: 'Approved refund', timestamp: new Date().toISOString(), status: 'completed', detail: 'Decision: Approve · $48,700 refund authorized' },
        { agent: 'ActionAgent', action: 'Refund workflow initiated', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Processing 980 affected transactions' },
      ]);
    } else if (incident?.humanDecision === 'rejected') {
      setActivity((prev) => [
        ...prev.slice(0, -1),
        { agent: 'Human', action: 'Rejected refund', timestamp: new Date().toISOString(), status: 'completed', detail: 'Decision: Reject · action blocked' },
        { agent: 'EscalationAgent', action: 'Incident escalated', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Human review required' },
      ]);
    }
  }, [incident?.humanDecision]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'command-center' });
  }, [dispatch]);

  const handleApprove = useCallback(() => {
    if (incident) {
      dispatch({ type: 'SET_APPROVAL_DECISION', incidentId: incident.id, decision: 'approved' });
    }
  }, [dispatch, incident]);

  const handleReject = useCallback(() => {
    if (incident) {
      dispatch({ type: 'SET_APPROVAL_DECISION', incidentId: incident.id, decision: 'rejected' });
    }
  }, [dispatch, incident]);

  if (!incident) {
    return (
      <MainLayout onBack={handleBack} backLabel="Command Center">
        <div className="approval-center--empty">
          <div className="approval-center--empty-inner animate-fade-in-up">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
              <path d="M24 14V24L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h2>No approval actions pending</h2>
            <p>Launch the demo to see approval workflows.</p>
            <Button variant="secondary" onClick={() => dispatch({ type: 'START_DEMO' })}>
              Launch Demo
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isPending = incident.humanDecision === 'pending';
  const isApproved = incident.humanDecision === 'approved';
  const isRejected = incident.humanDecision === 'rejected';

  return (
    <MainLayout
      title="Approval Center"
      subtitle="1 action requires your decision"
      showWorkflow={true}
      incident={incident}
      onBack={handleBack}
      backLabel="Back"
    >
      <PageHeader
        title="Approval Center"
        subtitle="Human-in-the-loop authorization for high-risk actions"
      />

      <div className="approval-center animate-fade-in">
        <div className="approval-center__card">
          <div className="approval-center__header">
            <div className="approval-center__badges">
              <Badge variant="danger">HIGH RISK</Badge>
              <Badge variant="warning">HUMAN APPROVAL REQUIRED</Badge>
            </div>
            <h2 className="approval-center__title">{incident.title}</h2>
            <span className="approval-center__id mono">{incident.id}</span>
          </div>

          <div className="approval-center__metrics">
            <MetricCard label="Refund amount" value={`$${incident.metrics.disputedAmount ? incident.metrics.disputedAmount.toLocaleString() : '48700'}`} accent="warning" />
            <MetricCard label="Affected transactions" value={incident.affectedCount.toLocaleString()} />
          </div>

          <div className="approval-center__reason">
            <span className="approval-center__reason-label">RESOLVE recommendation</span>
            <p className="approval-center__reason-text">
              Refund affected transactions. This action exceeds RESOLVE's autonomous transaction authority.
              Human approval is required before execution.
            </p>
            <div className="approval-center__reason-confidence">
              <span className="approval-center__reason-confidence-label">Confidence</span>
              <span className="approval-center__reason-confidence-value" style={{ color: 'var(--success)' }}>91%</span>
            </div>
          </div>

          {isPending && (
            <ApprovalActions
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {isApproved && (
            <ResolutionReportContent
              incident={incident}
              verification={state.verifications[0] ?? null}
              audit={state.audit}
            />
          )}

          {isRejected && (
            <div className="approval-center__rejected animate-fade-in-up">
              <div className="result-banner result-banner--error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="result-banner__body">
                  <span className="result-banner__title">Action Rejected</span>
                  <span className="result-banner__message">The refund has been blocked. Incident escalated for human review.</span>
                </div>
              </div>
            </div>
          )}

          <div className="approval-center__activity">
            <AgentActivityList activities={activity} />
          </div>
        </div>

        <div className="approval-center__footer animate-fade-in-up">
          <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'command-center' })}>
            Back to Command Center
          </Button>
          {isPending && (
            <Button variant="ghost" onClick={() => dispatch({ type: 'RESET' })}>
              Reset Demo
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
