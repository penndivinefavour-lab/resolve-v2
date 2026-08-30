import { Button } from '../ui/Button';

interface CompletedBoxProps {
  title: string;
  subtitle: string;
  onContinue?: () => void;
}

export function CompletedBox({ title, subtitle, onContinue }: CompletedBoxProps) {
  return (
    <div className="completed-box animate-fade-in-up">
      <div className="completed-box__title">{title}</div>
      <div className="completed-box__subtitle">{subtitle}</div>
      {onContinue && (
        <Button variant="primary" onClick={onContinue}>
          Continue →
        </Button>
      )}
    </div>
  );
}
