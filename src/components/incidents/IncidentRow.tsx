import type { Incident } from '../../store/types';

interface IncidentRowProps {
  incident: Incident;
  onClick?: () => void;
  selected?: boolean;
  showMetrics?: boolean;
}

export function IncidentRow({ incident, onClick, selected = false, showMetrics = true }: IncidentRowProps) {
  const severityColorClass = `badge--severity badge--${incident.severity}`;
  const statusColorClass = `badge--status badge--${incident.status.toLowerCase().replace(/_/g, '-')}`;

  return (
    <div
      className={`incident-row incident-row--${incident.severity} ${selected ? 'incident-row--selected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="incident-row__main">
        <div className="incident-row__badges">
          <span className={severityColorClass}>{incident.severity}</span>
          <span className={statusColorClass}>{incident.status.replace(/_/g, ' ')}</span>
        </div>
        <div className="incident-row__id mono">{incident.id}</div>
      </div>

      <div className="incident-row__content">
        <div className="incident-row__title">{incident.title}</div>
        <div className="incident-row__service mono">{incident.service}</div>
      </div>

      {showMetrics && (
        <div className="incident-row__metrics">
          {Object.entries(incident.metrics).map(([key, value]) => {
            const formatted = formatMetric(key, value);
            if (!formatted) return null;
            return (
              <div key={key} className="incident-row__metric">
                <span className="incident-row__metric-value mono" style={{ color: metricColor(key) }}>
                  {formatted}
                </span>
                <span className="incident-row__metric-label">{labelForKey(key)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="incident-row__cta">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 5H11M7 3L11 7L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export function formatMetric(key: string, value: number): string | null {
  if (key === 'paymentFailureRate' || key === 'gatewayTimeoutRate') return `${value}%`;
  if (key === 'disputedAmount') return `$${value.toLocaleString()}`;
  if (key === 'affectedTransactions' || key === 'transactionVolume' || key === 'affectedCount') return value.toLocaleString();
  return null;
}

export function labelForKey(key: string): string {
  const map: Record<string, string> = {
    paymentFailureRate: 'Failure rate',
    gatewayTimeoutRate: 'Timeout rate',
    transactionVolume: 'Volume',
    affectedTransactions: 'Transactions',
    disputedAmount: 'Amount',
    affectedCount: 'Affected',
  };
  return map[key] ?? key;
}

export function metricColor(key: string): string {
  if (key === 'paymentFailureRate') return 'var(--critical)';
  if (key === 'disputedAmount') return 'var(--warning)';
  return 'var(--text-primary)';
}
