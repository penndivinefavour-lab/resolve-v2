import type { Incident } from '../../store/types';
import { severityLabel, statusLabel } from '../../data/demoScenarios';

interface IncidentCardProps {
  incident: Incident;
  onClick?: () => void;
  selected?: boolean;
  expanded?: boolean;
}

export function IncidentCard({ incident, onClick, selected = false, expanded = false }: IncidentCardProps) {
  return (
    <div
      className={`incident-card incident-card--${incident.severity} ${selected ? 'incident-card--selected' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="incident-card__header">
        <span className="incident-card__id mono">{incident.id}</span>
        <span className={`badge badge--severity badge--${incident.severity}`}>
          {severityLabel(incident.severity)}
        </span>
        <span className={`badge badge--status badge--${incident.status.toLowerCase().replace(/_/g, '-')}`}>
          {statusLabel(incident.status)}
        </span>
      </div>

      <div className="incident-card__title">{incident.title}</div>
      <div className="incident-card__service mono">{incident.service}</div>

      <div className="incident-card__metrics">
        {Object.entries(incident.metrics).map(([key, value]) => {
          const formatted = formatMetricValue(key, value);
          if (!formatted) return null;
          return (
            <div key={key} className="incident-card__metric">
              <span className="incident-card__metric-label">{labelForMetric(key)}</span>
              <span className="incident-card__metric-value mono" style={{ color: metricColor(key) }}>
                {formatted}
              </span>
            </div>
          );
        })}
      </div>

      <div className="incident-card__footer">
        <span className="incident-card__affected mono">{incident.affectedCount.toLocaleString()} affected</span>
        {incident.status === 'DETECTED' && (
          <span className="incident-card__detected mono">
            Detected {new Date(incident.detectedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {expanded && incident.rootCause && (
        <div className="incident-card__expanded">
          <div className="incident-card__expanded-label">Root cause</div>
          <div className="incident-card__expanded-value">{incident.rootCause}</div>
          {incident.rootCauseConfidence && (
            <div className="incident-card__expanded-confidence">
              {(incident.rootCauseConfidence * 100).toFixed(0)}% confidence
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function formatMetricValue(key: string, value: number): string | null {
  if (key === 'paymentFailureRate' || key === 'gatewayTimeoutRate' || key === 'disputedAmount') {
    return `${value}%`;
  }
  if (key === 'disputedAmount') {
    return `$${value.toLocaleString()}`;
  }
  if (key === 'affectedTransactions' || key === 'transactionVolume' || key === 'affectedCount') {
    return value.toLocaleString();
  }
  return null;
}

export function labelForMetric(key: string): string {
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
  if (key === 'paymentFailureRate' && (typeof window === 'undefined' || true)) {
    return 'var(--critical)';
  }
  if (key === 'disputedAmount') return 'var(--warning)';
  return 'var(--text-primary)';
}
