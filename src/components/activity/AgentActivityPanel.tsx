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

  return (
    <div className="agent-panel">
      <div className="agent-panel__header">
        <div className="agent-panel__title-row">
          <span className="agent-panel__title">RESOLVE ACTIVITY</span>
          {!compact && (
            <div className="agent-panel__live">
              <span className="agent-panel__live-dot" />
              <span className="agent-panel__live-text">LIVE</span>
            </div>
          )}
        </div>
      </div>
      <div className="agent-panel__list">
        {enriched.length === 0 && (
          <div className="agent-panel__empty">No agent activity yet.</div>
        )}
        {enriched.map((activity, idx) => (
          <div
            key={idx}
            className={`agent-panel__item agent-panel__item--${activity.status} animate-fade-in-up`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <span className="agent-panel__icon" style={{ background: activity.color }}>
              {activity.icon}
            </span>
            <div className="agent-panel__body">
              <div className="agent-panel__agent">{activity.agent}</div>
              <div className="agent-panel__action">{activity.action}</div>
              {activity.detail && <div className="agent-panel__detail">{activity.detail}</div>}
              <div className="agent-panel__time mono">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <span className={`agent-panel__status agent-panel__status--${activity.status}`}>
              {activity.status === 'completed' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {activity.status === 'in_progress' && <span className="agent-panel__status-dot agent-panel__status-dot--active" />}
              {activity.status === 'pending' && <span className="agent-panel__status-dot agent-panel__status-dot--pending" />}
              {activity.status === 'failed' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
