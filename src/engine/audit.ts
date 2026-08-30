import type { AuditEvent, Authorization } from '../store/types';

export function createAudit(
  incidentId: string,
  action: string,
  actor: string,
  agent?: string,
  message?: string,
  metadata: Record<string, unknown> = {},
): AuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    incidentId,
    actor,
    agent,
    action,
    ...(message ? { metadata: { ...metadata, message } } : { metadata }),
  };
}

export function incidentDetected(incidentId: string, severity: string): AuditEvent {
  return createAudit(incidentId, 'INCIDENT_DETECTED', 'DetectionAgent', 'DetectionAgent', undefined, { severity });
}

export function investigationStarted(incidentId: string): AuditEvent {
  return createAudit(incidentId, 'INVESTIGATION_STARTED', 'InvestigationAgent', 'InvestigationAgent');
}

export function evidenceCollected(incidentId: string, evidenceId: string, label: string): AuditEvent {
  return createAudit(incidentId, 'EVIDENCE_COLLECTED', 'InvestigationAgent', 'InvestigationAgent', undefined, { evidenceId, label });
}

export function rootCauseIdentified(incidentId: string, rootCause: string, confidence: number): AuditEvent {
  return createAudit(incidentId, 'ROOT_CAUSE_IDENTIFIED', 'InvestigationAgent', 'InvestigationAgent', undefined, { rootCause, confidence });
}

export function actionProposed(incidentId: string, action: string, confidence: number): AuditEvent {
  return createAudit(incidentId, 'ACTION_PROPOSED', 'DecisionAgent', 'DecisionAgent', undefined, { action, confidence });
}

export function policyEvaluated(incidentId: string, action: string, authorization: Authorization, risk: string, policy: string): AuditEvent {
  return createAudit(incidentId, 'POLICY_EVALUATED', 'PolicyEngine', 'PolicyEngine', undefined, { action, authorization, risk, policy });
}

export function actionExecuted(incidentId: string, tool: string, result: string): AuditEvent {
  return createAudit(incidentId, 'ACTION_EXECUTED', 'ActionAgent', 'ActionAgent', undefined, { tool, result });
}

export function verificationStarted(incidentId: string): AuditEvent {
  return createAudit(incidentId, 'VERIFICATION_STARTED', 'VerificationAgent', 'VerificationAgent');
}

export function verificationPassed(incidentId: string, metric: string, before: number, after: number, baseline: number): AuditEvent {
  return createAudit(incidentId, 'VERIFICATION_PASSED', 'VerificationAgent', 'VerificationAgent', undefined, { metric, before, after, baseline });
}

export function verificationFailed(incidentId: string, metric: string, before: number, after: number, baseline: number, reason: string): AuditEvent {
  return createAudit(incidentId, 'VERIFICATION_FAILED', 'VerificationAgent', 'VerificationAgent', reason, { metric, before, after, baseline });
}

export function humanApprovalRequested(incidentId: string, action: string, amount: string, risk: string): AuditEvent {
  return createAudit(incidentId, 'HUMAN_APPROVAL_REQUESTED', 'DecisionAgent', 'DecisionAgent', undefined, { action, amount, risk });
}

export function humanApproved(incidentId: string, action: string, amount: string): AuditEvent {
  return createAudit(incidentId, 'HUMAN_APPROVED', 'Human', undefined, undefined, { action, amount });
}

export function humanRejected(incidentId: string, action: string, amount: string, reason: string): AuditEvent {
  return createAudit(incidentId, 'HUMAN_REJECTED', 'Human', undefined, reason, { action, amount });
}

export function escalated(incidentId: string, reason: string): AuditEvent {
  return createAudit(incidentId, 'ESCALATED', 'EscalationAgent', 'EscalationAgent', reason, { reason });
}

export function blocked(incidentId: string, action: string, policy: string): AuditEvent {
  return createAudit(incidentId, 'BLOCKED', 'PolicyEngine', 'PolicyEngine', undefined, { action, policy });
}

export function resolved(incidentId: string, recoveryMinutes: number, humanInterventions: number): AuditEvent {
  return createAudit(incidentId, 'RESOLVED', 'System', 'System', undefined, { recoveryMinutes, humanInterventions });
}

export { createAudit as createAuditEvent };
