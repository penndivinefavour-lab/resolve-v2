
interface TimelineProps {
  steps: Array<{ timestamp: string; agent: string; message: string; status: 'info' | 'success' | 'error' }>;
  isRunning?: boolean;
}

export function Timeline({ steps, isRunning = false }: TimelineProps) {
  return (
    <div className="timeline animate-fade-in-up">
      <div className="timeline__header">
        <span className="timeline__title">Execution Timeline</span>
        {isRunning && <span className="badge badge-accent">LIVE</span>}
      </div>
      <div className="timeline__list">
        {steps.map((step, idx) => (
          <div key={idx} className="timeline__row">
            <span className="timeline__time mono">{new Date(step.timestamp).toLocaleTimeString()}</span>
            <span className="timeline__agent">{step.agent}</span>
            <span className={`timeline__message ${step.status === 'success' ? 'timeline__message--success' : ''}`}>
              {step.message}
            </span>
          </div>
        ))}
        {isRunning && (
          <div className="timeline__row timeline__row--running">
            <span className="timeline__time mono">{new Date().toLocaleTimeString()}</span>
            <span className="timeline__agent">VerificationAgent</span>
            <span className="timeline__message timeline__message--pending">Verifying outcome...</span>
          </div>
        )}
      </div>
    </div>
  );
}
