import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { PageHeader } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Timeline } from '../components/incidents/Timeline';
import { CompletedBox } from '../components/incidents/CompletedBox';
import { useToast } from '../components/ui/Toast';
import type { AgentActivity } from '../store/types';

interface ExecStep {
  id: string;
  agent: string;
  message: string;
  status: 'pending' | 'running' | 'done';
  icon: string;
}

const DEFAULT_STEPS: ExecStep[] = [
  { id: '1', agent: 'ActionAgent', message: 'Validating target gateway...', status: 'pending', icon: '✓' },
  { id: '2', agent: 'ActionAgent', message: 'Snapshotting current configuration...', status: 'pending', icon: '✓' },
  { id: '3', agent: 'Gateway Connector', message: 'Applying rollback to Gateway A...', status: 'pending', icon: '✓' },
  { id: '4', agent: 'Gateway Connector', message: 'Configuration restored to baseline...', status: 'pending', icon: '✓' },
  { id: '5', agent: 'VerificationAgent', message: 'Checking gateway health metrics...', status: 'pending', icon: '✓' },
];

export function Execution() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const execution = state.executions[0];
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ExecStep[]>(DEFAULT_STEPS);
  const [currentStep, setCurrentStep] = useState(0);

  const [activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout config (94%)' },
    { agent: 'DecisionAgent', action: 'Action proposed', timestamp: new Date().toISOString(), status: 'completed', detail: 'rollback_gateway_config' },
    { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: 'AUTONOMOUS · MEDIUM risk' },
    { agent: 'ActionAgent', action: 'Executing remediation', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'rollback_gateway_config' },
  ]);

  useEffect(() => {
    if (state.activeScreen !== 'execution' || isComplete || !incident) return;
    setIsRunning(true);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < DEFAULT_STEPS.length) {
          setSteps((s) => s.map((step, i) => i === next ? { ...step, status: 'running' as const } : i < next ? { ...step, status: 'done' as const } : step));
          setActivity((a) => [...a, { agent: DEFAULT_STEPS[next].agent, action: DEFAULT_STEPS[next].message, timestamp: new Date().toISOString(), status: 'in_progress', detail: '' }]);
        }
        return next;
      });
      setProgress((prev) => Math.min(100, prev + 20));
    }, 400);

    const timeout = setTimeout(() => {
      clearInterval(stepInterval);
      setIsRunning(false);
      setIsComplete(true);
      setSteps((s) => s.map((step) => ({ ...step, status: 'done' as const })));
      setProgress(100);
      setActivity((prev) => [
        ...prev,
        { agent: 'ActionAgent', action: 'Remediation executed', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout configuration rolled back' },
        { agent: 'VerificationAgent', action: 'Verification started', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Checking recovery metrics' },
      ]);
      addToast({ type: 'success', title: 'Remediation Complete', message: 'Gateway A timeout configuration rolled back to baseline' });
      dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'verification' });
    }, 2200);

    return () => {
      clearTimeout(timeout);
      clearInterval(stepInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeScreen, isComplete, incident?.id, dispatch, addToast]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'decision' });
  }, [dispatch]);

  const handleDismiss = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'verification' });
  }, [dispatch]);

  if (!incident) {
    return (
      <MainLayout onBack={handleBack} backLabel="Decision">
        <p>No incident data.</p>
      </MainLayout>
    );
  }

  const runningStep = steps[currentStep];

  return (
    <MainLayout
      title={`Action Execution — ${incident.id}`}
      subtitle={`${incident.title} · Live execution timeline`}
      showWorkflow={true}
      incident={incident}
      onBack={handleBack}
      backLabel="Back"
    >
      <PageHeader
        title="Action Execution"
        subtitle={`${incident.id} — Rolling back Gateway A timeout configuration`}
      />

      <div className="execution animate-fade-in">
        <div className="execution__tool-badge">
          <Badge variant="accent">Tool: rollback_gateway_config</Badge>
          <Badge variant="success">Authorization: AUTONOMOUS</Badge>
        </div>

        {/* Progress Bar */}
        <div className="execution__progress-wrap">
          <div className="execution__progress-header">
            <span className="execution__progress-label">Progress</span>
            <span className="execution__progress-pct mono">{progress}%</span>
          </div>
          <div className="execution__progress-bar">
            <div className="execution__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          {isRunning && runningStep && (
            <p className="execution__progress-detail">
              <span className="execution__progress-agent">{runningStep.agent}</span>
              {' '}
              {runningStep.message}
            </p>
          )}
        </div>

        <Timeline
          steps={execution?.steps ?? [
            { timestamp: new Date().toISOString(), agent: 'ActionAgent', message: 'Preparing rollback.', status: 'info' },
            { timestamp: new Date().toISOString(), agent: 'PolicyEngine', message: 'Authorization verified.', status: 'success' },
            { timestamp: new Date().toISOString(), agent: 'Gateway Connector', message: 'Configuration rollback initiated.', status: 'info' },
          ]}
          isRunning={isRunning}
        />

        {isComplete && (
          <CompletedBox
            title="REMEDIATION COMPLETE"
            subtitle="Gateway A timeout configuration rolled back to last known-good state."
            onContinue={handleDismiss}
          />
        )}

        {!isComplete && (
          <div className="execution__status">
            <div className="execution__status-indicator">
              <span className="execution__status-dot animate-pulse" />
              <span className="execution__status-text">{isRunning ? 'Executing...' : 'Ready to execute'}</span>
            </div>
          </div>
        )}

        <div className="execution__activity">
          <AgentActivityList activities={activity} />
        </div>

        <div className="execution__actions">
          <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'decision' })}>
            Back to Decision
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
