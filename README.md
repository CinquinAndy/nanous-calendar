# Nanou's Calendar 📅

Application de prise de rendez-vous parents-profs (remplaçant Framadate), mobile-first, en français.

> L'enseignant·e crée ses créneaux et partage un lien (`maitresse-nanou.fr/r/ma-reunion`). Les familles
> choisissent leur horaire et reçoivent un email de confirmation avec ajout Google Calendar / Apple (.ics).

## Stack

| Brique | Choix |
| --- | --- |
| Front | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, shadcn/ui (thème compatible [tweakcn](https://tweakcn.com)) |
| Auth | Clerk (`@clerk/nextjs`, localisation fr) — rôle `teacher`/`parent` choisi à l'onboarding |
| Données | PocketBase self-hosted (Coolify) sur `api.maitresse-nanou.fr`, accès **100% server-side** via token superuser |
| Emails | Resend + react-email, pièce jointe `.ics` |
| Tooling | bun, biome, bun test |

## Démarrer en local

```bash
cp .env.example .env.local   # puis remplir les clés
bun install
bun run setup:pocketbase     # crée/synchronise les collections PB (idempotent)
bun dev                      # http://localhost:3000 (branché sur le PB prod)
```

Vérifications : `bun run typecheck` · `bun run check` (biome) · `bun test`.

## Architecture

- **PocketBase = base de données uniquement.** Toutes les API rules sont à `null` (verrouillées) ; le
  navigateur ne parle jamais à PocketBase. Tout passe par les server actions (`src/lib/actions/*`) avec un
  token superuser (`src/lib/pocketbase.ts`, instance par requête).
- **Sync des comptes** : webhook Clerk (`/webhooks`, événements user.created/updated/deleted) + création
  lazy `ensureUser()` en secours. Miroir dans la collection `users` (clé `clerk_id` unique).
- **Anti double-réservation** : index SQLite unique partiel `(event, parent) WHERE status = 'confirmed'` —
  1 réservation active max par parent et par réunion, garanti même en cas de course.
- **Course sur le dernier créneau** : insertion optimiste → re-check du rang (tri `created,id`) →
  auto-suppression si dépassement de capacité. Pas de compteur dénormalisé.
- **Timezone** : saisie/affichage en Europe/Paris, stockage UTC (`src/lib/datetime.ts`, DST testé).
- **Annulation** : soft-cancel (`status=cancelled`), la place se libère automatiquement.

## Déploiement (Coolify)

1. **PocketBase** : déjà déployé (`api.maitresse-nanou.fr`). Après un reset éventuel, rejouer
   `bun run setup:pocketbase` et régénérer un token d'impersonation (Admin UI → `_superusers` → ⋯ →
   Impersonate, durée longue) dans `POCKETBASE_SUPERUSER_TOKEN`.
2. **App Next.js** : nouvelle ressource Coolify sur ce repo (Dockerfile fourni ou nixpacks), domaine
   `maitresse-nanou.fr`, renseigner toutes les variables de `.env.example` (les `NEXT_PUBLIC_*` sont
   nécessaires **au build**). `NEXT_PUBLIC_APP_URL=https://maitresse-nanou.fr`.
3. **Clerk prod** : créer l'instance de production (domaine `maitresse-nanou.fr`), remplacer
   `pk_test_`/`sk_test_` par les clés `pk_live_`/`sk_live_`, recréer le webhook
   `https://maitresse-nanou.fr/webhooks` (événements user.*) et reporter son signing secret.
4. **Resend** : vérifier le domaine d'envoi de `EMAIL_FROM` (DNS SPF/DKIM) dans le dashboard Resend.

## Parcours

- **Prof** : inscription → onboarding "enseignant·e" → nouvelle réunion → onglet *Créneaux* (journée par
  journée : horaires, durée, capacité — modifiable créneau par créneau) → onglet *Partager* → suit les
  réservations dans *Planning* (annulation possible).
- **Parent** : ouvre le lien → choisit un créneau → crée son compte → nom de l'enfant + commentaire →
  email de confirmation + boutons calendrier → peut annuler/changer depuis *Mes réservations*.
