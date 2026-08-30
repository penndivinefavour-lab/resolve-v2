import type { Screen } from '../../store/types';

interface ScenarioPickerProps {
  onSelect: (screen: Screen) => void;
  current?: Screen;
}

const scenarios: Array<{ id: string; label: string; description: string; screen: Screen }> = [
  { id: 'A', label: 'PAY-2048 Happy Path', description: 'Payment gateway degradation — autonomous resolution.', screen: 'investigation' },
  { id: 'B', label: 'PAY-2051 Approval', description: 'High-value refund — human approval flow.', screen: 'approval-center' },
  { id: 'C', label: 'PAY-2051 Rejection', description: 'Human rejects — escalation path.', screen: 'approval-center' },
  { id: 'D', label: 'Blocked Deletion', description: 'Policy blocks a dangerous action.', screen: 'command-center' },
  { id: 'E', label: 'Verification Failure', description: 'Remediation succeeds but verification fails.', screen: 'verification' },
];

export function ScenarioPicker({ onSelect, current }: ScenarioPickerProps) {
  return (
    <div className="scenario-picker">
      <div className="scenario-picker__header">
        <span className="scenario-picker__title">Replay Scenario</span>
        <span className="scenario-picker__sub">Try a different outcome path</span>
      </div>
      <div className="scenario-picker__grid">
        {scenarios.map((s) => (
          <button
            key={s.id}
            className={`scenario-picker__item ${current === s.screen ? 'scenario-picker__item--active' : ''}`}
            onClick={() => onSelect(s.screen)}
          >
            <span className="scenario-picker__item-label">{s.label}</span>
            <span className="scenario-picker__item-desc">{s.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
