import { useCallback, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/metrics/MetricComponents';
import { SectionHeader } from '../components/layout/MainLayout';
import { statusLabel } from '../data/demoScenarios';
import type { AgentActivity, Screen } from '../store/types';

export function CommandCenter() {
  const { state, dispatch } = useRESOLVE();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleLaunchDemo = useCallback(() => {
    dispatch({ type: 'START_DEMO' });
  }, [dispatch]);

  const handleOpenIncident = useCallback((incidentId: string) => {
    setExpandedId(incidentId);
    dispatch({ type: 'OPEN_INCIDENT', incidentId });
  }, [dispatch]);

  const handleCollapse = useCallback(() => {
    setExpandedId(null);
  }, []);

  const handleNavigate = useCallback((screen: Screen) => {
    dispatch({ type: 'NAVIGATE', screen });
  }, [dispatch]);

  const primaryIncident = state.incidents[0];
  const isDemoReady = state.incidents.length > 0;
  const metrics = state.commandMetrics;
  const recentEvents: Array<{ id: string; time: string; agent: string; message: string }> = state.audit.slice(-5).map((a) => ({
    id: a.id,
    time: new Date(a.timestamp).toLocaleTimeString(),
    agent: a.agent ?? 'System',
    message: a.action.replace(/_/g, ' '),
  }));

  const activities: AgentActivity[] = isDemoReady
    ? [
        { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048 · Payment Gateway Degradation' },
        { agent: 'InvestigationAgent', action: '6 evidence sources analyzed', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout (94% confidence)' },
        { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: state.incidents[0]?.status === 'VERIFYING' ? 'completed' : 'in_progress', detail: 'rollback_gateway_config' },
        { agent: 'PolicyEngine', action: 'Policy evaluation', timestamp: new Date().toISOString(), status: state.incidents[0]?.status === 'EXECUTING' ? 'completed' : 'pending', detail: '' },
        { agent: 'ActionAgent', action: 'Executing remediation', timestamp: new Date().toISOString(), status: state.incidents[0]?.status === 'VERIFYING' ? 'completed' : state.incidents[0]?.status === 'EXECUTING' ? 'in_progress' : 'pending', detail: '' },
        { agent: 'VerificationAgent', action: 'Verifying recovery', timestamp: new Date().toISOString(), status: state.incidents[0]?.status === 'RESOLVED' ? 'completed' : state.incidents[0]?.status === 'VERIFYING' ? 'in_progress' : 'pending', detail: isDemoReady && state.incidents[0]?.status === 'VERIFYING' ? 'Failure rate: 38.4% → 17.2% → 4.7% → 2.3%' : '' },
      ]
    : [
        { agent: 'DetectionAgent', action: 'Awaiting incidents', timestamp: new Date().toISOString(), status: 'pending', detail: '' },
        { agent: 'InvestigationAgent', action: '', timestamp: new Date().toISOString(), status: 'pending', detail: '' },
        { agent: 'DecisionAgent', action: '', timestamp: new Date().toISOString(), status: 'pending', detail: '' },
        { agent: 'PolicyEngine', action: '', timestamp: new Date().toISOString(), status: 'pending', detail: '' },
        { agent: 'ActionAgent', action: '', timestamp: new Date().toISOString(), status: 'pending', detail: '' },
        { agent: 'VerificationAgent', action: '', timestamp: new Date().toISOString(), status: 'pending', detail: '' },
      ];

  return (
    <MainLayout
      title={isDemoReady ? 'Operations Command Center' : 'RESOLVE'}
      subtitle={isDemoReady ? 'Autonomous incident response with policy-controlled execution' : 'AI-native enterprise operations manager'}
      showActivity
      activities={activities as unknown as AgentActivity[]}
      incident={primaryIncident}
      showWorkflow={isDemoReady}
      onBack={expandedId ? handleCollapse : undefined}
      backLabel={expandedId ? 'Close' : undefined}
    >
      <div className="command-center">
        <div className="command-center__top-bar">
          <div className="command-center__brand">
            <div className="command-center__logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="command-center__wordmark">RESOLVE</span>
            </div>
            {isDemoReady && (
              <div className="command-center__status-pill">
                <span className="command-center__status-dot command-center__status-dot--active" />
                <span className="command-center__status-text">{primaryIncident?.status ?? '—'}</span>
              </div>
            )}
          </div>
          <Button variant="primary" onClick={handleLaunchDemo} disabled={isDemoReady}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Launch Demo
          </Button>
        </div>

        {isDemoReady ? (
          <>
            <div className="command-center__metrics">
              <StatCard
                label="ACTIVE INCIDENTS"
                value={metrics.activeIncidents}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4M12 16h.01M12 12v.01M12 2v.01M5.64 5.64l.01.01M18.36 18.36l.01.01M2 12h.01M20 12h.01M4.93 4.93l.01.01M19.07 19.07l.01.01M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
              />
              <StatCard
                label="CRITICAL"
                value={metrics.critical}
                accent="var(--danger)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
              <StatCard
                label="AWAITING APPROVAL"
                value={metrics.awaitingApproval}
                accent="var(--warning)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
              <StatCard
                label="AUTOMATED RESOLUTIONS"
                value={metrics.automatedResolutions}
                accent="var(--success)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
            </div>

            <div className="command-center__main-grid">
              <div className="command-center__primary-col">
                {expandedId ? (
                  <div className="command-center__incident-expanded animate-fade-in" key={expandedId}>
                    <button className="command-center__collapse-btn" onClick={handleCollapse}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Collapse
                    </button>
                    <ExpandedIncident incidentId={expandedId} />
                  </div>
                ) : (
                  <div className="command-center__active-incident">
                    <SectionHeader
                      label="ACTIVE INCIDENT"
                      count={`1 open`}
                      action={
                        <Button variant="ghost" size="sm" onClick={() => handleOpenIncident(primaryIncident?.id ?? 'PAY-2048')}>
                          View details
                        </Button>
                      }
                    />
                    <div className="incident-card-large" key={primaryIncident?.id}>
                      <div className="incident-card-large__header">
                        <span className="incident-card-large__id mono">{primaryIncident?.id}</span>
                        <Badge variant="severity" severity={primaryIncident?.severity}>
                          {primaryIncident?.severity?.toUpperCase()}
                        </Badge>
                        <Badge variant="status" status={primaryIncident?.status}>
                          {statusLabel(primaryIncident?.status)}
                        </Badge>
                      </div>
                      <h2 className="incident-card-large__title">{primaryIncident?.title}</h2>
                      <p className="incident-card-large__service mono">{primaryIncident?.service}</p>
                      <div className="incident-card-large__metrics">
                        <div className="metric-block">
                          <span className="metric-block__label">Failure rate</span>
                          <span className="metric-block__value text-metric">{primaryIncident?.metrics?.paymentFailureRate?.toFixed(1) ?? 38.4}%</span>
                          <span className="metric-block__baseline">Baseline: 2.3%</span>
                        </div>
                        <div className="metric-block">
                          <span className="metric-block__label">Affected transactions</span>
                          <span className="metric-block__value text-metric">{(12840).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="incident-card-large__root-cause">
                        <span className="incident-card-large__root-cause-label">Root cause</span>
                        <span className="incident-card-large__root-cause-value">{primaryIncident?.rootCause ?? 'Gateway A timeout configuration'}</span>
                        <span className="incident-card-large__root-cause-confidence">
                          {primaryIncident?.rootCauseConfidence ? (primaryIncident.rootCauseConfidence * 100).toFixed(0) + '% confidence' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="command-center__secondary-col">
                <div className="command-center__resolve-panel">
                  <SectionHeader
                    label="RESOLVE STATUS"
                    action={
                      expandedId ? (
                        <Button variant="ghost" size="sm" onClick={handleCollapse}>
                          ← Close
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={() => handleOpenIncident(primaryIncident?.id ?? 'PAY-2048')}>
                          Investigate Incident
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Button>
                      )
                    }
                  />
                  <div className="resolve-status-card">
                    <div className="resolve-status-card__current">
                      <span className="resolve-status-card__current-label">Current stage</span>
                      <span className="resolve-status-card__current-value">{primaryIncident?.status}</span>
                    </div>
                    <div className="resolve-status-card__summary">
                      {isDemoReady ? (
                        <p className="resolve-status-card__text">
                          {primaryIncident?.status === 'DETECTED' && 'Payment gateway A showing elevated failure rates. Auto-detection triggered.'}
                          {primaryIncident?.status === 'INVESTIGATING' && 'Investigation in progress. Analyzing 6 evidence sources.'}
                          {primaryIncident?.status === 'ROOT_CAUSE_IDENTIFIED' && 'Root cause identified: Gateway A timeout configuration.'}
                          {primaryIncident?.status === 'ACTION_PROPOSED' && 'Decision agent evaluating rollback action.'}
                          {primaryIncident?.status === 'RISK_CHECK' && 'Policy engine evaluating risk profile.'}
                          {primaryIncident?.status === 'EXECUTING' && 'Action agent executing approved remediation.'}
                          {primaryIncident?.status === 'VERIFYING' && 'Verification agent confirming recovery.'}
                          {primaryIncident?.status === 'RESOLVED' && 'Incident fully resolved and verified.'}
                          {primaryIncident?.status === 'ESCALATED' && 'Human escalation required.'}
                          {primaryIncident?.status === 'BLOCKED' && 'Action blocked by policy.'}
                        </p>
                      ) : (
                        <p className="resolve-status-card__text">Launch a demo to see RESOLVE in action.</p>
                      )}
                    </div>
                  </div>
                </div>

                {recentEvents.length > 0 && (
                  <div className="command-center__activity-minied">
                    <SectionHeader label="RECENT ACTIVITY" />
                    <div className="activity-mini-list">
                      {recentEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="activity-mini-item">
                          <span className="activity-mini-item__time mono">{event.time}</span>
                          <span className="activity-mini-item__agent">{event.agent}</span>
                          <span className="activity-mini-item__message">{event.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {expandedId && (
              <div className="command-center__bottom-actions">
                <Button variant="secondary" onClick={() => handleNavigate('command-center')}>
                  ← Back to overview
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="command-center__empty animate-fade-in">
            <div className="command-center__empty-content">
              <div className="command-center__empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--border-emphasis)" strokeWidth="1.5" />
                  <path d="M12 6v6l4 2" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="command-center__empty-title">No active incidents</h2>
              <p className="command-center__empty-text">
                RESOLVE is ready to monitor your operations. Launch a demo to see the full incident response workflow in action.
              </p>
              <div className="command-center__empty-actions">
                <Button variant="primary" size="lg" onClick={handleLaunchDemo}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Launch Demo
                </Button>
                <Button variant="secondary" size="lg" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'welcome' })}>
                  Learn more
                </Button>
              </div>
              <div className="command-center__empty-metrics-preview">
                <div className="command-center__empty-metric">
                  <span className="command-center__empty-metric-label">Typical failure rate</span>
                  <span className="command-center__empty-metric-value text-metric">38.4%</span>
                </div>
                <div className="command-center__empty-metric">
                  <span className="command-center__empty-metric-label">Affected transactions</span>
                  <span className="command-center__empty-metric-value text-metric">12,840</span>
                </div>
                <div className="command-center__empty-metric">
                  <span className="command-center__empty-metric-label">Target recovery</span>
                  <span className="command-center__empty-metric-value text-metric">2.3%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function ExpandedIncident({ incidentId }: { incidentId: string }) {
  const { state } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === incidentId);
  const evidence = state.evidence.length > 0 ? state.evidence : (incidentId === 'PAY-2048' ? PAY_2048_EVIDENCE : []);
  const execution = state.executions.find((e) => e.incidentId === incidentId);
  const proposal = state.proposals.find((p) => p.incidentId === incidentId);
  const policyDecision = state.policyDecisions.find((p) => p.incidentId === incidentId);

  return (
    <div className="expanded-incident">
      <div className="expanded-incident__metrics-grid">
        {incident?.metrics && Object.entries(incident.metrics).map(([key, value]) => (
          <div key={key} className="expanded-metric">
            <span className="expanded-metric__label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
            <span className="expanded-metric__value text-metric">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
          </div>
        ))}
      </div>
      {evidence.length > 0 && (
        <div className="expanded-incident__evidence">
          <SectionHeader label="EVIDENCE" count={`${evidence.length} sources`} />
          <div className="evidence-list">
            {evidence.map((ev) => (
              <div key={ev.id} className="evidence-item animate-fade-in">
                <div className="evidence-item__header">
                  <span className="evidence-item__id mono">{ev.id}</span>
                  <span className={`evidence-item__badge ${ev.supportsRootCause ? 'evidence-item__badge--root' : 'evidence-item__badge--context'}`}>
                    {ev.supportsRootCause ? 'Root cause support' : 'Context'}
                  </span>
                </div>
                <div className="evidence-item__body">
                  <span className="evidence-item__label">{ev.label}</span>
                  <span className="evidence-item__value">{String(ev.value)}</span>
                </div>
                <span className="evidence-item__time mono text-small">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {proposal && (
        <div className="expanded-incident__proposal">
          <SectionHeader label="PROPOSED ACTION" />
          <div className="proposal-card">
            <div className="proposal-card__header">
              <span className="proposal-card__action">{proposal.action}</span>
              <Badge variant="policy" policy={policyDecision?.authorization}>
                {policyDecision?.authorization}
              </Badge>
            </div>
            <p className="proposal-card__reason">{proposal.reason}</p>
            <div className="proposal-card__meta">
              <div className="proposal-card__meta-item">
                <span className="proposal-card__meta-label">Risk</span>
                <span className={`proposal-card__meta-value proposal-card__meta-value--${proposal.risk}`}>
                  {proposal.risk.toUpperCase()}
                </span>
              </div>
              <div className="proposal-card__meta-item">
                <span className="proposal-card__meta-label">Reversible</span>
                <span className="proposal-card__meta-value">{proposal.reversible ? 'Yes' : 'No'}</span>
              </div>
              <div className="proposal-card__meta-item">
                <span className="proposal-card__meta-label">Confidence</span>
                <span className="proposal-card__meta-value text-metric">{(proposal.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="proposal-card__meta-item">
                <span className="proposal-card__meta-label">Est. recovery</span>
                <span className="proposal-card__meta-value text-metric">{proposal.estimatedRecoveryMinutes} min</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {policyDecision && (
        <div className="expanded-incident__policy">
          <SectionHeader label="POLICY DECISION" />
          <div className="policy-card">
            <div className="policy-card__row">
              <span className="policy-card__label">Authorization level</span>
              <Badge variant="policy" policy={policyDecision.authorization}>
                {policyDecision.authorization}
              </Badge>
            </div>
            <div className="policy-card__row">
              <span className="policy-card__label">Requires human</span>
              <span className="policy-card__value">{policyDecision.requiresHuman ? 'Yes' : 'No'}</span>
            </div>
            <div className="policy-card__row">
              <span className="policy-card__label">Blocked</span>
              <span className="policy-card__value">{policyDecision.blocked ? 'Yes' : 'No'}</span>
            </div>
            <div className="policy-card__row">
              <span className="policy-card__label">Policy</span>
              <span className="policy-card__value mono text-small">{policyDecision.policy}</span>
            </div>
            {policyDecision.reason && (
              <div className="policy-card__row">
                <span className="policy-card__label">Reason</span>
                <span className="policy-card__value">{policyDecision.reason}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {execution && (
        <div className="expanded-incident__execution">
          <SectionHeader label="EXECUTION" />
          <div className="execution-summary">
            <div className="execution-summary__row">
              <span className="execution-summary__label">Tool</span>
              <span className="execution-summary__value mono">{execution.tool}</span>
            </div>
            <div className="execution-summary__row">
              <span className="execution-summary__label">Status</span>
              <Badge variant="status" status={execution.status}>
                {execution.status}
              </Badge>
            </div>
            <div className="execution-summary__row">
              <span className="execution-summary__label">Started</span>
              <span className="execution-summary__value mono text-small">{new Date(execution.startedAt).toLocaleTimeString()}</span>
            </div>
            {execution.steps.length > 0 && (
              <div className="execution-summary__steps">
                {execution.steps.map((step, idx) => (
                  <div key={idx} className="execution-step">
                    <span className="execution-step__time mono text-small">{new Date(step.timestamp).toLocaleTimeString()}</span>
                    <span className={`execution-step__badge execution-step__badge--${step.status}`}>{step.status}</span>
                    <span className="execution-step__agent">{step.agent}</span>
                    <span className="execution-step__message">{step.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const PAY_2048_EVIDENCE = [
  { id: 'ev-1', incidentId: 'PAY-2048', category: 'metrics', label: 'Payment failure rate', value: '38.4%', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-2', incidentId: 'PAY-2048', category: 'gateway', label: 'Gateway A timeout failures', value: '81% of timeouts', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-3', incidentId: 'PAY-2048', category: 'config', label: 'Gateway A timeout config', value: 'Changed 18 min before incident', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-4', incidentId: 'PAY-2048', category: 'deployment', label: 'Recent deployments', value: 'None correlate', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-5', incidentId: 'PAY-2048', category: 'gateway', label: 'Gateway B status', value: 'Normal', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-6', incidentId: 'PAY-2048', category: 'history', label: 'Incident PAY-1872', value: 'Similar failure pattern', supportsRootCause: false, timestamp: new Date().toISOString() },
];
