export function createAuditEvent(
  incidentId: string,
  action: string,
  actor: string,
  agent?: string,
  metadata: Record<string, unknown> = {},
): import('./types').AuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    incidentId,
    actor,
    agent,
    action,
    metadata,
  };
}
