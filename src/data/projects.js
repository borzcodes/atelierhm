/**
 * HM ARCHITECT — project index.
 *
 * Imagery lives in `public/assets/img/<slug>/`. Each entry lists its plates in
 * the order they should be read; the detail page lays itself out from that
 * list, so adding or removing an image needs no template change.
 *
 * NOTE ON COPY: titles, locations and imagery are the studio's own. The
 * descriptive prose and the figures in `facts` are placeholder editorial —
 * replace them with the practice's own text before this goes live.
 */

const IMG = 'assets/img';

/** Path to a plate. `size` is 'lg' for full-bleed use, omitted otherwise. */
export function plate(slug, file, size) {
  return `${IMG}/${slug}/${file}${size === 'lg' ? '-lg' : ''}.webp`;
}

/**
 * Path to one of a project's plates. Always use this rather than `plate()`
 * with `project.slug`: a placeholder borrows another project's imagery, so
 * the folder it reads from is not the folder its own slug would name.
 */
export function projectPlate(project, file, size) {
  return plate(project.imageSlug || project.slug, file, size);
}

export const CATEGORIES = [
  { id: 'all', label: 'All work' },
  { id: 'public', label: 'Public' },
  { id: 'mixed-use', label: 'Mixed-use' },
  { id: 'interiors', label: 'Interiors' },
  { id: 'residential', label: 'Residential' },
];

