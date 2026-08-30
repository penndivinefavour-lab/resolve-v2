import { WorkflowIndicator } from '../workflow/WorkflowIndicator';
import { AgentActivityPanel } from '../activity/AgentActivityPanel';

import type { Incident } from '../../store/types';
import type { AgentActivity } from '../../store/types';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showActivity?: boolean;
  activities?: AgentActivity[];
  incident?: Incident | null;
  showWorkflow?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

export function MainLayout({
  children,
  title,
  subtitle,
  showActivity = false,
  activities = [],
  incident,
  showWorkflow = false,
  onBack,
  backLabel = 'Back',
}: MainLayoutProps) {
  return (
    <div className="main-layout">
      {(onBack || title) && (
        <div className="main-layout__topbar">
          <div className="main-layout__topbar-left">
            {onBack && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {backLabel}
              </button>
            )}
            {onBack && <span className="main-layout__divider" />}
          </div>
          <div className="main-layout__topbar-right">
            {title && <h1 className="main-layout__title">{title}</h1>}
            {subtitle && <p className="main-layout__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}

      <div className="main-layout__body">
        {showWorkflow && incident && (
          <div className="main-layout__workflow">
            <WorkflowIndicator currentStatus={incident.status} />
          </div>
        )}

        <div className="main-layout__content">
          {children}
        </div>

        {showActivity && (
          <div className="main-layout__activity animate-slide-in-right">
            <AgentActivityPanel activities={activities} compact />
          </div>
        )}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, badgeColor, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__left">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        {badge && (
          <span className={`badge badge--${badgeColor ?? 'accent'}`}>{badge}</span>
        )}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

interface SectionHeaderProps {
  label: string;
  count?: number | string;
  action?: React.ReactNode;
}

export function SectionHeader({ label, count, action }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header__left">
        <span className="section-header__label">{label}</span>
        {count !== undefined && <span className="section-header__count mono">{count}</span>}
      </div>
      {action && <div className="section-header__action">{action}</div>}
    </div>
  );
}

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  icon?: boolean;
}

export function BackButton({ onClick, label = 'Back', icon = true }: BackButtonProps) {
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={onClick}>
      {icon && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {label}
    </button>
  );
}
