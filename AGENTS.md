<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nanou's Calendar

App de prise de rendez-vous parents-profs (remplaçant Framadate), mobile-first, UI 100% en français.
Domaine prod : maitresse-nanou.fr. Une prof crée une "réunion" avec des créneaux (capacité variable par
journée), partage un lien `/r/[slug]`, les parents réservent avec un compte et reçoivent un email de
confirmation (Google Calendar + .ics).

## Stack

- Next.js 16 App Router, React 19, TypeScript strict, bun, Tailwind v4, shadcn/ui (preset radix-nova,
  variables CSS OKLch compatibles tweakcn), biome (tabs, lineWidth 120, single quotes, semicolons asNeeded)
- Clerk pour l'auth (localisation fr), rôle `teacher`/`parent` dans `publicMetadata`
- PocketBase v0.23+ self-hosted (https://api.maitresse-nanou.fr) = base de données uniquement.
  **Accès 100% server-side** via token superuser (`lib/pocketbase.ts`, instance par requête). Les API rules
  de toutes les collections sont à `null` ; le navigateur ne parle JAMAIS à PocketBase directement.
- Resend + react-email pour les emails, package `ics` pour les pièces jointes calendrier
- Timezone **Europe/Paris hardcodée** : stockage UTC, conversions via `lib/datetime.ts` (@date-fns/tz).
  Jamais de `new Date(y, m, d, h)` ni d'offset manuel.

## Commandes

- `bun dev` — dev server (branché sur le PocketBase prod)
- `bun run check` — biome check --write (lint + format)
- `bun run typecheck` — tsc --noEmit
- `bun test` — tests unitaires (lib/slots, lib/datetime, lib/slug, lib/calendar)
- `bun run setup:pocketbase` — script idempotent de création/màj des collections PB (API admin)

## Conventions

- Server actions dans `src/lib/actions/*` : toutes valident avec zod, vérifient `auth()` Clerk +
  l'ownership (prof propriétaire de l'event, parent propriétaire du booking), retournent
  `ActionResult<T> = { ok: true, data } | { ok: false, error }` (erreurs en français pour l'UI).
- Données : `users` (miroir Clerk, sync par webhook `/webhooks` + `ensureUser` lazy), `events`, `slots`,
  `bookings` (soft-cancel via `status`, jamais de delete ; 1 résa active max par parent/réunion garantie
  par un index unique partiel SQLite).
- Concurrence réservation : insertion optimiste + re-check du rang (tri `created,id`) + auto-suppression
  si dépassement de capacité — PB n'a pas de transactions REST, ne pas introduire de compteur dénormalisé.
- UI : composants shadcn dans `src/components/ui` (générés, ne pas réécrire à la main), composants métier
  dans `src/components/{event-page,dashboard,shared}`. Jamais de couleur hardcodée — uniquement les tokens
  du thème (`bg-primary`, `text-muted-foreground`…) pour rester compatible tweakcn.
