import type { Incident, VerificationResult, AuditEvent } from '../../store/types';
import { MetricCard } from './MetricCard';

interface ResolutionReportContentProps {
  incident: Incident;
  verification?: VerificationResult;
  audit: AuditEvent[];
}

export function ResolutionReportContent({ verification, audit }: ResolutionReportContentProps) {
  const timeline = [
    { time: '09:42', text: 'Incident detected.' },
    { time: '09:43', text: 'Investigation initiated.' },
    { time: '09:44', text: 'Root cause identified.' },
    { time: '09:45', text: 'Autonomous remediation authorized.' },
    { time: '09:45', text: 'Rollback executed.' },
    { time: '09:46', text: 'Recovery detected.' },
    { time: '09:47', text: 'Resolution verified.' },
  ];

  const agents = ['Detection', 'Investigation', 'Decision', 'Risk', 'Action', 'Verification'];

  return (
    <div className="resolution-report-content animate-fade-in">
      <div className="resolution-report-content__summary">
        <span className="resolution-report-content__summary-label">Executive Summary</span>
        <p className="resolution-report-content__summary-text">
          Gateway A timeout configuration triggered a critical payment failure spike. RESOLVE investigated,
          identified the root cause with 94% confidence, authorized an autonomous rollback via deterministic policy,
          executed the remediation, and verified full recovery to baseline.
        </p>
      </div>

      <div className="resolution-report-content__outcome-grid">
        <MetricCard label="Failure Rate Reduction" value={verification ? `${verification.recovery.toFixed(1)} pp` : '—'} accent="success" />
        <MetricCard label="Resolution Time" value="5 min" accent="info" />
        <MetricCard label="Human Interventions" value="0" accent="success" />
        <MetricCard label="Actions Audited" value={audit.length} accent="accent" />
      </div>

      <div className="resolution-report-content__timeline">
        <span className="resolution-report-content__section-label">Timeline</span>
        {timeline.map((item, idx) => (
          <div key={idx} className="resolution-report-content__timeline-row">
            <span className="resolution-report-content__timeline-time mono">{item.time}</span>
            <span className="resolution-report-content__timeline-dot" />
            <span className="resolution-report-content__timeline-text">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="resolution-report-content__agents">
        <span className="resolution-report-content__section-label">Agent Contribution</span>
        <div className="resolution-report-content__agents-row">
          {agents.map((a) => (
            <span key={a} className="badge badge-accent">{a} ✓</span>
          ))}
        </div>
      </div>

      <div className="resolution-report-content__audit">
        <span className="resolution-report-content__section-label">Audit Trail ({audit.length} events)</span>
        <div className="resolution-report-content__audit-list">
          {audit.slice(0, 8).map((event) => (
            <div key={event.id} className="resolution-report-content__audit-item">
              <span className="resolution-report-content__audit-time mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
              <span className="resolution-report-content__audit-agent">{event.agent ?? 'System'}</span>
              <span className="resolution-report-content__audit-action">{event.action.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
