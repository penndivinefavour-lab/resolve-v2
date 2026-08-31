import { useCallback } from 'react';
import { useRESOLVE } from '../../store/RESOLVEContext';
import type { Screen } from '../../store/types';

interface AppShellProps {
  children: React.ReactNode;
  title: string;
}

const NAV_ITEMS = [
  { id: 'command-center' as Screen, label: 'Command Center', icon: '⌘' },
  { id: 'approval-center' as Screen, label: 'Approvals', icon: '△' },
  { id: 'audit-trail' as Screen, label: 'Audit Trail', icon: '◷' },
] as const;

export function AppShell({ children, title }: AppShellProps) {
  const { state, dispatch } = useRESOLVE();
  const isDemoActive = state.incidents.length > 0;

  const navigate = useCallback((screen: Screen) => {
    dispatch({ type: 'NAVIGATE', screen });
  }, [dispatch]);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="sidebar__text">
            <span className="sidebar__name">RESOLVE</span>
            <span className="sidebar__sub">AI Operations</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => {
            const isActive = state.activeScreen === item.id ||
              (item.id === 'command-center' && (state.activeScreen === 'incident' || state.activeScreen === 'investigation'));
            return (
              <button
                key={item.id}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                onClick={() => navigate(item.id)}
                type="button"
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-label">{item.label}</span>
                {item.id === 'approval-center' && state.commandMetrics.awaitingApproval > 0 && (
                  <span className="sidebar__badge badge--warning">{state.commandMetrics.awaitingApproval}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__status">
            <span className={`sidebar__status-dot ${isDemoActive ? 'sidebar__status-dot--active' : ''}`} />
            <span className="sidebar__status-text">{isDemoActive ? 'Operations Active' : 'System Ready'}</span>
          </div>
          <span className="sidebar__env badge badge-muted">SIMULATION</span>
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-main">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar__left">
            <h1 className="topbar__title">{title}</h1>
            {isDemoActive && state.currentIncidentId && (
              <span className="topbar__incident-badge mono">
                {state.incidents.find(i => i.id === state.currentIncidentId)?.id ?? state.currentIncidentId}
              </span>
            )}
          </div>
          <div className="topbar__right">
            {isDemoActive && (
              <>
                <span className="topbar__metric">
                  <span className="topbar__metric-value danger">{state.commandMetrics.critical}</span>
                  <span className="topbar__metric-label">Critical</span>
                </span>
                <span className="topbar__metric">
                  <span className="topbar__metric-value warning">{state.commandMetrics.awaitingApproval}</span>
                  <span className="topbar__metric-label">Pending</span>
                </span>
                <span className="topbar__metric">
                  <span className="topbar__metric-value success">{state.commandMetrics.automatedResolutions}</span>
                  <span className="topbar__metric-label">Resolved</span>
                </span>
              </>
            )}
            {!isDemoActive && (
              <span className="topbar__ready">Ready — Launch demo to begin</span>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
