import { useCallback, useEffect, useState } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ROOT_CAUSE, ROOT_CAUSE_CONFIDENCE } from '../data/demoIncidents';
import { getEvidenceForIncident } from '../data/demoScenarios';
import { useToast } from '../components/ui/Toast';
import type { AgentActivity } from '../store/types';

type LoadStage = 'idle' | 'analyzing' | 'correlating' | 'identifying';

export function Investigation() {
  const { state, dispatch } = useRESOLVE();
  const { addToast } = useToast();
  const incident = state.incidents.find((i) => i.id === state.currentIncidentId) ?? state.incidents.find((i) => i.id === 'PAY-2048');
  const evidence = state.evidence.length > 0 ? state.evidence : getEvidenceForIncident(incident?.id ?? 'PAY-2048');

  const [_activity, setActivity] = useState<AgentActivity[]>([
    { agent: 'DetectionAgent', action: 'Incident detected', timestamp: new Date().toISOString(), status: 'completed', detail: 'PAY-2048 · Payment Gateway Degradation' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadStage, setLoadStage] = useState<LoadStage>('idle');

  useEffect(() => {
    if (incident?.status === 'INVESTIGATING') {
      setActivity((prev) => [...prev, { agent: 'InvestigationAgent', action: '6 evidence sources analyzed', timestamp: new Date().toISOString(), status: 'in_progress' as const, detail: 'Correlating metrics, configs, and deployment history' }]);
    }
    if (incident?.status === 'ROOT_CAUSE_IDENTIFIED') {
      setActivity((prev) => [
        ...prev.filter((a) => a.agent !== 'InvestigationAgent' || a.status !== 'in_progress'),
        { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed' as const, detail: `${ROOT_CAUSE} · ${Math.round(ROOT_CAUSE_CONFIDENCE * 100)}% confidence` },
        { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: 'in_progress' as const, detail: 'Analyzing proposed actions against policy' },
      ]);
    }
  }, [incident?.status]);

  const handleContinue = useCallback(() => {
    if (!incident || loading) return;
    setLoading(true);
    setLoadStage('analyzing');

    const timers = [
      setTimeout(() => setLoadStage('correlating'), 400),
      setTimeout(() => setLoadStage('identifying'), 800),
      setTimeout(() => {
        dispatch({ type: 'ADVANCE_INCIDENT', incidentId: incident.id, screen: 'investigation' });
        setActivity((prev) => [
          ...prev,
          { agent: 'InvestigationAgent', action: 'Root cause identified', timestamp: new Date().toISOString(), status: 'completed' as const, detail: `${ROOT_CAUSE} · ${Math.round(ROOT_CAUSE_CONFIDENCE * 100)}% confidence` },
          { agent: 'DecisionAgent', action: 'Evaluating remediation', timestamp: new Date().toISOString(), status: 'in_progress' as const, detail: 'Analyzing proposed actions against policy' },
        ]);
        setLoading(false);
        setLoadStage('idle');
        addToast({ type: 'success', title: 'Root Cause Identified', message: `${ROOT_CAUSE} — ${Math.round(ROOT_CAUSE_CONFIDENCE * 100)}% confidence` });
      }, 1400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [incident, loading, dispatch, addToast]);

  const handleBack = useCallback(() => dispatch({ type: 'NAVIGATE', screen: 'command-center' }), [dispatch]);

  if (!incident) {
    return (
      <div className="empty-state">
        <p>No incident selected.</p>
        <Button variant="secondary" onClick={handleBack}>Back to Command Center</Button>
      </div>
    );
  }

  const loadMessages: Record<LoadStage, string> = { idle: '', analyzing: 'Analyzing evidence sources...', correlating: 'Correlating gateway telemetry...', identifying: 'Identifying root cause...' };

  return (
    <div className="investigation-view animate-fade-in">
      <div className="investigation-header">
        <div>
          <h2 className="investigation-title">{incident.id} — {incident.title}</h2>
          <p className="investigation-subtitle mono">{incident.service} · Detected {new Date(incident.detectedAt).toLocaleTimeString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Badge variant="severity" severity={incident.severity}>{incident.severity?.toUpperCase()}</Badge>
          <Badge variant="status" status={incident.status}>{incident.status.replace(/_/g, ' ')}</Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="investigation-stats">
        {[
          { label: 'Failure Rate', value: `${incident.metrics?.paymentFailureRate ?? 38.4}%`, cls: 'danger' },
          { label: 'Evidence Sources', value: String(evidence.length), cls: 'accent' },
          { label: 'Confidence', value: `${Math.round(ROOT_CAUSE_CONFIDENCE * 100)}%`, cls: 'success' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="stat-box">
            <span className={`stat-box__value stat-box__value--${cls}`}>{value}</span>
            <span className="stat-box__label">{label}</span>
          </div>
        ))}
      </div>

      <div className="investigation-body">
        {/* Evidence Grid */}
        <div>
          {incident.status !== 'ROOT_CAUSE_IDENTIFIED' ? (
            <div className="evidence-grid">
              {evidence.map((ev, i) => (
                <div key={ev.id} className={`evidence-card ${ev.supportsRootCause ? 'evidence-card--root' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <span className="evidence-card__category">{ev.category}</span>
                  <span className="evidence-card__label">{ev.label}</span>
                  <span className="evidence-card__value mono">{String(ev.value)}</span>
                  {ev.supportsRootCause && <span className="badge badge-accent" style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>Supports root cause</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="conclusion-box animate-fade-in-up">
              <span className="conclusion-box__title">Root Cause Identified</span>
              <span className="conclusion-box__root-cause">{ROOT_CAUSE}</span>
              <span className="conclusion-box__confidence">{Math.round(ROOT_CAUSE_CONFIDENCE * 100)}% Confidence</span>
              <p className="conclusion-box__insight">InvestigationAgent analyzed {evidence.length} evidence sources including metrics, configuration history, and cross-gateway health data to isolate this root cause.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="investigation-sidebar">
          <div className="card">
            <div className="panel-header"><span className="panel-title">Investigation Status</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {[
                { agent: 'DetectionAgent', status: 'completed', label: 'Incident detected' },
                { agent: 'InvestigationAgent', status: incident.status === 'ROOT_CAUSE_IDENTIFIED' ? 'completed' : 'in_progress', label: incident.status === 'ROOT_CAUSE_IDENTIFIED' ? 'Root cause identified' : 'Analyzing evidence' },
                { agent: 'DecisionAgent', status: incident.status === 'ROOT_CAUSE_IDENTIFIED' ? 'in_progress' : 'pending', label: 'Evaluating remediation' },
              ].map(({ agent, status, label: _label }) => (
                <div key={agent} className={`pipeline-item pipeline-item--${status}`}>
                  <span className="pipeline-icon" style={{ background: 'var(--text-muted)' }}>●</span>
                  <span className="pipeline-label">{agent}</span>
                  <span className="pipeline-status">{status === 'completed' ? <span style={{ color: 'var(--success)' }}>✓</span> : status === 'in_progress' ? <span className="pipeline-dot pipeline-dot--active" /> : <span className="pipeline-dot pipeline-dot--pending" />}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="investigation-actions">
        <Button variant="primary" size="lg" loading={loading} disabled={loading} onClick={handleContinue}>
          {loading ? loadMessages[loadStage] || 'Processing...' : 'Continue to Decision →'}
        </Button>
        <Button variant="ghost" onClick={handleBack}>Back to Command Center</Button>
      </div>
    </div>
  );
}
