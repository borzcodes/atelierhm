# Graph Report - .  (2026-09-09)

## Corpus Check
- 53 files · ~96,780 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 180 nodes · 247 edges · 25 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output
- Edge kinds: contains: 62 · references: 53 · imports: 39 · calls: 36 · method: 24 · conceptually_related_to: 23 · semantically_similar_to: 10

## God Nodes (most connected - your core abstractions)
1. `WorkSlider` - 20 edges
2. `index.html (Home Page document)` - 15 edges
3. `HeroSequence` - 8 edges
4. `src/data/projects.js` - 8 edges
5. `project.html (Project Page document)` - 8 edges
6. `HM Architect — Tangier (studio site)` - 7 edges
7. `boot()` - 6 edges
8. `Smile Lab Brussels – Staff Meeting Room` - 6 edges
9. `Staff Lounge and Kitchenette with Pool Table (Smile Lab Brussels)` - 6 edges
10. `projectPlate()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Home Page (index.html route)` --references--> `index.html (Home Page document)`  [EXTRACTED]
  README.md → index.html
- `index.html (Home Page document)` --references--> `src/css/base.css`  [EXTRACTED]
  index.html → README.md
- `Hero Section (#hero)` --conceptually_related_to--> `src/js/mark.js`  [INFERRED]
  index.html → README.md
- `Work Section (#work)` --conceptually_related_to--> `src/js/work.js`  [INFERRED]
  index.html → README.md
- `project.html (Project Page document)` --references--> `src/css/base.css`  [EXTRACTED]
  project.html → README.md

## Hyperedges (group relationships)
- **Mark Reveal Flow (mark.js + hma-mark.svg + hero)** — readme_mark_js, readme_hma_mark_svg, indexhtml_hero_section [INFERRED 0.75]
- **Logo Trace Pipeline (trace:mark script -> PNG -> SVG -> favicon)** — readme_trace_mark_script, readme_hma_mark_png, readme_hma_mark_svg, readme_favicon_svg [EXTRACTED 0.90]
- **Background-Tab Resilience (rAF racing + loader + hero timeout)** — readme_raf_js, readme_loader_js, readme_hero_js [EXTRACTED 0.80]

## Communities

