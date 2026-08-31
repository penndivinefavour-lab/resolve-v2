import type { AgentActivity } from '../../store/types';
import { AGENT_DEFS } from '../../data/demoScenarios';

interface AgentActivityPanelProps {
  activities: AgentActivity[];
  compact?: boolean;
}

export function AgentActivityPanel({ activities, compact = false }: AgentActivityPanelProps) {
  const enriched = activities.map((a) => {
    const def = AGENT_DEFS[a.agent] ?? { color: '#6b7480', icon: '●' };
    return { ...a, color: def.color, icon: def.icon };
  });

  const currentAgent = enriched.find((a) => a.status === 'in_progress') ?? enriched[enriched.length - 1];

  return (
    <div className="agent-panel">
      <div className="agent-panel__header">
        <div className="agent-panel__title-row">
          <span className="agent-panel__title">LIVE OPERATIONS</span>
          {!compact && (
            <div className="agent-panel__live">
              <span className="agent-panel__live-dot" />
              <span className="agent-panel__live-text">ONLINE</span>
            </div>
          )}
        </div>
      </div>

      {currentAgent && (
        <div className="agent-panel__current-agent">
          <span className="agent-panel__current-label">CURRENT AGENT</span>
          <div className="agent-panel__current-info">
            <span className="agent-panel__current-icon" style={{ background: currentAgent.color }}>
              {currentAgent.icon}
            </span>
            <span className="agent-panel__current-name">{currentAgent.agent}</span>
          </div>
          <span className="agent-panel__current-action">{currentAgent.action}</span>
        </div>
      )}

      <div className="agent-panel__list">
        {enriched.length === 0 && (
          <div className="agent-panel__empty">No agent activity yet.</div>
        )}
        {enriched.map((activity, idx) => (
          <div
            key={idx}
            className={`agent-panel__item ${activity.status === 'in_progress' ? 'agent-panel__item--active' : ''}`}
          >
            <span className="agent-panel__status-indicator">
              {activity.status === 'completed' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              {activity.status === 'in_progress' && <span className="agent-panel__dot agent-panel__dot--active" />}
              {activity.status === 'pending' && <span className="agent-panel__dot agent-panel__dot--pending" />}
              {activity.status === 'failed' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </span>
            <div className="agent-panel__content">
              <div className="agent-panel__meta">
                <span className="agent-panel__agent">{activity.agent}</span>
                <span className="agent-panel__time mono">{new Date(activity.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="agent-panel__action">{activity.action}</div>
              {activity.detail && <div className="agent-panel__detail">{activity.detail}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
