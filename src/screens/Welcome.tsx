import React, { useCallback } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ScenarioPicker } from '../components/ui/ScenarioPicker';
import type { Screen } from '../store/types';

export function Welcome() {
  const { state, dispatch } = useRESOLVE();

  const handleLaunchDemo = useCallback(() => {
    dispatch({ type: 'START_DEMO' });
  }, [dispatch]);

  const handleStartScenario = useCallback((screen: Screen) => {
    dispatch({ type: 'NAVIGATE', screen });
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const isDemoActive = state.incidents.length > 0;

  return (
    <div className="welcome-page">
      <div className="welcome-page__bg">
        <div className="welcome-page__bg-grid" />
        <div className="welcome-page__bg-glow" />
      </div>

      <div className="welcome-page__content">
        <div className="welcome-page__brand">
          <div className="welcome-page__logo">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="48" height="48" rx="12" stroke="currentColor" strokeWidth="2.5" />
              <path d="M16 28L24 36L40 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="welcome-page__title">RESOLVE</h1>
          <p className="welcome-page__subtitle">AI-Native Enterprise Operations</p>
        </div>

        <div className="welcome-page__body">
          <p className="welcome-page__description">
            Autonomous incident response with policy-controlled execution.
            RESOLVE detects incidents, investigates root causes, evaluates remediation
            actions against policy, executes safe actions, independently verifies recovery,
            and escalates decisions that require human intervention.
          </p>

          <div className="welcome-page__workflow">
            {['DETECT', 'INVESTIGATE', 'DECIDE', 'POLICY', 'ACT', 'VERIFY', 'RESOLVE'].map((step, i) => (
              <React.Fragment key={step}>
                <span className="welcome-page__workflow-step">{step}</span>
                {i < 6 && <span className="welcome-page__workflow-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="welcome-page__actions">
            <Button variant="primary" size="lg" onClick={handleLaunchDemo}>
              Launch Demo
            </Button>
            <Button variant="secondary" size="lg" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {isDemoActive && (
            <ScenarioPicker onSelect={handleStartScenario} />
          )}
        </div>

        <div className="welcome-page__scenarios">
          <div className="welcome-page__scenario">
            <Badge variant="success">Scenario A</Badge>
            <h3>PAY-2048 Happy Path</h3>
            <p>Payment gateway degradation detected, investigated, remediated autonomously, and verified.</p>
          </div>
          <div className="welcome-page__scenario">
            <Badge variant="warning">Scenario B</Badge>
            <h3>PAY-2051 Approval</h3>
            <p>High-value refund requires human approval; human approves and RESOLVE executes.</p>
          </div>
          <div className="welcome-page__scenario">
            <Badge variant="danger">Scenario C</Badge>
            <h3>PAY-2051 Rejection</h3>
            <p>Human rejects the refund; incident escalates.</p>
          </div>
          <div className="welcome-page__scenario">
            <Badge variant="accent">Scenario D</Badge>
            <h3>Blocked Deletion</h3>
            <p>Policy engine blocks a production data deletion request.</p>
          </div>
          <div className="welcome-page__scenario">
            <Badge variant="danger">Scenario E</Badge>
            <h3>Verification Failure</h3>
            <p>PAY-2048 remediation executed but verification fails; incident escalates.</p>
          </div>
        </div>
      </div>

      <div className="welcome-page__footer">
        <div className="welcome-page__status">
          <span className="welcome-page__status-dot" />
          <span>Systems Operational</span>
        </div>
        <span className="welcome-page__version">Stage 1 Prototype</span>
      </div>
    </div>
  );
}
