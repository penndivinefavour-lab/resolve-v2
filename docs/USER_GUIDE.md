# RESOLVE — User Guide

## 1. What RESOLVE Does

RESOLVE is an AI-native enterprise operations assistant.

When a production incident occurs, RESOLVE:

- detects the problem
- investigates the likely cause
- proposes a remediation
- checks whether the action is allowed by policy
- executes the action through a controlled boundary
- independently verifies whether recovery actually happened
- records every significant event in an audit trail
- escalates to a human when the action is too risky to perform automatically

The key idea is:

**Autonomy when safe. Humans when necessary. Verification always.**

This prototype uses simulated enterprise data and deterministic demo flows so the product can be demonstrated reliably without live integrations.

## 2. How to Start

From the RESOLVE project folder:

```bash
cd C:\Users\USER\Desktop\RESOLVE
npm install
npm run dev
```

Open the localhost URL shown in the terminal, usually:

- `http://localhost:5173`
- or `http://localhost:5174` if 5173 is already in use

## 3. Welcome Page

The first screen you see is the RESOLVE welcome page.

Click:

**Launch Demo**

This initializes the demonstration incidents and takes you to the Command Center.

If you do not see the Command Center after clicking, refresh the page and click **Launch Demo** once.

## 4. Command Center

The Command Center is the operational dashboard.

You should see:

- Operational status
- Key metrics
- An active payment gateway incident: **PAY-2048**
- A high-risk approval incident: **PAY-2051**

To start the primary demo:

Click the **PAY-2048** card or its **Open Incident** button.

To see the approval workflow:

Click the **PAY-2051** card or its **Open Approval Center** button.

## 5. Incident Detail

The Incident Detail page shows:

- incident ID
- title
- service
- severity
- status
- detection time
- affected transaction count
- failure rate and baseline
- a lifecycle pipeline showing current progress

Click:

**View Evidence**

to enter the Investigation screen.

## 6. Investigation

The Investigation page displays evidence cards collected by the Investigation Agent.

Each card shows:

- category
- label
- value
- whether it supports the root cause

At the bottom you will see:

- **Likely root cause:** Gateway A timeout configuration
- **Confidence:** 94%
- **Supporting signals:** count of supporting evidence cards

Click:

**Continue to Decision**

to proceed.

## 7. Decision + Risk Gate

This screen shows the recommended remediation.

You should see:

- recommended action
- expected outcome
- estimated recovery time
- risk
- reversibility
- policy check

For PAY-2048 the policy result is:

**AUTONOMOUS**

This means RESOLVE is authorized to execute the action without waiting for a human.

Click:

**Execute Remediation**

to continue.

## 8. Action Execution

The Execution screen shows a live simulated timeline.

You will see entries such as:

- Action Agent preparing rollback
- Policy Engine verifying authorization
- Gateway Connector initiating rollback
- Gateway Connector confirming success

After execution completes, RESOLVE automatically moves into verification.

## 9. Verification

Verification is one of RESOLVE’s core differentiators.

The system does not mark the incident resolved just because the action ran. It independently checks whether recovery actually occurred.

You will see:

```
38.4%
→ 17.2%
→ 4.7%
→ 2.3%
```

Baseline:

```
2.1%
```

Individual checks include:

- Payment failure rate
- Gateway timeout rate
- Transaction recovery
- Customer impact

Only when all checks indicate recovery does RESOLVE mark the incident:

**RESOLVED**

## 10. Resolution Report

After successful verification, the Resolution Report summarizes:

- incident
- root cause
- action taken
- policy decision
- execution result
- verification result
- recovery metrics
- audit history
- final status

This report answers:

- What happened?
- Why did it happen?
- What did RESOLVE decide?
- Why was that decision allowed?
- What action was executed?
- Did it actually work?
- How do we know?

## 11. Approval Center

Some actions are too risky for autonomous execution.

PAY-2051 demonstrates this:

- Action: Refund affected transactions
- Amount: $48,700
- Risk: HIGH
- Required authorization: HUMAN APPROVAL

In the Approval Center you can:

- click **Approve Action** to allow the workflow to continue
- click **Reject** to block the action and escalate

Both choices are recorded in the audit trail.

## 12. Blocked Actions

Some actions are never allowed.

Example:

- `delete_production_data`

Expected result:

- PolicyEngine returns **BLOCKED**
- ToolGateway does not execute the action
- Audit trail records the blocked attempt

## 13. Failed Verification

If an action executes but verification does not confirm recovery, RESOLVE does not mark the incident resolved.

Instead:

- status becomes **ESCALATED**
- failed checks are shown
- human intervention is recommended

This ensures RESOLVE does not claim success unless recovery is independently proven.

## 14. Audit Trail

Every significant event is recorded, including:

- detection
- investigation
- root-cause identification
- decision
- policy evaluation
- execution
- verification
- resolution or escalation
- approval decisions

The audit trail is human-readable and visible in the Resolution Report.

## 15. Recommended Demo Flow

For a 90-second demonstration:

1. Open RESOLVE.
2. Click **Launch Demo**.
3. On the Command Center, open **PAY-2048**.
4. Open **Investigation** and show the evidence cards.
5. Note the root cause and 94% confidence.
6. Open **Decision & Risk Gate** and show **AUTONOMOUS** authorization.
7. Click **Execute Remediation**.
8. Open **Verification** and show the progression:
   - 38.4% → 17.2% → 4.7% → 2.3%
9. Show **RESOLVED**.
10. Open **Resolution Report**.
11. If time permits, open **Approval Center** and show **PAY-2051** requiring human approval.

## 16. Troubleshooting

**Server does not start**

- Ensure Node.js and npm are installed
- Run `npm install`
- Run `npm run dev`

**Page does not load**

- Use the URL shown in the terminal
- Do not use `file://` to open the app

**Launch Demo does nothing**

- Make sure you clicked **Launch Demo** only once
- Refresh the page and try again
- Ensure the dev server is running

**Incident does not appear**

- Confirm demo state initialized
- Check browser console for errors
- Restart the dev server if needed

**Approval screen does not appear**

- Navigate from the Command Center approval card
- Or go directly to the Approval Center screen if available

**Browser automation unavailable**

- This is a known local permission/capture limitation in some environments
- You can still use RESOLVE manually in a normal browser
