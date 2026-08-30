import type { Authorization } from '../../store/types';

interface PolicyBadgeProps {
  authorization: Authorization;
  risk?: string;
}

export function PolicyBadge({ authorization, risk }: PolicyBadgeProps) {
  const label = authorization.replace(/_/g, ' ').toUpperCase();
  const variant = authorization === 'AUTONOMOUS' ? 'success' : authorization === 'HUMAN_APPROVAL' ? 'warning' : 'danger';
  return (
    <span className={`badge badge-${variant}`}>
      {label}
      {risk && <span className="policy-badge__risk">· {risk.toUpperCase()}</span>}
    </span>
  );
}
