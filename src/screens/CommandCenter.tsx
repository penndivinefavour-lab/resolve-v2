import { useCallback, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { statusLabel } from '../data/demoScenarios';
import type { AgentActivity, Screen } from '../store/types';
import { AGENT_DEFS } from '../data/demoScenarios';
import { SectionHeader } from '../components/layout/MainLayout';

export function CommandCenter() {
  const { state, dispatch } = useRESOLVE();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleLaunchDemo = useCallback(() => dispatch({ type: 'START_DEMO' }), [dispatch]);
  const handleOpenIncident = useCallback((incidentId: string) => {
    setExpandedId(incidentId);
    dispatch({ type: 'OPEN_INCIDENT', incidentId });
  }, [dispatch]);
  const handleCollapse = useCallback(() => setExpandedId(null), []);
  const handleNavigate = useCallback((screen: Screen) => dispatch({ type: 'NAVIGATE', screen }), [dispatch]);

  const primary = state.incidents[0];
  const secondary = state.incidents[1];
  const isDemo = state.incidents.length > 0;
  const m = state.commandMetrics;
  const recentEvents = state.audit.slice(-5).map((a) => ({
    id: a.id, time: new Date(a.timestamp).toLocaleTimeString(),
    agent: a.agent ?? 'System', message: a.action.replace(/_/g, ' '),
  }));

  const activities: AgentActivity[] = isDemo ? [
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Evidence analyzed', timestamp: new Date().toISOString(), status: 'completed', detail: '6 sources · 94% confidence' },
    { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: ['VERIFYING','EXECUTING'].includes(primary?.status ?? '') ? 'in_progress' as const : 'completed' as const, detail: 'rollback_gateway_config' },
    { agent: 'PolicyEngine', action: 'Policy evaluation', timestamp: new Date().toISOString(), status: primary?.status === 'EXECUTING' ? 'completed' as const : 'pending' as const, detail: '' },
    { agent: 'ActionAgent', action: 'Executing remediation', timestamp: new Date().toISOString(), status: ['VERIFYING','RESOLVED'].includes(primary?.status ?? '') ? 'completed' as const : primary?.status === 'EXECUTING' ? 'in_progress' as const : 'pending' as const, detail: '' },
    { agent: 'VerificationAgent', action: 'Verifying recovery', timestamp: new Date().toISOString(), status: primary?.status === 'RESOLVED' ? 'completed' as const : primary?.status === 'VERIFYING' ? 'in_progress' as const : 'pending' as const, detail: primary?.status === 'VERIFYING' ? '38.4% → 2.3%' : '' },
  ] : [];

  const healthStatuses = [
    { name: 'Gateway A', status: primary?.status === 'RESOLVED' ? 'healthy' as const : 'degraded' as const, detail: primary?.service ?? '—' },
    { name: 'Gateway B', status: 'healthy' as const, detail: 'Normal' },
    { name: 'Payment API', status: primary?.status === 'RESOLVED' ? 'healthy' as const : 'degraded' as const, detail: primary ? 'Elevated failure rate' : '—' },
    { name: 'Transaction Engine', status: 'healthy' as const, detail: 'Operational' },
  ];

  return (
    <div className="command-center">
      {/* Metrics Strip */}
      <div className="command-center__metrics">
        {[
          { label: 'Active Incidents', value: m.activeIncidents, cls: '' },
          { label: 'Critical', value: m.critical, cls: '--danger' },
          { label: 'Awaiting Approval', value: m.awaitingApproval, cls: '--warning' },
          { label: 'Resolved Today', value: m.automatedResolutions, cls: '--success' },
          { label: 'Health', value: `${m.operationalHealth}%`, cls: primary?.status === 'RESOLVED' ? '--success' : '--warning' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`metric-strip-card${cls ? ` metric-strip-card${cls}` : ''}`}>
            <span className="metric-strip-card__label">{label}</span>
            <span className="metric-strip-card__value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
          </div>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left: Incident Panel */}
        <div className="command-center__incident-panel">
          {expandedId ? (
            <div className="animate-fade-in" key={expandedId}>
              <button className="btn btn-ghost btn-sm" onClick={handleCollapse}>← Back</button>
              <ExpandedIncident incidentId={expandedId} onNavigate={handleNavigate} />
            </div>
          ) : (
            <>
              {primary && <IncidentHero incident={primary} onInvestigate={() => handleOpenIncident(primary.id)} />}
              {secondary && <IncidentSecondary incident={secondary} onOpen={() => handleOpenIncident(secondary.id)} />}
            </>
          )}
        </div>

        {/* Right: Sidebar Panels */}
        <div className="right-panels">
          <SystemHealthPanel statuses={healthStatuses} />
          <AgentPipeline activities={activities} />
          {recentEvents.length > 0 && <RecentActivity events={recentEvents} />}
        </div>
      </div>

      {/* Empty State */}
      {!isDemo && (
        <div className="command-center__empty animate-fade-in">
          <div className="empty-content">
            <div className="empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--border-emphasis)" strokeWidth="1.5" />
                <path d="M12 6v6l4 2" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="empty-title">No active incidents</h2>
            <p className="empty-text">RESOLVE is monitoring your operations. Launch a demo to see autonomous incident response in action.</p>
            <Button variant="primary" size="lg" onClick={handleLaunchDemo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Launch Demo
            </Button>
            <div className="empty-preview">
              {[
                { label: 'Failure Rate', value: '38.4%' },
                { label: 'Affected Txns', value: '12,840' },
                { label: 'Baseline', value: '2.3%' },
              ].map(({ label, value }) => (
                <div key={label} className="preview-card">
                  <span className="preview-card__label">{label}</span>
                  <span className="preview-card__value text-metric">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-Components ─── */
function IncidentHero({ incident, onInvestigate }: { incident: import('../store/types').Incident; onInvestigate: () => void }) {
  return (
    <div className={`incident-hero ${incident.severity === 'critical' ? 'incident-hero--critical' : ''}`}>
      <div className="incident-hero__header">
        <div className="incident-hero__identity">
          <span className="incident-hero__id mono">{incident.id}</span>
          <Badge variant="severity" severity={incident.severity}>{incident.severity?.toUpperCase()}</Badge>
          <Badge variant="status" status={incident.status}>{statusLabel(incident.status)}</Badge>
        </div>
        {incident.status !== 'RESOLVED' && incident.status !== 'ESCALATED' && incident.status !== 'BLOCKED' && (
          <Button variant="primary" size="lg" onClick={onInvestigate}>
            Investigate Incident
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Button>
        )}
      </div>
      <h2 className="incident-hero__title">{incident.title}</h2>
      <p className="incident-hero__service mono">{incident.service}</p>
      <div className="incident-hero__metrics">
        <div className="hero-metric-cell">
          <span className="hero-metric-cell__label">Failure Rate</span>
          <span className="hero-metric-cell__value hero-metric-cell__value--danger">{incident.metrics?.paymentFailureRate?.toFixed(1) ?? 38.4}%</span>
          <span className="hero-metric-cell__detail">Baseline: 2.3%</span>
        </div>
        <div className="hero-metric-cell">
          <span className="hero-metric-cell__label">Affected Transactions</span>
          <span className="hero-metric-cell__value">{incident.affectedCount.toLocaleString()}</span>
          <span className="hero-metric-cell__detail">last 24h</span>
        </div>
        <div className="hero-metric-cell">
          <span className="hero-metric-cell__label">Gateway Timeout</span>
          <span className="hero-metric-cell__value hero-metric-cell__value--danger">{incident.metrics?.gatewayTimeoutRate?.toFixed(1) ?? 12.1}%</span>
          <span className="hero-metric-cell__detail">Baseline: 0.3%</span>
        </div>
      </div>
      {incident.rootCause && (
        <div className="incident-hero__root-cause">
          <span className="incident-hero__rc-label">Root Cause</span>
          <span className="incident-hero__rc-value">{incident.rootCause}</span>
          {incident.rootCauseConfidence && (
            <span className="incident-hero__rc-confidence">{Math.round(incident.rootCauseConfidence * 100)}% confidence</span>
          )}
        </div>
      )}
      <div className="incident-hero__action">
        <div className="incident-hero__stage">
          <span className="incident-hero__stage-label">Current Stage</span>
          <span className="incident-hero__stage-value mono">{incident.status.replace(/_/g, ' ')}</span>
        </div>
        {incident.status === 'DETECTED' && <span className="incident-hero__stage-hint">Auto-detection triggered</span>}
        {incident.status === 'INVESTIGATING' && <span className="incident-hero__stage-hint">Analyzing evidence sources</span>}
        {incident.status === 'ROOT_CAUSE_IDENTIFIED' && <span className="incident-hero__stage-hint">Root cause identified — awaiting decision</span>}
        {incident.status === 'ACTION_PROPOSED' && <span className="incident-hero__stage-hint">Remediation recommended</span>}
        {incident.status === 'RISK_CHECK' && <span className="incident-hero__stage-hint">Policy evaluation in progress</span>}
        {incident.status === 'EXECUTING' && <span className="incident-hero__stage-hint">Action agent executing remediation</span>}
        {incident.status === 'VERIFYING' && <span className="incident-hero__stage-hint">Independent verification running</span>}
      </div>
    </div>
  );
}

function IncidentSecondary({ incident, onOpen }: { incident: import('../store/types').Incident; onOpen: () => void }) {
  return (
    <div className="incident-secondary" onClick={onOpen} role="button" tabIndex={0}>
      <div className="incident-secondary__header">
        <span className="incident-hero__id mono">{incident.id}</span>
        <Badge variant="severity" severity={incident.severity}>{incident.severity?.toUpperCase()}</Badge>
        <Badge variant="status" status={incident.status}>{statusLabel(incident.status)}</Badge>
      </div>
      <span className="incident-secondary__title">{incident.title}</span>
      <span className="incident-secondary__service mono">{incident.service}</span>
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
        <span className="incident-secondary__cta-label">● Human approval required</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
}

function ExpandedIncident({ incidentId, onNavigate }: { incidentId: string; onNavigate: (s: Screen) => void }) {
  const { state } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === incidentId);
  const evidence = state.evidence.filter((e) => e.incidentId === incidentId);
  const proposal = state.proposals.find((p) => p.incidentId === incidentId);
  const policyDecision = state.policyDecisions.find((p) => p.incidentId === incidentId);

  if (!incident) return null;

  return (
    <div className="card">
      <SectionHeader label={`Incident Details — ${incident.id}`} />
      {evidence.length > 0 && (
        <div className="section" style={{ marginTop: 'var(--space-4)' }}>
          <SectionHeader label="EVIDENCE" count={`${evidence.length} sources`} />
          <div className="evidence-grid">
            {evidence.map((ev) => (
              <div key={ev.id} className={`evidence-card ${ev.supportsRootCause ? 'evidence-card--root' : ''}`}>
                <span className="evidence-card__category">{ev.category}</span>
                <span className="evidence-card__label">{ev.label}</span>
                <span className="evidence-card__value mono">{String(ev.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {proposal && (
        <div className="section" style={{ marginTop: 'var(--space-4)' }}>
          <SectionHeader label="PROPOSED ACTION" />
          <div className="proposal-card">
            <div className="proposal-card__header">
              <span className="proposal-card__action mono">{proposal.action}</span>
              <Badge variant="policy" policy={policyDecision?.authorization}>{policyDecision?.authorization}</Badge>
            </div>
            <p className="proposal-card__reason">{proposal.reason}</p>
            <div className="proposal-card__meta">
              {[
                { label: 'Risk', value: proposal.risk.toUpperCase(), cls: `proposal-card__meta-value--${proposal.risk}` },
                { label: 'Reversible', value: proposal.reversible ? 'Yes' : 'No' },
                { label: 'Confidence', value: `${Math.round(proposal.confidence * 100)}%` },
                { label: 'Est. Recovery', value: `${proposal.estimatedRecoveryMinutes} min` },
              ].map(({ label, value, cls }) => (
                <div key={label} className="proposal-card__meta-item">
                  <span className="proposal-card__meta-label">{label}</span>
                  <span className={`proposal-card__meta-value ${cls ?? ''}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
        <Button variant="primary" size="sm" onClick={() => onNavigate('investigation')}>Continue Investigation</Button>
        <Button variant="ghost" size="sm" onClick={() => onNavigate('command-center')}>Back</Button>
      </div>
    </div>
  );
}

function SystemHealthPanel({ statuses }: { statuses: Array<{ name: string; status: 'healthy' | 'degraded' | 'critical'; detail: string }> }) {
  return (
    <div className="health-panel">
      <div className="panel-header"><span className="panel-title">System Health</span></div>
      <div className="health-grid">
        {statuses.map((s) => (
          <div key={s.name} className={`health-item health-item--${s.status}`}>
            <span className="health-dot" />
            <span className="health-name">{s.name}</span>
            <span className="health-status">{s.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentPipeline({ activities }: { activities: AgentActivity[] }) {
  const agents = [
    { key: 'DetectionAgent', label: 'Detect' },
    { key: 'InvestigationAgent', label: 'Investigate' },
    { key: 'DecisionAgent', label: 'Decide' },
    { key: 'PolicyEngine', label: 'Policy' },
    { key: 'ActionAgent', label: 'Act' },
    { key: 'VerificationAgent', label: 'Verify' },
  ];

  const getStatus = (key: string) => activities.find((a) => a.agent === key)?.status ?? 'pending';

  return (
    <div className="agent-pipeline">
      <div className="panel-header"><span className="panel-title">Agent Pipeline</span></div>
      <div className="pipeline-list">
        {agents.map(({ key, label }) => {
          const status = getStatus(key);
          const def = AGENT_DEFS[key];
          return (
            <div key={key} className={`pipeline-item pipeline-item--${status}`}>
              <span className="pipeline-icon" style={{ background: def?.color ?? 'var(--text-muted)' }}>{def?.icon ?? '●'}</span>
              <span className="pipeline-label">{label}</span>
              <span className="pipeline-status">
                {status === 'completed' && <span style={{ color: 'var(--success)' }}>✓</span>}
                {status === 'in_progress' && <span className="pipeline-dot pipeline-dot--active" />}
                {status === 'pending' && <span className="pipeline-dot pipeline-dot--pending" />}
                {status === 'failed' && <span style={{ color: 'var(--danger)' }}>✗</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivity({ events }: { events: Array<{ id: string; time: string; agent: string; message: string }> }) {
  return (
    <div className="activity-panel">
      <div className="panel-header"><span className="panel-title">Recent Activity</span></div>
      <div className="activity-list">
        {events.map((e) => (
          <div key={e.id} className="activity-row">
            <span className="activity-time mono">{e.time}</span>
            <span className="activity-agent">{e.agent}</span>
            <span className="activity-msg">{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
