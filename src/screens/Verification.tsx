import { useCallback, useEffect, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import type { AgentActivity } from '../store/types';

export function Verification() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const verification = state.verifications[0];

  const [_activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048' },
    { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout (94%)' },
    { agent: 'DecisionAgent', action: 'Action proposed', timestamp: new Date().toISOString(), status: 'completed', detail: 'rollback_gateway_config' },
    { agent: 'PolicyEngine', action: 'Policy evaluated', timestamp: new Date().toISOString(), status: 'completed', detail: 'AUTONOMOUS' },
    { agent: 'ActionAgent', action: 'Remediation executed', timestamp: new Date().toISOString(), status: 'completed', detail: 'Gateway A timeout rolled back' },
    { agent: 'VerificationAgent', action: 'Verification started', timestamp: new Date().toISOString(), status: 'in_progress', detail: 'Checking recovery metrics' },
  ]);

  useEffect(() => {
    if (verification?.verified) {
      setActivity((prev) => [
        ...prev.slice(0, -1),
        { agent: 'VerificationAgent', action: 'Verification passed', timestamp: new Date().toISOString(), status: 'completed' as const, detail: `Payment failure rate: ${verification.before}% → ${verification.after}% (baseline: ${verification.baseline}%)` },
      ]);
      addToast({ type: 'success', title: 'Recovery Verified', message: `Failure rate reduced from ${verification.before}% to ${verification.after}%` });
    }
  }, [verification, addToast]);

  const failed = !verification?.verified && incident?.status === 'ESCALATED';

  const handleBack = useCallback(() => dispatch({ type: 'NAVIGATE', screen: 'execution' }), [dispatch]);
  const handleContinue = useCallback(() => {
    if (incident) dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'report' });
  }, [dispatch, incident]);
  const handleFail = useCallback(() => {
    if (!incident) return;
    dispatch({ type: 'FAIL_VERIFICATION', incidentId: incident.id });
    setActivity((prev) => [
      ...prev.slice(0, -1),
      { agent: 'VerificationAgent', action: 'Verification failed', timestamp: new Date().toISOString(), status: 'failed' as const, detail: 'Payment failure rate remains above baseline' },
      { agent: 'EscalationAgent', action: 'Incident escalated', timestamp: new Date().toISOString(), status: 'in_progress' as const, detail: 'Human intervention required' },
    ]);
    dispatch({ type: 'NAVIGATE', screen: 'report' });
  }, [dispatch, incident]);

  if (!incident || !verification) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-12)' }}>
        <div className="spinner spinner-lg" />
        <p style={{ color: 'var(--text-muted)' }}>Running verification checks...</p>
      </div>
    );
  }

  return (
    <div className="verification-view animate-fade-in">
      <div className="investigation-header">
        <div>
          <h2 className="investigation-title">Verification — {incident.id}</h2>
          <p className="investigation-subtitle mono">{failed ? 'Verification failed' : 'Independent verification of remediation'}</p>
        </div>
        <Badge variant={failed ? 'danger' : 'success'}>{failed ? 'FAILED' : 'IN PROGRESS'}</Badge>
      </div>

      {!failed ? (
        <>
          {/* Recovery Hero */}
          <div className="verification-hero">
            <span className="verification-hero__title">RECOVERY VERIFICATION</span>
            <div className="verification-hero__flow">
              <div className="verification-hero__metric">
                <span className="verification-hero__label">Initial</span>
                <span className="verification-hero__value verification-hero__value--danger">{verification.before}%</span>
              </div>
              <span className="verification-hero__arrow">→</span>
              <div className="verification-hero__metric">
                <span className="verification-hero__label">Current</span>
                <span className="verification-hero__value verification-hero__value--success">{verification.after}%</span>
              </div>
              <span className="verification-hero__arrow">→</span>
              <div className="verification-hero__metric">
                <span className="verification-hero__label">Baseline</span>
                <span className="verification-hero__value" style={{ color: 'var(--info)' }}>{verification.baseline}%</span>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--success)', fontWeight: 600 }}>
              Recovery: {verification.recovery.toFixed(1)} percentage points
            </div>
          </div>

          {/* Chart */}
          <div className="verification-chart">
            <div className="panel-header"><span className="panel-title">Recovery Progression</span></div>
            <div className="bar-chart__grid">
              {[
                { label: 'Before', value: 38.4, color: 'var(--danger)' },
                { label: 'After rollback', value: 17.2, color: 'var(--warning)' },
                { label: 'Stabilizing', value: 4.7, color: 'var(--info)' },
                { label: 'Baseline', value: 2.3, color: 'var(--success)' },
              ].map(({ label, value, color }, i) => (
                <div key={i} className="bar-chart__stage">
                  <div className="bar-chart__bar-wrapper">
                    <div className="bar-chart__bar" style={{ height: `${Math.max(8, (value / 40) * 100)}%`, background: color }} />
                  </div>
                  <span className="bar-chart__bar-value mono">{value}%</span>
                  <span className="bar-chart__stage-label">{label}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>Baseline: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{verification.baseline}%</span></div>
          </div>

          {/* Checks */}
          <div className="card">
            <div className="panel-header"><span className="panel-title">Verification Checks</span><Badge variant={verification.verified ? 'success' : 'danger'}>{verification.verified ? 'ALL PASSED' : 'SOME FAILED'}</Badge></div>
            <div className="checks-list">
              {verification.checks.map((check, i) => (
                <div key={i} className="check-item">
                  <span className={`check-icon--${check.passed ? 'pass' : 'fail'}`}>{check.passed ? '✓' : '✗'}</span>
                  <span className="check-name">{check.name}</span>
                  <span className="check-value mono">{String(check.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="verification-actions">
            <Button variant="primary" size="lg" onClick={handleContinue}>View Resolution Report →</Button>
            <Button variant="danger" onClick={handleFail}>Simulate Verification Failure</Button>
            <Button variant="ghost" onClick={handleBack}>Back to Execution</Button>
          </div>
        </>
      ) : (
        <div className="escalation-card">
          <span className="escalation-card__title">VERIFICATION FAILED</span>
          <Badge variant="danger">ESCALATED</Badge>
          <p className="escalation-card__message">RESOLVE could not verify recovery. Payment failure rate remains above baseline. Further human intervention is required.</p>
          <div className="checks-list">
            {verification.checks.filter(c => !c.passed).map((check, i) => (
              <div key={i} className="check-item">
                <span className="check-icon--fail">✗</span>
                <span className="check-name">{check.name}</span>
                <span className="check-value mono">{String(check.value)}</span>
              </div>
            ))}
          </div>
          <div className="verification-actions">
            <Button variant="primary" onClick={handleContinue}>View Escalation Report →</Button>
            <Button variant="ghost" onClick={handleBack}>Back to Execution</Button>
          </div>
        </div>
      )}
    </div>
  );
}
