import { useCallback, useEffect, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { PageHeader } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { BarChart } from '../components/incidents/BarChart';
import { ChecksList } from '../components/incidents/ChecksList';
import { EscalationCard } from '../components/incidents/EscalationCard';
import { ResolutionCard } from '../components/incidents/ResolutionCard';
import type { AgentActivity } from '../store/types';

export function Verification() {
  const { state, dispatch } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const verification = state.verifications[0];

  const [activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout config (94%)' },
    { agent: 'DecisionAgent', action: 'Action proposed', timestamp: new Date().toISOString(), status: 'completed', detail: 'rollback_gateway_config' },
    { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: 'AUTONOMOUS' },
    { agent: 'ActionAgent', action: 'Remediation executed', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout rolled back' },
    { agent: 'VerificationAgent', action: 'Verification started', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Checking recovery metrics' },
  ]);

  useEffect(() => {
    if (verification && verification.verified) {
      setActivity((prev) => [
        ...prev.slice(0, -1),
        { agent: 'VerificationAgent', action: 'Verification passed', timestamp: new Date().toISOString(), status: 'completed', detail: `Payment failure rate: ${verification.before}% → ${verification.after}% (baseline: ${verification.baseline}%)` },
      ]);
    }
  }, [verification]);

  const failed = !verification?.verified && incident?.status === 'ESCALATED';

  const handleBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'execution' });
  }, [dispatch]);

  const handleContinue = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'report' });
  }, [dispatch]);

  const handleFailVerification = useCallback(() => {
    if (incident) {
      dispatch({ type: 'FAIL_VERIFICATION', incidentId: incident.id });
      setActivity((prev) => [
        ...prev.slice(0, -1),
        { agent: 'VerificationAgent', action: 'Verification failed', timestamp: new Date().toISOString(), status: 'failed', detail: 'Payment failure rate remains above baseline' },
        { agent: 'EscalationAgent', action: 'Incident escalated', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Human intervention required' },
      ]);
      dispatch({ type: 'NAVIGATE', screen: 'report' });
    }
  }, [incident, dispatch]);

  if (!incident || !verification) {
    return (
      <MainLayout onBack={handleBack} backLabel="Execution">
        <div className="verification--loading">
          <div className="spinner spinner-lg animate-spin" />
          <p>Running verification checks...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Verification — ${incident.id}`}
      subtitle={failed ? 'Verification failed' : 'Independent verification'}
      showWorkflow={true}
      incident={incident}
      onBack={handleBack}
      backLabel="Back"
    >
      <PageHeader
        title="Verification"
        subtitle={`${incident.id} — ${failed ? 'Verification failed' : 'Independent verification of remediation'}`}
      />

      <div className="verification animate-fade-in">
        {!failed && (
          <>
            <div className="verification__chart-card">
              <BarChart
                stages={[
                  { label: 'Before', value: verification.before, color: 'var(--critical)' },
                  { label: 'After rollback', value: 17.2, color: 'var(--warning)' },
                  { label: 'Stabilizing', value: 4.7, color: 'var(--info)' },
                  { label: 'Baseline', value: verification.after, color: 'var(--success)' },
                ]}
                baseline={verification.baseline}
              />
              <div className="verification__baseline mono">
                Baseline: <span className="verification__baseline-value">{verification.baseline}%</span>
              </div>
            </div>

            <ChecksList checks={verification.checks} passed={verification.verified} />

            <ResolutionCard recovery={verification.recovery} />
          </>
        )}

        {failed && (
          <EscalationCard
            metric="paymentFailureRate"
            failedChecks={verification.checks.filter((c) => !c.passed)}
          />
        )}

        <div className="verification__activity">
          <AgentActivityList activities={activity} />
        </div>

        <div className="verification__actions">
          {!failed && (
            <>
              <Button variant="primary" size="lg" onClick={handleContinue}>
                View Resolution Report →
              </Button>
              <Button variant="danger" onClick={handleFailVerification}>
                Simulate Verification Failure
              </Button>
            </>
          )}
          {failed && (
            <Button variant="primary" size="lg" onClick={handleContinue}>
              View Escalation Report →
            </Button>
          )}
          <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'execution' })}>
            Back to Execution
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
