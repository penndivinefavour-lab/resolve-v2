import type { Authorization } from '../store/types';

export interface PolicyRule {
  actionPattern: string;
  riskThreshold: string;
  authorization: Authorization;
  reason: string;
}

export const POLICY_RULES: PolicyRule[] = [
  {
    actionPattern: 'delete',
    riskThreshold: 'any',
    authorization: 'BLOCKED',
    reason: 'Production data deletion is prohibited by policy. No execution permitted.',
  },
  {
    actionPattern: 'refund',
    riskThreshold: 'high',
    authorization: 'HUMAN_APPROVAL',
    reason: 'Refund above high-risk threshold requires explicit human authorization.',
  },
  {
    actionPattern: 'refund',
    riskThreshold: 'low',
    authorization: 'AUTONOMOUS',
    reason: 'Low-value refund is within autonomous authority.',
  },
  {
    actionPattern: 'rollback',
    riskThreshold: 'any',
    authorization: 'AUTONOMOUS',
    reason: 'Configuration rollback is a reversible, well-understood remediation within autonomous scope.',
  },
  {
    actionPattern: 'restart',
    riskThreshold: 'any',
    authorization: 'AUTONOMOUS',
    reason: 'Service restart is a reversible operational action within autonomous scope.',
  },
];

export type PolicyDecision = {
  incidentId: string;
  action: string;
  risk: string;
  authorization: Authorization;
  requiresHuman: boolean;
  blocked: boolean;
  policy: string;
  reason?: string;
};

export function evaluatePolicy(
  incidentId: string,
  action: string,
  risk: string,
  policyVersion = 'payment-operations-v3.2',
): PolicyDecision {
  const lower = action.toLowerCase();
  const riskLower = risk.toLowerCase();

  for (const rule of POLICY_RULES) {
    if (lower.includes(rule.actionPattern)) {
      const matchesRisk = rule.riskThreshold === 'any' || riskLower === rule.riskThreshold;
      if (matchesRisk || rule.riskThreshold === 'any') {
        const authorization = rule.authorization;
        return {
          incidentId,
          action,
          risk,
          authorization,
          requiresHuman: authorization === 'HUMAN_APPROVAL',
          blocked: authorization === 'BLOCKED',
          policy: policyVersion,
          reason: rule.reason,
        };
      }
    }
  }

  return {
    incidentId,
    action,
    risk,
    authorization: 'AUTONOMOUS',
    requiresHuman: false,
    blocked: false,
    policy: policyVersion,
    reason: 'Action does not match any restricted policy pattern.',
  };
}
