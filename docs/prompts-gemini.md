# Prompts Gemini — tous les assets de l'app

Où déposer les fichiers générés (l'app les détecte automatiquement, rien d'autre à changer — sauf le logo du
header, à me signaler une fois le fichier en place) :

| Asset | Chemin | Format |
| --- | --- | --- |
| Vidéo de fond du hero | `public/landing/hero.mp4` | 1920×1080 min, H.264, 8–12 s en boucle, < 8 Mo si possible |
| Image carte 001 (créneaux) | `public/landing/step-1.png` | PNG fond transparent, ~1000×1000 |
| Image carte 002 (partage) | `public/landing/step-2.png` | PNG fond transparent, ~1000×1000 |
| Image carte 003 (familles) | `public/landing/step-3.png` | PNG fond transparent, ~1000×1000 |
| Favicon / icône d'app | `src/app/icon.png` | PNG **512×512**, fond transparent (Next génère les favicons) |
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
Cinematic 3D motion design loop, premium editorial style, NOT a tech startup aesthetic.

Scene: a minimalist floating 3D calendar made of soft matte cream-colored (#E1E0CC) rounded
tiles, suspended in a deep charcoal-black void (#0C0B10) with a large soft violet glow
(#6D5BD0) breathing slowly behind it, like studio lighting through haze.

Action, in one seamless choreography:
1. Empty calendar grid drifts gently; a row of time-slot tiles assembles itself one by one,
   each tile sliding into place with a soft, satisfying snap — as if a teacher is opening
   appointment slots.
2. Then three small cream cards, each carrying a tiny abstract family glyph (two rounded
   figures, no faces), glide in from different directions and dock into separate slots,
   one after another. Each docking emits a quiet violet light pulse and the tile's corner
   lights up with a small check mark shape.
3. The filled calendar floats and slowly rotates a few degrees; the violet glow breathes;
   the loop closes back to the starting drift.

Camera: very slow dolly with a slight orbital drift, shallow depth of field, the calendar
occupies the upper-center of the frame, generous empty dark space in the lower third
(text will be overlaid there).

Lighting & texture: soft studio key light, gentle rim light on tile edges, subtle film
grain, no lens flares, no particles, no bokeh confetti.

Palette strictly limited to: deep black-violet background #0C0B10, cream #E1E0CC objects,
violet glow #6D5BD0, one warm peach accent #E8A857 used only on the check-mark pulses.

Mood: calm, tactile, reassuring, crafted — like a high-end stationery brand film.
No text, no logos, no UI screenshots, no humans, no faces, no hands.
Slow pace, ~10 seconds, perfectly seamless loop, 4K, 24fps.
```

Variante si le rendu est trop chargé :

```
Same scene, but even more minimal: only five calendar tiles, one card docking once,
extreme negative space, slower camera, the violet glow is the main source of movement.
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
