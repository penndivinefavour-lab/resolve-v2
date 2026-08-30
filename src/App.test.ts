import { describe, it, expect } from 'vitest';
import { resolveReducer } from './store/reducer';
import { initialState } from './store/initialState';

describe('RESOLVE orchestrator', () => {
  it('starts demo and creates incidents', () => {
    const state = resolveReducer(initialState, { type: 'START_DEMO' });
    expect(state.incidents.length).toBe(2);
    expect(state.incidents[0].id).toBe('PAY-2048');
    expect(state.incidents[0].status).toBe('DETECTED');
    expect(state.incidents[1].id).toBe('PAY-2051');
  });

  it('advances PAY-2048 through full happy path', () => {
    let state = resolveReducer(initialState, { type: 'START_DEMO' });
    const screens = ['incident', 'investigation', 'decision', 'execution', 'verification', 'report', 'report'] as const;
    const sequence = ['DETECTED', 'INVESTIGATING', 'ROOT_CAUSE_IDENTIFIED', 'ACTION_PROPOSED', 'RISK_CHECK', 'EXECUTING', 'VERIFYING', 'RESOLVED'] as const;

    for (let i = 0; i < sequence.length - 1; i++) {
      state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: screens[i] || 'command-center' });
      expect(state.incidents[0].status).toBe(sequence[i + 1]);
    }

    expect(state.incidents[0].status).toBe('RESOLVED');
    expect(state.verifications.length).toBe(1);
    expect(state.verifications[0].verified).toBe(true);
  });

  it('records audit events during happy path', () => {
    let state = resolveReducer(initialState, { type: 'START_DEMO' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'investigation' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'decision' });
    expect(state.audit.length).toBeGreaterThanOrEqual(3);
    const actions = state.audit.map(a => a.action);
    expect(actions).toContain('incident_detected');
    expect(actions).toContain('state_transition');
  });

  it('policy engine returns autonomous for rollback', () => {
    const state = resolveReducer(initialState, { type: 'START_DEMO' });
    const pd = state.policyDecisions[0];
    expect(pd.authorization).toBe('AUTONOMOUS');
    expect(pd.requiresHuman).toBe(false);
    expect(pd.blocked).toBe(false);
  });

  it('high-risk refund requires human approval', () => {
    const state = resolveReducer(initialState, { type: 'START_DEMO' });
    const approval = state.approvals[0];
    expect(approval.risk).toBe('high');
    expect(approval.amount).toBe('$48,700');
  });

  it('approval center approves and executes', () => {
    let state = resolveReducer(initialState, { type: 'START_DEMO' });
    state = resolveReducer(state, { type: 'SET_APPROVAL_DECISION', incidentId: 'PAY-2051', decision: 'approved' });
    expect(state.incidents[1].humanDecision).toBe('approved');
    expect(state.incidents[1].status).toBe('EXECUTING');
  });

  it('approval center rejects and escalates', () => {
    let state = resolveReducer(initialState, { type: 'START_DEMO' });
    state = resolveReducer(state, { type: 'SET_APPROVAL_DECISION', incidentId: 'PAY-2051', decision: 'rejected' });
    expect(state.incidents[1].humanDecision).toBe('rejected');
    expect(state.incidents[1].status).toBe('ESCALATED');
  });

  it('verification contains expected recovery data', () => {
    let state = resolveReducer(initialState, { type: 'START_DEMO' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'investigation' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'decision' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'execution' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'verification' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'report' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'report' });
    expect(state.verifications[0].recovery).toBeCloseTo(36.1, 0);
    expect(state.verifications[0].after).toBeCloseTo(2.3, 1);
  });

  it('verification failure escalates instead of resolving', () => {
    let state = resolveReducer(initialState, { type: 'START_DEMO' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'investigation' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'decision' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'execution' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'verification' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'report' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'report' });
    state = resolveReducer(state, { type: 'FAIL_VERIFICATION', incidentId: 'PAY-2048' });
    expect(state.incidents[0].status).toBe('ESCALATED');
    expect(state.verifications[0].verified).toBe(false);
    const escalation = state.audit.find((a) => a.action === 'verification_failed');
    expect(escalation).toBeDefined();
  });

  it('blocked action prevents execution and records audit', () => {
    let state = resolveReducer(initialState, { type: 'START_DEMO' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'investigation' });
    state = resolveReducer(state, { type: 'ADVANCE_INCIDENT', incidentId: 'PAY-2048', screen: 'decision' });
    state = resolveReducer(state, { type: 'BLOCK_ACTION', incidentId: 'PAY-2048' });
    expect(state.incidents[0].status).toBe('BLOCKED');
    const block = state.audit.find((a) => a.action === 'blocked');
    expect(block).toBeDefined();
    expect(block?.agent).toBe('PolicyEngine');
  });
});
