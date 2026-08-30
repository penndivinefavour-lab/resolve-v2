
interface MetricCardProps {
  label: string;
  value: string | number;
  accent?: string;
  onClick?: () => void;
}

export function MetricCard({ label, value, accent, onClick }: MetricCardProps) {
  return (
    <div
      className={`metric-card ${onClick ? 'metric-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-card__label">{label}</div>
      <div className={`metric-card__value mono ${accent ? `metric-card__value--${accent}` : ''}`}>
        {typeof value === 'number' && value >= 1000 ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
