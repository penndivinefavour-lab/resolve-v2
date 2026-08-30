
interface Check {
  name: string;
  passed: boolean;
  value: string | number;
}

interface ChecksListProps {
  checks: Check[];
  passed: boolean;
}

export function ChecksList({ checks, passed }: ChecksListProps) {
  return (
    <div className={`checks-list ${passed ? 'checks-list--passed' : 'checks-list--failed'}`}>
      <div className="checks-list__header">
        <span className="checks-list__title">Verification Checks</span>
        <span className={`badge badge-${passed ? 'success' : 'danger'}`}>
          {passed ? 'ALL PASSED' : 'SOME FAILED'}
        </span>
      </div>
      <div className="checks-list__items">
        {checks.map((check, idx) => (
          <div key={idx} className="checks-list__item">
            <span className={passed ? 'checks-list__icon checks-list__icon--pass' : 'checks-list__icon checks-list__icon--fail'}>
              {passed ? '✓' : '✗'}
            </span>
            <span className="checks-list__name">{check.name}</span>
            <span className="checks-list__value mono">{check.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
