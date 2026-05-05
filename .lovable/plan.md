# Listing Claim Flow

A self-serve way for business owners to claim their listing, verify ownership, and get partner access — with an admin review queue as the trust gate.

## User flow

```text
Listing page                  Submitter                     Admin
-----------                   ---------                     -----
[Claim this listing] ──▶  Sign in / sign up
                          Fill claim form
                          (role at business,
                           work email, notes)
                                  │
                                  ▼
                          Auto-verify if work
                          email domain matches
                          listing website domain
                                  │
                                  ▼
                          Status: pending  ───────────▶  Admin queue
                                                         /admin/claims
                                                              │
                                                              ▼
                                                         Approve / Reject
                                                              │
                          ◀──────────────────────────────────┘
                          On approve:
                            - listings.partner_id = user
                            - grant 'partner' role
                            - email submitter
                          On reject:
                            - email submitter w/ reason
```

## What gets built

### 1. Database (`listing_claims` table)

Columns: `id`, `listing_id`, `user_id`, `claimant_name`, `claimant_email`, `claimant_role` (Owner / Manager / Marketing / Other), `notes`, `status` (pending / approved / rejected), `email_domain_match` (bool — auto-set on insert), `reviewed_by`, `review_notes`, `created_at`, `reviewed_at`.

- Unique partial index: one pending claim per (listing_id, user_id).
- RLS:
  - INSERT: any authenticated user, with `user_id = auth.uid()`.
  - SELECT: claimant sees own claims; admins see all.
  - UPDATE: admins only (status, review_notes, reviewed_by, reviewed_at).
- Trigger on approve: set `listings.partner_id = user_id`, insert `('partner')` into `user_roles` (idempotent).

### 2. "Claim this listing" CTA on listing pages

Added to `ListingDetailPage.tsx` sidebar, shown when `listings.partner_id IS NULL`. If signed-in user already has a pending or approved claim on the listing, button shows that state instead.

Unauthenticated click → redirect to `/auth?next=/{category}/{slug}?claim=1`.

### 3. Claim form (`/claim/$slug`)

- Auth-gated (redirect to `/auth` if signed out).
- Zod-validated form: name (≤100), work email (valid email, ≤255), role (enum), notes (≤500).
- On submit: insert into `listing_claims`. Server compares email domain to listing's website host — sets `email_domain_match = true` if equal (helps admin triage but doesn't auto-approve).
- Success screen: "We'll review within 1–2 business days."

### 4. Admin review queue (`/admin/claims`)

- New entry in admin nav.
- Table: listing, claimant, role, email (with green "domain match" badge if true), submitted date, status filter.
- Detail drawer with claimant info + listing preview + Approve / Reject buttons.
- Approve runs the trigger logic (link partner_id, grant role). Reject takes a required reason.

### 5. Partner dashboard empty state

Update `/partner` empty state to link to "Find your listing" with a search, plus "Submit a claim" copy. Removes the current dead-end.

### 6. `/partners` marketing page CTAs

Wire the inactive "Claim listing" / "Start Featured" / etc. buttons to either the claim flow (Free tier) or a "Contact sales" mailto for paid tiers (Stripe checkout is out of scope for this round — noted as next step).

### 7. Email notifications

Three transactional emails via the project's email infra:
- Claim submitted (to claimant): "We got it, review in 1–2 days."
- Claim approved (to claimant): link to `/partner`.
- Claim rejected (to claimant): with admin's reason.

## Out of scope (can follow up)

- Stripe checkout for paid tiers
- Phone/postcard verification fallback when email domain doesn't match
- Partner-facing analytics dashboard (currently mocked)
- Bulk claim approval

## Technical notes

- Schema change via migration; data writes via standard insert tooling.
- The auto-link-on-approve runs as a Postgres trigger using `SECURITY DEFINER` so the admin UI doesn't need service-role calls.
- Claim form input validated with zod on both client and server (server function with `requireSupabaseAuth`).
- Domain comparison normalizes (`lowercase`, strip `www.`, drop port) and only checks exact match — subdomains don't auto-match.
