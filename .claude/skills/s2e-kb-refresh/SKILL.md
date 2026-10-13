---
name: s2e-kb-refresh
description: Re-verify the Street 2 Elite business knowledge base in business/ against the current code, SQL and git history, then update the files, evidence tags and gap register. Use after merges, after the owner answers an open question, after schema changes, or when business/ may be stale.
allowed-tools: Bash(bash ${CLAUDE_SKILL_DIR}/scripts/scan.sh) Bash(git *) Read Grep Glob Edit Write
---

# Refresh the business knowledge base

`business/` is only useful while it is true. This skill re-checks it.

## Steps

1. **Find the snapshot.** Read `business/README.md` for the snapshot date and git commit. Run `git log --oneline <commit>..HEAD` and `git status --short` from the repo root. Everything new since then, committed or not, may have changed a fact.
2. **Run the scan.** `bash ${CLAUDE_SKILL_DIR}/scripts/scan.sh` prints the facts the knowledge base depends on: routes and dead links, unused components, SQL constraints, which statuses and columns the app writes, storage calls, hardcoded claims, and `.env.local` variable names only. It is read-only and never prints secret values.
3. **Diff against the files.** Compare the scan with `business/02-people-and-roles.md` through `business/06-gaps-and-risks.md`. For each difference, decide: new fact, changed fact, or resolved gap.
4. **Look at the changed files.** Read the diff of anything that touches bookings, approval, medical forms, storage, auth or payments in full. Do not rely on the scan alone.
5. **Update.**
   - Facts that moved from `[WIP]` to committed become `[CODE]`. Facts that vanished are removed with a note in the gap register.
   - Resolved gaps move to a "Resolved" table at the bottom of `business/06-gaps-and-risks.md` with the commit that resolved them. Do not delete them silently.
   - New gaps get the next free ID.
   - Owner answers (ask for them, never infer) become `[OWNER yyyy-mm-dd]` in the right file, and the question is deleted from `business/07-open-questions.md`.
6. **Reset the snapshot** line in `business/README.md` to today's date and `git rev-parse --short HEAD`, and note whether the tree is clean.
7. **Check `CLAUDE.md`.** If it differs from the SQL, tell the CTO role; do not edit it unless asked.
8. **Report** what changed, what is newly unknown, and which leaders are affected (see `leadership/README.md`).

## Rules

- Never promote `[SEED]`, `[CLAIM]` or `[INFERRED]` to fact without the owner's confirmation.
- Never print `.env.local` values.
- Never run SQL against the live database. If something can only be checked there (policies, triggers, bucket visibility), add or keep it as a question.
- If another session has uncommitted changes, say what is `[WIP]` and do not treat it as shipped.
