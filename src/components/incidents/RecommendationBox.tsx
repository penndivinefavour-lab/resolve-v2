import type { ActionProposal } from '../../store/types';

interface RecommendationBoxProps {
  proposal: ActionProposal;
}

export function RecommendationBox({ proposal }: RecommendationBoxProps) {
  return (
    <div className="recommendation-box animate-fade-in-up">
      <div className="recommendation-box__header">
        <span className="recommendation-box__title">Recommended Action</span>
        <span className={`badge badge-${proposal.risk === 'low' ? 'success' : proposal.risk === 'medium' ? 'warning' : 'danger'}`}>
          {proposal.risk.toUpperCase()} RISK
        </span>
      </div>

      <div className="recommendation-box__action">
        <span className="recommendation-box__action-label">Action</span>
        <div className="recommendation-box__action-value mono">{proposal.action.replace(/_/g, ' ').toUpperCase()}</div>
      </div>

      <div className="recommendation-box__meta-grid">
        <div className="recommendation-box__meta">
          <div className="recommendation-box__meta-label">Expected outcome</div>
          <div className="recommendation-box__meta-value">{proposal.expectedOutcome}</div>
        </div>
        <div className="recommendation-box__meta">
          <div className="recommendation-box__meta-label">Estimated recovery</div>
          <div className="recommendation-box__meta-value">{proposal.estimatedRecoveryMinutes} min</div>
        </div>
        <div className="recommendation-box__meta">
          <div className="recommendation-box__meta-label">Reversible</div>
          <div className="recommendation-box__meta-value">{proposal.reversible ? 'Yes' : 'No'}</div>
        </div>
        <div className="recommendation-box__meta">
          <div className="recommendation-box__meta-label">Confidence</div>
          <div className="recommendation-box__meta-value recommendation-box__meta-value--high">{(proposal.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="recommendation-box__reason">
        <span className="recommendation-box__reason-label">Rationale</span>
        <p className="recommendation-box__reason-text">{proposal.reason}</p>
      </div>
    </div>
  );
}
