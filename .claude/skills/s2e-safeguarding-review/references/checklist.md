# Safeguarding and data checklist

Work through each heading against the code, not the intent. Principles only: no statute is cited because jurisdiction is unknown. Anything noted "adviser" needs a qualified person for the actual rule.

## 1. Collection
- Is every field needed for a stated purpose? Is anything collected "just in case"?
- Is anything needed for safety missing? In this product the register currently lacks emergency contact, conditions and allergies entered by the parent, guardian consent, photo consent, who may collect the child (G-15).
- Is the age limit checked correctly? (Current check is by year difference, so a player turning 18 this year passes.)

## 2. Access
- Who can read each item: the parent who owns the child, any admin, any signed-in user, anyone with a link? Is it enforced by a database policy or only by hiding it in the UI?
- Can a parent see another parent's children, bookings, forms or contact details?
- Can anyone change their own role or the approval status?
- The bookings roster joins parent email and phone for admins. Is that visible to anyone else? (Draft RLS lets any signed-in user read all booking rows; check what ids reveal.)
- Does `coach` have a defined, minimal view, or does it fall through to parent or admin?

## 3. Storage and transport
- Bucket visibility for photos and medical files. Code assumes `player-photos` is public (G-03). Is a file URL guessable? Does it contain the child's id?
- Are medical files ever served by public URL? Prefer short-lived signed URLs.
- File type and size limits enforced on the server, not only in the form?

## 4. Display, logs and exports
- Does any `console.log`, error message or toast print child or parent details? (`admin-dashboard.tsx` logs children and profiles.)
- Can the admin UI show the wrong family's contact details (G-14)?
- Do emails or notifications contain names, medical information or full dates of birth? Prefer first name only and no medical detail.
- Is anything exported, downloaded or copied to a third party?

## 5. Consent
- Is consent captured, versioned and dated for terms, privacy notice, photos, and emergency treatment?
- Is it by a parent or guardian with authority?
- Can a parent withdraw it, and what happens then?

## 6. Retention and deletion
- When a player is deleted, are the database rows, photo, medical file and bookings all removed? (Today only rows; files stay: G-13.)
- Is there a retention period and a way to apply it? Is a leaving player's data kept longer than needed?
- Do backups, logs and exports keep data after deletion? (adviser)

## 7. Approval and review
- Can the admin actually inspect the medical form in the product? (G-02: the button does nothing.)
- Is a form accepted without review? Is expiry enforced anywhere?
- Is an edit after approval (name, date of birth, photo) re-reviewed? (G-16)
- Is a rejection recorded with a reason, and can a family correct and resubmit? (G-05)

## 8. Third parties
- Any new service that receives personal data: payments, email, SMS, analytics, error tracking, AI tools. What does it receive, where is it processed, is there an agreement? (adviser)
- Are keys kept server-side? Is the service-role key ever reachable from the browser?

## 9. People and process
- Are coaches vetted, and is that recorded outside the app? (Q-11, adviser)
- Is there a named safeguarding lead, an incident route and a way for parents to raise a concern? (Q-15)
- Are supervision, changing-room, transport and photography rules written down? (Q-15, adviser)

## 10. Incident readiness
- If a file or list were exposed, could the owner tell who was affected and notify them? Is there a record of which families have which data?
- Is there a written first-hour plan? (adviser)