const REAL = [
  {
    slug: 'hopital-tetouan',
    title: 'Hôpital Provincial de Tétouan',
    shortTitle: 'Hôpital de Tétouan',
    category: 'public',
    categoryLabel: 'Public',
    location: 'Tétouan, Morocco',
    year: '2024',
    status: 'Completed',
    aspect: 'wide',
    accent: '#3E5A63',
    lede: 'A provincial hospital planned as a single mass, then opened up with courtyards until every room found daylight.',
    statement:
      'The brief arrived as a schedule of areas — a medico-technical platform, a logistics spine, and the inpatient wings above. We began with one solid volume covering the site, and the whole design was the act of carving into it: patios cut for light, then wings pulled apart until the plan read as a sequence of gardens rather than a sequence of corridors.',
    caption:
      'Five moves, in order: the initial mass, the patios, the medico-technical platform, the inpatient wings, the final volume.',
    body: [
      'A hospital is a machine before it is a building, and the machine is not negotiable. Operating theatres want depth and no daylight; wards want the opposite. The plan holds both by stacking them — the technical platform low and deep, the inpatient wings above it and only two rooms thick.',
      'Between them sit the courtyards. They are the entire environmental argument of the project: no patient room is more than seven metres from one, and the corridors that serve them are lit and ventilated along their whole length rather than at the ends.',
      'The entrance canopy is a timber lattice on slender columns, sized so that the shade it throws reaches the drop-off point at midday in July. It is the one gesture the building makes towards the road, and it is deliberately the softest thing on the site.',
    ],
    facts: [
      ['Typology', 'Provincial hospital'],
      ['Location', 'Tétouan, Morocco'],
      ['Programme', 'Medico-technical, logistics, inpatient'],
      ['Concept', 'Carved mass, courtyard-lit'],
      ['Status', 'Completed'],
    ],
    images: [
      { file: '01', alt: 'Aerial view of the hospital complex at night, courtyards lit within the mass' },
      { file: '02', alt: 'The entrance canopy at dusk, timber lattice over the drop-off' },
      {
        file: '03',
        alt: 'Conceptual diagram: five massing moves from initial volume to final form',
        // Line art on white — belongs in the project gallery, but reads as a
        // blank card in the small cycling slots.
        diagram: true,
      },
    ],
  },

  {
    slug: 'tangier-sky-ring',
    title: 'Tangier Sky Ring',
    shortTitle: 'Tangier Sky Ring',
    category: 'mixed-use',
    categoryLabel: 'Mixed-use',
    location: 'Tangier, Morocco',
    year: '2026',
    status: 'In design',
    aspect: 'square',
    accent: '#6E7F6B',
    lede: 'Two towers held apart by a single suspended ring, over a retail base that behaves like a piece of coastline.',
    statement:
      'The ring is the whole idea. Two towers on their own are a pair; a ring set between them at height makes them one figure, gives the city an observation deck it can see from the shore, and leaves the space beneath it open all the way to the ground.',
    caption:
      'Vertical fins wrap both towers. They carry the planting, they cut the western sun, and at night they carry light.',
    body: [
      'The towers are clad in a deep vertical fin — close-spaced, full-height, and turned slightly floor by floor so the facade reads as a woven surface rather than a grid. The fins are structural to the balconies they pass, and they hold the planting that runs in continuous bands up both shafts.',
      'The base is where the project meets the city. Retail runs behind a screen of the same fins, interrupted by two full-height aquarium windows and a media wall that turns the podium into a public surface — a flag on a national holiday, surf on an ordinary Tuesday.',
      'At the top, the ring holds a restaurant, an observation floor and a skydive drop. It is the piece everyone will photograph, so it was designed to be legible in silhouette from the port, from the Marshan and from the Spanish coast.',
    ],
    facts: [
      ['Typology', 'Mixed-use towers'],
      ['Location', 'Tangier, Morocco'],
      ['Programme', 'Retail, offices, hotel, observation'],
      ['Facade', 'Vertical fins with planted bands'],
      ['Status', 'In design'],
    ],
    images: [
      { file: '01', alt: 'The twin towers and the suspended ring at night, lit for a celebration' },
      { file: '02', alt: 'Facade detail: vertical fins, planted bands and the lit podium below' },
      { file: '03', alt: 'The retail base with the aquarium window and the media wall' },
    ],
  },

  {
    slug: 'smile-lab-brussels',
    title: 'Smile Lab Brussels',
    shortTitle: 'Smile Lab Brussels',
    category: 'interiors',
    categoryLabel: 'Interiors',
    location: 'Brussels, Belgium',
    year: '2023',
    status: 'Completed',
    aspect: 'wide',
    accent: '#B08A5E',
    lede: 'A dental clinic built out of oak, poured concrete and borrowed daylight — and almost nothing that reads as clinical.',
    statement:
      'Nobody looks forward to a dental appointment, so the brief was really about the ninety seconds before one. The plan puts a garden on the other side of every wall a patient faces: from the street window, from the waiting room, from the chair itself. The equipment is not hidden, but it is never the first thing in the frame.',
    caption:
      'Oak, polished concrete and one continuous line of warm light. The clinical surfaces are there — they are simply not the subject.',
    body: [
      'The clinic occupies a narrow Brussels plot with rooms front and back and a courtyard cut through the middle. That courtyard does most of the work: it lights the treatment rooms from the side rather than overhead, which is both better for the dentist and far better for the person in the chair.',
      'Everything vertical is oak — full-height panelling, joinery, door leaves, the reception desk — set against polished concrete floors and plain white ceilings. A single recessed line of warm light runs through the whole plan and does the rest.',
      'Behind the clinical rooms there is a staff kitchen and lounge opening onto the garden. It was not in the original brief. It is the reason the practice can run two shifts.',
    ],
    facts: [
      ['Typology', 'Dental clinic'],
      ['Location', 'Brussels, Belgium'],
      ['Programme', 'Reception, surgeries, staff lounge'],
      ['Materials', 'Oak, polished concrete, glass'],
      ['Status', 'Completed'],
    ],
    images: [
      { file: '05', alt: 'Reception and waiting area, with the street window beyond' },
      { file: '02', alt: 'Consulting office looking onto the planted courtyard' },
      { file: '03', alt: 'A treatment room in use, lit from the courtyard along its length' },
      { file: '04', alt: 'Treatment room with the moss panel and oak joinery' },
      { file: '01', alt: 'The meeting room, oak-lined, opening to the garden' },
      { file: '06', alt: 'Staff kitchen and lounge opening onto the rear garden' },
    ],
  },

  {
    slug: 'residence-terracotta',
    title: 'Résidence Terracotta',
    shortTitle: 'Résidence Terracotta',
    category: 'residential',
    categoryLabel: 'Residential',
    location: 'Tangier, Morocco',
    year: '2025',
    status: 'Completed',
    aspect: 'wide',
    accent: '#C0725A',
    lede: 'An apartment worked out in three colours — terracotta, sage and warm marble — and then left alone.',
    statement:
      'The palette was fixed in the first week and never revisited: a burnt terracotta for the joinery, a soft sage for the upholstery, and a warm veined marble wherever water or heat arrives. Everything after that was a question of where each one stops.',
    caption:
      'Terracotta on the joinery, sage on the soft furniture, marble at the hearth and the wet rooms. Three materials, one rule each.',
    body: [
      'The plan is conventional — a through living room, a kitchen off it, bedrooms behind — so the work went into the surfaces and the light. Full-height sheers on every window keep the daylight even and stop the terracotta going orange in the afternoon.',
      'Joinery runs floor to ceiling in every room and carries the lighting, so there are no downlights in the living spaces at all. The ceiling stays a single unbroken plane; a shadow gap and a concealed strip do everything a fitting would have.',
      'In the principal bedroom the wardrobe, the dressing table and the bathroom are one continuous piece of cabinetry that turns three corners. The marble shower sits inside it like a lit vitrine.',
    ],
    facts: [
      ['Typology', 'Private apartment'],
      ['Location', 'Tangier, Morocco'],
      ['Programme', 'Living, kitchen, principal suite'],
      ['Materials', 'Lacquered joinery, marble, brass'],
      ['Status', 'Completed'],
    ],
    images: [
      { file: '02', alt: 'Living room with the terracotta media wall and sage seating' },
      { file: '03', alt: 'Kitchen with marble island and brass fittings' },
      { file: '01', alt: 'Principal bedroom opening into the marble bathroom' },
    ],
  },
];

