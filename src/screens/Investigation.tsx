import { useCallback, useEffect, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { PageHeader } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EvidenceCard } from '../components/incidents/EvidenceCard';
import { ConclusionBox } from '../components/incidents/ConclusionBox';
import { ROOT_CAUSE, ROOT_CAUSE_CONFIDENCE } from '../data/demoIncidents';
import { getEvidenceForIncident } from '../data/demoScenarios';
import { useToast } from '../components/ui/Toast';
import type { AgentActivity } from '../store/types';

type LoadingStage = 'idle' | 'analyzing' | 'correlating' | 'identifying';

export function Investigation() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const evidence = state.evidence.length > 0 ? state.evidence : getEvidenceForIncident(incident?.id ?? 'PAY-2048');

  const [activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048 · Payment Gateway Degradation' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadStage, setLoadStage] = useState<LoadingStage>('idle');

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
    if (!incident || loading) return;
    setLoading(true);
    setLoadStage('analyzing');

    const stages: { stage: LoadingStage; ms: number }[] = [
      { stage: 'analyzing', ms: 400 },
      { stage: 'correlating', ms: 800 },
      { stage: 'identifying', ms: 1400 },
    ];

    stages.forEach(({ stage, ms }) => {
      setTimeout(() => setLoadStage(stage), ms);
    });

    setTimeout(() => {
      dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'investigation' });
      setActivity((prev) => [
        ...prev,
        { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: `${ROOT_CAUSE} · ${(ROOT_CAUSE_CONFIDENCE * 100).toFixed(0)}% confidence` },
        { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Analyzing proposed actions against policy' },
      ]);
      setLoading(false);
      setLoadStage('idle');
      addToast({ type: 'success', title: 'Root Cause Identified', message: `${ROOT_CAUSE} — ${Math.round(ROOT_CAUSE_CONFIDENCE * 100)}% confidence` });
    }, 1800);
  }, [incident, loading, dispatch]);

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

  const loadMessages: Record<LoadingStage, string> = {
    idle: '',
    analyzing: 'Analyzing evidence sources...',
    correlating: 'Correlating gateway telemetry...',
    identifying: 'Identifying root cause...',
  };

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
        {/* Incident Summary Bar */}
        <div className="investigation-summary">
          <div className="investigation-summary__left">
            <span className="investigation-summary__id mono">{incident.id}</span>
            <span className="investigation-summary__title">{incident.title}</span>
          </div>
          <div className="investigation-summary__right">
            <Badge variant="severity" severity={incident.severity}>{incident.severity?.toUpperCase()}</Badge>
            <span className="investigation-summary__status mono">{incident.status.replace(/_/g, ' ')}</span>
          </div>
        </div>

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

        <div className="investigation__actions">
          {incident.status !== 'ROOT_CAUSE_IDENTIFIED' && (
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              onClick={handleContinue}
            >
              {loading
                ? loadMessages[loadStage] || 'Processing...'
                : 'Continue to Decision →'}
            </Button>
          )}
          {incident.status === 'ROOT_CAUSE_IDENTIFIED' && (
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              onClick={handleContinue}
            >
              {loading ? loadMessages[loadStage] || 'Processing...' : 'Continue to Decision →'}
            </Button>
          )}
          <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'command-center' })}>
            Back to Command Center
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
