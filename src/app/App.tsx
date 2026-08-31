import type { ReactNode } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
import { AppShell } from '../components/layout/AppShell';
import { Welcome } from '../screens/Welcome';
import { CommandCenter } from '../screens/CommandCenter';
import { Investigation } from '../screens/Investigation';
import { Decision } from '../screens/Decision';
import { Execution } from '../screens/Execution';
import { Verification } from '../screens/Verification';
import { ApprovalCenter } from '../screens/ApprovalCenter';
import { ResolutionReport } from '../screens/ResolutionReport';
import { AuditTrail } from '../screens/AuditTrail';

export default function App(): ReactNode {
  const { state } = useRESOLVE();

  const screenConfig: Record<string, { component: ReactNode; title: string }> = {
    'welcome': { component: <Welcome />, title: 'Welcome' },
    'command-center': { component: <CommandCenter />, title: 'Command Center' },
    'investigation': { component: <Investigation />, title: 'Investigation' },
    'incident': { component: <Investigation />, title: 'Incident' },
    'decision': { component: <Decision />, title: 'Decision' },
    'execution': { component: <Execution />, title: 'Execution' },
    'verification': { component: <Verification />, title: 'Verification' },
    'approval-center': { component: <ApprovalCenter />, title: 'Approval Center' },
    'report': { component: <ResolutionReport />, title: 'Resolution Report' },
    'audit-trail': { component: <AuditTrail />, title: 'Audit Trail' },
  };

  const config = screenConfig[state.activeScreen] ?? screenConfig['welcome'];

  return <AppShell title={config.title}>{config.component}</AppShell>;
}
