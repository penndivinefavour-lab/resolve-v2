# RESOLVE

AI-Native Enterprise Operations Agent

Detect. Decide. Act. Verify.

---

## Problem

Enterprise teams have dashboards and alerts, but lack a system that can actually **respond** — investigating root causes, taking authorized action, verifying recovery, and escalating when needed.

## Solution

RESOLVE is an AI-native enterprise operations system that coordinates specialized agents through a policy-controlled incident response workflow:

1. **Detect** — Identifies anomalies and determines severity
2. **Investigate** — Gathers evidence and correlates metrics
3. **Decide** — Evaluates remediation options
4. **Policy** — Deterministic authority checks (never bypassed by agents)
5. **Act** — Executes through a controlled tool gateway
6. **Verify** — Independently confirms recovery
7. **Resolve** — Records full audit trail

### Demo Scenarios

- **PAY-2048**: Payment gateway degradation — autonomous resolution end-to-end
- **PAY-2051**: High-value refund requiring human approval (approve or reject)
- **Blocked deletion**: Policy engine blocks critical production data deletion
- **Verification failure**: Remediation executes but fails independent verification → escalation

## Core Workflow

```
DETECT → INVESTIGATE → DECIDE → POLICY → ACT → VERIFY → RESOLVE
```

## Key Capabilities

- Agentic incident investigation with multi-source evidence correlation
- Root-cause analysis with confidence scoring
- Deterministic policy engine for risk/authority evaluation
- Human-in-the-loop approval for high-risk actions
- Controlled tool gateway with permission requirements
- Independent post-action verification
- Immutable audit trail for every transition
- Automatic escalation on failure or rejection

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Vitest
- CSS custom properties (design tokens)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and click **Launch Demo**.

## Demo Walkthrough

1. Click **Launch Demo**
2. View Command Center with PAY-2048 incident (38.4% failure rate)
3. Open incident → investigate evidence → identify root cause (Gateway A timeout, 94% confidence)
4. Review autonomous rollback recommendation → execute remediation
5. Watch live agent activity and verification metrics recover to baseline (2.3%)
6. View resolution report
7. Open Approval Center to see PAY-2051 ($48,700 refund) requiring human approval

## Architecture

- `src/store/` — State management via useReducer with deterministic state machine
- `src/engine/` — Agent logic (detection, investigation, decision, policy, execution, verification)
- `src/screens/` — React screens for each workflow stage
- `src/components/` — Reusable UI components
- `src/data/` — Demo data and scenarios
- `src/styles/` — Design tokens, layout, and animation styles

## Known Limitations

- Stage-1 prototype with simulated enterprise connectors
- No real external API integrations
- Demo data is deterministic
- Voice interface not implemented

## GitHub

https://github.com/penndivinefavour-lab/resolve-v2
