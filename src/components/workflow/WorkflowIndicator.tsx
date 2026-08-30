import React from 'react';
import { workflowSteps } from '../../data/demoScenarios';
import type { WorkflowStep } from '../../data/demoScenarios';

type WorkflowStepStatus = 'completed' | 'current' | 'upcoming' | 'failed' | 'blocked';

interface WorkflowIndicatorProps {
  currentStatus: string;
  failed?: boolean;
  blocked?: boolean;
}

export function WorkflowIndicator({ currentStatus, failed = false, blocked = false }: WorkflowIndicatorProps) {
  const labelForStatus = (status: string): string => {
    const lower = status.toLowerCase();
    const kebab = lower.replace(/_/g, '-');
    return workflowSteps.find((s: WorkflowStep) => s.key === kebab)?.label ?? status;
  };

  return (
    <div className="workflow-indicator" role="navigation" aria-label="Incident workflow">
      {workflowSteps.map((step: WorkflowStep, idx: number) => {
        const key = step.key;
        const currentStatusKey = currentStatus.toLowerCase().replace(/_/g, '-');
        const isTerminal = ['resolved', 'escalated', 'blocked'].includes(currentStatusKey);

        let status: WorkflowStepStatus = 'upcoming';

        if (failed && currentStatusKey === 'verifying') {
          status = 'failed';
        } else if (blocked && currentStatusKey === 'risk-check') {
          status = 'blocked';
        } else if (isTerminal && currentStatus === 'RESOLVED') {
          status = idx <= 7 ? 'completed' : 'upcoming';
        } else if (isTerminal && (currentStatus === 'ESCALATED' || currentStatus === 'BLOCKED')) {
          const terminalStepIndex = currentStatus === 'ESCALATED' ? 6 : 4;
          status = idx <= terminalStepIndex ? 'completed' : 'upcoming';
          if (idx === terminalStepIndex + 1 && currentStatus === 'ESCALATED') status = 'failed';
          if (idx === terminalStepIndex && currentStatus === 'BLOCKED') status = 'blocked';
        } else if (currentStatusKey === key) {
          status = 'current';
        } else if (workflowSteps.findIndex((s: WorkflowStep) => s.key === currentStatusKey) !== -1) {
          const currentIdx = workflowSteps.findIndex((s: WorkflowStep) => s.key === currentStatusKey);
          status = idx <= currentIdx ? 'completed' : 'upcoming';
        }

        const isClickable = ['detected', 'investigating', 'root-cause-identified', 'action-proposed', 'risk-check', 'executing', 'verifying', 'resolved'].includes(key);
        const isLast = idx === workflowSteps.length - 1;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`workflow-step workflow-step--${status} ${isClickable && status !== 'upcoming' ? 'workflow-step--clickable' : ''}`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <button
                type="button"
                disabled={!isClickable || status === 'upcoming'}
                className="workflow-step__circle"
                aria-label={`${labelForStatus(key)} — ${status}`}
                aria-current={status === 'current' ? 'step' : undefined}
              >
                {status === 'completed' ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : status === 'failed' ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M4 4L10 10M10 4L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : status === 'blocked' ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="2.5" y="2.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M5 5L9 9M9 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                ) : (
                  <span className="workflow-step__number">{idx + 1}</span>
                )}
              </button>
              <span className="workflow-step__label">{step.label}</span>
            </div>
            {!isLast && (
              <div
                className={`workflow-arrow workflow-arrow--${status}`}
                style={{ animationDelay: `${idx * 60 + 30}ms` }}
                aria-hidden="true"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10H15M12 6L16 10L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
