// RESOLVE orchestration
// Stage 2+: replace with engine-driven orchestration
// For now this module is a placeholder
export const ORCHESTRATION_STAGES = [
  'detected',
  'investigating',
  'root-cause-identified',
  'action-proposed',
  'risk-check',
  'executing',
  'verifying',
  'resolved',
] as const;

export type OrchestrationStage = typeof ORCHESTRATION_STAGES[number];
