import type { VerificationResult } from '../store/types';

export interface RecoveryStage {
  stage: number;
  value: number;
  label: string;
}

export const PAY_2048_RECOVERY: RecoveryStage[] = [
  { stage: 1, value: 38.4, label: 'Detected' },
  { stage: 2, value: 17.2, label: 'After rollback' },
  { stage: 3, value: 4.7, label: 'Stabilizing' },
  { stage: 4, value: 2.3, label: 'Baseline' },
];

export const PAY_2048_BASELINE = 2.3;
export const PAY_2048_BEFORE = 38.4;

export function buildVerificationResult(
  incidentId: string,
  success = true,
): VerificationResult {
  const checks = success
    ? [
        { name: 'Payment failure rate', passed: true, value: '2.3%' },
        { name: 'Gateway timeout rate', passed: true, value: '0.4%' },
        { name: 'Transaction recovery', passed: true, value: 'Confirmed' },
        { name: 'Customer impact', passed: true, value: 'Stabilized' },
      ]
    : [
        { name: 'Payment failure rate', passed: false, value: '14.8%' },
        { name: 'Gateway timeout rate', passed: false, value: 'Elevated' },
        { name: 'Transaction recovery', passed: false, value: 'Partial' },
        { name: 'Customer impact', passed: false, value: 'Unstable' },
      ];

  return {
    incidentId,
    verified: success,
    metric: 'paymentFailureRate',
    before: PAY_2048_BEFORE,
    after: success ? PAY_2048_BASELINE : 14.8,
    baseline: PAY_2048_BASELINE,
    recovery: success ? 36.1 : 23.6,
    confidence: success ? 0.99 : 0.42,
    checks,
    recoveryStages: success ? PAY_2048_RECOVERY : PAY_2048_RECOVERY.map((s) => ({ ...s, value: s.value })),
  };
}

export { buildVerificationResult as createVerificationResult };
