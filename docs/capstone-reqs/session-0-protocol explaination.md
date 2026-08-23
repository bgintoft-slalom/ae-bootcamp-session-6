# Session-Zero Protocol

A reusable session-state diff playbook for multi-source research / planning specs.

**Origin:** developed to handle the problem that any spec touching multiple live sources (ticketing systems, wikis, code, chat, design tools) will drift between sessions. Without an automated drift check, every session either starts cold (slow and lossy) or builds on stale snapshots (correctness risk).

**Outcome:** every session begins with a numbered changelog of what changed since the last session, so substantive work picks up from current truth rather than a frozen snapshot.

---

## What it is

Two artifacts work together:

1. **`.session-state.json`** - a manifest at the root of the spec's research directory. Records the last-known state of every live source the spec touches (Jira ticket statuses, Confluence page versions, code SHAs, Figma node IDs, Slack channel cursors). Refreshed at session end.

2. **A `§0 Session start protocol` section** in the spec's living entry-point doc (`AGENT-CONTEXT.md` or equivalent). Tells the agent: read the manifest, diff each entry against live state, surface the changelog, stop and ask before proceeding.

The manifest is the cursor. The entry-point doc is the canonical state. They stay in sync because §0 mandates both updates at session end.

---

## How it works (the 5-step protocol)

At session start, before any substantive work:

1. **Read the manifest.** If absent or older than ~7 days, flag and propose regenerating before continuing.

2. **Diff each entry against the live source.** Source-specific patterns:
   - **Jira:** JQL with `key in (...) AND updated > <captured_at>`, filtered to the manifest's keys. Pull `summary`, `status`, `assignee`, `updated`.
   - **Confluence:** fetch each page; compare `version.number` to the recorded value. If higher, surface the version's edit message as a one-line "what changed."
   - **Code:** `git log <manifest.sha>..origin/main -- <watched_paths>` per watched repo.
   - **Figma:** no clean diff API. List the watched node IDs and ask the user whether any have changed.
   - **Slack:** `slack_read_channel` with `oldest = latest_ts` for each watched channel. Pull top-level messages; pull threads with `slack_read_thread` for any message implying decisions / AC drift / scope changes. Roll routine pings into one "N routine messages, no drift" line so the changelog stays scannable.

3. **Surface findings as a numbered changelog.** Per item: source, what changed, link, and a one-line "why this might matter for the spec." Zero-change sources get a single "no drift" line.

4. **Stop and prompt the user.**
   > "Diff complete - N items changed since [captured_at]. Want to walk through them before we start, or are these expected?"
   
   Do not start substantive work until the user confirms.

5. **As changes are addressed during the session, update the entry-point doc inline.** Ticket-inventory rows, decision-ledger entries, watchouts - so the doc reflects current state rather than the snapshot state. Treat the entry-point as a living doc, not an archive.

At session end:

> "Refresh `.session-state.json` to snapshot current state for the next session?"

On confirmation: re-fetch every entry, rewrite the file, bump `captured_at`. Commit alongside any entry-point doc edits from step 5.

---

## Manifest format

```jsonc
{
  "schema_version": 1,
  "spec": "<spec-id>",
  "captured_at": "<ISO-8601 timestamp>",
  "captured_by": "<model + brief session note>",
  "notes": "<freeform refresh notes from the prior session-end>",
  "atlassian_cloud_id": "<cloud uuid>",

  "jira": {
    "tickets": [
      { "key": "PROJ-NNN", "summary": "...", "status": "...", "updated": "<ISO-8601>" }
    ],
    "epic": "PROJ-NNNN",
    "diff_jql_template": "key in ({{keys}}) AND updated > \"{{captured_at_jql}}\""
  },

  "confluence": {
    "pages": [
      { "id": "...", "title": "...", "version": N, "last_edited": "<ISO-8601>" }
    ]
  },

  "code": {
    "<repo-name>": {
      "remote": "origin/main",
      "sha": "<git sha>",
      "watched_paths": ["path/to/relevant/dir/"]
    }
  },

  "slack": {
    "channels": [
      {
        "id": "<channel id>",
        "name": "#channel-name",
        "latest_ts": "<top-level message ts>",
        "latest_message_at": "<ISO-8601>",
        "latest_top_level_author": "<context note>"
      }
    ],
    "diff_note": "<freeform note on how to use the cursor>"
  },

  "figma": {
    "file_key": "<figma file key>",
    "file_name": "<file name>",
    "watched_nodes": [
      { "id": "NNNN-NNNN", "tab": "...", "variant": "..." }
    ]
  }
}
```

Sections are optional - if the spec doesn't touch a source (e.g. no Slack channels yet), omit that section. Add new sources by adding new top-level keys plus a corresponding diff step in §0.

---

## Bootstrapping for a new spec

When starting a new research / planning project:

1. **Pick the entry-point doc.** Convention: `research/<spec-id>/AGENT-CONTEXT.md`. This becomes the living canonical doc for the spec.

2. **Identify watched sources.** Walk through:
   - Which Jira tickets are in scope? (parent epic + direct children)
   - Which Confluence pages? (PRD, Decision Log, Tech Spec, other related docs)
   - Which code paths matter? (per repo, list the directories the spec touches)
   - Which Figma frames? (list canonical node IDs by surface)
   - Which Slack channels? (one or two project channels, usually)

