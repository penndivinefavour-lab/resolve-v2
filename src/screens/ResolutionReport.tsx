import { useCallback } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { PageHeader } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { ResolutionReportContent } from '../components/incidents/ResolutionReportContent';
import type { AgentActivity } from '../store/types';

export function ResolutionReport() {
  const { state, dispatch } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === 'PAY-2048');
  const verification = state.verifications[0];

  const handleBack = useCallback(() => {
    if (incident?.status === 'RESOLVED') {
      dispatch({ type: 'NAVIGATE', screen: 'verification' });
    } else {
      dispatch({ type: 'NAVIGATE', screen: 'command-center' });
    }
  }, [dispatch, incident]);

  const activity: AgentActivity[] = [
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout config (94%)' },
    { agent: 'DecisionAgent', action: 'Action proposed', timestamp: new Date().toISOString(), status: 'completed', detail: 'rollback_gateway_config' },
    { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: 'AUTONOMOUS' },
    { agent: 'ActionAgent', action: 'Remediation executed', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout rolled back' },
    { agent: 'VerificationAgent', action: 'Verification passed', timestamp: new Date().toISOString(), status: 'completed', detail: 'All checks passed' },
  ];

  const isResolved = incident?.status === 'RESOLVED';
  const isEscalated = incident?.status === 'ESCALATED';

  return (
    <MainLayout
      title={`Resolution Report — ${incident?.id ?? '—'}`}
      subtitle={incident?.title ?? 'Incident report'}
      showWorkflow={true}
      incident={incident ?? null}
      onBack={handleBack}
      backLabel="Back"
    >
      <PageHeader
        title={incident?.id ?? 'Resolution Report'}
        subtitle={incident?.title ?? ''}
        badge={isResolved ? 'RESOLVED' : isEscalated ? 'ESCALATED' : 'REPORT'}
        badgeColor={isResolved ? 'success' : isEscalated ? 'danger' : 'accent'}
      />

      <div className="resolution-report animate-fade-in">
        {incident && (
          <ResolutionReportContent
            incident={incident}
            verification={verification}
            audit={state.audit}
          />
        )}

        <div className="resolution-report__activity">
          <AgentActivityList activities={activity} />
        </div>

        <div className="resolution-report__actions">
          <Button variant="primary" onClick={() => dispatch({ type: 'RESET' })}>
            Run Demo Again
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'command-center' })}>
            Back to Command Center
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
