import React from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'status';

interface BadgeProps {
  variant?: BadgeVariant | string;
  children: React.ReactNode;
  className?: string;
  policy?: string;
  severity?: string;
  status?: string;
}

export function Badge({ variant = 'default', children, className, policy, severity, status }: BadgeProps) {
  const cls = typeof variant === 'string' && variant !== 'status' ? variant : 'default';
  const parts = ['badge'];
  parts.push(`badge-${cls}`);
  if (policy) parts.push(`badge-${policy.toLowerCase()}`);
  if (severity) parts.push(`badge--${severity.toLowerCase()}`);
  if (status) parts.push(`badge--${status.toLowerCase().replace(/_/g, '-')}`);
  if (className) parts.push(className);
  return <span className={parts.join(' ')}>{children}</span>;
}
