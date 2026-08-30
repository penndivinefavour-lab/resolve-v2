
interface MetricRowProps {
  label: string;
  value: string | number;
  accent?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricRow({ label, value, accent, icon, trend }: MetricRowProps) {
  return (
    <div className="metric-row">
      {icon && <span className="metric-row__icon">{icon}</span>}
      <div className="metric-row__label">{label}</div>
      <div className={`metric-row__value mono ${accent ? `metric-row__value--accent metric-row__value--${accent}` : ''}`}>
        {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}
      </div>
      {trend && (
        <span className={`metric-row__trend metric-row__trend--${trend}`} aria-label={`Trend: ${trend}`}>
          {trend === 'up' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2V10M3 6L6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          {trend === 'down' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 10V2M3 6L6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          {trend === 'neutral' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        </span>
      )}
    </div>
  );
}

interface MetricValueProps {
  value: number | string;
  label: string;
  accent?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function MetricValue({ value, label, accent, size = 'md', trend, trendValue }: MetricValueProps) {
  const sizeClass = `metric-value--${size}`;
  return (
    <div className={`metric-value ${sizeClass}`}>
      <div className={`metric-value__number mono ${accent ? `metric-value__number--${accent}` : ''}`}>
        {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}
      </div>
      <div className="metric-value__label">{label}</div>
      {trend && (
        <div className={`metric-value__trend metric-value__trend--${trend}`}>
          <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, accent, icon, trend, trendValue, onClick }: StatCardProps) {
  return (
    <div
      className={`stat-card stat-card--${accent ?? 'neutral'} ${onClick ? 'stat-card--interactive' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card__header">
        {icon && <span className="stat-card__icon">{icon}</span>}
        <span className="stat-card__label">{label}</span>
      </div>
      <div className={`stat-card__value mono ${accent ? `stat-card__value--${accent}` : ''}`}>
        {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}
      </div>
      {trend && (
        <div className={`stat-card__trend stat-card__trend--${trend}`}>
          <span>{trend === 'up' ? '+' : trend === 'down' ? '−' : '→'}</span>
          {trendValue}
        </div>
      )}
    </div>
  );
}

interface MetricGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}

export function MetricGrid({ children, cols = 3 }: MetricGridProps) {
  return (
    <div className={`metric-grid metric-grid--${cols}`}>
      {children}
    </div>
  );
}

interface MetricTrendProps {
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
}

export function MetricTrend({ from, to, prefix = '', suffix = '' }: MetricTrendProps) {
  const diff = to - from;
  const isPositive = diff > 0;
  const isNeutral = diff === 0;
  const className = isNeutral ? 'metric-trend--neutral' : isPositive ? 'metric-trend--up' : 'metric-trend--down';

  return (
    <div className={`metric-trend ${className}`}>
      <span className="metric-trend__arrow">{isNeutral ? '→' : isPositive ? '↑' : '↓'}</span>
      <span className="metric-trend__value mono">
        {prefix}{(isNeutral ? 0 : Math.abs(diff)).toFixed(1)}{suffix}
      </span>
      <span className="metric-trend__label">
        {isNeutral ? 'unchanged' : isPositive ? 'improvement' : 'regression'}
      </span>
    </div>
  );
}
