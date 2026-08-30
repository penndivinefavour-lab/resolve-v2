import type { Incident, Evidence } from '../store/types';
import type { RecoveryStage } from '../engine/verification';

export const PAY_2048: Incident = {
  id: 'PAY-2048',
  title: 'Payment Gateway Degradation',
  service: 'Gateway A',
  severity: 'critical',
  status: 'DETECTED',
  detectedAt: new Date().toISOString(),
  metrics: { paymentFailureRate: 38.4, gatewayTimeoutRate: 12.1, transactionVolume: 4820, affectedTransactions: 12840 },
  baseline: { paymentFailureRate: 2.3, gatewayTimeoutRate: 0.3, transactionVolume: 4800, affectedTransactions: 0 },
  affectedCount: 12840,
  humanRequired: false,
  rootCause: 'Gateway A timeout configuration',
  rootCauseConfidence: 0.94,
};

export const PAY_2051: Incident = {
  id: 'PAY-2051',
  title: 'High-Value Refund Batch',
  service: 'Payments Service',
  severity: 'high',
  status: 'AWAITING_APPROVAL',
  detectedAt: new Date().toISOString(),
  metrics: { affectedTransactions: 980, disputedAmount: 48700 },
  baseline: { affectedTransactions: 0, disputedAmount: 0 },
  affectedCount: 980,
  humanRequired: true,
  humanDecision: 'pending',
  proposedAction: 'issue_refund for $48,700 affected transactions',
};

export const EVIDENCE_PAY_2048: Evidence[] = [
  { id: 'ev-1', incidentId: 'PAY-2048', category: 'metrics', label: 'Payment failure rate', value: '38.4%', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-2', incidentId: 'PAY-2048', category: 'gateway', label: 'Gateway A timeout failures', value: '81% of timeouts', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-3', incidentId: 'PAY-2048', category: 'config', label: 'Gateway A timeout config', value: 'Changed 18 min before incident', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-4', incidentId: 'PAY-2048', category: 'deployment', label: 'Recent deployments', value: 'None correlate', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-5', incidentId: 'PAY-2048', category: 'gateway', label: 'Gateway B status', value: 'Normal', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-6', incidentId: 'PAY-2048', category: 'history', label: 'Incident PAY-1872', value: 'Similar failure pattern', supportsRootCause: false, timestamp: new Date().toISOString() },
];

export const EVIDENCE_PAY_2051: Evidence[] = [
  { id: 'ev-a', incidentId: 'PAY-2051', category: 'finance', label: 'Disputed transaction amount', value: '$48,700', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-b', incidentId: 'PAY-2051', category: 'metrics', label: 'Affected transactions', value: '980 transactions', supportsRootCause: true, timestamp: new Date().toISOString() },
];

export const ROOT_CAUSE = 'Gateway A timeout configuration';
export const ROOT_CAUSE_CONFIDENCE = 0.94;
export const RECOVERY_STAGES_PAY_2048: RecoveryStage[] = [
  { stage: 0, value: 38.4, label: 'Detected' },
  { stage: 1, value: 17.2, label: 'After rollback' },
  { stage: 2, value: 4.7, label: 'Stabilizing' },
  { stage: 3, value: 2.3, label: 'Baseline' },
];
