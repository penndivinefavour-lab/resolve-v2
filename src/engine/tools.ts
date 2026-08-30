import { severityLabel, statusLabel, resolvePermission } from './agents';

export type ToolName =
  | 'rollback_gateway_config'
  | 'issue_refund'
  | 'delete_production_data'
  | 'run_health_check'
  | 'fetch_gateway_metrics'
  | 'fetch_transaction_metrics';

export interface Tool {
  name: ToolName;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  permission: 'autonomous' | 'human_approval' | 'blocked';
  reversible: boolean;
  verificationStrategy: string;
}

export const TOOLS: Record<ToolName, Tool> = {
  rollback_gateway_config: {
    name: 'rollback_gateway_config',
    description: 'Roll back gateway timeout configuration to the last known-good state',
    risk: 'medium',
    permission: 'autonomous',
    reversible: true,
    verificationStrategy: 'fetch_gateway_metrics + fetch_transaction_metrics',
  },
  issue_refund: {
    name: 'issue_refund',
    description: 'Issue a refund to affected customers',
    risk: 'high',
    permission: 'human_approval',
    reversible: true,
    verificationStrategy: 'fetch_transaction_metrics + audit reconciliation',
  },
  delete_production_data: {
    name: 'delete_production_data',
    description: 'Delete data from production stores',
    risk: 'critical',
    permission: 'blocked',
    reversible: false,
    verificationStrategy: 'audit log-only; no execution permitted',
  },
  run_health_check: {
    name: 'run_health_check',
    description: 'Run a synthetic health check across dependent services',
    risk: 'low',
    permission: 'autonomous',
    reversible: true,
    verificationStrategy: 'service health status + latency measurement',
  },
  fetch_gateway_metrics: {
    name: 'fetch_gateway_metrics',
    description: 'Retrieve gateway latency, timeout, and error metrics',
    risk: 'low',
    permission: 'autonomous',
    reversible: true,
    verificationStrategy: 'metric value comparison against baseline',
  },
  fetch_transaction_metrics: {
    name: 'fetch_transaction_metrics',
    description: 'Retrieve payment transaction success/failure metrics',
    risk: 'low',
    permission: 'autonomous',
    reversible: true,
    verificationStrategy: 'failure rate comparison against baseline',
  },
};

export function getTool(name: ToolName): Tool | undefined {
  return TOOLS[name];
}

export function isExecutable(name: ToolName): boolean {
  const tool = TOOLS[name];
  return tool ? tool.permission !== 'blocked' : false;
}

export { severityLabel, statusLabel, resolvePermission };