### Community 0 - "Page Structure & Brand Assets"
Cohesion: 0.08
Nodes (32): Capability Section (#capability), Contact Form (#contactForm), Contact Section (#contact), index.html (Home Page document), Footer (index.html), Founder Section (#founder), Header (index.html), Hero Section (#hero) (+24 more)

### Community 1 - "Project Data & Detail Page"
Cohesion: 0.09
Nodes (24): ALL_PLATES, BORROWS, bySlug(), CATEGORY_LABEL, HERO_SLIDES, nextOf(), PLACEHOLDER_SEED, placeholders (+16 more)

### Community 2 - "Site Chrome & Boot Logic"
Cohesion: 0.13
Nodes (20): initAnchors(), initCookie(), initMenu(), initProximity(), initReveals(), initScroll(), initYear(), scrollTo() (+12 more)

### Community 3 - "Work Slider Component"
Cohesion: 0.17
Nodes (3): CATEGORIES, initWork(), WorkSlider

### Community 4 - "Studio README & Tech Stack"
Cohesion: 0.15
Nodes (14): GSAP, HM Architect — Tangier (studio site), Hôpital Provincial de Tétouan, Home Page (index.html route), Lenis, PLACEHOLDER_SEED, tools/process-images.sh, Project Page (project.html?p=<slug> route) (+6 more)

### Community 5 - "Hero Sequence Animation"
Cohesion: 0.28
Nodes (2): buildSlides(), HeroSequence

### Community 6 - "Preloader & RAF Scheduling"
Cohesion: 0.36
Nodes (6): stopScroll(), preload(), revealHero(), runLoader(), nextFrame(), scheduleFrame()

### Community 7 - "Smile Lab Meeting Room"
Cohesion: 0.48
Nodes (7): Clinical Staff in White Lab Coats Reviewing Documents, Floor-to-Ceiling Glazing Overlooking Landscaped Courtyard, Smile Lab Brussels – Staff Meeting Room, Full-Height Oak Wood Paneling with Integrated LED Cove Lighting, Slim Linear Pendant Light Fixtures Over Table, Polished Concrete Flooring, Solid Wood Conference/Consultation Table with Upholstered Task Chairs

### Community 8 - "Smile Lab Staff Lounge"
Cohesion: 0.48
Nodes (7): Clinic Staff in White Coat and Scrubs, Wooden Convertible Pool/Dining Table, Full-Height Sliding Glass Wall to Terrace Garden, Oak Kitchenette Millwork with Espresso Machine, Beige Sectional Lounge Seating Area, Polished Concrete Flooring, Staff Lounge and Kitchenette with Pool Table (Smile Lab Brussels)

### Community 9 - "Brand Logo Assets"
Cohesion: 0.83
Nodes (4): HM Architect Favicon Icon, HM Architect Primary Logo Mark, HM Architect Monogram Logo, HMA Original Source Logo (Instagram Capture)

### Community 11 - "Founder Portrait"
Cohesion: 1.00
Nodes (3): Haytham Mribah — Founder Portrait, Haytham Mribah, HM Architect

### Community 12 - "Hopital Aerial Render"
Cohesion: 1.00
Nodes (1): Aerial Night Rendering of Hôpital Provincial de Tétouan

### Community 13 - "Terracotta Bedroom Suite"
Cohesion: 1.00
Nodes (1): Résidence Terracotta - Master Bedroom & Ensuite Bathroom Suite

### Community 14 - "Sky Ring Twin Towers"
Cohesion: 1.00
Nodes (1): Tangier Sky Ring - Twin Tower Render with Sky Ring (Plate 01)

### Community 15 - "Hopital Entrance Photo"
Cohesion: 1.00
Nodes (1): Hôpital Provincial de Tétouan - Main Entrance at Dusk

### Community 16 - "Terracotta Living Room"
Cohesion: 1.00
Nodes (1): Résidence Terracotta – Living Room with Terracotta Media Wall

### Community 17 - "Smile Lab Office"
Cohesion: 1.00
Nodes (1): Smile Lab Brussels - Director's Office with Courtyard View

### Community 18 - "Sky Ring Podium Facade"
Cohesion: 1.00
Nodes (1): Tangier Sky Ring - Illuminated Podium Facade with Retail Frontage (Plate 02)

### Community 19 - "Hospital Concept Diagram"
Cohesion: 1.00
Nodes (1): Démarche Conceptuelle — Massing Diagram Sequence

### Community 20 - "Terracotta Kitchen Island"
Cohesion: 1.00
Nodes (1): Résidence Terracotta – Kitchen Island Interior (Plate 03)

### Community 21 - "Smile Lab Treatment Room"
Cohesion: 1.00
Nodes (1): Smile Lab Brussels - Treatment Room with Garden-View Corridor

### Community 22 - "Smile Lab Operatory"
Cohesion: 1.00
Nodes (1): Smile Lab Brussels – Treatment Room with Living Green Wall

### Community 23 - "Smile Lab Reception"
Cohesion: 1.00
Nodes (1): Smile Lab Brussels – Reception Desk and Waiting Lounge

### Community 24 - "Original Studio Logo"
Cohesion: 1.00
Nodes (1): hma-original.jpg

### Community 25 - "Sky Ring Facade Detail"
Cohesion: 1.00
Nodes (1): Tangier Sky Ring Plate 03 - Curved Facade with LED Screen and Moroccan Flag Overlay

## Knowledge Gaps
- **44 isolated node(s):** `REAL`, `PLACEHOLDER_SEED`, `CATEGORY_LABEL`, `BORROWS`, `placeholders` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Hero Sequence Animation`** (2 nodes): `buildSlides()`, `HeroSequence`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hopital Aerial Render`** (1 nodes): `Aerial Night Rendering of Hôpital Provincial de Tétouan`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Terracotta Bedroom Suite`** (1 nodes): `Résidence Terracotta - Master Bedroom & Ensuite Bathroom Suite`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sky Ring Twin Towers`** (1 nodes): `Tangier Sky Ring - Twin Tower Render with Sky Ring (Plate 01)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hopital Entrance Photo`** (1 nodes): `Hôpital Provincial de Tétouan - Main Entrance at Dusk`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Terracotta Living Room`** (1 nodes): `Résidence Terracotta – Living Room with Terracotta Media Wall`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smile Lab Office`** (1 nodes): `Smile Lab Brussels - Director's Office with Courtyard View`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sky Ring Podium Facade`** (1 nodes): `Tangier Sky Ring - Illuminated Podium Facade with Retail Frontage (Plate 02)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hospital Concept Diagram`** (1 nodes): `Démarche Conceptuelle — Massing Diagram Sequence`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Terracotta Kitchen Island`** (1 nodes): `Résidence Terracotta – Kitchen Island Interior (Plate 03)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smile Lab Treatment Room`** (1 nodes): `Smile Lab Brussels - Treatment Room with Garden-View Corridor`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smile Lab Operatory`** (1 nodes): `Smile Lab Brussels – Treatment Room with Living Green Wall`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Smile Lab Reception`** (1 nodes): `Smile Lab Brussels – Reception Desk and Waiting Lounge`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Original Studio Logo`** (1 nodes): `hma-original.jpg`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sky Ring Facade Detail`** (1 nodes): `Tangier Sky Ring Plate 03 - Curved Facade with LED Screen and Moroccan Flag Overlay`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initWork()` connect `Work Slider Component` to `Site Chrome & Boot Logic`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `index.html (Home Page document)` connect `Page Structure & Brand Assets` to `Studio README & Tech Stack`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `src/data/projects.js` (e.g. with `tools/process-images.sh` and `src/js/work.js`) actually correct?**
  _`src/data/projects.js` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `REAL`, `PLACEHOLDER_SEED`, `CATEGORY_LABEL` to the rest of the system?**
  _44 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Page Structure & Brand Assets` be split into smaller, more focused modules?**
  _Cohesion score 0.08064516129032258 - nodes in this community are weakly interconnected._
- **Should `Project Data & Detail Page` be split into smaller, more focused modules?**
  _Cohesion score 0.09425287356321839 - nodes in this community are weakly interconnected._
- **Should `Site Chrome & Boot Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.12666666666666668 - nodes in this community are weakly interconnected._