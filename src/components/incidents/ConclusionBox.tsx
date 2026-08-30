
interface ConclusionBoxProps {
  rootCause: string;
  confidence: number;
  evidenceCount: number;
}

export function ConclusionBox({ rootCause, confidence, evidenceCount }: ConclusionBoxProps) {
  return (
    <div className="conclusion-box animate-fade-in-up">
      <div className="conclusion-box__header">
        <span className="conclusion-box__title">Investigation Conclusion</span>
        <span className="badge badge-success">{evidenceCount} evidence sources</span>
      </div>
      <div className="conclusion-box__grid">
        <div className="conclusion-box__item">
          <div className="conclusion-box__label">Root cause</div>
          <div className="conclusion-box__value">{rootCause}</div>
        </div>
        <div className="conclusion-box__item">
          <div className="conclusion-box__label">Confidence</div>
          <div className="conclusion-box__value conclusion-box__value--high">{(confidence * 100).toFixed(0)}%</div>
        </div>
      </div>
      <div className="conclusion-box__insight">
        InvestigationAgent analyzed metric anomalies, configuration history, and cross-gateway health data to isolate Gateway A timeout configuration as the root cause with high confidence.
      </div>
    </div>
  );
}
