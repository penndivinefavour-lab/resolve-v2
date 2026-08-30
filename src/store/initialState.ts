import type { RESOLVESState } from './types';

export const initialState: RESOLVESState = {
  incidents: [],
  currentIncidentId: null,
  evidence: [],
  proposals: [],
  policyDecisions: [],
  approvals: [],
  approvalRecords: [],
  executions: [],
  verifications: [],
  audit: [],
  activeScreen: 'welcome',
  commandMetrics: {
    activeIncidents: 0,
    critical: 0,
    awaitingApproval: 0,
    automatedResolutions: 0,
    operationalHealth: 100,
  },
};

export const SEQUENCE = [
  'DETECTED',
  'INVESTIGATING',
  'ROOT_CAUSE_IDENTIFIED',
  'ACTION_PROPOSED',
  'RISK_CHECK',
  'EXECUTING',
  'VERIFYING',
  'RESOLVED',
] as const;

export const AGENT_FOR_STAGE: Record<string, string> = {
  INVESTIGATING: 'InvestigationAgent',
  ROOT_CAUSE_IDENTIFIED: 'InvestigationAgent',
  ACTION_PROPOSED: 'DecisionAgent',
  RISK_CHECK: 'PolicyEngine',
  EXECUTING: 'ActionAgent',
  VERIFYING: 'VerificationAgent',
  RESOLVED: 'System',
  ESCALATED: 'EscalationAgent',
  BLOCKED: 'PolicyEngine',
};
