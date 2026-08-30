import { useCallback, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { MainLayout } from '../components/layout/MainLayout';
import { AgentActivityList } from '../components/activity/AgentActivityList';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PolicyBadge } from '../components/ui/PolicyBadge';
import { RecommendationBox } from '../components/incidents/RecommendationBox';
import type { AgentActivity } from '../store/types';

export function Decision() {
  const { state, dispatch } = useRESOLVE();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const proposal = state.proposals[0];
  const policyDecision = state.policyDecisions[0];

  const [activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout configuration (94%)' },
    { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'rollback_gateway_config' },
  ]);

  const handleContinue = useCallback(() => {
    if (incident) {
      dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'execution' });
      setActivity((prev) => [
        ...prev,
        { agent: 'DecisionAgent', action: 'Action proposed', timestamp: new Date().toISOString(), status: 'completed', detail: proposal?.action ?? 'rollback_gateway_config' },
        { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: policyDecision?.authorization ?? 'AUTONOMOUS' },
        { agent: 'ActionAgent', action: 'Preparing execution', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Awaiting authorization' },
      ]);
    }
  }, [incident, dispatch, proposal, policyDecision]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE', screen: 'investigation' });
  }, [dispatch]);

  if (!incident || !proposal || !policyDecision) {
    return (
      <MainLayout onBack={handleBack} backLabel="Investigation">
        <div className="decision--empty">
          <p>No decision data available.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`Decision & Risk Gate — ${incident.id}`}
      subtitle={`${incident.title} · Recommended remediation`}
      showWorkflow={true}
      incident={incident}
      onBack={handleBack}
      backLabel="Back"
    >
      <RecommendationBox proposal={proposal} />

      <div className="decision animate-fade-in">
        <div className="decision__policy-panel">
          <div className="decision__policy-header">
            <span className="decision__policy-title">Policy Gate</span>
            <PolicyBadge authorization={policyDecision.authorization} risk={policyDecision.risk} />
          </div>

          <div className="decision__policy-rows">
            <div className="decision__policy-row">
              <span className="decision__policy-label">Authorization</span>
              <Badge variant={policyDecision.authorization === 'AUTONOMOUS' ? 'success' : policyDecision.authorization === 'HUMAN_APPROVAL' ? 'warning' : 'danger'}>
                {policyDecision.authorization.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="decision__policy-row">
              <span className="decision__policy-label">Policy</span>
              <span className="decision__policy-value mono">{policyDecision.policy}</span>
            </div>
            <div className="decision__policy-row">
              <span className="decision__policy-label">Risk</span>
              <Badge variant={policyDecision.risk as 'low' | 'medium' | 'high' | 'critical'}>
                {policyDecision.risk.toUpperCase()}
              </Badge>
            </div>
            <div className="decision__policy-row">
              <span className="decision__policy-label">Status</span>
              <Badge variant="success">VERIFIED</Badge>
            </div>
          </div>

          <p className="decision__policy-message">
            {policyDecision.authorization === 'AUTONOMOUS'
              ? 'RESOLVE is authorized to execute this action autonomously.'
              : policyDecision.authorization === 'HUMAN_APPROVAL'
              ? 'This action requires human approval before execution.'
              : 'This action is blocked by policy and cannot be executed.'}
          </p>
        </div>

        <div className="decision__activity">
          <AgentActivityList activities={activity} />
        </div>

        <div className="decision__actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            disabled={policyDecision.authorization === 'BLOCKED'}
          >
            {policyDecision.authorization === 'BLOCKED'
              ? 'Action Blocked — Cannot Execute'
              : 'Execute Remediation →'}
          </Button>
          <Button variant="ghost" onClick={() => dispatch({ type: 'NAVIGATE', screen: 'investigation' })}>
            Back to Investigation
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
