---
name: s2e-supabase-change
description: Make a safe change to the Street 2 Elite Supabase database - new table or column, constraint, RLS policy, trigger, function, storage policy or realtime setting - by writing a reviewable, re-runnable SQL script in street2elite/scripts/ and updating the docs. Use for any schema, access-rule or storage change. Writes the script; never runs it on the live database.
---

# Supabase change

The repo's SQL in `street2elite/scripts/` is the only record of the database, and it is incomplete: access rules for `children`, `profiles`, `medical_forms` and storage are not versioned, and the profile-on-sign-up trigger was deleted (see `business/05-platform-and-data.md`, G-04). Every change should leave the repo more complete, not less.

## Before writing

1. `git status`. Another session may be editing the same scripts or components. If so, stop and ask.
2. Read the current SQL for the tables involved and the app code that reads and writes them (`grep` the table and column names). Enum-like values live in three places that must agree: the SQL check constraint, the zod schema or TypeScript type, and the UI select.
3. If the change touches child or parent data, run `s2e-safeguarding-review` first and write its controls into the script.
4. State the reason and which gap (`G-xx`) or question it answers.

## The script

Follow the convention of the existing files: a header comment saying what and why and how to run it, "Run once in Supabase -> SQL Editor. Safe to re-run.", wrapped in a transaction where possible.

- **Idempotent.** `create table if not exists`, `add column if not exists`, `drop policy if exists` before `create policy`, `create or replace function`, `drop trigger if exists` before `create trigger`. Constraint changes use a guarded `do $$ ... $$` block.
- **File name:** descriptive and dated, for example `2026-10-12_bookings_payment_status_guard.sql`. Do not edit the base table scripts to describe later changes; add a script.
- **Header must include** the rollback statements, even if they are commented out, and a "Verify" block of `select` queries.
- **New table:** enable row level security in the same script and write every policy. A table without policies is closed to the app (good); a table with RLS off is open to any signed-in user (bad).
- **Policies:** write them per role (parent, admin, coach) and per action. Prefer "own rows" rules (`parent_id = auth.uid()`). Use `public.is_admin()` only after checking it matches the roles you mean; the draft version recognises `admin` only, not `coach`.
- **Functions:** `security definer` only when needed, always with `set search_path = public`, and explain why in a comment.
- **Never trust the browser** for rules that matter (capacity, eligibility, payment status). Enforce in a trigger or policy. A parent must not be able to write `payment_status` (G-23).
- **Cascades:** note what `on delete cascade` removes. Deleting a child removes bookings and medical form rows but not storage files (G-13).
- **Realtime:** a table the UI subscribes to must be in the `supabase_realtime` publication.
- **Storage:** bucket visibility and policies belong in the script or a documented manual step. Medical files should not be public.

## After writing

1. Update the schema tables in `business/05-platform-and-data.md`, close or add gaps in `business/06-gaps-and-risks.md`, and tell the CTO to update `CLAUDE.md`.
2. If the app code must change with it, list the files and let the CTO role do it.
3. Give the owner: the file path, what it changes, who is affected, how to verify, how to roll back, and whether it needs a maintenance window.

## Rules

- **Never run SQL against the live database.** Never use the service-role key or connection strings in `.env.local`; do not read their values.
- A destructive statement (`drop`, `delete`, `truncate`, a column removal, a type change) needs the owner's explicit approval and a data check first.
- Say what you could not test. There is no local database and no automated test suite.
