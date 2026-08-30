import { useCallback, useEffect, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { PageHeader } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { EvidenceCard } from '../components/incidents/EvidenceCard';
import { ConclusionBox } from '../components/incidents/ConclusionBox';
import { ROOT_CAUSE, ROOT_CAUSE_CONFIDENCE } from '../data/demoIncidents';
import { getEvidenceForIncident } from '../data/demoScenarios';
import type { AgentActivity } from '../store/types';

export function Investigation() {
  const { state, dispatch } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const evidence = state.evidence.length > 0 ? state.evidence : getEvidenceForIncident(incident?.id ?? 'PAY-2048');

  const [activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048 · Payment Gateway Degradation' },
  ]);

  useEffect(() => {
    if (incident?.status === 'INVESTIGATING') {
      setActivity((prev) => [
        ...prev,
        { agent: 'InvestigationAgent', action: '6 evidence sources analyzed', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Correlating metrics, configs, and deployment history' },
      ]);
    }
    if (incident?.status === 'ROOT_CAUSE_IDENTIFIED') {
      setActivity((prev) => [
        ...prev.filter((a) => a.agent !== 'InvestigationAgent' || a.status !== 'in_progress'),
        { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: `${ROOT_CAUSE} · ${(ROOT_CAUSE_CONFIDENCE * 100).toFixed(0)}% confidence` },
        { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Analyzing proposed actions against policy' },
      ]);
    }
  }, [incident?.status]);

  const handleContinue = useCallback(() => {
    if (incident) {
      dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'decision' });
      setActivity((prev) => [
        ...prev,
        { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: `${ROOT_CAUSE} · ${(ROOT_CAUSE_CONFIDENCE * 100).toFixed(0)}% confidence` },
        { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Analyzing proposed actions against policy' },
      ]);
    }
  }, [incident, dispatch]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'command-center' });
  }, [dispatch]);

  if (!incident) {
    return (
      <MainLayout onBack={handleBack} backLabel="Command Center">
        <div className="investigation--empty">
          <p>No incident selected.</p>
          <Button variant="secondary" onClick={handleBack}>Back to Command Center</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Investigation — ${incident.id}`}
      subtitle={`${incident.title} · ${incident.service}`}
      showWorkflow={true}
      incident={incident}
      onBack={handleBack}
      backLabel="Back"
    >
      <PageHeader
        title="Live Investigation"
        subtitle={`${incident.id} — ${incident.title}`}
      />

      <div className="investigation animate-fade-in">
        {incident.status !== 'ROOT_CAUSE_IDENTIFIED' && (
          <EvidenceCard evidence={evidence} />
        )}

        {incident.status === 'ROOT_CAUSE_IDENTIFIED' && (
          <ConclusionBox
            rootCause={ROOT_CAUSE}
            confidence={ROOT_CAUSE_CONFIDENCE}
            evidenceCount={evidence.length}
          />
        )}

        <div className="investigation__activity">
          <AgentActivityList activities={activity} />
        </div>

        {incident.status === 'ROOT_CAUSE_IDENTIFIED' && (
          <div className="investigation__actions">
            <Button variant="primary" size="lg" onClick={handleContinue}>
              Continue to Decision →
            </Button>
            <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'command-center' })}>
              Back to Command Center
            </Button>
          </div>
        )}

        {incident.status !== 'ROOT_CAUSE_IDENTIFIED' && (
          <div className="investigation__actions">
            <Button variant="primary" size="lg" onClick={handleContinue} disabled={incident.status !== 'DETECTED'}>
              Continue to Decision →
            </Button>
            <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'command-center' })}>
              Back to Command Center
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
