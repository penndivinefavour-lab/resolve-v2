
interface BarChartProps {
  stages: Array<{ label: string; value: number; color: string }>;
  baseline: number;
}

export function BarChart({ stages, baseline }: BarChartProps) {
  const max = Math.max(...stages.map(s => s.value), baseline) * 1.15;

  return (
    <div className="bar-chart animate-fade-in-up">
      <div className="bar-chart__header">
        <span className="bar-chart__title">Recovery Progress</span>
        <span className="badge badge-accent">{baseline}% baseline</span>
      </div>
      <div className="bar-chart__grid">
        {stages.map((stage, idx) => (
          <div key={idx} className="bar-chart__stage">
            <div className="bar-chart__bar-wrapper">
              <div
                className="bar-chart__bar"
                style={{
                  height: `${Math.max(8, (stage.value / max) * 100)}%`,
                  background: stage.color,
                }}
              />
              {baseline > 0 && (
                <div
                  className="bar-chart__baseline-line"
                  style={{ bottom: `${(baseline / max) * 100}%` }}
                />
              )}
            </div>
            <span className="bar-chart__label mono">{stage.value}%</span>
            <span className="bar-chart__stage-label">{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
