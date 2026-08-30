
interface ResultBannerProps {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

export function ResultBanner({ type, title, message }: ResultBannerProps) {
  const variant = type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning';
  return (
    <div className={`result-banner result-banner--${variant}`}>
      <div className="result-banner__title">{title}</div>
      <div className="result-banner__message">{message}</div>
    </div>
  );
}
