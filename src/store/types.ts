export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus =
  | 'DETECTED'
  | 'INVESTIGATING'
  | 'ROOT_CAUSE_IDENTIFIED'
  | 'ACTION_PROPOSED'
  | 'RISK_CHECK'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'BLOCKED';
export type Authorization = 'AUTONOMOUS' | 'HUMAN_APPROVAL' | 'BLOCKED';
export type Screen =
  | 'welcome'
  | 'command-center'
  | 'incident'
  | 'investigation'
  | 'decision'
  | 'execution'
  | 'verification'
  | 'approval-center'
  | 'report';

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  detectedAt: string;
  resolvedAt?: string;
  metrics: Record<string, number>;
  baseline: Record<string, number>;
  affectedCount: number;
  humanRequired: boolean;
  humanDecision?: 'pending' | 'approved' | 'rejected';
  proposedAction?: string;
  rootCause?: string;
  rootCauseConfidence?: number;
}

export interface Evidence {
  id: string;
  incidentId: string;
  category: string;
  label: string;
  value: string | number;
  supportsRootCause: boolean;
  timestamp: string;
}

export interface ActionProposal {
  incidentId: string;
  action: string;
  reason: string;
  confidence: number;
  expectedOutcome: string;
  estimatedRecoveryMinutes: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  reversible: boolean;
  evidenceIds: string[];
  tool: string;
  inputs: Record<string, unknown>;
}

export interface PolicyDecision {
  incidentId: string;
  action: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  authorization: Authorization;
  requiresHuman: boolean;
  blocked: boolean;
  policy: string;
  reason?: string;
}

export interface ApprovalRequest {
  incidentId: string;
  action: string;
  risk: string;
  amount?: string;
  requestedBy: string;
  timestamp: string;
}

export interface ApprovalRecord {
  incidentId: string;
  action: string;
  decision: 'approved' | 'rejected';
  decidedBy: string;
  timestamp: string;
}

export interface ActionExecution {
  incidentId: string;
  actionId: string;
  tool: string;
  status: 'running' | 'success' | 'failure';
  startedAt: string;
  completedAt?: string;
  result: Record<string, unknown>;
  steps: {
    timestamp: string;
    agent: string;
    message: string;
    status: 'info' | 'success' | 'error';
  }[];
}

export interface VerificationResult {
  incidentId: string;
  verified: boolean;
  metric: string;
  before: number;
  after: number;
  baseline: number;
  recovery: number;
  confidence: number;
  checks: { name: string; passed: boolean; value: string | number }[];
  recoveryStages?: { stage: number; value: number }[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  incidentId: string;
  actor: string;
  agent?: string;
  action: string;
  decision?: string;
  policy?: string;
  authorization?: Authorization;
  executionResult?: string;
  verificationResult?: string;
  metadata: Record<string, unknown>;
}

export interface CommandMetrics {
  activeIncidents: number;
  critical: number;
  awaitingApproval: number;
  automatedResolutions: number;
  operationalHealth: number;
}

export interface RESOLVESState {
  incidents: Incident[];
  currentIncidentId: string | null;
  evidence: Evidence[];
  proposals: ActionProposal[];
  policyDecisions: PolicyDecision[];
  approvals: ApprovalRequest[];
  approvalRecords: ApprovalRecord[];
  executions: ActionExecution[];
  verifications: VerificationResult[];
  audit: AuditEvent[];
  activeScreen: Screen;
  commandMetrics: CommandMetrics;
}

export type AgentActivity = {
  agent: string;
  action: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  detail?: string;
};
