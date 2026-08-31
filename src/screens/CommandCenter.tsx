import { useCallback, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/layout/MainLayout';
import { statusLabel } from '../data/demoScenarios';
import type { AgentActivity, Screen } from '../store/types';
import { AGENT_DEFS } from '../data/demoScenarios';

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
  const secondaryIncident = state.incidents[1];
  const isDemoReady = state.incidents.length > 0;
  const metrics = state.commandMetrics;
  const recentEvents: Array<{ id: string; time: string; agent: string; message: string }> = state.audit.slice(-5).map((a) => ({
    id: a.id,
    time: new Date(a.timestamp).toLocaleTimeString(),
    agent: a.agent ?? 'System',
    message: a.action.replace(/_/g, ' '),
  }));

  // Health indicators based on incident state
  const healthStatuses: Array<{ name: string; status: 'healthy' | 'degraded' | 'critical'; detail: string }> = [
    { name: 'Gateway A', status: primaryIncident?.status === 'RESOLVED' ? 'healthy' : 'degraded', detail: primaryIncident?.service ?? '—' },
    { name: 'Gateway B', status: 'healthy' as const, detail: 'Normal' },
    { name: 'Payment API', status: primaryIncident?.status === 'RESOLVED' ? 'healthy' : 'degraded', detail: 'Elevated failure rate' },
    { name: 'Transaction Engine', status: 'healthy' as const, detail: 'Operational' },
  ];

  const activities: AgentActivity[] = isDemoReady
    ? [
        { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048 · Payment Gateway Degradation' },
        { agent: 'InvestigationAgent', action: '6 evidence sources analyzed', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout (94% confidence)' },
        { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: ['VERIFYING', 'EXECUTING'].includes(primaryIncident?.status ?? '') ? 'in_progress' : 'completed', detail: 'rollback_gateway_config' },
        { agent: 'PolicyEngine', action: 'Policy evaluation', timestamp: new Date().toISOString(), status: primaryIncident?.status === 'EXECUTING' ? 'completed' : 'pending', detail: '' },
        { agent: 'ActionAgent', action: 'Executing remediation', timestamp: new Date().toISOString(), status: ['VERIFYING', 'RESOLVED'].includes(primaryIncident?.status ?? '') ? 'completed' : primaryIncident?.status === 'EXECUTING' ? 'in_progress' : 'pending', detail: '' },
        { agent: 'VerificationAgent', action: 'Verifying recovery', timestamp: new Date().toISOString(), status: primaryIncident?.status === 'RESOLVED' ? 'completed' : primaryIncident?.status === 'VERIFYING' ? 'in_progress' : 'pending', detail: primaryIncident?.status === 'VERIFYING' ? 'Failure rate: 38.4% → 17.2% → 4.7% → 2.3%' : '' },
      ]
    : [];

  return (
    <MainLayout
      title={isDemoReady ? 'Operations Command Center' : 'RESOLVE'}
      subtitle={isDemoReady ? 'Autonomous incident response with policy-controlled execution' : 'AI-native enterprise operations manager'}
      showActivity
      activities={activities}
      incident={primaryIncident}
      showWorkflow={isDemoReady}
      onBack={expandedId ? handleCollapse : undefined}
      backLabel={expandedId ? 'Close' : undefined}
      hideHeader={isDemoReady}
    >
      <div className="command-center">
        {/* Top Bar */}
        <div className="command-center__top-bar">
          <div className="command-center__brand">
            <div className="command-center__logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="command-center__wordmark">RESOLVE</span>
              <span className="command-center__subtitle">AI Operations</span>
            </div>
            {isDemoReady && (
              <div className="command-center__status-pill">
                <span className="command-center__status-dot command-center__status-dot--active" />
                <span className="command-center__status-text">{primaryIncident?.status ?? '—'}</span>
                <span className="command-center__sim-badge">SIMULATION</span>
              </div>
            )}
          </div>
          <div className="command-center__top-bar-actions">
            {isDemoReady && (
              <>
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'audit-trail' as Screen })}>
                  Audit Trail
                </Button>
                {secondaryIncident && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenIncident(secondaryIncident.id)}
                    className={secondaryIncident.humanDecision === 'pending' ? 'btn--warning-border' : ''}
                  >
                    <span className="pulse-dot" />
                    PAY-2051 Approval
                  </Button>
                )}
              </>
            )}
            <Button variant="primary" onClick={handleLaunchDemo} disabled={isDemoReady}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Launch Demo
            </Button>
          </div>
        </div>

        {isDemoReady ? (
          <div className="command-center__dashboard">
            {/* Metrics Strip */}
            <div className="command-center__metrics">
              <div className="stat-card stat-card--compact">
                <div className="stat-card__header">
                  <span className="stat-card__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 8v4M12 16h.01M12 12v.01M12 2v.01M5.64 5.64l.01.01M18.36 18.36l.01.01M2 12h.01M20 12h.01M4.93 4.93l.01.01M19.07 19.07l.01.01M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </span>
                  <span className="stat-card__label">Active Incidents</span>
                </div>
                <div className="stat-card__value" style={{ color: 'var(--text-primary)' }}>{metrics.activeIncidents}</div>
              </div>
              <div className="stat-card stat-card--compact stat-card--danger">
                <div className="stat-card__header">
                  <span className="stat-card__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="stat-card__label">Critical</span>
                </div>
                <div className="stat-card__value" style={{ color: 'var(--danger)' }}>{metrics.critical}</div>
              </div>
              <div className="stat-card stat-card--compact stat-card--warning">
                <div className="stat-card__header">
                  <span className="stat-card__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="stat-card__label">Awaiting Approval</span>
                </div>
                <div className="stat-card__value" style={{ color: 'var(--warning)' }}>{metrics.awaitingApproval}</div>
              </div>
              <div className="stat-card stat-card--compact stat-card--success">
                <div className="stat-card__header">
                  <span className="stat-card__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="stat-card__label">Resolved</span>
                </div>
                <div className="stat-card__value" style={{ color: 'var(--success)' }}>{metrics.automatedResolutions}</div>
              </div>
              <div className="stat-card stat-card--compact">
                <div className="stat-card__header">
                  <span className="stat-card__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="stat-card__label">Health</span>
                </div>
                <div className="stat-card__value" style={{ color: primaryIncident?.status === 'RESOLVED' ? 'var(--success)' : 'var(--warning)' }}>{metrics.operationalHealth}%</div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="command-center__grid">
              {/* LEFT: Primary Incident */}
              <div className="command-center__incident-panel">
                {expandedId ? (
                  <div className="command-center__incident-expanded animate-fade-in" key={expandedId}>
                    <button className="command-center__collapse-btn" onClick={handleCollapse}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Collapse
                    </button>
                    <ExpandedIncident incidentId={expandedId} onNavigate={handleNavigate} />
                  </div>
                ) : (
                  <>
                    <IncidentHero incident={primaryIncident} onInvestigate={() => handleOpenIncident(primaryIncident?.id ?? 'PAY-2048')} />
                    {secondaryIncident && (
                      <IncidentSecondary incident={secondaryIncident} onOpen={() => handleOpenIncident(secondaryIncident.id)} />
                    )}
                  </>
                )}
              </div>

              {/* RIGHT: System Health + Activity */}
              <div className="command-center__sidebar">
                <SystemHealthPanel statuses={healthStatuses} />
                <AgentPipeline activities={activities} />
                {recentEvents.length > 0 && (
                  <RecentActivity events={recentEvents} />
                )}
              </div>
            </div>
          </div>
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
              </div>
              <div className="command-center__empty-preview">
                <div className="preview-card">
                  <span className="preview-card__label">Failure Rate</span>
                  <span className="preview-card__value text-metric">38.4%</span>
                </div>
                <div className="preview-card">
                  <span className="preview-card__label">Affected Txns</span>
                  <span className="preview-card__value text-metric">12,840</span>
                </div>
                <div className="preview-card">
                  <span className="preview-card__label">Baseline</span>
                  <span className="preview-card__value text-metric">2.3%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

/* ─── Hero Incident Card ─── */
function IncidentHero({ incident, onInvestigate }: { incident?: import('../store/types').Incident; onInvestigate: () => void }) {
  if (!incident) return null;
  return (
    <div className={`incident-hero ${incident.severity === 'critical' ? 'incident-hero--critical' : ''}`}>
      <div className="incident-hero__top">
        <div className="incident-hero__identity">
          <span className="incident-hero__id mono">{incident.id}</span>
          <Badge variant="severity" severity={incident.severity}>{incident.severity?.toUpperCase()}</Badge>
          <Badge variant="status" status={incident.status}>{statusLabel(incident.status)}</Badge>
        </div>
        <div className="incident-hero__cta">
          <Button variant="primary" size="lg" onClick={onInvestigate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Investigate Incident
          </Button>
        </div>
      </div>
      <h2 className="incident-hero__title">{incident.title}</h2>
      <p className="incident-hero__service mono">{incident.service}</p>
      <div className="incident-hero__metrics">
        <div className="hero-metric">
          <span className="hero-metric__label">Failure Rate</span>
          <span className="hero-metric__value danger">{incident.metrics?.paymentFailureRate?.toFixed(1) ?? 38.4}%</span>
          <span className="hero-metric__baseline">Baseline: 2.3%</span>
        </div>
        <div className="hero-metric">
          <span className="hero-metric__label">Affected Transactions</span>
          <span className="hero-metric__value">{incident.affectedCount.toLocaleString()}</span>
        </div>
        {incident.rootCause && (
          <div className="hero-metric hero-metric--root">
            <span className="hero-metric__label">Root Cause</span>
            <span className="hero-metric__value">{incident.rootCause}</span>
            <span className="hero-metric__confidence">
              {incident.rootCauseConfidence ? `${Math.round(incident.rootCauseConfidence * 100)}% confidence` : ''}
            </span>
          </div>
        )}
      </div>
      {incident.status !== 'RESOLVED' && incident.status !== 'ESCALATED' && incident.status !== 'BLOCKED' && (
        <div className="incident-hero__action">
          <span className="incident-hero__action-label">CURRENT STAGE</span>
          <span className="incident-hero__action-value mono">{incident.status}</span>
          <span className="incident-hero__action-hint">
            {incident.status === 'DETECTED' && 'Auto-detection triggered'}
            {incident.status === 'INVESTIGATING' && 'Evidence analysis in progress'}
            {incident.status === 'ROOT_CAUSE_IDENTIFIED' && 'Root cause identified — awaiting decision'}
            {incident.status === 'ACTION_PROPOSED' && 'Remediation recommended'}
            {incident.status === 'RISK_CHECK' && 'Policy evaluation in progress'}
            {incident.status === 'EXECUTING' && 'Action agent executing remediation'}
            {incident.status === 'VERIFYING' && 'Independent verification running'}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Secondary Incident Card ─── */
function IncidentSecondary({ incident, onOpen }: { incident: import('../store/types').Incident; onOpen: () => void }) {
  return (
    <div className="incident-secondary" onClick={onOpen} role="button" tabIndex={0}>
      <div className="incident-secondary__header">
        <span className="incident-secondary__id mono">{incident.id}</span>
        <Badge variant="severity" severity={incident.severity}>{incident.severity?.toUpperCase()}</Badge>
        <Badge variant="status" status={incident.status}>{statusLabel(incident.status)}</Badge>
      </div>
      <div className="incident-secondary__body">
        <span className="incident-secondary__title">{incident.title}</span>
        <span className="incident-secondary__service mono">{incident.service}</span>
      </div>
      <div className="incident-secondary__metrics">
        <div className="mini-metric">
          <span className="mini-metric__label">Amount</span>
          <span className="mini-metric__value warning">${incident.metrics?.disputedAmount?.toLocaleString() ?? '48,700'}</span>
        </div>
        <div className="mini-metric">
          <span className="mini-metric__label">Transactions</span>
          <span className="mini-metric__value">{incident.affectedCount.toLocaleString()}</span>
        </div>
      </div>
      <div className="incident-secondary__cta">
        <span className="incident-secondary__cta-label">Human approval required</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Expanded Incident Detail ─── */
function ExpandedIncident({ incidentId, onNavigate }: { incidentId: string; onNavigate: (s: Screen) => void }) {
  const { state } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === incidentId);
  const evidence = state.evidence.filter((e) => e.incidentId === incidentId);
  const execution = state.executions.find((e) => e.incidentId === incidentId);
  const proposal = state.proposals.find((p) => p.incidentId === incidentId);
  const policyDecision = state.policyDecisions.find((p) => p.incidentId === incidentId);

  if (!incident) return null;

  return (
    <div className="expanded-incident">
      <div className="expanded-incident__metrics-grid">
        {Object.entries(incident.metrics || {}).map(([key, value]) => (
          <div key={key} className="expanded-metric">
            <span className="expanded-metric__label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
            <span className="expanded-metric__value text-metric">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
          </div>
        ))}
      </div>
      {evidence.length > 0 && (
        <div className="expanded-incident__section">
          <SectionHeader label="EVIDENCE" count={`${evidence.length} sources`} />
          <div className="evidence-list">
            {evidence.map((ev) => (
              <div key={ev.id} className="evidence-item">
                <span className="evidence-item__id mono">{ev.id}</span>
                <span className={`evidence-item__badge ${ev.supportsRootCause ? 'evidence-item__badge--root' : 'evidence-item__badge--context'}`}>
                  {ev.supportsRootCause ? 'Root cause' : 'Context'}
                </span>
                <span className="evidence-item__label">{ev.label}</span>
                <span className="evidence-item__value mono">{String(ev.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {proposal && (
        <div className="expanded-incident__section">
          <SectionHeader label="PROPOSED ACTION" />
          <div className="proposal-card">
            <div className="proposal-card__header">
              <span className="proposal-card__action">{proposal.action}</span>
              <Badge variant="policy" policy={policyDecision?.authorization}>{policyDecision?.authorization}</Badge>
            </div>
            <p className="proposal-card__reason">{proposal.reason}</p>
            <div className="proposal-card__meta">
              <div className="proposal-card__meta-item"><span className="proposal-card__meta-label">Risk</span><span className={`proposal-card__meta-value proposal-card__meta-value--${proposal.risk}`}>{proposal.risk.toUpperCase()}</span></div>
              <div className="proposal-card__meta-item"><span className="proposal-card__meta-label">Reversible</span><span className="proposal-card__meta-value">{proposal.reversible ? 'Yes' : 'No'}</span></div>
              <div className="proposal-card__meta-item"><span className="proposal-card__meta-label">Confidence</span><span className="proposal-card__meta-value text-metric">{(proposal.confidence * 100).toFixed(0)}%</span></div>
              <div className="proposal-card__meta-item"><span className="proposal-card__meta-label">Est. recovery</span><span className="proposal-card__meta-value text-metric">{proposal.estimatedRecoveryMinutes} min</span></div>
            </div>
          </div>
        </div>
      )}
      {execution && (
        <div className="expanded-incident__section">
          <SectionHeader label="EXECUTION" />
          <div className="execution-summary">
            <div className="execution-summary__row"><span className="execution-summary__label">Tool</span><span className="execution-summary__value mono">{execution.tool}</span></div>
            <div className="execution-summary__row"><span className="execution-summary__label">Status</span><Badge variant="status" status={execution.status}>{execution.status}</Badge></div>
          </div>
        </div>
      )}
      <div className="expanded-incident__actions">
        <Button variant="primary" size="sm" onClick={() => onNavigate('investigation')}>Continue Investigation</Button>
        <Button variant="ghost" size="sm" onClick={() => onNavigate('command-center')}>Back</Button>
      </div>
    </div>
  );
}

/* ─── System Health Panel ─── */
function SystemHealthPanel({ statuses }: { statuses: Array<{ name: string; status: 'healthy' | 'degraded' | 'critical'; detail: string }> }) {
  return (
    <div className="health-panel">
      <SectionHeader label="SYSTEM HEALTH" />
      <div className="health-grid">
        {statuses.map((s) => (
          <div key={s.name} className={`health-item health-item--${s.status}`}>
            <span className="health-item__dot" />
            <span className="health-item__name">{s.name}</span>
            <span className="health-item__status">{s.status.toUpperCase()}</span>
            <span className="health-item__detail mono">{s.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Agent Pipeline Panel ─── */
function AgentPipeline({ activities }: { activities: AgentActivity[] }) {
  const agents = [
    { key: 'DetectionAgent', label: 'Detect' },
    { key: 'InvestigationAgent', label: 'Investigate' },
    { key: 'DecisionAgent', label: 'Decide' },
    { key: 'PolicyEngine', label: 'Policy' },
    { key: 'ActionAgent', label: 'Act' },
    { key: 'VerificationAgent', label: 'Verify' },
  ];

  const getStatus = (agentKey: string) => {
    const a = activities.find((act) => act.agent === agentKey);
    return a?.status ?? 'pending';
  };

  return (
    <div className="agent-pipeline">
      <SectionHeader label="AGENT PIPELINE" />
      <div className="pipeline-list">
        {agents.map(({ key, label }) => {
          const status = getStatus(key);
          const def = AGENT_DEFS[key];
          return (
            <div key={key} className={`pipeline-item pipeline-item--${status}`}>
              <span className="pipeline-item__icon" style={{ background: def?.color ?? 'var(--text-muted)' }}>{def?.icon ?? '●'}</span>
              <span className="pipeline-item__label">{label}</span>
              <span className="pipeline-item__status">
                {status === 'completed' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {status === 'in_progress' && <span className="pipeline-dot pipeline-dot--active" />}
                {status === 'pending' && <span className="pipeline-dot pipeline-dot--pending" />}
                {status === 'failed' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Recent Activity Panel ─── */
function RecentActivity({ events }: { events: Array<{ id: string; time: string; agent: string; message: string }> }) {
  return (
    <div className="activity-panel">
      <SectionHeader label="RECENT ACTIVITY" />
      <div className="activity-list">
        {events.map((event) => (
          <div key={event.id} className="activity-item">
            <span className="activity-item__time mono">{event.time}</span>
            <span className="activity-item__agent">{event.agent}</span>
            <span className="activity-item__message">{event.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
