import type { Screen, RESOLVESState, Incident } from './types';
import { initialState, SEQUENCE, AGENT_FOR_STAGE } from './initialState';

export type Action =
  | { type: 'START_DEMO' }
  | { type: 'OPEN_INCIDENT'; incidentId: string }
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'ADVANCE_INCIDENT'; incidentId: string; screen: Screen }
  | { type: 'SET_APPROVAL_DECISION'; incidentId: string; decision: 'approved' | 'rejected' }
  | { type: 'BLOCK_ACTION'; incidentId: string }
  | { type: 'FAIL_VERIFICATION'; incidentId: string }
  | { type: 'RESET' };

function now(): string {
  return new Date().toISOString();
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function buildAudit(partial: Omit<import('./types').AuditEvent, 'id' | 'timestamp'>): import('./types').AuditEvent {
  return {
    id: `audit-${uid()}`,
    timestamp: now(),
    ...partial,
    action: partial.action.toLowerCase(),
  };
}

function advanceSequence(current: import('./types').IncidentStatus, targetScreen: Screen): import('./types').IncidentStatus | null {
  const idx = SEQUENCE.indexOf(current as typeof SEQUENCE[number]);
  if (idx === -1) return null;
  if (idx >= SEQUENCE.length - 1) return null;
  const next = SEQUENCE[idx + 1];
  // Map target screen to the next status in sequence
  const screenToNextStatus: Partial<Record<Screen, import('./types').IncidentStatus>> = {
    investigation: 'INVESTIGATING',
    decision: 'ACTION_PROPOSED',
    execution: 'EXECUTING',
    verification: 'VERIFYING',
    report: 'RESOLVED',
  };
  const expectedNext = screenToNextStatus[targetScreen];
  if (expectedNext && expectedNext === next) return next;
  // Fallback: allow any incident-detail screen to advance
  if (['incident', 'investigation', 'decision', 'execution', 'verification', 'report'].includes(targetScreen)) {
    return next as import('./types').IncidentStatus;
  }
  return null;
}

function buildExecution(incidentId: string, tool: string): import('./types').ActionExecution {
  const t = now();
  return {
    incidentId,
    actionId: `exec-${uid()}`,
    tool,
    status: 'running',
    startedAt: t,
    result: {},
    steps: [
      { timestamp: t, agent: 'ActionAgent', message: 'Preparing action.', status: 'info' },
      { timestamp: t, agent: 'PolicyEngine', message: 'Authorization verified.', status: 'success' },
    ],
  };
}

function buildVerification(incidentId: string): import('./types').VerificationResult {
  return {
    incidentId,
    verified: true,
    metric: 'paymentFailureRate',
    before: 38.4,
    after: 2.3,
    baseline: 2.3,
    recovery: 36.1,
    confidence: 0.99,
    recoveryStages: [
      { stage: 1, value: 38.4 },
      { stage: 2, value: 17.2 },
      { stage: 3, value: 4.7 },
      { stage: 4, value: 2.3 },
    ],
    checks: [
      { name: 'Payment failure rate', passed: true, value: '2.3%' },
      { name: 'Gateway timeout rate', passed: true, value: '0.4%' },
      { name: 'Transaction recovery', passed: true, value: 'Confirmed' },
      { name: 'Customer impact', passed: true, value: 'Stabilized' },
    ],
  };
}

function buildDemo(state: RESOLVESState): RESOLVESState {
  const payId = 'PAY-2048';
  const incident: import('./types').Incident = {
    id: payId,
    title: 'Payment Gateway Degradation',
    service: 'Gateway A',
    severity: 'critical',
    status: 'DETECTED',
    detectedAt: now(),
    metrics: { paymentFailureRate: 38.4, gatewayTimeoutRate: 12.1, transactionVolume: 4820, affectedTransactions: 12840 },
    baseline: { paymentFailureRate: 2.3, gatewayTimeoutRate: 0.3, transactionVolume: 4800, affectedTransactions: 0 },
    affectedCount: 12840,
    humanRequired: false,
    rootCause: 'Gateway A timeout configuration',
    rootCauseConfidence: 0.94,
  };

  const pay2Id = 'PAY-2051';
  const pay2: import('./types').Incident = {
    id: pay2Id,
    title: 'High-Value Refund Batch',
    service: 'Payments Service',
    severity: 'high',
    status: 'AWAITING_APPROVAL',
    detectedAt: now(),
    metrics: { affectedTransactions: 980, disputedAmount: 48700 },
    baseline: { affectedTransactions: 0, disputedAmount: 0 },
    affectedCount: 980,
    humanRequired: true,
    humanDecision: 'pending',
    proposedAction: 'issue_refund for $48,700 affected transactions',
  };

  const evidence: import('./types').Evidence[] = [
    { id: 'ev-1', incidentId: payId, category: 'metrics', label: 'Payment failure rate', value: '38.4%', supportsRootCause: true, timestamp: now() },
    { id: 'ev-2', incidentId: payId, category: 'gateway', label: 'Gateway A timeout failures', value: '81% of timeouts', supportsRootCause: true, timestamp: now() },
    { id: 'ev-3', incidentId: payId, category: 'config', label: 'Gateway A timeout config', value: 'Changed 18 min before incident', supportsRootCause: true, timestamp: now() },
    { id: 'ev-4', incidentId: payId, category: 'deployment', label: 'Recent deployments', value: 'None correlate', supportsRootCause: true, timestamp: now() },
    { id: 'ev-5', incidentId: payId, category: 'gateway', label: 'Gateway B status', value: 'Normal', supportsRootCause: true, timestamp: now() },
    { id: 'ev-6', incidentId: payId, category: 'history', label: 'Incident PAY-1872', value: 'Similar failure pattern', supportsRootCause: false, timestamp: now() },
  ];

  const proposal: import('./types').ActionProposal = {
    incidentId: payId,
    action: 'rollback_gateway_config',
    reason: 'Gateway A timeout configuration changed 18 minutes before incident onset. No recent deployment correlates. Gateway B is normal.',
    confidence: 0.94,
    expectedOutcome: 'Payment failure rate returns to baseline range',
    estimatedRecoveryMinutes: 5,
    risk: 'medium',
    reversible: true,
    evidenceIds: ['ev-1', 'ev-2', 'ev-3', 'ev-4', 'ev-5'],
    tool: 'rollback_gateway_config',
    inputs: { gateway: 'Gateway A' },
  };

  const pd: import('./types').PolicyDecision = {
    incidentId: payId,
    action: 'rollback_gateway_config',
    risk: 'medium',
    authorization: 'AUTONOMOUS',
    requiresHuman: false,
    blocked: false,
    policy: 'payment-operations-v3.2',
    reason: 'Medium risk, reversible, within autonomous authority for payment operations.',
  };

  const approval: import('./types').ApprovalRequest = {
    incidentId: pay2Id,
    action: 'issue_refund',
    risk: 'high',
    amount: '$48,700',
    requestedBy: 'DecisionAgent',
    timestamp: now(),
  };

  const execution: import('./types').ActionExecution = {
    incidentId: payId,
    actionId: `exec-${uid()}`,
    tool: 'rollback_gateway_config',
    status: 'running',
    startedAt: now(),
    result: {},
    steps: [
      { timestamp: now(), agent: 'ActionAgent', message: 'Preparing rollback.', status: 'info' },
      { timestamp: now(), agent: 'PolicyEngine', message: 'Authorization verified.', status: 'success' },
      { timestamp: now(), agent: 'Gateway Connector', message: 'Configuration rollback initiated.', status: 'info' },
    ],
  };

  const auditEvents: import('./types').AuditEvent[] = [
    buildAudit({ incidentId: payId, actor: 'system', agent: 'DetectionAgent', action: 'INCIDENT_DETECTED', metadata: { severity: 'critical' } }),
    buildAudit({ incidentId: pay2Id, actor: 'system', agent: 'DecisionAgent', action: 'HUMAN_APPROVAL_REQUESTED', metadata: { amount: '$48,700' } }),
    buildAudit({ incidentId: payId, actor: 'InvestigationAgent', agent: 'InvestigationAgent', action: 'INVESTIGATION_STARTED', metadata: {} }),
  ];

  return {
    ...state,
    incidents: [incident, pay2],
    currentIncidentId: payId,
    evidence,
    proposals: [proposal],
    policyDecisions: [pd],
    approvals: [approval],
    executions: [execution],
    verifications: [],
    audit: auditEvents,
    activeScreen: 'command-center',
    commandMetrics: {
      activeIncidents: 2,
      critical: 1,
      awaitingApproval: 1,
      automatedResolutions: 0,
      operationalHealth: 97.8,
    },
  };
}

export function resolveReducer(state: RESOLVESState, action: Action): RESOLVESState {
  switch (action.type) {
    case 'START_DEMO': {
      return buildDemo(state);
    }

    case 'NAVIGATE': {
      return { ...state, activeScreen: action.screen };
    }

    case 'OPEN_INCIDENT': {
      return { ...state, currentIncidentId: action.incidentId, activeScreen: 'incident' };
    }

    case 'ADVANCE_INCIDENT': {
      const idx = state.incidents.findIndex((i) => i.id === action.incidentId);
      if (idx === -1) return state;

      const incident = state.incidents[idx];
      const nextStatus = advanceSequence(incident.status, action.screen);
      if (!nextStatus) return state;

      const newIncidents = state.incidents.map((i) =>
        i.id === action.incidentId ? { ...i, status: nextStatus } : i,
      );

      const auditEvents: import('./types').AuditEvent[] = [
        buildAudit({
          incidentId: action.incidentId,
          actor: 'system',
          agent: AGENT_FOR_STAGE[nextStatus] ?? 'System',
          action: 'STATE_TRANSITION',
          decision: nextStatus,
          metadata: { from: incident.status, to: nextStatus },
        }),
      ];

      if (nextStatus === 'INVESTIGATING') {
        state.evidence.forEach((ev) => {
          auditEvents.push(
            buildAudit({
              incidentId: action.incidentId,
              actor: 'InvestigationAgent',
              agent: 'InvestigationAgent',
              action: 'EVIDENCE_COLLECTED',
              metadata: { evidenceId: ev.id, label: ev.label },
            }),
          );
        });
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'InvestigationAgent',
            agent: 'InvestigationAgent',
            action: 'INVESTIGATION_STARTED',
            metadata: { evidenceCount: state.evidence.length },
          }),
        );
      }

      if (nextStatus === 'ROOT_CAUSE_IDENTIFIED') {
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'InvestigationAgent',
            agent: 'InvestigationAgent',
            action: 'ROOT_CAUSE_IDENTIFIED',
            decision: incident.rootCause ?? 'Gateway A timeout configuration',
            metadata: { confidence: incident.rootCauseConfidence ?? 0.94 },
          }),
        );
      }

      if (nextStatus === 'ACTION_PROPOSED') {
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'DecisionAgent',
            agent: 'DecisionAgent',
            action: 'ACTION_PROPOSED',
            decision: incident.proposedAction ?? 'rollback_gateway_config',
            metadata: { confidence: 0.94 },
          }),
        );
      }

      if (nextStatus === 'RISK_CHECK') {
        const pd = state.policyDecisions.find((p) => p.incidentId === action.incidentId);
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'PolicyEngine',
            agent: 'PolicyEngine',
            action: 'POLICY_EVALUATED',
            policy: pd?.policy ?? 'payment-operations-v3.2',
            authorization: pd?.authorization ?? 'AUTONOMOUS',
            metadata: { risk: pd?.risk ?? 'medium' },
          }),
        );
      }

      if (nextStatus === 'EXECUTING') {
        const exec = buildExecution(action.incidentId, 'rollback_gateway_config');
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'ActionAgent',
            agent: 'ActionAgent',
            action: 'ACTION_EXECUTED',
            executionResult: 'success',
            metadata: { tool: 'rollback_gateway_config' },
          }),
        );
        return {
          ...state,
          incidents: newIncidents,
          activeScreen: action.screen,
          audit: [...state.audit, ...auditEvents],
          executions: [...state.executions, exec],
        };
      }

      if (nextStatus === 'VERIFYING') {
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'VerificationAgent',
            agent: 'VerificationAgent',
            action: 'VERIFICATION_STARTED',
            metadata: {},
          }),
        );
        const verification = buildVerification(action.incidentId);
        return {
          ...state,
          incidents: newIncidents,
          activeScreen: action.screen,
          audit: [...state.audit, ...auditEvents],
          verifications: [...state.verifications, verification],
        };
      }

      if (nextStatus === 'RESOLVED') {
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'System',
            agent: 'System',
            action: 'RESOLVED',
            verificationResult: 'success',
            metadata: { recoveryMinutes: 5 },
          }),
        );
        return {
          ...state,
          incidents: newIncidents.map((i) =>
            i.id === action.incidentId ? { ...i, resolvedAt: now() } : i,
          ),
          activeScreen: action.screen,
          audit: [...state.audit, ...auditEvents],
          commandMetrics: {
            ...state.commandMetrics,
            activeIncidents: Math.max(0, state.commandMetrics.activeIncidents - 1),
            automatedResolutions: state.commandMetrics.automatedResolutions + 1,
          },
        };
      }

      if (nextStatus === 'ESCALATED') {
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'EscalationAgent',
            agent: 'EscalationAgent',
            action: 'ESCALATED',
            metadata: { reason: 'Verification failed or human rejection' },
          }),
        );
        return {
          ...state,
          incidents: newIncidents,
          activeScreen: action.screen,
          audit: [...state.audit, ...auditEvents],
        };
      }

      if (nextStatus === 'BLOCKED') {
        auditEvents.push(
          buildAudit({
            incidentId: action.incidentId,
            actor: 'PolicyEngine',
            agent: 'PolicyEngine',
            action: 'BLOCKED',
            policy: 'payment-operations-v3.2',
            metadata: { risk: 'critical' },
          }),
        );
        return {
          ...state,
          incidents: newIncidents,
          activeScreen: action.screen,
          audit: [...state.audit, ...auditEvents],
        };
      }

      return {
        ...state,
        incidents: newIncidents as Incident[],
        activeScreen: action.screen,
        audit: [...state.audit, ...auditEvents],
      };
    }

    case 'SET_APPROVAL_DECISION': {
      const idx = state.incidents.findIndex((i) => i.id === action.incidentId);
      if (idx === -1) return state;

      const decision = action.decision;
      const newIncidents = state.incidents.map((i) =>
        i.id === action.incidentId
          ? {
              ...i,
              humanDecision: decision,
              status: decision === 'approved' ? 'EXECUTING' : 'ESCALATED',
            }
          : i,
      );

      const approvalRecord: import('./types').ApprovalRecord = {
        incidentId: action.incidentId,
        action: 'issue_refund',
        decision,
        decidedBy: 'human',
        timestamp: now(),
      };

      const auditEvent = buildAudit({
        incidentId: action.incidentId,
        actor: 'human',
        agent: decision === 'approved' ? 'System' : 'EscalationAgent',
        action: decision === 'approved' ? 'HUMAN_APPROVED' : 'HUMAN_REJECTED',
        decision,
        metadata: { amount: '$48,700' },
      });

      return {
        ...state,
        incidents: newIncidents as Incident[],
        approvalRecords: [...state.approvalRecords, approvalRecord],
        audit: [...state.audit, auditEvent],
        commandMetrics: decision === 'approved'
          ? {
              ...state.commandMetrics,
              awaitingApproval: Math.max(0, state.commandMetrics.awaitingApproval - 1),
            }
          : state.commandMetrics,
      };
    }

    case 'BLOCK_ACTION': {
      const idx = state.incidents.findIndex((i) => i.id === action.incidentId);
      if (idx === -1) return state;

      const newIncidents = state.incidents.map((i) =>
        i.id === action.incidentId ? { ...i, status: 'BLOCKED' } : i,
      );

      const auditEvent = buildAudit({
        incidentId: action.incidentId,
        actor: 'PolicyEngine',
        agent: 'PolicyEngine',
        action: 'BLOCKED',
        policy: 'payment-operations-v3.2',
        metadata: { risk: 'critical' },
      });

      return {
        ...state,
        incidents: newIncidents as Incident[],
        audit: [...state.audit, auditEvent],
      };
    }

    case 'FAIL_VERIFICATION': {
      const idx = state.incidents.findIndex((i) => i.id === action.incidentId);
      if (idx === -1) return state;

      const newIncidents = state.incidents.map((i) =>
        i.id === action.incidentId ? { ...i, status: 'ESCALATED' } : i,
      );

      const newVerifications = state.verifications.map((v) =>
        v.incidentId === action.incidentId ? { ...v, verified: false } : v,
      );

      const auditEvent = buildAudit({
        incidentId: action.incidentId,
        actor: 'VerificationAgent',
        agent: 'VerificationAgent',
        action: 'VERIFICATION_FAILED',
        metadata: { reason: 'Metrics did not return to baseline' },
      });

      return {
        ...state,
        incidents: newIncidents as Incident[],
        verifications: newVerifications,
        audit: [...state.audit, auditEvent],
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}
