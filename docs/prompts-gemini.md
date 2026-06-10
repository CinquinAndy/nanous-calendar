# Prompts Gemini — tous les assets de l'app

Où déposer les fichiers générés (l'app les détecte automatiquement, rien d'autre à changer — sauf le logo du
header, à me signaler une fois le fichier en place) :

| Asset | Chemin | Format |
| --- | --- | --- |
| Vidéo de fond du hero | `public/landing/hero.mp4` | 1920×1080 min, H.264, 8–12 s en boucle, < 8 Mo si possible |
| Image carte 001 (créneaux) | `public/landing/step-1.png` | PNG fond transparent, ~1000×1000 |
| Image carte 002 (partage) | `public/landing/step-2.png` | PNG fond transparent, ~1000×1000 |
| Image carte 003 (familles) | `public/landing/step-3.png` | PNG fond transparent, ~1000×1000 |
| Favicon / icône d'app | ✅ déjà en place (`src/app/icon.svg`, calendrier-cœur du header) — `src/app/icon.png` Gemini = optionnel | PNG **512×512** si tu veux le remplacer |
| Icône Apple (écran d'accueil) | `src/app/apple-icon.png` | PNG **180×180**, fond PLEIN (pas de transparence, coins carrés) |
| Logo complet (header, emails) | `public/landing/logo.png` | PNG fond transparent, ~1200 de large |
| Image de partage (OG) | `src/app/opengraph-image.png` | PNG/JPG **1200×630** exactement |

Tant que les fichiers n'existent pas, le hero affiche le dégradé violet et les cartes affichent une icône — rien ne casse.

---

## 🎬 Vidéo du hero (Veo / Gemini)

> Contraintes de design : la vidéo passe SOUS une énorme typographie crème en bas à gauche et un texte à droite,
> avec un voile sombre haut/bas et un grain ajoutés par le site. Il faut donc : du calme, du contraste sombre,
> l'action visuelle centrée/haute, aucun texte incrusté, et une boucle parfaite.

Prompt principal (à coller tel quel) :

```
Cinematic live-action-style nature loop, calm and cozy, premium editorial mood.

Scene: a serene twilight landscape — soft rolling meadow at dusk, gentle mist in the
distance, a deep dusk sky in dark blue-violet tones (#0C0B10 shadows, #6D5BD0 violet
haze). In the middle of the frame, slightly above the horizon, floats a single very
simple calendar: a plain cream-colored (#E1E0CC) rounded rectangle page with a thin
binding bar on top, almost no detail, glowing softly as if it were the only light
source of the scene, like a quiet lantern. Its warm light spills gently onto the
grass and the mist around it.

The calendar itself does NOT move or animate. All the life comes from the ambiance:
tall grass swaying slowly in a light breeze, a few dust motes and tiny pollen specks
drifting through the calendar's light, thin clouds sliding very slowly across the sky,
the mist breathing softly. Everything slow, peaceful, hypnotic.

Camera: locked tripod or an extremely slow push-in, the calendar sits in the
upper-center of the frame, the lower third of the frame stays dark and uncluttered
(text will be overlaid there).

Lighting: dusk ambience, the cream calendar as the main warm light source, soft violet
atmospheric haze, subtle film grain, no lens flares.

Palette: deep dark blue-violet night tones, cream #E1E0CC light, violet #6D5BD0 haze.

Mood: serene, cozy, reassuring — like a quiet evening before a school day.
No text, no logos, no humans, no animals, no buildings.
~10 seconds, perfectly seamless loop, 4K, 24fps.
```

Variante encore plus épurée (si le paysage devient trop chargé) :

```
Same mood, but minimal: only a dark misty gradient horizon, the simple glowing cream
calendar floating in the center-top, and slow drifting dust particles in its light.
No grass, no clouds — just mist, light and dust. Perfectly seamless loop.
```

Conseils :
- Génère en 16:9 ; sur mobile le site recadre en `object-cover` (l'action centrée/haute reste visible).
- Si la boucle "saute", demande : `make the first and last frame identical for a perfect loop`.
- Compresse ensuite (ex. `ffmpeg -i in.mp4 -an -vcodec libx264 -crf 28 -movflags +faststart hero.mp4`).

---

## 🖼️ Images des 3 cartes (style "thiings" : objet 3D isolé)

Style commun — préfixe à coller devant chacun des trois prompts :

```
A single cute 3D rendered object in the style of premium app icons: soft rounded shapes,
matte clay material with subtle gloss, gentle studio lighting, pastel colors,
slight top-down 3/4 view, centered, isolated on a plain pure white background,
no text, no shadows outside the object, high resolution.
```

**step-1.png — Créer ses créneaux (carte violette)**

```
Object: a friendly desk calendar with rounded cream pages, a few time-slot bars in soft
violet (#8B6FE8) being slotted into the page like puzzle pieces, one tiny golden pencil
resting against it. Main colors: cream, soft violet, a touch of warm gold.
```

**step-2.png — Partager le lien (carte orange)**

```
Object: a small cream paper plane carrying a glossy rounded chain-link charm, with a soft
dotted flight path curling behind it. Main colors: cream, warm orange (#F0A24B) accents,
a touch of soft violet on the link.
```

**step-3.png — Les familles réservent (carte bleue)**

```
Object: an open cream envelope with a rounded confirmation card popping out, the card shows
a big soft blue (#5BA3F5) check mark and a tiny calendar page corner. Main colors: cream,
soft blue, a touch of warm gold on the envelope flap.
```

Conseils :
- Demande le fond **blanc uni** puis détoure (remove.bg, ou Gimp/Photoshop) → PNG transparent,
  sinon le carré blanc se verra sur les cartes.
- Garde le même prompt de style pour les trois afin qu'elles forment une famille cohérente.

---

## 🔖 Logo (favicon + header + emails)

Concept : un **calendrier-cœur** — la page de calendrier dont la date est un petit cœur, reprise de l'icône
actuelle du header, dans le même langage 3D clay que les cartes. Trois déclinaisons à générer **dans la même
session de chat** pour garder la cohérence.

**1. `src/app/icon.png` (512×512) — l'icône seule**

```
A single app icon: a cute 3D rendered desk calendar page in soft matte cream clay (#E1E0CC),
rounded corners, with one small glossy violet heart (#6D5BD0) in the center of the page and
a thin violet top binding bar. Soft studio lighting, subtle gloss, slight top-down 3/4 view,
centered, isolated on a plain pure white background, no text, no shadow outside the object,
high resolution, 1:1 aspect ratio.
```

→ détourer en PNG transparent, exporter en 512×512.

**2. `src/app/apple-icon.png` (180×180) — version à fond plein**

```
Same 3D cream calendar with violet heart, but placed on a solid deep black-violet background
(#0C0B10) with a very soft violet glow behind the object, the calendar filling about 70% of
the frame, 1:1 aspect ratio, no text.
```

→ exporter en 180×180, SANS transparence (Apple ajoute lui-même les coins arrondis).

**3. `public/landing/logo.png` — logo horizontal complet**

```
Same 3D cream calendar with violet heart on the left, followed by the handwritten-style
wordmark "Nanou's Calendar" in warm dark charcoal (#1A1820), modern rounded sans-serif with
slightly playful curves, on a plain pure white background, horizontal lockup, no tagline,
high resolution.
```

→ détourer en PNG transparent. (Les wordmarks générés par IA sont parfois approximatifs sur les
lettres — si c'est le cas, génère seulement l'icône et je compose le texte en CSS à côté.)

---

## 🖼️ Image de partage — `src/app/opengraph-image.png` (1200×630)

C'est l'aperçu affiché quand le lien est partagé (WhatsApp, Messages, mails…) — important car
toute l'app repose sur le partage de liens aux familles.

```
A wide social media banner, 1200x630: deep black-violet background (#0C0B10) with a soft
violet glow (#6D5BD0) in the upper right, fine film grain. On the left, large elegant
cream-colored (#E1E0CC) text reading "Nanou's Calendar" in a modern medium-weight sans-serif
with tight letter spacing, and below it a smaller cream line "Rendez-vous parents-profs,
sans prise de tête". On the right, the cute 3D cream clay calendar with a glossy violet
heart, floating with a subtle shadow. Premium editorial style, calm, crafted, no other text,
no logos, no watermark.
```

→ si le texte généré est approximatif, demande la même image **sans aucun texte** (juste le fond
et le calendrier 3D à droite) et je poserai le texte par-dessus en CSS/export.