3. **Create the manifest.** Initial `.session-state.json` at `research/<spec-id>/.session-state.json`. Populate each section with the watched-source list and current state (fetch all the timestamps / SHAs / versions / cursors now).

4. **Add the §0 section to the entry-point doc.** Copy the 5-step protocol above into the doc as section §0. Customize:
   - Refer to the spec's actual ticket prefix, file paths, channel IDs in step 2's bullets.
   - Adjust the "what changed" prompt phrasing to your taste.
   - List any spec-specific caveats (e.g. "diffs catch awareness, not correctness - re-read the live source before acting").

5. **Add a Writing convention / story-point convention block at the top** if applicable. This encodes workflow preferences that future sessions should inherit.

6. **Commit both files in one go.** Manifest and entry-point doc should land together; one without the other creates ambiguity about which is the source of truth.

---

## Maintenance

**Per-session:** §0 step 5 keeps the entry-point doc current; session-end manifest refresh keeps the cursor current. Both must happen at session end or they drift.

**Periodic:** every few weeks, re-walk the watched-sources list. New tickets may have been filed under the epic; new Confluence pages may have been spun up; new code paths may matter. Add them to the manifest as new entries.

**Stale-source pruning:** if a watched source goes Done / closed / archived, decide whether to keep it in the manifest (for historical drift detection) or prune it (to keep the diff fast). Keeping closed items in the list can be useful because their timestamps can still occasionally change (status flips, comment activity); pruning them loses that signal.

---

## Why the two-artifact design

The manifest alone can't capture context - it's a snapshot of timestamps and IDs, not semantics. The entry-point doc alone can't catch drift - it's a frozen narrative that doesn't know what changed in the world.

Together: the manifest detects drift; the entry-point doc explains it. The §0 protocol enforces that both stay current.

The cost is one session-end ritual (refresh the manifest, prompt to commit). The payoff is every subsequent session starting from current truth instead of having to re-derive it.

---

## Caveats

- **The diff catches drift awareness, not drift correctness.** Once a changed item is identified, read the live source fresh - don't trust the manifest's snapshot of the prior state as ground truth.
- **The manifest is the cursor; the entry-point doc is canonical.** They drift if §0 step 5 is skipped during the session - flag that risk if a session ends without both being refreshed.
- **Slack cursors track top-level messages only.** New replies on older threads aren't auto-flagged. If something signals a stale thread moved (referenced in a fresh top-level, named explicitly by the user), pull it explicitly.
- **Figma has no clean diff API.** The manifest tracks watched node IDs but can't diff their content; the agent has to ask the user whether anything moved.

---

## Our implementation: `docs/capstone-reqs`

This repo adapts the protocol to a single-source variant, using **GitHub issues** as the only live source (standing in for Jira/Confluence/Slack/Figma in the general pattern above).

### What we built

| Protocol concept | Our implementation |
|---|---|
| Manifest | [`docs/capstone-reqs/.session-state.json`](./.session-state.json) — tracks open issues labeled `requirement-proposal`: number, title, state, `updated_at`, comment count. |
| Entry-point doc / §0 | [`docs/capstone-reqs/AGENT-CONTEXT.md`](./AGENT-CONTEXT.md) — holds the adapted 5-step protocol and a "Current Snapshot" of triage status. |
| Triage ledger | [`docs/capstone-reqs/decisions.md`](./decisions.md) — a row per triaged issue: status (Accepted/Deferred/Rejected) and rationale. |
| Trigger | [`.github/skills/process-team-input/SKILL.md`](../../.github/skills/process-team-input/SKILL.md) — a skill invocable as `/process-team-input` or via natural-language phrasing like "process team input" / "start a requirements gathering session." |

### What it's for

Anyone can propose a requirement by filing a GitHub issue labeled `requirement-proposal` (see [`process.md`](./process.md) for the submission workflow). Because proposals can arrive at any time from any contributor, the set of open proposals drifts between requirement-gathering sessions. Session-Zero gives us a repeatable way to:

- Never silently miss a new proposal or new discussion on an existing one.
- Never re-triage something that's already been decided (unless it changed since).
- Keep a single narrative doc (`AGENT-CONTEXT.md`) and a single decision ledger (`decisions.md`) that stay accurate over time, rather than re-deriving state from scratch each session.

### How to use it

1. **Start a session.** Say something like *"let's process team input"* or *"start a requirements gathering session for docs/capstone-reqs"* — this invokes `/process-team-input`.
2. **Review the changelog.** The agent reads the manifest, fetches open `requirement-proposal` issues, and presents a numbered changelog: new proposals, updated proposals, issues with new comments, and issues closed since the last session. It will explicitly stop and ask before doing anything else.
3. **Triage.** Work through the changelog with the agent — for each issue, decide Accepted / Deferred / Rejected and capture the rationale. This gets recorded in `decisions.md` and reflected in `AGENT-CONTEXT.md`'s Current Snapshot.
4. **Close settled issues.** If an issue's outcome is fully decided with no open questions, the agent will prompt you to close the GitHub issue as completed. It will never close an issue without your confirmation.
5. **End the session.** When you're done, confirm the manifest refresh. The agent re-fetches the current open `requirement-proposal` issues and rewrites `.session-state.json` with a new `captured_at` timestamp.
6. **Commit together.** Commit the manifest, `AGENT-CONTEXT.md`, and `decisions.md` changes from the session as one unit — splitting them across commits risks the manifest and the narrative doc drifting out of sync.
