import type { ReactNode } from 'react';
import { useRESOLVE } from '../store/RESOLVEContext';
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

  switch (state.activeScreen) {
    case 'welcome':
      return <Welcome />;
    case 'command-center':
      return <CommandCenter />;
    case 'investigation':
    case 'incident':
      return <Investigation />;
    case 'decision':
      return <Decision />;
    case 'execution':
      return <Execution />;
    case 'verification':
      return <Verification />;
    case 'approval-center':
      return <ApprovalCenter />;
    case 'report':
      return <ResolutionReport />;
    case 'audit-trail':
      return <AuditTrail />;
    default:
      return <Welcome />;
  }
}