/* -------------------------------------------------------- placeholders -- */
/**
 * Stand-ins, so every category has six entries to lay out against while the
 * studio's own archive is still being gathered. They borrow imagery from the
 * four real projects, rotated so no two cards open on the same plate.
 *
 * TO REMOVE: delete PLACEHOLDER_SEED and the `...placeholders` spread in the
 * PROJECTS assembly below. Nothing else refers to them.
 */
const PLACEHOLDER_SEED = [
  // --- public ---
  ['Centre de Santé Beni Makada', 'public', 'Beni Makada, Tangier', '2025', 'In design'],
  ['Lycée Ibn Batouta', 'public', 'Tétouan, Morocco', '2022', 'Completed'],
  ['Bibliothèque de la Médina', 'public', 'Medina, Tangier', '2026', 'In design'],
  ['Pôle Mère-Enfant', 'public', 'Al Hoceima, Morocco', '2023', 'Completed'],
  ['Centre de Dialyse', 'public', 'Larache, Morocco', '2024', 'On site'],
  // --- mixed-use ---
  ['Marina Bay Offices', 'mixed-use', 'Tanger Med, Morocco', '2025', 'On site'],
  ['Socco Alto Extension', 'mixed-use', 'Tangier, Morocco', '2024', 'Completed'],
  ['Rif Business Park', 'mixed-use', 'Tétouan, Morocco', '2026', 'In design'],
  ['Corniche Hotel & Residences', 'mixed-use', 'Corniche, Tangier', '2025', 'On site'],
  ['Gare Boukhalef Retail', 'mixed-use', 'Boukhalef, Tangier', '2023', 'Completed'],
  // --- interiors ---
  ['Clinique Dentaire Iberia', 'interiors', 'Iberia, Tangier', '2024', 'Completed'],
  ['Bureau Nord Workplace', 'interiors', 'Brussels, Belgium', '2023', 'Completed'],
  ['Café Cinéma Rif', 'interiors', 'Grand Socco, Tangier', '2022', 'Completed'],
  ['Pharmacie Centrale', 'interiors', 'Tétouan, Morocco', '2025', 'On site'],
  ['Studio HM', 'interiors', "Rue d'Italie, Tangier", '2021', 'Completed'],
  // --- residential ---
  ['Villa Achakkar', 'residential', 'Achakkar, Tangier', '2025', 'On site'],
  ['Appartement Marshan', 'residential', 'Marshan, Tangier', '2024', 'Completed'],
  ['Riad Dar Zaynab', 'residential', 'Kasbah, Tangier', '2023', 'Completed'],
  ['Maison Malabata', 'residential', 'Malabata, Tangier', '2026', 'In design'],
  ['Duplex Iberia', 'residential', 'Iberia, Tangier', '2022', 'Completed'],
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

/** Which real project each category borrows its imagery from. */
const BORROWS = {
  public: 'hopital-tetouan',
  'mixed-use': 'tangier-sky-ring',
  interiors: 'smile-lab-brussels',
  residential: 'residence-terracotta',
};

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const placeholders = PLACEHOLDER_SEED.map(([title, category, location, year, status], i) => {
  const base = REAL.find((p) => p.slug === BORROWS[category]) || REAL[0];
  const turn = i % base.images.length;
  return {
    slug: slugify(title),
    title,
    shortTitle: title,
    category,
    categoryLabel: CATEGORY_LABEL[category],
    location,
    year,
    status,
    aspect: base.aspect,
    accent: base.accent,
    placeholder: true,
    // Imagery is borrowed, so it lives under the lender's folder.
    imageSlug: base.slug,
    lede: base.lede,
    statement: base.statement,
    caption: base.caption,
    body: base.body,
    facts: [
      ['Typology', CATEGORY_LABEL[category]],
      ['Location', location],
      ['Year', year],
      ['Status', status],
    ],
    // Rotated so each card opens on a different plate.
    images: [...base.images.slice(turn), ...base.images.slice(0, turn)],
  };
});

/** Real work first, stand-ins after; numbering runs across the whole list. */
export const PROJECTS = [...REAL, ...placeholders].map((p, i) => ({
  ...p,
  index: String(i + 1).padStart(2, '0'),
}));

/** The full-bleed sequence that opens the site. */
export const HERO_SLIDES = [
  {
    slug: 'hopital-tetouan',
    file: '01',
    position: 'center 55%',
    alt: 'Hôpital Provincial de Tétouan seen from the air at night',
  },
  {
    slug: 'tangier-sky-ring',
    file: '01',
    position: 'center 34%',
    alt: 'Tangier Sky Ring — the twin towers and the suspended ring at night',
  },
  {
    slug: 'hopital-tetouan',
    file: '02',
    position: 'center 50%',
    alt: 'The hospital entrance canopy at dusk',
  },
  {
    slug: 'residence-terracotta',
    file: '02',
    position: 'center 60%',
    alt: 'Résidence Terracotta — the living room',
  },
];

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug);

export const nextOf = (slug) => {
  const i = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(i + 1) % PROJECTS.length];
};

/**
 * Every photographic plate, in project order — used by the loader and by the
 * small cycling slots. Diagrams are excluded: they are worth a full frame on
 * the project page but read as an empty card at thumbnail size.
 */
export const ALL_PLATES = PROJECTS.flatMap((p) =>
  p.images
    .filter((im) => !im.diagram)
    .map((im) => ({
      slug: p.imageSlug || p.slug,
      file: im.file,
      alt: im.alt,
      title: p.title,
    }))
);
