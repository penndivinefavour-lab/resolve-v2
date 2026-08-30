import type { AgentActivity } from '../../store/types';
import { AGENT_DEFS, ACTIVITY_STEPS } from '../../data/demoScenarios';

interface EventItem {
  id: string;
  agent: string;
  message: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

interface AgentActivityListProps {
  activities: AgentActivity[];
  events?: EventItem[];
}

export function AgentActivityList({ activities, events }: AgentActivityListProps) {
  const enriched = activities.map((a) => {
    const def = AGENT_DEFS[a.agent] ?? { color: '#6b7480', icon: '●' };
    return { ...a, color: def.color, icon: def.icon };
  });

  const eventItems = events ?? [];

  const currentStepIndex = enriched.findIndex((a) => a.status === 'in_progress');

  return (
    <div className="agent-activity-list">
      <div className="agent-activity-list__header">
        <div className="agent-activity-list__title-row">
          <span className="agent-activity-list__title">RESOLVE ACTIVITY</span>
          <div className="agent-activity-list__live">
            <span className="agent-activity-list__live-dot" />
            <span className="agent-activity-list__live-text">LIVE</span>
          </div>
        </div>
        <div className="agent-activity-list__progress">
          {ACTIVITY_STEPS.map((step, idx) => (
            <div
              key={step.agent}
              className={`agent-activity-list__progress-dot ${idx <= currentStepIndex ? 'agent-activity-list__progress-dot--active' : ''}`}
              title={step.label}
            />
          ))}
        </div>
      </div>

      {currentStepIndex >= 0 && (
        <div className="agent-activity-list__current-summary">
          <span className="agent-activity-list__current-step-label">
            {ACTIVITY_STEPS[currentStepIndex].agent}
          </span>
          <span className="agent-activity-list__current-step-status">
            {ACTIVITY_STEPS[currentStepIndex].label}
          </span>
        </div>
      )}

      <div className="agent-activity-list__group">
        {enriched.length === 0 && (
          <div className="agent-activity-list__empty">No agent activity yet.</div>
        )}
        {enriched.map((activity, idx) => (
          <div
            key={idx}
            className={`agent-activity-list__item agent-activity-list__item--${activity.status} animate-fade-in-up`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <span className="agent-activity-list__icon" style={{ background: activity.color }}>
              {activity.icon}
            </span>
            <div className="agent-activity-list__body">
              <div className="agent-activity-list__agent">{activity.agent}</div>
              <div className="agent-activity-list__action">{activity.action}</div>
              {activity.detail && <div className="agent-activity-list__detail mono">{activity.detail}</div>}
              <div className="agent-activity-list__time mono">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <span className={`agent-activity-list__status agent-activity-list__status--${activity.status}`}>
              {activity.status === 'completed' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {activity.status === 'in_progress' && <span className="agent-activity-list__status-dot agent-activity-list__status-dot--active" />}
              {activity.status === 'pending' && <span className="agent-activity-list__status-dot agent-activity-list__status-dot--pending" />}
              {activity.status === 'failed' && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </span>
          </div>
        ))}
      </div>

      {eventItems.length > 0 && (
        <div className="agent-activity-list__timeline">
          {eventItems.map((event, idx) => (
            <div
              key={event.id}
              className="agent-activity-list__event animate-slide-in-left"
              style={{ animationDelay: `${enriched.length * 80 + idx * 60}ms` }}
            >
              <div className="agent-activity-list__event-dot" />
              <div className="agent-activity-list__event-content">
                <div className="agent-activity-list__event-agent">{event.agent}</div>
                <div className="agent-activity-list__event-message">{event.message}</div>
                <div className="agent-activity-list__event-time mono">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
