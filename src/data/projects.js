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
  { id: 'all', label: 'Tous les projets' },
  { id: 'public', label: 'Public' },
  { id: 'mixed-use', label: 'Mixte' },
  { id: 'interiors', label: 'Intérieurs' },
  { id: 'residential', label: 'Résidentiel' },
];

const REAL = [
  {
    slug: 'hopital-tetouan',
    title: 'Hôpital Provincial de Tétouan',
    shortTitle: 'Hôpital de Tétouan',
    category: 'public',
    categoryLabel: 'Public',
    location: 'Tétouan, Maroc',
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2024',
    status: 'Proposition de projet',
    aspect: 'wide',
    accent: '#3E5A63',
    // The statement is the studio's own description of the proposal, carried
    // into English; the lede and body expand on it from the drawings.
    lede: 'Un hôpital provincial pensé comme une masse unique, puis ouverte par des patios jusqu\'à ce que chaque pièce trouve la lumière du jour.',
    statement:
      'Le projet s\'articule autour d\'une organisation lisible et performante des fonctions hospitalières, favorisant la fluidité des déplacements, la qualité des espaces intérieurs et le confort des usagers. Une architecture contemporaine au service du soin, conçue pour accompagner l\'évolution des pratiques médicales tout en affirmant une identité forte et durable.',
    caption:
      'Cinq étapes, dans l\'ordre : la masse initiale, les patios pour un éclairage optimal, le plateau médico-technique et la zone logistique, le secteur des hospitalisations, le volume final.',
    body: [
      'Un hôpital est une machine avant d\'être un bâtiment, et cette contrainte n\'est pas négociable. Les blocs opératoires ont besoin de profondeur et d\'absence de lumière naturelle ; les chambres veulent l\'inverse. Le plan concilie les deux en les superposant — le plateau technique bas et profond, les ailes d\'hospitalisation au-dessus, sur deux chambres de large seulement.',
      'Le projet est parti d\'un volume plein couvrant l\'ensemble du site, et tout le travail a consisté à creuser dans cette masse : des patios taillés pour la lumière, puis des ailes écartées jusqu\'à ce que le plan se lise comme une succession de jardins plutôt que de couloirs. Le rez-de-chaussée en montre le résultat — une zone logistique d\'un côté, le plateau technique et les urgences au centre, une colonne publique qui traverse l\'ensemble, et les hospitalisations organisées autour de leurs propres patios.',
      'La canopée d\'entrée est une résille en bois portée par de fins poteaux, dimensionnée pour que son ombre atteigne la dépose-minute à midi en juillet. C\'est le seul geste que le bâtiment adresse à la route, et il est délibérément le plus doux de tout le site.',
    ],
    facts: [
      ['Type', 'Centre hospitalier provincial'],
      ['Lieu', 'Tétouan, Maroc'],
      ['Programme', 'Médico-technique, logistique, hospitalisation'],
      ['Concept', 'Masse évidée, éclairée par patios'],
      ['Statut', 'Proposition de projet'],
    ],
    // Reading order, not file order: the whole, the idea, the plan, the
    // arrival. The concept sheet sits second so the caption beside it — the
    // five moves — describes what is actually on the page.
    images: [
      { file: '01', alt: 'Vue aérienne de l\'hôpital de nuit, patios éclairés au cœur de la masse' },
      {
        file: '03',
        alt: 'Schéma conceptuel : cinq étapes de la masse initiale à la forme finale',
        // Line art on white — belongs in the project gallery, but reads as a
        // blank card in the small cycling slots.
        diagram: true,
      },
      {
        file: '04',
        alt: 'Plan général du rez-de-chaussée : logistique, plateau médico-technique, colonne publique et ailes d\'hospitalisation autour de leurs patios',
        diagram: true,
      },
      { file: '02', alt: 'La canopée d\'entrée au crépuscule, résille en bois au-dessus de la dépose-minute' },
    ],
  },

  {
    slug: 'tangier-sky-ring',
    title: 'Tangier Sky Ring',
    shortTitle: 'Tangier Sky Ring',
    category: 'mixed-use',
    categoryLabel: 'Mixte',
    location: 'Tanger, Maroc',
    year: '2026',
    status: 'En conception',
    aspect: 'square',
    accent: '#6E7F6B',
    lede: 'Deux tours maintenues à distance par un anneau suspendu unique, au-dessus d\'un socle commercial qui se comporte comme un fragment de littoral.',
    statement:
      'L\'anneau est toute l\'idée. Deux tours seules ne sont qu\'une paire ; un anneau placé entre elles en hauteur en fait une seule figure, offre à la ville un belvédère visible depuis le rivage, et laisse l\'espace en dessous entièrement ouvert jusqu\'au sol.',
    caption:
      'Des ailettes verticales enveloppent les deux tours. Elles portent la végétation, filtrent le soleil couchant, et la nuit, elles portent la lumière.',
    body: [
      'Les tours sont habillées d\'une ailette verticale profonde — rapprochée, filante sur toute la hauteur, et légèrement pivotée étage par étage, si bien que la façade se lit comme une surface tissée plutôt que comme une grille. Les ailettes sont structurelles pour les balcons qu\'elles traversent, et portent la végétation qui court en bandes continues le long des deux fûts.',
      'Le socle est le lieu où le projet rencontre la ville. Les commerces se déploient derrière un écran des mêmes ailettes, interrompu par deux baies-aquariums toute hauteur et un mur d\'images qui transforme le podium en surface publique — un drapeau les jours de fête nationale, du surf un mardi ordinaire.',
      'Au sommet, l\'anneau accueille un restaurant, un étage d\'observation et un point de saut en chute libre. C\'est la pièce que tout le monde photographiera, conçue pour rester lisible en silhouette depuis le port, depuis le Marshan et depuis la côte espagnole.',
    ],
    facts: [
      ['Type', 'Tours mixtes'],
      ['Lieu', 'Tanger, Maroc'],
      ['Programme', 'Commerces, bureaux, hôtel, observation'],
      ['Façade', 'Ailettes verticales et bandes plantées'],
      ['Statut', 'En conception'],
    ],
    images: [
      { file: '01', alt: 'Les deux tours et l\'anneau suspendu de nuit, illuminés pour une célébration' },
      { file: '02', alt: 'Détail de façade : ailettes verticales, bandes plantées et podium éclairé en contrebas' },
      { file: '03', alt: 'Le socle commercial avec la baie-aquarium et le mur d\'images' },
    ],
  },

  {
    slug: 'smile-lab-brussels',
    title: 'Smile Lab Brussels',
    shortTitle: 'Smile Lab Brussels',
    category: 'interiors',
    categoryLabel: 'Intérieurs',
    location: 'Bruxelles, Belgique',
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2023',
    status: 'Proposition de projet',
    aspect: 'wide',
    accent: '#B08A5E',
    lede: 'Un cabinet dentaire en chêne, béton coulé et lumière naturelle empruntée — et presque rien qui se lise comme clinique.',
    statement:
      'Personne n\'attend un rendez-vous chez le dentiste avec impatience, alors le programme portait en réalité sur les quatre-vingt-dix secondes qui le précèdent. Le plan place un jardin de l\'autre côté de chaque mur que croise un patient : depuis la vitrine sur rue, depuis la salle d\'attente, depuis le fauteuil lui-même. L\'équipement n\'est pas caché, mais il n\'est jamais la première chose que l\'on voit.',
    caption:
      'Chêne, béton ciré et une ligne continue de lumière chaude. Les surfaces cliniques sont bien là — elles ne sont simplement pas le sujet.',
    body: [
      'Le cabinet occupe une parcelle étroite bruxelloise, avec des pièces à l\'avant et à l\'arrière et un patio découpé au centre. Ce patio fait l\'essentiel du travail : il éclaire les salles de soins par le côté plutôt que par le dessus, ce qui est à la fois meilleur pour le praticien et bien meilleur pour la personne sur le fauteuil.',
      'Tout ce qui est vertical est en chêne — lambris toute hauteur, menuiseries, portes, banque d\'accueil — posé sur des sols en béton ciré et des plafonds blancs unis. Une seule ligne de lumière chaude encastrée traverse tout le plan et fait le reste.',
      'Derrière les salles de soins se trouve une cuisine et un salon pour le personnel, ouverts sur le jardin. Ce n\'était pas dans le programme d\'origine ; c\'est ce qui permet au cabinet de faire tourner deux équipes.',
    ],
    facts: [
      ['Type', 'Cabinet dentaire'],
      ['Lieu', 'Bruxelles, Belgique'],
      ['Programme', 'Accueil, salles de soins, salon du personnel'],
      ['Matériaux', 'Chêne, béton ciré, verre'],
      ['Statut', 'Proposition de projet'],
    ],
    images: [
      { file: '05', alt: 'Accueil et salle d\'attente, avec la vitrine sur rue en arrière-plan' },
      { file: '02', alt: 'Bureau de consultation donnant sur le patio planté' },
      { file: '03', alt: 'Une salle de soins en activité, éclairée sur toute sa longueur par le patio' },
      { file: '04', alt: 'Salle de soins avec le panneau de mousse et les menuiseries en chêne' },
      { file: '01', alt: 'La salle de réunion, habillée de chêne, ouverte sur le jardin' },
      { file: '06', alt: 'Cuisine et salon du personnel ouverts sur le jardin arrière' },
    ],
  },

  {
    slug: 'appartement-f3-brussels',
    // The studio's own name for it. An F3 is a three-room flat — living room
    // plus two bedrooms — in the French and Belgian convention.
    title: 'Appartement F3 — Brussels',
    shortTitle: 'Appartement F3',
    category: 'residential',
    categoryLabel: 'Résidentiel',
    location: 'Bruxelles, Belgique',
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2025',
    status: 'Proposition de projet',
    aspect: 'wide',
    accent: '#C0725A',
    lede: 'Un appartement F3 bruxellois travaillé en trois couleurs — terre cuite, sauge et marbre chaud — puis laissé tel quel.',
    statement:
      'La palette a été fixée dès le départ et jamais remise en question : une terre cuite brûlée pour les menuiseries, une sauge douce pour les assises, et un marbre veiné chaud partout où l\'eau ou la chaleur arrivent. Tout le reste n\'a été qu\'une question de savoir où chacune s\'arrête.',
    caption:
      'Terre cuite sur les menuiseries, sauge sur les assises, marbre à l\'âtre et dans les pièces d\'eau. Trois matières, une règle chacune.',
    body: [
      'Le plan est celui, classique, d\'un F3 — un séjour traversant, une cuisine attenante, deux chambres à l\'arrière — le travail a donc porté sur les surfaces et la lumière. Des voilages toute hauteur sur chaque fenêtre uniformisent la lumière bruxelloise et empêchent la terre cuite de virer à l\'orange l\'après-midi.',
      'Les menuiseries courent du sol au plafond dans chaque pièce et portent l\'éclairage, si bien qu\'il n\'y a aucun spot dans les espaces de vie. Le plafond reste un plan continu et ininterrompu ; une ombre creusée et un bandeau dissimulé font tout le travail qu\'un luminaire aurait fait.',
      'Dans la chambre principale, le dressing, la coiffeuse et la salle de bains forment une seule menuiserie continue qui tourne trois angles. La douche en marbre s\'y love comme une vitrine éclairée.',
    ],
    facts: [
      ['Type', 'Appartement privé, F3'],
      ['Lieu', 'Bruxelles, Belgique'],
      ['Programme', 'Séjour, cuisine, deux chambres'],
      ['Matériaux', 'Menuiseries laquées, marbre, laiton'],
      ['Statut', 'Proposition de projet'],
    ],
    images: [
      { file: '02', alt: 'Séjour avec le mur média en terre cuite et les assises sauge' },
      { file: '03', alt: 'Cuisine avec îlot en marbre et robinetterie laiton' },
      { file: '01', alt: 'Chambre principale ouverte sur la salle de bains en marbre' },
    ],
  },

  {
    slug: 'regard-opticien',
    title: 'Regard Opticien',
    shortTitle: 'Regard Opticien',
    category: 'interiors',
    categoryLabel: 'Intérieurs',
    // TODO(studio): confirm location, year and status — the renders carry none.
    location: 'Tanger, Maroc',
    year: '2026',
    status: 'En conception',
    aspect: 'wide',
    accent: '#A8927A',
    lede: 'Un opticien conçu comme une galerie — montures sur étagères flottantes, une longue table d\'essayage, et une lumière qui flatte les visages.',
    statement:
      'On vient chez un opticien pour qu\'on nous regarde, alors l\'espace est construit autour d\'un seul geste : s\'asseoir à une table et porter une monture devant un miroir. La table, c\'est le plan. Tout le reste — les étagères, le bureau, l\'œil sur le mur — recule et l\'éclaire.',
    caption:
      'Travertin pour tout ce que l\'on touche, bois sombre pour les murs, et les montures sur verre éclairé pour qu\'elles flottent. Les textes muraux font le discours pour que les produits n\'aient pas à le faire.',
    body: [
      'Les montures reposent sur des étagères de verre flottantes, avec une lumière chaude encastrée dans le mur derrière chacune, si bien qu\'une paire de lunettes se lit comme un objet plutôt que comme du stock. Les étagères sont, par conception, l\'élément le plus lumineux de la pièce ; le plafond ne comporte presque aucun spot.',
      'Un seul bloc de travertin court sur toute la longueur du magasin en guise de table d\'essayage, avec le comptoir d\'accueil taillé dans la même pierre à l\'autre extrémité. C\'est là que le client passe toute sa visite, et la finition est pensée pour qu\'on y reste assis une demi-heure.',
      'Les murs sont en bois sombre teinté, ce qui fait deux choses : cela met en valeur les étagères éclairées, et cela fait des visages à la table l\'élément le plus lumineux de chaque miroir. Un grand œil photographique sur le mur du fond est la seule image du magasin, et il vous regarde.',
    ],
    facts: [
      ['Type', 'Opticien'],
      ['Lieu', 'Tanger, Maroc'],
      ['Programme', 'Exposition, table d\'essayage, examen, accueil'],
      ['Matériaux', 'Travertin, bois teinté, étagères de verre éclairées'],
      ['Statut', 'En conception'],
    ],
    images: [
      { file: '01', alt: 'Le magasin depuis l\'entrée — table d\'essayage en travertin, étagères éclairées de part et d\'autre, enseigne Regard sur le mur du fond' },
      { file: '02', alt: 'La table d\'essayage de face, trois chaises, l\'œil photographique sur le mur du fond' },
      { file: '03', alt: 'Le long de la table vers le comptoir d\'accueil, montures sur étagères de verre éclairées à droite' },
    ],
  },

  {
    slug: 'mediatheque-tetouan',
    title: 'Médiathèque de Tétouan',
    shortTitle: 'Médiathèque de Tétouan',
    category: 'public',
    categoryLabel: 'Public',
    location: 'Tétouan, Maroc',
    // TODO(studio): confirm the year — the proposal carries none.
    year: '2025',
    status: 'Proposition de projet',
    aspect: 'wide',
    accent: '#8A6A46',
    // Copy is the studio's own Instagram description, carried into English.
    lede: 'Une médiathèque conçue comme un pôle culturel — des espaces ouverts, flexibles et connectés, et un amphithéâtre que la bibliothèque enveloppe.',
    statement:
      'Pensée comme un véritable pôle culturel, la médiathèque s\'organise autour d\'espaces ouverts, flexibles et connectés, favorisant la lecture, l\'apprentissage, les rencontres et les activités culturelles. Son écriture architecturale contemporaine, caractérisée par une volumétrie dynamique et de larges façades vitrées, établit un dialogue permanent entre les espaces intérieurs et l\'amphithéâtre extérieur. Au-delà d\'un simple lieu de consultation, le projet devient un espace de transmission, d\'innovation et de vie collective, offrant une identité architecturale forte, durable et résolument tournée vers les usages de demain.',
    caption:
      'Trois volumes — administration, hall d\'accueil, bibliothèque — et un amphithéâtre en gradins creusé dans le sol entre la bibliothèque et le jardin. La coupe se lit à +3, +6 et +10.',
    body: [
      'Le terrain est un trapèze à la lisière de Tétouan, le Rif en toile de fond et des terres agricoles en limite. L\'administration et le hall d\'accueil forment deux blocs rectilignes le long de la voie d\'accès ; la bibliothèque est le troisième volume, le seul courbe, tournant le dos au parking et présentant toute sa façade vitrée à l\'amphithéâtre et au jardin.',
      'Cette façade est le langage architectural du projet : un volume dynamique sous une toiture continue, avec un vitrage toute hauteur entre des meneaux en bois rapprochés qui courent sur toute la longueur de la courbe. Depuis les gradins, la vue traverse jusqu\'aux rayonnages ; depuis les salles de lecture, le regard porte par-dessus les gradins jusqu\'aux montagnes.',
      'L\'amphithéâtre n\'est pas un espace événementiel ajouté après coup, mais le cœur du projet — le sol qui descend en gradins de la bibliothèque vers la pelouse, éclairé à chaque marche la nuit. C\'est ce qui fait de ce bâtiment un lieu public avant même d\'y être entré, et c\'est l\'image sur laquelle s\'ouvre la proposition.',
    ],
    facts: [
      ['Type', 'Médiathèque'],
      ['Lieu', 'Tétouan, Maroc'],
      ['Programme', 'Bibliothèque, hall, administration, amphithéâtre extérieur'],
      ['Façade', 'Meneaux en bois, vitrage toute hauteur'],
      ['Statut', 'Proposition de projet'],
    ],
    images: [
      { file: '01', alt: 'L\'amphithéâtre de jour — gradins s\'élevant vers la façade vitrée courbe de la bibliothèque' },
      { file: '02', alt: 'La façade de la bibliothèque : vitrage toute hauteur entre meneaux de bois sous la toiture' },
      { file: '03', alt: 'Axonométrie du site — administration, hall et bibliothèque, l\'amphithéâtre logé dans la courbe' },
      { file: '04', alt: 'Coupe AA à travers la bibliothèque et l\'amphithéâtre, le Rif en arrière-plan' },
      {
        file: '05',
        alt: 'Plan du rez-de-chaussée : le croissant de la bibliothèque, le hall, l\'aile administrative',
        // Line art on a white sheet — a full frame on the project page, a
        // blank card in the small cycling slots.
        diagram: true,
      },
      { file: '06', alt: 'L\'amphithéâtre de nuit, la bibliothèque éclairée en arrière-plan, un croissant de lune' },
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
    alt: 'Hôpital Provincial de Tétouan vu du ciel de nuit',
  },
  {
    slug: 'tangier-sky-ring',
    file: '01',
    position: 'center 34%',
    alt: 'Tangier Sky Ring — les deux tours et l\'anneau suspendu de nuit',
  },
  {
    slug: 'regard-opticien',
    file: '02',
    position: 'center 50%',
    alt: 'Regard Opticien — la table d\'essayage et les étagères éclairées',
  },
  {
    slug: 'appartement-f3-brussels',
    file: '02',
    position: 'center 60%',
    alt: 'Appartement F3, Bruxelles — le séjour',
  },
  {
    slug: 'mediatheque-tetouan',
    file: '06',
    position: 'center 58%',
    alt: 'Médiathèque de Tétouan — l\'amphithéâtre de nuit, la bibliothèque éclairée en arrière-plan',
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
