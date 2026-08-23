# Capstone Requirements — Agent Context

Living entry-point doc for requirement-gathering sessions on `docs/capstone-reqs`. Adapted from the [Session-Zero Protocol](./session-0-protocol%20explaination.md), using GitHub issues as the sole live source (in place of Jira/Confluence/Slack/Figma).

See also: [process.md](./process.md) (submission/triage workflow) and [decisions.md](./decisions.md) (triage ledger).

---

## §0 Session start protocol

Invoked via the `/process-team-input` skill, or natural-language phrasing like "let's process team input" / "start a requirements gathering session for docs/capstone-reqs."

Before any substantive triage work:

1. **Read the manifest.** Load `docs/capstone-reqs/.session-state.json`. If it's missing, or `captured_at` is more than 7 days old, flag this and propose bootstrapping/refreshing it before continuing.

2. **Diff against live GitHub state.** Fetch all **open** issues labeled `requirement-proposal` in this repo. Compare each against the manifest's `github.issues` entries:
   - **New proposal** — issue number not present in the manifest.
   - **Updated** — issue's `updated_at` is newer than the manifest's recorded value.
   - **New comments** — issue's live `comments` count differs from the manifest's recorded value (flag the count difference; don't fetch comment bodies). Note: the GitHub tool omits `comments` from the response when it's `0` — treat a missing field as `0`, not as unavailable.
   - **Closed since last session** — issue number is in the manifest but no longer appears in the open/labeled results.
   - **No drift** — matches the manifest exactly; roll all of these into a single summary line.

3. **Surface a numbered changelog** grouped by the categories above, each with issue number, title, link, and a one-line note on why it might matter.

4. **Stop and ask.** Present:
   > "Diff complete — N items changed since [captured_at]. Want to review before triaging, or proceed?"
   
   Do not begin triage until the user responds.

5. **Update living docs as triage happens.** For each issue triaged during the session:
   - Append a row to `decisions.md` (Accepted / Deferred / Rejected + rationale).
   - Update the "Current Snapshot" section below.
   - If the issue's outcome is fully settled (decision recorded, no open questions remaining), **prompt the user to close the GitHub issue as completed.** Never close it automatically without confirmation.

### Session end

Prompt: "Refresh `.session-state.json` for next session?" On confirmation:
- Re-fetch all open `requirement-proposal` issues (number, title, state, `updated_at`, `comments`).
- Rewrite the manifest, bumping `captured_at` and updating `notes` with a brief summary of the session.
- Remind the user to commit the manifest alongside any `AGENT-CONTEXT.md` / `decisions.md` edits from this session — they should land together.

---

## Current Snapshot

_No requirement proposals have been triaged yet. This section is updated during §0 step 5 as issues move through triage._

| Status | Count |
|--------|-------|
| Accepted | 0 |
| Deferred | 0 |
| Rejected | 0 |
| Pending triage | 0 |

---

## Caveats

- The diff catches drift *awareness*, not correctness — re-read an issue's live content before acting on it, don't trust the manifest snapshot.
- Comment-count drift only signals *that* something new was said, not *what* — open the issue to see the actual discussion.
- The manifest is the cursor; this doc is canonical. They drift if session-end refresh is skipped — flag that risk if a session ends without both being updated.
