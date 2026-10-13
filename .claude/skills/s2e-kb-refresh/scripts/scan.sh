#!/usr/bin/env bash
# Read-only evidence scan for the Street 2 Elite knowledge base.
# Prints facts business/ depends on. Never prints secret values.
set -u

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "Run inside the street2elite repo."; exit 1; }
APP="$ROOT/street2elite"
cd "$APP" || { echo "App directory not found: $APP"; exit 1; }

section() { printf '\n=== %s ===\n' "$1"; }

section "Git snapshot"
git -C "$ROOT" log --oneline -5
git -C "$ROOT" status --short

section "Routes that exist (page.tsx)"
find app -name page.tsx | sort

section "Internal links and redirects, with counts"
grep -rhoE 'href="/[^"]*|push\(.?/[^)"`]*|redirect\(.?/[^)"`]*' app components lib 2>/dev/null | sort | uniq -c | sort -rn

section "Components imported by nothing (candidates for legacy)"
for f in components/*.tsx; do
  name="$(basename "$f" .tsx)"
  hits="$(grep -rlE "components/$name\"|\./$name\"" app components lib 2>/dev/null | grep -v "^components/$name.tsx$" | wc -l | tr -d ' ')"
  [ "$hits" = "0" ] && echo "$name"
done

section "SQL: tables, check constraints, unique constraints"
grep -hnE "create table|check \(|array\[|unique|references" scripts/*.sql 2>/dev/null | grep -v seed_mock | head -80

section "SQL: policies, triggers, functions, RLS versioned in repo?"
grep -rniE "create (or replace )?(trigger|function|policy)|row level security|enable row" scripts ../CLAUDE.md 2>/dev/null || echo "(none versioned)"

section "Statuses the app writes"
grep -rnE "(approval_status|payment_status|status|role)\s*[:=]\s*['\"]" app components lib 2>/dev/null | grep -vE "className|variant" | head -40

section "Columns defined in SQL but not referenced in app code"
for col in checked_in checked_in_at payment_intent_id rejection_reason medical_notes approved_by; do
  n="$(grep -rlE "$col" app components lib 2>/dev/null | wc -l | tr -d ' ')"
  echo "$col: referenced in $n app file(s)"
done

section "Storage calls"
grep -rnE "storage|getPublicUrl|createSignedUrl|\.remove\(|\.upload\(" app components lib 2>/dev/null | grep -vE "^\S+:\s*[0-9]+:\s*import" | head -30

section "Realtime channels"
grep -rnE "\.channel\(|postgres_changes|table:" app components lib 2>/dev/null | head -20

section "Messaging or payment integrations in code"
grep -rniE "stripe|paypal|sendgrid|resend|twilio|postmark|nodemailer|mailto:|payment_intent" app components lib package.json 2>/dev/null | head -20 || true

section "Hardcoded public claims and dead links"
grep -rnE "Trusted by|href=\"#\"|Add to Cart|Contact Support|Contact Us" app components 2>/dev/null

section "Merch images referenced vs present in public/"
grep -oE "image: \"[^\"]+\"" app/merch/page.tsx 2>/dev/null | sed -E 's/image: "(.*)"/\1/' | while read -r img; do
  [ -f "public$img" ] && echo "present  $img" || echo "MISSING  $img"
done

section "Console logging and 'any' usage (counts)"
echo "console.log: $(grep -rn 'console\.log' app components lib 2>/dev/null | wc -l | tr -d ' ')"
echo "': any' / 'as any': $(grep -rnE ': any|as any|<any>' app components lib 2>/dev/null | wc -l | tr -d ' ')"
echo "test files: $(find . -path ./node_modules -prune -o \( -name '*.test.*' -o -name '*.spec.*' \) -print 2>/dev/null | wc -l | tr -d ' ')"

section "Environment variable NAMES only (values never printed)"
[ -f .env.local ] && cut -d= -f1 .env.local | grep -v '^\s*#' | grep -v '^\s*$' || echo "(no .env.local)"

section "Dependencies of interest"
grep -E "\"(next|react|@supabase/ssr|@fullcalendar/core|zod|tailwindcss)\"" package.json

echo
echo "Scan complete. Compare against business/02 to business/06."
