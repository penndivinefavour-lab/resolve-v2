import type { Incident, Evidence, AgentActivity, ActionProposal, PolicyDecision, ApprovalRequest, ActionExecution, VerificationResult, AuditEvent, Authorization } from '../store/types';
import { incidentDetected, investigationStarted, evidenceCollected, rootCauseIdentified, actionProposed, policyEvaluated, actionExecuted, verificationPassed, verificationFailed, humanApprovalRequested, humanApproved, humanRejected, escalated, blocked, resolved } from './audit';
import { buildVerificationResult } from './verification';

export function severityLabel(severity: Incident['severity']): string {
  return severity.toUpperCase();
}

export function statusLabel(status: Incident['status']): string {
  return status.replace(/_/g, ' ');
}

export function resolvePermission(action: string): Authorization {
  const lower = action.toLowerCase();
  if (lower.includes('delete')) return 'BLOCKED';
  if (lower.includes('refund')) return 'HUMAN_APPROVAL';
  if (lower.includes('rollback') || lower.includes('restart')) return 'AUTONOMOUS';
  return 'AUTONOMOUS';
}

export function detect(incidentId: string, title: string, service: string, severity: Incident['severity'], failureRate: number, affectedCount: number): {
  incident: Incident;
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const incident: Incident = {
    id: incidentId,
    title,
    service,
    severity,
    status: 'DETECTED',
    detectedAt: new Date().toISOString(),
    metrics: { paymentFailureRate: failureRate, affectedTransactions: affectedCount },
    baseline: { paymentFailureRate: 2.3, affectedTransactions: 0 },
    affectedCount,
    humanRequired: false,
  };

  const activity: AgentActivity = {
    agent: 'DetectionAgent',
    action: 'Incident detected',
    timestamp: incident.detectedAt,
    status: 'completed',
    detail: `${severity} severity · ${service} · ${failureRate}% failure rate`,
  };

  const audit: AuditEvent[] = [incidentDetected(incidentId, severity)];

  return { incident, activity, audit };
}

export function investigate(incidentId: string): {
  evidence: Evidence[];
  rootCause: string;
  rootCauseConfidence: number;
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const evidence: Evidence[] = [
    { id: 'ev-1', incidentId, category: 'metrics', label: 'Payment failure rate', value: '38.4%', supportsRootCause: true, timestamp: new Date().toISOString() },
    { id: 'ev-2', incidentId, category: 'gateway', label: 'Gateway A timeout failures', value: '81% of timeouts', supportsRootCause: true, timestamp: new Date().toISOString() },
    { id: 'ev-3', incidentId, category: 'config', label: 'Gateway A timeout config', value: 'Changed 18 min before incident', supportsRootCause: true, timestamp: new Date().toISOString() },
    { id: 'ev-4', incidentId, category: 'deployment', label: 'Recent deployments', value: 'None correlate', supportsRootCause: true, timestamp: new Date().toISOString() },
    { id: 'ev-5', incidentId, category: 'gateway', label: 'Gateway B status', value: 'Normal', supportsRootCause: true, timestamp: new Date().toISOString() },
    { id: 'ev-6', incidentId, category: 'history', label: 'Incident PAY-1872', value: 'Similar failure pattern', supportsRootCause: false, timestamp: new Date().toISOString() },
  ];

  const rootCause = 'Gateway A timeout configuration';
  const rootCauseConfidence = 0.94;

  const activity: AgentActivity = {
    agent: 'InvestigationAgent',
    action: '6 evidence sources analyzed',
    timestamp: new Date().toISOString(),
    status: 'completed',
    detail: `Root cause: ${rootCause} (${rootCauseConfidence * 100}% confidence)`,
  };

  const audit: AuditEvent[] = [
    investigationStarted(incidentId),
    ...evidence.map((ev) => evidenceCollected(incidentId, ev.id, ev.label)),
    rootCauseIdentified(incidentId, rootCause, rootCauseConfidence),
  ];

  return { evidence, rootCause, rootCauseConfidence, activity, audit };
}

export function decide(incidentId: string): {
  proposal: ActionProposal;
  policyDecision: PolicyDecision;
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const proposal: ActionProposal = {
    incidentId,
    action: 'rollback_gateway_config',
    reason: 'Gateway A timeout configuration changed 18 minutes before incident onset. No recent deployment correlates. Gateway B is normal.',
    confidence: 0.94,
    expectedOutcome: 'Payment failure rate returns to baseline range (2.3%)',
    estimatedRecoveryMinutes: 5,
    risk: 'medium',
    reversible: true,
    evidenceIds: ['ev-1', 'ev-2', 'ev-3', 'ev-4', 'ev-5'],
    tool: 'rollback_gateway_config',
    inputs: { gateway: 'Gateway A' },
  };

  const policyDecision: PolicyDecision = {
    incidentId,
    action: 'rollback_gateway_config',
    risk: 'medium',
    authorization: 'AUTONOMOUS',
    requiresHuman: false,
    blocked: false,
    policy: 'payment-operations-v3.2',
    reason: 'Medium risk, reversible, within autonomous authority for payment operations.',
  };

  const activity: AgentActivity = {
    agent: 'DecisionAgent',
    action: 'Evaluating remediation',
    timestamp: new Date().toISOString(),
    status: 'completed',
    detail: `Proposed: ${proposal.action} · Risk: ${proposal.risk} · Authorization: ${policyDecision.authorization}`,
  };

  const audit: AuditEvent[] = [
    actionProposed(incidentId, proposal.action, proposal.confidence),
    policyEvaluated(incidentId, proposal.action, policyDecision.authorization, proposal.risk, policyDecision.policy),
  ];

  return { proposal, policyDecision, activity, audit };
}

