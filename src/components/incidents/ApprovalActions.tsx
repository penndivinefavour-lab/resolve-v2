import { Button } from '../ui/Button';

interface ApprovalActionsProps {
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalActions({ onApprove, onReject }: ApprovalActionsProps) {
  return (
    <div className="approval-actions">
      <div className="approval-actions__row">
        <Button variant="danger" onClick={onReject}>
          Reject
        </Button>
        <Button variant="success" onClick={onApprove}>
          Approve Action
        </Button>
      </div>
      <p className="approval-actions__hint">
        Your decision is final and will be recorded in the audit trail.
      </p>
    </div>
  );
}
