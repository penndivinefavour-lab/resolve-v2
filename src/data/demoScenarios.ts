import { EVIDENCE_PAY_2048, EVIDENCE_PAY_2051 } from '../data/demoIncidents';
import type { Evidence } from '../store/types';

export const ACTIVITY_STEPS = [
  { agent: 'DetectionAgent', label: 'Incident detected', done: true },
  { agent: 'InvestigationAgent', label: '6 evidence sources analyzed', done: true },
  { agent: 'DecisionAgent', label: 'Evaluating remediation', done: false, current: true },
  { agent: 'PolicyEngine', label: 'Policy evaluation', done: false },
  { agent: 'ActionAgent', label: 'Executing remediation', done: false },
  { agent: 'VerificationAgent', label: 'Verifying recovery', done: false },
];

export const NAVIGATION_ITEMS = [
  { key: 'command-center', label: 'Command Center' },
  { key: 'approval-center', label: 'Approvals' },
  { key: 'report', label: 'Resolution Report' },
];

export const AGENT_DEFS: Record<string, { color: string; icon: string }> = {
  DetectionAgent: { color: 'var(--critical)', icon: '⚡' },
  InvestigationAgent: { color: 'var(--info)', icon: '🔬' },
  DecisionAgent: { color: 'var(--brand)', icon: '🧠' },
  PolicyEngine: { color: 'var(--warning)', icon: '📋' },
  ActionAgent: { color: 'var(--success)', icon: '⚙️' },
  VerificationAgent: { color: 'var(--brand)', icon: '✅' },
  EscalationAgent: { color: 'var(--danger)', icon: '🚨' },
  System: { color: 'var(--text-muted)', icon: '●' },
};

export const workflowSteps = [
  { key: 'detected', label: 'Detect' },
  { key: 'investigating', label: 'Investigate' },
  { key: 'root-cause-identified', label: 'Root Cause' },
  { key: 'action-proposed', label: 'Decision' },
  { key: 'risk-check', label: 'Policy' },
  { key: 'executing', label: 'Execute' },
  { key: 'verifying', label: 'Verify' },
  { key: 'resolved', label: 'Resolve' },
] as const;

export type WorkflowStep = typeof workflowSteps[number];

export function getEvidenceForIncident(incidentId: string): Evidence[] {
  if (incidentId === 'PAY-2048') return EVIDENCE_PAY_2048;
  if (incidentId === 'PAY-2051') return EVIDENCE_PAY_2051;
  return [];
}

export function severityLabel(severity: 'critical' | 'high' | 'medium' | 'low'): string {
  return severity.toUpperCase();
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').toUpperCase();
}

export function resolvePermission(action: string): 'AUTONOMOUS' | 'HUMAN_APPROVAL' | 'BLOCKED' {
  const lower = action.toLowerCase();
  if (lower.includes('delete')) return 'BLOCKED';
  if (lower.includes('refund')) return 'HUMAN_APPROVAL';
  if (lower.includes('rollback') || lower.includes('restart')) return 'AUTONOMOUS';
  return 'AUTONOMOUS';
}
