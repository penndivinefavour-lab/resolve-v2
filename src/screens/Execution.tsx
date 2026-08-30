import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { PageHeader } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Timeline } from '../components/incidents/Timeline';
import { CompletedBox } from '../components/incidents/CompletedBox';
import type { AgentActivity } from '../store/types';

export function Execution() {
  const { state, dispatch } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const execution = state.executions[0];
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const incidentId = incident?.id ?? null;

  const [activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout config (94%)' },
    { agent: 'DecisionAgent', action: 'Action proposed', timestamp: new Date().toISOString(), status: 'completed', detail: 'rollback_gateway_config' },
    { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: 'AUTONOMOUS · MEDIUM risk' },
    { agent: 'ActionAgent', action: 'Executing remediation', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'rollback_gateway_config' },
  ]);

  useEffect(() => {
    if (state.activeScreen !== 'execution' || isComplete) return;

    setIsRunning(true);

    const timeout = setTimeout(() => {
      setIsRunning(false);
      setIsComplete(true);
      setActivity((prev) => [
        ...prev,
        { agent: 'ActionAgent', action: 'Remediation executed', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout configuration rolled back' },
        { agent: 'VerificationAgent', action: 'Verification started', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Checking recovery metrics' },
      ]);

      if (incident) {
        dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'verification' });
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [state.activeScreen, isComplete, incidentId, dispatch]);

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