export function execute(incidentId: string, tool: string, authorization: Authorization): {
  execution: ActionExecution;
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  if (authorization === 'BLOCKED') {
    const activity: AgentActivity = {
      agent: 'ActionAgent',
      action: 'Action blocked',
      timestamp: new Date().toISOString(),
      status: 'failed',
      detail: `Tool ${tool} is blocked by policy`,
    };
    const audit: AuditEvent[] = [blocked(incidentId, tool, 'payment-operations-v3.2')];
    const execution: ActionExecution = {
      incidentId,
      actionId: `exec-${Date.now()}`,
      tool,
      status: 'failure',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: { error: 'Action blocked by policy' },
      steps: [],
    };
    return { execution, activity, audit };
  }

  const startedAt = new Date().toISOString();
  const execution: ActionExecution = {
    incidentId,
    actionId: `exec-${Date.now()}`,
    tool,
    status: 'success',
    startedAt,
    completedAt: new Date().toISOString(),
    result: { success: true, rollbackTarget: 'Gateway A', previousConfig: 'timeout: 30s', rolledBackConfig: 'timeout: 10s' },
    steps: [
      { timestamp: startedAt, agent: 'ActionAgent', message: 'Preparing rollback.', status: 'info' },
      { timestamp: startedAt, agent: 'PolicyEngine', message: 'Authorization verified.', status: 'success' },
      { timestamp: new Date().toISOString(), agent: 'Gateway Connector', message: 'Configuration rollback initiated.', status: 'info' },
      { timestamp: new Date().toISOString(), agent: 'Gateway Connector', message: 'Gateway A timeout configuration rolled back to last known-good state.', status: 'success' },
    ],
  };

  const activity: AgentActivity = {
    agent: 'ActionAgent',
    action: 'Remediation executed',
    timestamp: startedAt,
    status: 'completed',
    detail: `${tool} · Authorization: ${authorization}`,
  };

  const audit: AuditEvent[] = [actionExecuted(incidentId, tool, 'success')];

  return { execution, activity, audit };
}

export function verify(incidentId: string, success = true): {
  verification: VerificationResult;
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const verification: VerificationResult = buildVerificationResult(incidentId, success);

  const activity: AgentActivity = {
    agent: 'VerificationAgent',
    action: success ? 'Verification passed' : 'Verification failed',
    timestamp: new Date().toISOString(),
    status: success ? 'completed' : 'failed',
    detail: `Payment failure rate: ${verification.before}% → ${verification.after}% (baseline: ${verification.baseline}%)`,
  };

  const audit: AuditEvent[] = success
    ? [verificationPassed(incidentId, 'paymentFailureRate', 38.4, 2.3, 2.3)]
    : [verificationFailed(incidentId, 'paymentFailureRate', 38.4, 14.8, 2.3, 'Metrics did not return to baseline')];

  return { verification, activity, audit };
}

export function requestApproval(incidentId: string, action: string, amount: string, risk: string): {
  approval: ApprovalRequest;
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const approval: ApprovalRequest = {
    incidentId,
    action,
    risk,
    amount,
    requestedBy: 'DecisionAgent',
    timestamp: new Date().toISOString(),
  };

  const activity: AgentActivity = {
    agent: 'DecisionAgent',
    action: 'Human approval requested',
    timestamp: new Date().toISOString(),
    status: 'in_progress',
    detail: `${action} · ${amount} · ${risk} risk`,
  };

  const audit: AuditEvent[] = [humanApprovalRequested(incidentId, action, amount, risk)];

  return { approval, activity, audit };
}

export function approveAction(incidentId: string, decision: 'approved' | 'rejected'): {
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const activity: AgentActivity = {
    agent: 'Human',
    action: decision === 'approved' ? 'Approved action' : 'Rejected action',
    timestamp: new Date().toISOString(),
    status: 'completed',
    detail: `Decision: ${decision}`,
  };

  const audit: AuditEvent[] = decision === 'approved'
    ? [humanApproved(incidentId, 'issue_refund', '$48,700')]
    : [humanRejected(incidentId, 'issue_refund', '$48,700', 'Refund exceeds authorized budget threshold')];

  return { activity, audit };
}

export function escalate(incidentId: string, reason: string): {
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const activity: AgentActivity = {
    agent: 'EscalationAgent',
    action: 'Incident escalated',
    timestamp: new Date().toISOString(),
    status: 'in_progress',
    detail: reason,
  };

  const audit: AuditEvent[] = [escalated(incidentId, reason)];

  return { activity, audit };
}

export function resolve(incidentId: string, recoveryMinutes: number, humanInterventions: number = 0): {
  activity: AgentActivity;
  audit: AuditEvent[];
} {
  const activity: AgentActivity = {
    agent: 'System',
    action: 'Incident resolved',
    timestamp: new Date().toISOString(),
    status: 'completed',
    detail: `Resolution time: ${recoveryMinutes} min · Human interventions: ${humanInterventions}`,
  };

  const audit: AuditEvent[] = [resolved(incidentId, recoveryMinutes, humanInterventions)];

  return { activity, audit };
}
