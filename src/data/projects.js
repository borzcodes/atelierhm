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

/** Path to one of a project's plates. */
export function projectPlate(project, file, size) {
  return plate(project.slug, file, size);
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
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2024',
    status: 'Design proposal',
    aspect: 'wide',
    accent: '#3E5A63',
    // The statement is the studio's own description of the proposal, carried
    // into English; the lede and body expand on it from the drawings.
    lede: 'A proposal for a provincial hospital planned as a single mass, then opened up with courtyards until every room found daylight.',
    statement:
      'The project is built around a legible, efficient organisation of the hospital\'s functions — one that keeps movement fluid, gives the interior spaces real quality, and puts the comfort of the people using them first. It is a contemporary architecture in the service of care: laid out to keep pace with how medical practice will change, while holding a strong and lasting identity of its own.',
    caption:
      'Five moves, in order: the initial mass, the patios cut for light, the medico-technical platform and logistics zone, the inpatient wings, the final volume.',
    body: [
      'A hospital is a machine before it is a building, and the machine is not negotiable. Operating theatres want depth and no daylight; wards want the opposite. The plan holds both by stacking them — the technical platform low and deep, the inpatient wings above it and only two rooms thick.',
      'The design began as one solid volume covering the site, and everything after that was the act of carving into it: patios cut for light, then wings pulled apart until the plan read as a sequence of gardens rather than a sequence of corridors. The ground floor shows the result — a logistics zone to one side, the emergency and technical platform in the centre, a public spine running through, and the wards laid out around their own courtyards.',
      'The entrance canopy is a timber lattice on slender columns, sized so that the shade it throws reaches the drop-off point at midday in July. It is the one gesture the building makes towards the road, and it is deliberately the softest thing on the site.',
    ],
    facts: [
      ['Typology', 'Centre hospitalier provincial'],
      ['Location', 'Tétouan, Morocco'],
      ['Programme', 'Medico-technical, logistics, inpatient'],
      ['Concept', 'Carved mass, courtyard-lit'],
      ['Status', 'Design proposal'],
    ],
    // Reading order, not file order: the whole, the idea, the plan, the
    // arrival. The concept sheet sits second so the caption beside it — the
    // five moves — describes what is actually on the page.
    images: [
      { file: '01', alt: 'Aerial view of the hospital complex at night, courtyards lit within the mass' },
      {
        file: '03',
        alt: 'Conceptual diagram: five massing moves from initial volume to final form',
        // Line art on white — belongs in the project gallery, but reads as a
        // blank card in the small cycling slots.
        diagram: true,
      },
      {
        file: '04',
        alt: 'General ground-floor plan: logistics, the medico-technical platform, the public spine and the inpatient wings around their courtyards',
        diagram: true,
      },
      { file: '02', alt: 'The entrance canopy at dusk, timber lattice over the drop-off' },
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
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2023',
    status: 'Design proposal',
    aspect: 'wide',
    accent: '#B08A5E',
    lede: 'A proposal for a dental clinic in oak, poured concrete and borrowed daylight — and almost nothing that reads as clinical.',
    statement:
      'Nobody looks forward to a dental appointment, so the brief was really about the ninety seconds before one. The plan puts a garden on the other side of every wall a patient faces: from the street window, from the waiting room, from the chair itself. The equipment is not hidden, but it is never the first thing in the frame.',
    caption:
      'Oak, polished concrete and one continuous line of warm light. The clinical surfaces are there — they are simply not the subject.',
    body: [
      'The clinic occupies a narrow Brussels plot with rooms front and back and a courtyard cut through the middle. That courtyard does most of the work: it lights the treatment rooms from the side rather than overhead, which is both better for the dentist and far better for the person in the chair.',
      'Everything vertical is oak — full-height panelling, joinery, door leaves, the reception desk — set against polished concrete floors and plain white ceilings. A single recessed line of warm light runs through the whole plan and does the rest.',
      'Behind the clinical rooms there is a staff kitchen and lounge opening onto the garden. It was not in the original brief; it is there so that a practice running two shifts has somewhere to be between them.',
    ],
    facts: [
      ['Typology', 'Dental clinic'],
      ['Location', 'Brussels, Belgium'],
      ['Programme', 'Reception, surgeries, staff lounge'],
      ['Materials', 'Oak, polished concrete, glass'],
      ['Status', 'Design proposal'],
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
    slug: 'appartement-f3-brussels',
    // The studio's own name for it. An F3 is a three-room flat — living room
    // plus two bedrooms — in the French and Belgian convention.
    title: 'Appartement F3 — Brussels',
    shortTitle: 'Appartement F3',
    category: 'residential',
    categoryLabel: 'Residential',
    location: 'Brussels, Belgium',
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2025',
    status: 'Design proposal',
    aspect: 'wide',
    accent: '#C0725A',
    lede: 'A proposal for a three-room Brussels flat worked out in three colours — terracotta, sage and warm marble — and then left alone.',
    statement:
      'The palette was fixed first and never revisited: a burnt terracotta for the joinery, a soft sage for the upholstery, and a warm veined marble wherever water or heat arrives. Everything after that was a question of where each one stops.',
    caption:
      'Terracotta on the joinery, sage on the soft furniture, marble at the hearth and the wet rooms. Three materials, one rule each.',
    body: [
      'The plan is the conventional one for an F3 — a through living room, a kitchen off it, two bedrooms behind — so the work went into the surfaces and the light. Full-height sheers on every window keep the flat Brussels daylight even and stop the terracotta going orange in the afternoon.',
      'Joinery runs floor to ceiling in every room and carries the lighting, so there are no downlights in the living spaces at all. The ceiling stays a single unbroken plane; a shadow gap and a concealed strip do everything a fitting would have.',
      'In the principal bedroom the wardrobe, the dressing table and the bathroom are one continuous piece of cabinetry that turns three corners. The marble shower sits inside it like a lit vitrine.',
    ],
    facts: [
      ['Typology', 'Private apartment, F3'],
      ['Location', 'Brussels, Belgium'],
      ['Programme', 'Living, kitchen, two bedrooms'],
      ['Materials', 'Lacquered joinery, marble, brass'],
      ['Status', 'Design proposal'],
    ],
    images: [
      { file: '02', alt: 'Living room with the terracotta media wall and sage seating' },
      { file: '03', alt: 'Kitchen with marble island and brass fittings' },
      { file: '01', alt: 'Principal bedroom opening into the marble bathroom' },
    ],
  },

  {
    slug: 'regard-opticien',
    title: 'Regard Opticien',
    shortTitle: 'Regard Opticien',
    category: 'interiors',
    categoryLabel: 'Interiors',
    // TODO(studio): confirm location, year and status — the renders carry none.
    location: 'Tangier, Morocco',
    year: '2026',
    status: 'In design',
    aspect: 'wide',
    accent: '#A8927A',
    lede: 'An optician laid out like a gallery — frames on floating shelves, one long table to try them at, and light that flatters a face.',
    statement:
      'People come to an optician to be looked at, so the room is built around a single act: sitting down at a table and holding a frame up to a mirror. The table is the plan. Everything else — the shelves, the desk, the eye on the wall — stands back from it and lights it.',
    caption:
      'Travertine for anything you touch, dark timber for the walls, and the frames on lit glass so they float. The wall texts do the talking so the fittings do not have to.',
    body: [
      'The frames sit on floating glass shelves with a warm light let into the wall behind each one, so a pair of glasses reads as an object rather than as stock. The shelves are the brightest thing in the room by design; the ceiling carries almost no downlights at all.',
      'A single travertine block runs the length of the shop as the fitting table, with the reception desk cut from the same stone at the far end. It is where a customer spends their whole visit, and it is finished to be sat at for half an hour.',
      'The walls are dark stained timber, which does two things: it makes the lit shelves count, and it makes the faces at the table the lightest thing in every mirror. A large photographic eye on the back wall is the only image in the shop, and it is looking at you.',
    ],
    facts: [
      ['Typology', 'Optician'],
      ['Location', 'Tangier, Morocco'],
      ['Programme', 'Display, fitting table, examination, reception'],
      ['Materials', 'Travertine, stained timber, lit glass shelving'],
      ['Status', 'In design'],
    ],
    images: [
      { file: '01', alt: 'The shop from the entrance — travertine fitting table, lit shelves either side, the Regard sign on the back wall' },
      { file: '02', alt: 'The fitting table head-on, three chairs, the photographic eye on the wall behind' },
      { file: '03', alt: 'Along the table towards the reception desk, frames on lit glass shelves to the right' },
    ],
  },

  {
    slug: 'mediatheque-tetouan',
    title: 'Médiathèque de Tétouan',
    shortTitle: 'Médiathèque de Tétouan',
    category: 'public',
    categoryLabel: 'Public',
    location: 'Tétouan, Morocco',
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2025',
    status: 'Design proposal',
    aspect: 'wide',
    accent: '#8A6A46',
    // Copy is the studio's own Instagram description, carried into English.
    lede: 'A proposal for a médiathèque conceived as a cultural hub — open, flexible, connected spaces, and an amphitheatre that the library wraps around.',
    statement:
      'The library is a crescent, and the crescent holds an outdoor amphitheatre. That is the whole plan: a building organised around open, flexible and connected spaces for reading, learning, meeting and cultural life, whose glazed facade keeps up a permanent conversation with the tiered seating outside it. More than a place to consult a book, it is meant as a place of transmission, invention and collective life.',
    caption:
      'Three volumes — administration, the entrance hall, the library — and a stepped amphitheatre cut into the ground between the library and the garden. The section reads at +3, +6 and +10.',
    body: [
      'The site is a trapezoid at the edge of Tétouan with the Rif behind it and agricultural land alongside. The administration and the entrance hall are two straight blocks along the access road; the library is the third volume and the only curved one, turning its back to the car park and its whole glazed face to the amphitheatre and the garden.',
      'That facade is the project\'s architectural language: a dynamic volume under a continuous roof plate, with full-height glazing between close-set timber mullions that run the length of the curve. From the tiers you see straight through to the shelves; from the reading rooms you look out over the seating to the mountains.',
      'The amphitheatre is not an event space bolted on but the middle of the scheme — the ground stepping down from the library to the lawn, lit along each riser at night. It is what makes the building a public place before anyone has gone inside it, and it is the image the proposal leads with.',
    ],
    facts: [
      ['Typology', 'Médiathèque'],
      ['Location', 'Tétouan, Morocco'],
      ['Programme', 'Library, hall, administration, outdoor amphitheatre'],
      ['Facade', 'Timber mullions, full-height glazing'],
      ['Status', 'Design proposal'],
    ],
    images: [
      { file: '01', alt: 'The amphitheatre by day — tiered seating stepping up to the curved glass facade of the library' },
      { file: '02', alt: 'The library facade: full-height glazing between timber mullions under the roof plate' },
      { file: '03', alt: 'Axonometric of the site — administration, hall and library, with the amphitheatre held in the curve' },
      { file: '04', alt: 'Section AA through the library and the amphitheatre, the Rif behind' },
      {
        file: '05',
        alt: 'First-floor plan: the crescent of the library, the hall, the administration wing',
        // Line art on a white sheet — a full frame on the project page, a
        // blank card in the small cycling slots.
        diagram: true,
      },
      { file: '06', alt: 'The amphitheatre at night, the library lit behind it, a crescent moon' },
    ],
  },
];

/** Numbered in the order above. */
export const PROJECTS = REAL.map((p, i) => ({
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
    slug: 'regard-opticien',
    file: '02',
    position: 'center 50%',
    alt: 'Regard Opticien — the fitting table and the lit shelves',
  },
  {
    slug: 'appartement-f3-brussels',
    file: '02',
    position: 'center 60%',
    alt: 'Appartement F3, Brussels — the living room',
  },
  {
    slug: 'mediatheque-tetouan',
    file: '06',
    position: 'center 58%',
    alt: 'Médiathèque de Tétouan — the amphitheatre at night, the library lit behind it',
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
      slug: p.slug,
      file: im.file,
      alt: im.alt,
      title: p.title,
    }))
);
