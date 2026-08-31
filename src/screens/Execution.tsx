import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

interface ExecStep { id: string; agent: string; message: string; status: 'pending' | 'running' | 'done'; }

const DEFAULT_STEPS: ExecStep[] = [
  { id: '1', agent: 'ActionAgent', message: 'Validating target gateway...', status: 'pending' },
  { id: '2', agent: 'ActionAgent', message: 'Snapshotting current configuration...', status: 'pending' },
  { id: '3', agent: 'Gateway Connector', message: 'Applying rollback to Gateway A...', status: 'pending' },
  { id: '4', agent: 'Gateway Connector', message: 'Configuration restored to baseline...', status: 'pending' },
  { id: '5', agent: 'VerificationAgent', message: 'Checking gateway health metrics...', status: 'pending' },
];

export function Execution() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ExecStep[]>(DEFAULT_STEPS);
  const [currentStep, setCurrentStep] = useState(0);

  const handleBack = useCallback(() => dispatch({ type: 'NAVIGATE', screen: 'decision' }), [dispatch]);
  const handleDismiss = useCallback(() => dispatch({ type: 'NAVIGATE', screen: 'verification' }), [dispatch]);

  useEffect(() => {
    if (state.activeScreen !== 'execution' || isComplete || !incident) return;
    setIsRunning(true);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < DEFAULT_STEPS.length) {
          setSteps((s) => s.map((step, i) => i === next ? { ...step, status: 'running' as const } : i < next ? { ...step, status: 'done' as const } : step));
        }
        return next;
      });
      setProgress((p) => Math.min(100, p + 20));
    }, 400);

    const timeout = setTimeout(() => {
      clearInterval(stepInterval);
      setIsRunning(false);
      setIsComplete(true);
      setSteps((s) => s.map((step) => ({ ...step, status: 'done' as const })));
      setProgress(100);
      addToast({ type: 'success', title: 'Remediation Complete', message: 'Gateway A timeout configuration rolled back to baseline' });
      dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'verification' });
    }, 2200);

    return () => { clearTimeout(timeout); clearInterval(stepInterval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeScreen, isComplete, incident?.id, dispatch, addToast]);

  if (!incident) return <div>No incident data.</div>;

  const runningStep = steps[currentStep];

  return (
    <div className="execution-view animate-fade-in">
      <div className="investigation-header">
        <div>
          <h2 className="investigation-title">Execution — {incident.id}</h2>
          <p className="investigation-subtitle mono">{incident.title} · Live execution timeline</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Badge variant="accent">Tool: rollback_gateway_config</Badge>
          <Badge variant="success">Authorization: AUTONOMOUS</Badge>
        </div>
      </div>

      <div className="execution-content">
        {/* Left: Progress */}
        <div>
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Progress</span>
              <span className="progress-pct mono">{progress}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            {isRunning && runningStep && (
              <p className="progress-detail">
                <span className="progress-agent">{runningStep.agent}</span>
                {' '}— {runningStep.message}
              </p>
            )}
            {!isRunning && isComplete && (
              <p className="progress-detail" style={{ color: 'var(--success)' }}>✓ Execution complete</p>
            )}
          </div>

          {/* Timeline */}
          <div className="timeline-card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="panel-header"><span className="panel-title">Execution Timeline</span></div>
            <div className="timeline-list">
              {[
                { agent: 'PolicyEngine', msg: 'Authorization verified', done: true },
                { agent: 'ActionAgent', msg: 'Preparing rollback', done: progress >= 20 },
                { agent: 'Gateway Connector', msg: 'Applying rollback', done: progress >= 60 },
                { agent: 'Gateway Connector', msg: 'Configuration restored', done: progress >= 80 },
                { agent: 'VerificationAgent', msg: 'Health check pending', done: false },
              ].map(({ agent, msg, done }, i) => (
                <div key={i} className={`timeline-item ${done ? 'timeline-item--done' : !isRunning && !isComplete ? 'timeline-item--active' : 'timeline-item--pending'}`}>
                  <span className="timeline-icon">{done ? '✓' : !isRunning && !isComplete ? '●' : '○'}</span>
                  <span className="timeline-agent">{agent}</span>
                  <span className="timeline-msg">{msg}</span>
                </div>
              ))}
            </div>
          </div>

          {isComplete && (
            <div className="completed-box" style={{ marginTop: 'var(--space-4)' }}>
              <span className="completed-box__title">REMEDIATION COMPLETE</span>
              <span className="completed-box__subtitle">Gateway A timeout configuration rolled back to last known-good state.</span>
              <Button variant="primary" onClick={handleDismiss} style={{ marginTop: 'var(--space-4)' }}>Continue to Verification →</Button>
            </div>
          )}

          {!isComplete && (
            <div className="card" style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className="execution__status-dot animate-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{isRunning ? 'Executing...' : 'Ready to execute'}</span>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="execution-sidebar">
          <div className="card">
            <div className="panel-header"><span className="panel-title">Execution Summary</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { label: 'Tool', value: 'rollback_gateway_config', mono: true },
                { label: 'Risk', value: 'MEDIUM' },
                { label: 'Reversible', value: 'Yes' },
                { label: 'Status', value: isComplete ? 'SUCCESS' : isRunning ? 'EXECUTING' : 'PENDING' },
              ].map(({ label, value, mono }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--border-default)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</span>
                  <span className={mono ? 'mono' : ''} style={{ fontSize: 'var(--text-sm)', color: mono ? 'var(--accent)' : value === 'SUCCESS' ? 'var(--success)' : value === 'EXECUTING' ? 'var(--warning)' : 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" onClick={handleBack}>Back to Decision</Button>
        </div>
      </div>
    </div>
  );
}
