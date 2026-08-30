# RESOLVE

AI-Native Enterprise Operations Agent

Detect. Decide. Act. Verify.

---

## Problem

Enterprise teams have no shortage of dashboards and alerts. What they lack is a system that can actually **respond** when something goes wrong — investigating root causes, taking authorized action, verifying recovery, and knowing when to ask a human.

## Solution

RESOLVE is an AI-native enterprise operations system that:

1. **Detects** operational incidents
2. **Investigates** root causes through evidence correlation
3. **Decides** on remediation through structured reasoning
4. **Checks authority** via a deterministic policy engine
5. **Acts** through controlled tool boundaries
6. **Verifies** outcomes independently
7. **Escalates** to humans when autonomy ends

## Architecture

```
USER
  ↓
UI
  ↓
RESOLVE ORCHESTRATOR
  ↓
SPECIALIZED AGENTS
  ↓
DETERMINISTIC POLICY ENGINE
  ↓
AUTONOMOUS / HUMAN APPROVAL / BLOCKED
  ↓
ACTION AGENT → TOOL GATEWAY
  ↓
VERIFICATION AGENT
  ↓
RESOLVED / ESCALATED
  ↓
AUDIT
```

### Component boundaries

- **UI** — React screens for command center, investigation, decision, execution, verification, approval, and reporting.
- **Orchestrator** — deterministic state machine enforcing allowed transitions and auditability.
- **Specialized Agents** — logical roles for detection, investigation, decision, action, verification, and escalation.
- **PolicyEngine** — deterministic authority checks; never bypassed by agent reasoning.
- **ToolGateway** — controlled execution boundary with simulated enterprise connectors and explicit adapter slots for future Freshworks/MCP integrations.
- **VerificationAgent** — independent outcome verification before resolution.
- **Audit** — immutable event log for every significant transition.

## Agent Roles

- **DetectionAgent** — Identifies anomalies, determines severity, creates incidents
- **InvestigationAgent** — Gathers evidence, correlates metrics, examines changes, identifies root cause
- **DecisionAgent** — Evaluates evidence, proposes remediation, estimates outcomes
- **PolicyEngine** — Deterministic risk/authority evaluation (independent from LLM)
- **ActionAgent** — Receives authorized actions, invokes tools through ToolGateway
- **VerificationAgent** — Measures post-action state, compares against baseline, determines recovery
- **EscalationAgent** — Creates human-readable escalation packages

## Policy Engine

Deterministic example policies:

| Action | Risk | Authorization |
|--------|------|---------------|
| `rollback_gateway_config` | MEDIUM | AUTONOMOUS |
| `restart_service` | MEDIUM | AUTONOMOUS |
| `issue_refund` (low amount) | HUMAN_APPROVAL | HUMAN_APPROVAL |
| `issue_refund` $48,700 | HIGH | HUMAN_APPROVAL |
| `delete_production_data` | CRITICAL | BLOCKED |

## Tool Gateway

Controlled execution boundary. Every tool has:
- Name, description, input schema
- Permission requirement
- Risk classification
- Reversibility flag
- Execution handler
- Verification strategy

Simulated tools: `get_payment_metrics`, `get_gateway_status`, `get_recent_changes`, `get_deployment_history`, `get_incident_history`, `rollback_gateway_config`, `create_incident`, `update_incident`, `request_human_approval`, `issue_refund`, `send_notification`

## Verification Model

Verification is not optional. RESOLVE only marks incidents RESOLVED after independent verification of:
- payment failure rate recovery
- gateway timeout normalization
- transaction recovery confirmation
- customer impact stabilization

Failure path:
- `VERIFYING` → `ESCALATED`
- UI shows verification failure and recommended human intervention

Blocked path:
- `RISK_CHECK` → `BLOCKED`
- PolicyEngine records blocked action in audit trail

## Human-in-the-Loop

High-risk actions require human approval. The Approval Center shows:
- Risk level
- Amount/impact
- RESOLVE recommendation
- Approve/Reject buttons

All decisions are audited.

## Verification

RESOLVE does not mark incidents resolved based on tool success. It independently verifies:
- Payment failure rate recovery
- Gateway timeout normalization
- Transaction recovery confirmation
- Customer impact stabilization

## Demo Instructions

```bash
cd C:/Users/USER/Desktop/RESOLVE
npm install
npm run dev
```

Open `http://localhost:5173`

## How to Use RESOLVE

1. Open the localhost URL shown by `npm run dev`.
2. On the welcome screen, click **Launch Demo**.
3. Use the **Command Center** to open incidents.
4. Walk through **Investigation → Decision → Execution → Verification → Resolution Report**.
5. Open **Approval Center** to test high-risk human approval for PAY-2051.

For full step-by-step guidance, see [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md).

### Primary Demo Flow (90 seconds)

1. **Command Center** — See active PAY-2048 incident (38.4% failure rate)
2. **Open Incident** — View pipeline: DETECTED → INVESTIGATING → ROOT CAUSE → DECISION → RISK CHECK → ACTION → VERIFY
3. **Investigation** — Six evidence cards, Gateway A timeout config identified, 94% confidence
4. **Decision** — Rollback recommended, MEDIUM risk, AUTONOMOUS authorization
5. **Execute** — Live execution timeline, rollback successful
6. **Verification** — Metrics: 38.4% → 17.2% → 4.7% → 2.3%, all checks pass
7. **Resolution Report** — 36.1pp reduction, 5 min resolution, 0 human interventions

### Human Approval Flow

1. From Command Center, open **Approval Center**
2. See PAY-2051: $48,700 refund, HIGH RISK, HUMAN APPROVAL REQUIRED
3. Approve or Reject
4. Decision recorded in audit trail

## Technology Stack

- React 19 + TypeScript
- Vite 6
- Vitest
- Deterministic state machine (no external AI dependency for demo)

## Known Limitations

- Stage-1 prototype with simulated enterprise connectors
- No real external integrations
- Demo data is deterministic
- Voice interface not implemented in this stage

## Future Integrations

- Freshworks Agent Studio / MCP tools
- Enterprise ticketing systems
- Real monitoring/payment systems
- ElevenLabs voice interface
- WebSocket live metrics

## Hackathon Context

Built for The Great Agent Hackathon — Stage 1 Prototype.

The differentiator is not "AI analyzes incidents." It is **AI-driven operational reasoning combined with deterministic authority, controlled execution, independent verification, and human escalation**.

---

**RESOLVE** — Detect. Decide. Act. Verify.
