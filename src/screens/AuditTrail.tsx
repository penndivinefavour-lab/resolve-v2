import { useCallback, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { AGENT_DEFS } from '../data/demoScenarios';
import type { AuditEvent } from '../store/types';

type FilterType = 'all' | 'incident' | 'policy' | 'execution';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'All Events',
  incident: 'Incident',
  policy: 'Policy',
  execution: 'Execution',
};

const INCENDENT_ACTIONS = ['incident_detected', 'investigation_started', 'root_cause_identified', 'escalated'];
const POLICY_ACTIONS = ['policy_evaluated', 'blocked', 'human_approval_requested', 'human_approved', 'human_rejected'];
const EXECUTION_ACTIONS = ['action_proposed', 'action_executed', 'verification_started', 'verification_passed', 'verification_failed', 'resolved'];

const actionIcon = (action: string): string => {
  if (action.includes('detect')) return '⚡';
  if (action.includes('investigat')) return '🔬';
  if (action.includes('propose') || action.includes('decide')) return '🧠';
  if (action.includes('policy') || action.includes('block') || action.includes('approval')) return '📋';
  if (action.includes('execut')) return '⚙️';
  if (action.includes('verif')) return '✅';
  if (action.includes('escalat')) return '🚨';
  if (action.includes('resolv')) return '✓';
  return '●';
};

const agentColor = (agent?: string): string => {
  const def = AGENT_DEFS[agent ?? ''] ?? { color: '#6b7480', icon: '●' };
  return def.color;
};

export function AuditTrail() {
  const { state, dispatch } = useRESOLVE();
  const [filter, setFilter] = useState<FilterType>('all');

  const handleBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'command-center' });
  }, [dispatch]);

  const filteredAudit: AuditEvent[] = state.audit.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'incident') return INCENDENT_ACTIONS.includes(a.action);
    if (filter === 'policy') return POLICY_ACTIONS.includes(a.action);
    if (filter === 'execution') return EXECUTION_ACTIONS.includes(a.action);
    return true;
  });

  return (
    <MainLayout
      title="Audit Trail"
      subtitle="Complete incident response log"
      onBack={handleBack}
      backLabel="Command Center"
    >
      <div className="audit-trail animate-fade-in">
        <div className="audit-trail__filters">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
            <button
              key={f}
              className={`audit-filter ${filter === f ? 'audit-filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
              <span className="audit-filter__count">
                {f === 'all' ? state.audit.length : filteredAudit.length}
              </span>
            </button>
          ))}
        </div>

        <div className="audit-trail__list">
          {filteredAudit.length === 0 ? (
            <div className="audit-empty">
              <p>No audit events recorded yet.</p>
              <Button variant="secondary" onClick={handleBack}>Back to Command Center</Button>
            </div>
          ) : (
            filteredAudit.map((event, idx) => (
              <div
                key={event.id}
                className="audit-event animate-fade-in"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="audit-event__time mono">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                <div className="audit-event__icon" style={{ color: agentColor(event.agent) }}>
                  {actionIcon(event.action)}
                </div>
                <div className="audit-event__body">
                  <div className="audit-event__header">
                    <span className="audit-event__agent">{event.agent ?? 'System'}</span>
                    <span className="audit-event__action">{event.action.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="audit-event__detail">
                    <span className="audit-event__incident mono">#{event.incidentId}</span>
                    {event.decision && <span className="audit-event__decision">{String(event.decision)}</span>}
                    {typeof event.metadata.severity === 'string' && event.metadata.severity && (
                      <span className="audit-event__meta">Severity: {event.metadata.severity}</span>
                    )}
                    {typeof event.metadata.amount === 'string' && event.metadata.amount && (
                      <span className="audit-event__meta">Amount: {event.metadata.amount}</span>
                    )}
                    {typeof event.metadata.recoveryMinutes === 'number' && event.metadata.recoveryMinutes && (
                      <span className="audit-event__meta">Recovery: {event.metadata.recoveryMinutes} min</span>
                    )}
                  </div>
                </div>
                <div className="audit-event__arrow">→</div>
              </div>
            ))
          )}
        </div>

        <div className="audit-trail__footer">
          <span className="audit-trail__total">{state.audit.length} total events</span>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            Back to Command Center
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
