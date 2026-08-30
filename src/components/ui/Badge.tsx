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
  const extra = [policy, severity, status].filter(Boolean).join(' ');
  return <span className={`badge badge-${cls} ${extra ? `badge-${extra}` : ''} ${className ?? ''}`}>{children}</span>;
}
