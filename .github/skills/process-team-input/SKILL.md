---
name: process-team-input
description: Start a requirements-gathering session for docs/capstone-reqs by diffing incoming GitHub issue proposals against last session's known state, surfacing what changed, and guiding triage. Trigger on requests like "process team input", "start a requirements gathering session", or "check for new requirements".
metadata:
  author: capstone-demo
  source: docs/capstone-reqs/session-0-protocol explaination.md
---

# Process Team Input

Runs the Session-Zero-style protocol described in `docs/capstone-reqs/AGENT-CONTEXT.md` (§0), using GitHub issues labeled `requirement-proposal` as the only live source.

## User Input

```text
$ARGUMENTS
```

Consider the user input before proceeding (if not empty) — e.g. they may ask to focus on a specific issue number or skip straight to triage.

## Steps

### 1. Read the manifest
Read `docs/capstone-reqs/.session-state.json`.
- If the file is missing: tell the user no manifest exists yet, propose bootstrapping it now (fetch current state and create it), and proceed only after they confirm.
- If `captured_at` is more than 7 days old: flag this as stale before continuing, but still proceed with the diff.

### 2. Diff against live GitHub state
Fetch all **open** issues labeled `requirement-proposal` in this repository (owner/repo from the manifest's `github.repo`, or detect from the current repo if the manifest is being bootstrapped). For each issue returned, compare against the manifest's `github.issues` entries and classify:

- **New proposal** — issue number not present in the manifest.
- **Updated** — present in the manifest, but live `updated_at` is newer than the recorded value. If the comment count also changed, mention both (e.g. "updated, +2 comments") in one entry rather than double-listing the issue.
- **New comments** — present in the manifest, `updated_at` unchanged, but live `comments` count differs from the recorded value. In practice this is rare on its own: GitHub bumps `updated_at` when a comment is added, so most comment activity will already surface under "Updated."
- **No drift** — matches the manifest exactly.

> **Gotcha:** the GitHub issue-listing tool omits the `comments` field entirely from an issue's response when its value is `0` — it does not return `comments: 0` explicitly. Treat a missing `comments` field as `0`, not as missing/unavailable data.

Also identify:
- **Closed since last session** — issue numbers present in the manifest that are no longer in the open/labeled result set.

### 3. Surface the changelog
Present a numbered changelog grouped by category (New proposal / Updated / New comments / Closed since last session), each entry showing issue number, title, a link, and a one-line note on why it might matter for triage. Roll all "No drift" issues into a single summary line rather than listing them individually.

If there are zero changes and zero known issues, say so plainly and ask if the user wants to proceed to check for anything filed outside the label, or end the session here.

### 4. Stop and confirm
Ask the user:
> "Diff complete — N items changed since [captured_at]. Want to review before triaging, or proceed?"

**Do not begin triage work until the user responds.** This is a hard stop, not a formality.

### 5. Triage
For each issue the user chooses to triage:
- Discuss the requirement with the user; help evaluate it against `.specify/memory/constitution.md` and `docs/functional-requirements.md`.
- Record the outcome (Accepted / Deferred / Rejected) with rationale as a new row in `docs/capstone-reqs/decisions.md`.
- Update the "Current Snapshot" table in `docs/capstone-reqs/AGENT-CONTEXT.md` to reflect the new counts.
- **If the issue's outcome is fully settled** (decision recorded, no open follow-up questions), prompt the user: "This looks settled — close issue #N as completed?" Only close the GitHub issue if the user confirms. Never close automatically.

### 6. Session end
When the user indicates they're done for this session (or you've worked through the changelog), ask:
> "Refresh `.session-state.json` for next session?"

On confirmation:
- Re-fetch all open `requirement-proposal` issues (number, title, state, `updated_at`, `comments`).
- Rewrite the manifest: bump `captured_at` to now, replace the `github.issues` array with the fresh fetch, and update `notes` with a short summary of what happened this session.
- Remind the user that the manifest, `AGENT-CONTEXT.md`, and `decisions.md` changes should be committed together so they don't drift apart.
