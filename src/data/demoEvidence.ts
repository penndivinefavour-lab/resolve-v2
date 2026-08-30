import type { Evidence } from '../store/types';

export const EVIDENCE_PAY_2048: Evidence[] = [
  { id: 'ev-1', incidentId: 'PAY-2048', category: 'metrics', label: 'Payment failure rate', value: '38.4%', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-2', incidentId: 'PAY-2048', category: 'gateway', label: 'Gateway A timeout failures', value: '81% of timeouts', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-3', incidentId: 'PAY-2048', category: 'config', label: 'Gateway A timeout config', value: 'Changed 18 min before incident', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-4', incidentId: 'PAY-2048', category: 'deployment', label: 'Recent deployments', value: 'None correlate', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-5', incidentId: 'PAY-2048', category: 'gateway', label: 'Gateway B status', value: 'Normal', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-6', incidentId: 'PAY-2048', category: 'history', label: 'Incident PAY-1872', value: 'Similar failure pattern', supportsRootCause: false, timestamp: new Date().toISOString() },
];

export const EVIDENCE_PAY_2051: Evidence[] = [
  { id: 'ev-a', incidentId: 'PAY-2051', category: 'metrics', label: 'Disputed transaction count', value: '980 transactions', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-b', incidentId: 'PAY-2051', category: 'finance', label: 'Total disputed amount', value: '$48,700', supportsRootCause: true, timestamp: new Date().toISOString() },
  { id: 'ev-c', incidentId: 'PAY-2051', category: 'policy', label: 'Refund authority threshold', value: 'Autonomous limit: $10,000', supportsRootCause: true, timestamp: new Date().toISOString() },
];

export function getEvidenceForIncident(incidentId: string): Evidence[] {
  if (incidentId === 'PAY-2048') return EVIDENCE_PAY_2048;
  if (incidentId === 'PAY-2051') return EVIDENCE_PAY_2051;
  return [];
}
