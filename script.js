/* This site manages its own scroll position on navigation (see showHome/
   showProjectView below). The browser's built-in automatic scroll
   restoration on back/forward otherwise fights with that and wins
   intermittently, landing at the wrong position. */
if('scrollRestoration' in history){
  history.scrollRestoration = 'manual';
}

/* ===================== DARK MODE =====================
   The theme itself is already applied to <body> by a tiny inline
   script at the top of <body> (before first paint, to avoid a
   flash of the wrong theme). This just syncs the switch's visual/
   aria state and handles toggling + persistence from here on. */
(function(){
  const toggle = document.getElementById('themeToggle');
  if(!toggle) return;

  function syncToggle(){
    const isDark = document.body.classList.contains('dark-mode');
    toggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
  }
  syncToggle();

  toggle.addEventListener('click', ()=>{
    const isDark = document.body.classList.toggle('dark-mode');
    syncToggle();
    try{ localStorage.setItem('hm-theme', isDark ? 'dark' : 'light'); }catch(e){}
  });
})();

/* ===================== SECURITY HELPERS =====================
   This is a static, backend-less site: no forms submit anywhere, no
   API endpoints, no database. The two things that ARE real attack
   surface on a page like this are (1) any value that ends up in
   innerHTML, and (2) the URL hash, which is attacker-controlled
   (a visitor can craft a link like #project/<anything>).
   Both are handled below: every interpolated string is HTML-escaped
   before insertion, and the hash is matched against a strict slug
   pattern before ever being used to look anything up. */

// Escape untrusted/dynamic text before it is concatenated into innerHTML.
function escapeHTML(str){
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}

// Only allow simple slugs (letters, numbers, hyphens) out of the URL hash.
// Anything else is rejected outright instead of being passed along.
const SAFE_SLUG = /^[a-z0-9-]{1,60}$/i;
function sanitizeSlug(raw){
  if(typeof raw !== 'string') return null;
  const decoded = (() => { try { return decodeURIComponent(raw); } catch(e){ return null; } })();
  if(decoded === null) return null;
  return SAFE_SLUG.test(decoded) ? decoded : null;
}

/* ===================== DATA ===================== */
const heroSlides = [
  { img:'assets/hopital-tetouan-entrance_1.jpg', title:{fr:'HÔPITAL DE TÉTOUAN',en:'TÉTOUAN HOSPITAL',ar:'مستشفى تطوان'}, loc:{fr:'TÉTOUAN',en:'TETOUAN',ar:'تطوان'} },
  { img:'assets/dental-clinic-corridor.jpg', title:{fr:'CABINET DE DENTISTE',en:'DENTAL CLINIC',ar:'عيادة أسنان'}, loc:{fr:'TANGER',en:'TANGIER',ar:'طنجة'} }
];

const projects = [
  {
    id:'hopital-tetouan', title:{fr:'HÔPITAL DE TÉTOUAN',en:'TÉTOUAN HOSPITAL',ar:'مستشفى تطوان'}, year:'2024', surface:'22 000 m²',
    loc:{fr:'Tétouan',en:'Tetouan',ar:'تطوان'},
    cat:{fr:'Équipement — Santé',en:'Public Facility — Healthcare',ar:'تجهيز — صحة'},
    metier:{fr:'Architecture · Urbanisme',en:'Architecture · Urban planning',ar:'العمارة · التعمير'},
    categories:['architecture','urbanisme'],
    desc:{
      fr:"L'hôpital provincial de Tétouan déploie ses unités d'hospitalisation en peigne autour d'une trame de patios plantés, pensée pour apporter lumière naturelle et calme aux espaces de soin. À l'entrée, un large auvent en caillebotis de bois protège le parvis et distingue les flux piétons du dépose-minute et des ambulances. En fond de parcelle, le plateau médico-technique et la zone logistique s'organisent autour d'un axe de distribution unique, au bénéfice de la clarté des circulations comme de la maintenance du bâtiment.",
      en:"The Tétouan provincial hospital arranges its hospitalisation wings in a comb layout around a grid of planted patios, designed to bring natural light and calm to the care spaces. At the entrance, a wide timber-slat canopy shelters the forecourt and separates pedestrian flows from the drop-off and ambulance bay. At the rear of the plot, the medical-technical platform and logistics zone are organised around a single distribution spine, benefiting both the clarity of circulation and the building's maintenance.",
      ar:"يوزّع المستشفى الإقليمي بتطوان أجنحة الاستشفاء على شكل مشط حول شبكة من الأفنية المشجّرة، صُممت لإدخال الضوء الطبيعي والهدوء إلى فضاءات العناية. عند المدخل، تحمي مظلة خشبية عريضة الساحة الأمامية وتفصل حركة المشاة عن منطقة النزول وسيارات الإسعاف. في مؤخرة القطعة، ينتظم الطابق الطبي التقني ومنطقة اللوجستيك حول محور توزيع واحد، لفائدة وضوح التنقلات وصيانة المبنى."
    },
    hero:'assets/hopital-tetouan-entrance_1.jpg',
    gallery:[
      'assets/hopital-tetouan-aerial.jpg',
      'assets/hopital-tetouan-concept.png',
      'assets/hopital-tetouan-plan.png'
    ]
  },
  {
    id:'riad-souani', title:{fr:'RIAD SOUANI',en:'RIAD SOUANI',ar:'رياض سواني'}, year:'2022', surface:'310 m²',
    loc:{fr:'Tanger — Kasbah',en:'Tangier — Kasbah',ar:'طنجة — القصبة'},
    cat:{fr:'Réhabilitation — Patrimoine',en:'Rehabilitation — Heritage',ar:'ترميم — تراث'},
    metier:{fr:'Architecture · Réhabilitation',en:'Architecture · Rehabilitation',ar:'العمارة · الترميم'},
    categories:['architecture'],
    desc:{
      fr:"Restauration complète d'un riad du XIXe siècle dans la Kasbah, mené en collaboration avec des maalems locaux. Les enduits à la chaux, les zelliges d'origine et la charpente en cèdre ont été conservés ou refaits à l'identique, autour d'un patio central rouvert à la lumière du ciel.",
      en:"Complete restoration of a 19th-century riad in the Kasbah, carried out with local master craftsmen. Lime plasters, original zellige tilework and cedar framing were preserved or rebuilt to match, around a central patio reopened to the sky.",
      ar:"ترميم كامل لرياض يعود للقرن التاسع عشر داخل القصبة، بالتعاون مع معلمين محليين. تم الحفاظ على الطلاء الجيري والزليج الأصلي وهيكل خشب الأرز أو إعادة صنعها مطابقة للأصل، حول فناء مركزي أعيد فتحه على ضوء السماء."
    },
    hero:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'residence-baie', title:{fr:'RÉSIDENCE BAIE',en:'BAY RESIDENCE',ar:'إقامة الخليج'}, year:'2024', surface:'2 400 m²',
    loc:{fr:'Malabata',en:'Malabata',ar:'مالاباطا'},
    cat:{fr:'Résidentiel — Collectif',en:'Residential — Multi-unit',ar:'سكني — جماعي'},
    metier:{fr:'Architecture · Urbanisme',en:'Architecture · Urban planning',ar:'العمارة · التعمير'},
    categories:['architecture','urbanisme'],
    desc:{
      fr:"Un ensemble résidentiel de 24 logements face à la baie de Tanger, pensé en terrasses successives pour préserver la vue de chaque unité. Les volumes blancs et les garde-corps en métal ajouré reprennent le vocabulaire balnéaire de la côte nord.",
      en:"A residential complex of 24 units facing Tangier bay, arranged in successive terraces to preserve each unit's view. White volumes and perforated metal railings echo the seaside vocabulary of the northern coast.",
      ar:"مجمع سكني يضم 24 وحدة يطل على خليج طنجة، صُمم على شكل مصاطب متتالية للحفاظ على إطلالة كل وحدة. تعكس الكتل البيضاء والدرابزين المعدني المخرّم مفردات العمارة الساحلية للشمال."
    },
    hero:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'cabinet-dentiste-tanger', title:{fr:'CABINET DE DENTISTE',en:'DENTAL CLINIC',ar:'عيادة أسنان'}, year:'2023', surface:'450 m²',
    loc:{fr:'Tanger',en:'Tangier',ar:'طنجة'},
    cat:{fr:'Santé — Cabinet dentaire',en:'Healthcare — Dental clinic',ar:'صحة — عيادة أسنان'},
    metier:{fr:'Architecture · Design intérieur',en:'Architecture · Interior design',ar:'العمارة · التصميم الداخلي'},
    categories:['architecture','interior'],
    desc:{
      fr:"Un cabinet dentaire pensé comme un lieu de soin apaisant plutôt qu'un espace clinique. Le bois clair, les murs végétalisés et la lumière naturelle des patios accompagnent le parcours du patient depuis l'accueil jusqu'aux salles de soin, tandis qu'un espace de vie dédié à l'équipe — cuisine, salon, table de billard — prolonge le même langage domestique côté coulisses.",
      en:"A dental clinic conceived as a calming place of care rather than a clinical space. Light timber, living plant walls and natural light from the patios accompany the patient's path from reception to the treatment rooms, while a dedicated staff space — kitchen, lounge, pool table — extends the same domestic language behind the scenes.",
      ar:"عيادة أسنان صُممت كمكان علاج مهدئ بدلاً من فضاء سريري بحت. يرافق الخشب الفاتح وجدران النباتات والضوء الطبيعي القادم من الأفنية مسار المريض من الاستقبال إلى غرف العلاج، بينما يمتد فضاء مخصص للفريق — مطبخ وصالة وطاولة بلياردو — بنفس اللغة المنزلية خلف الكواليس."
    },
    hero:'assets/dental-clinic-corridor.jpg',
    gallery:[
      'assets/dental-clinic-meeting.jpg',
      'assets/dental-clinic-lounge.jpg',
      'assets/dental-clinic-treatment-1.jpg',
      'assets/dental-clinic-reception.jpg',
      'assets/dental-clinic-office.jpg'
    ]
  },
  {
    id:'villa-a', title:{fr:'VILLA A',en:'VILLA A',ar:'فيلا A'}, year:'2021', surface:'520 m²',
    loc:{fr:'Tanger',en:'Tangier',ar:'طنجة'},
    cat:{fr:'Résidentiel — Villa',en:'Residential — Villa',ar:'سكني — فيلا'},
    metier:{fr:'Architecture',en:'Architecture',ar:'العمارة'},
    categories:['architecture'],
    desc:{
      fr:"Villa familiale organisée en L autour d'une piscine à débordement, avec un large auvent en porte-à-faux qui protège les baies vitrées du soleil de l'après-midi. Le bois vertical rythme la façade et adoucit l'échelle du volume principal.",
      en:"An L-shaped family villa organised around an infinity pool, with a wide cantilevered canopy shielding the glazed façades from the afternoon sun. Vertical timber slats rhythm the façade and soften the scale of the main volume.",
      ar:"فيلا عائلية على شكل حرف L تنتظم حول مسبح لا متناهي، مع مظلة بارزة عريضة تحمي الواجهات الزجاجية من شمس بعد الظهر. تُوقّع الألواح الخشبية العمودية إيقاع الواجهة وتُلطّف حجم الكتلة الرئيسية."
    },
    hero:'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'siege-alwifaq', title:{fr:'SIÈGE AL WIFAQ',en:'AL WIFAQ HEADQUARTERS',ar:'مقر الوفاق'}, year:'2020', surface:'3 100 m²',
    loc:{fr:'Tétouan',en:'Tetouan',ar:'تطوان'},
    cat:{fr:'Tertiaire — Bureaux',en:'Commercial — Offices',ar:'مكاتب — إداري'},
    metier:{fr:'Architecture · Design intérieur',en:'Architecture · Interior design',ar:'العمارة · التصميم الداخلي'},
    categories:['architecture','interior'],
    desc:{
      fr:"Siège administratif organisé sur cinq niveaux autour d'un atrium central végétalisé. La résille en aluminium perforé qui enveloppe le bâtiment filtre l'ensoleillement direct tout en générant un dessin d'ombres changeant au fil de la journée.",
      en:"An administrative headquarters organised over five levels around a planted central atrium. The perforated aluminium screen wrapping the building filters direct sunlight while casting a shifting pattern of shadows through the day.",
      ar:"مقر إداري ينتظم على خمسة طوابق حول فناء مركزي مزروع. تعمل الشبكة المعدنية المثقبة التي تلف المبنى على تصفية أشعة الشمس المباشرة مع رسم أنماط ظل متغيرة على مدار اليوم."
    },
    hero:'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'villa-h', title:{fr:'VILLA H',en:'VILLA H',ar:'فيلا H'}, year:'2022', surface:'610 m²',
    loc:{fr:'Tanger',en:'Tangier',ar:'طنجة'},
    cat:{fr:'Résidentiel — Villa',en:'Residential — Villa',ar:'سكني — فيلا'},
    metier:{fr:'Architecture',en:'Architecture',ar:'العمارة'},
    categories:['architecture'],
    desc:{
      fr:"Villa d'angle sur un terrain en pente, dont les niveaux se décalent pour suivre la topographie. Un escalier extérieur en pierre relie le jardin haut à la terrasse basse, ouverte sur la baie.",
      en:"A corner villa on a sloping plot, its levels stepping down to follow the topography. An outdoor stone stair links the upper garden to the lower terrace, open to the bay.",
      ar:"فيلا زاوية على أرض منحدرة، تتدرج مستوياتها لتتبع الطبوغرافيا. يربط درج حجري خارجي الحديقة العلوية بالتراس السفلي المطل على الخليج."
    },
    hero:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'immeuble-d', title:{fr:'IMMEUBLE RÉSIDENTIEL D',en:'RESIDENTIAL BUILDING D',ar:'مبنى سكني D'}, year:'2021', surface:'4 200 m²',
    loc:{fr:'Tanger',en:'Tangier',ar:'طنجة'},
    cat:{fr:'Résidentiel — Collectif',en:'Residential — Multi-unit',ar:'سكني — جماعي'},
    metier:{fr:'Architecture · Urbanisme',en:'Architecture · Urban planning',ar:'العمارة · التعمير'},
    categories:['architecture','urbanisme'],
    desc:{
      fr:"Immeuble de 32 appartements organisé autour d'un rez-de-chaussée planté, avec loggias filantes qui prolongent chaque logement vers l'extérieur.",
      en:"A 32-unit apartment building organised around a planted ground floor, with continuous loggias extending each home outward.",
      ar:"عمارة من 32 شقة تنتظم حول طابق أرضي مزروع، مع لوجيات ممتدة تُطيل كل مسكن نحو الخارج."
    },
    hero:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'complexe-kaa-assrass', title:{fr:'COMPLEXE RÉSIDENTIEL',en:'RESIDENTIAL COMPLEX',ar:'مجمع سكني'}, year:'2024', surface:'6 800 m²',
    loc:{fr:'Kaa Assrass',en:'Kaa Assrass',ar:'قاع السرس'},
    cat:{fr:'Résidentiel — Lotissement',en:'Residential — Masterplan',ar:'سكني — تجزئة'},
    metier:{fr:'Architecture · Urbanisme',en:'Architecture · Urban planning',ar:'العمارة · التعمير'},
    categories:['architecture','urbanisme'],
    desc:{
      fr:"Plan d'ensemble pour un lotissement de 40 villas, structuré autour d'une trame paysagère et d'un réseau de venelles piétonnes inspiré du parcellaire traditionnel.",
      en:"A masterplan for a 40-villa development, structured around a landscaped grid and a network of pedestrian lanes inspired by traditional plot patterns.",
      ar:"مخطط شامل لتجزئة من 40 فيلا، منظم حول شبكة مناظر طبيعية وشبكة من الأزقة المخصصة للمشاة مستوحاة من التقسيم العقاري التقليدي."
    },
    hero:'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'centre-mre', title:{fr:"CENTRE D'ACCUEIL MRE",en:'MRE WELCOME CENTRE',ar:'مركز استقبال الجالية'}, year:'2021', surface:'1 200 m²',
    loc:{fr:'Béni Mellal',en:'Beni Mellal',ar:'بني ملال'},
    cat:{fr:'Équipement',en:'Public Facility',ar:'تجهيز عمومي'},
    metier:{fr:'Architecture',en:'Architecture',ar:'العمارة'},
    categories:['architecture'],
    desc:{
      fr:"Centre d'accueil pour les Marocains résidant à l'étranger, conçu comme un socle de pierre locale surmonté d'un volume en porte-à-faux qui marque l'entrée du site.",
      en:"A welcome centre for Moroccans living abroad, conceived as a local-stone plinth topped by a cantilevered volume marking the site's entrance.",
      ar:"مركز استقبال للجالية المغربية بالخارج، صُمم كقاعدة من الحجر المحلي يعلوها حجم بارز يحدد مدخل الموقع."
    },
    hero:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?q=80&w=900&auto=format&fit=crop'
    ]
  },
  {
    id:'acces-zone-industrielle', title:{fr:'ACCÈS ZONE INDUSTRIELLE',en:'INDUSTRIAL ZONE ACCESS',ar:'مدخل المنطقة الصناعية'}, year:'2023', surface:'—',
    loc:{fr:'Tanger',en:'Tangier',ar:'طنجة'},
    cat:{fr:'Industriel',en:'Industrial',ar:'صناعي'},
    metier:{fr:'Architecture · Urbanisme',en:'Architecture · Urban planning',ar:'العمارة · التعمير'},
    categories:['architecture','urbanisme'],
    desc:{
      fr:"Bâtiment de contrôle d'accès pour une zone industrielle portuaire, pensé comme un repère simple et robuste, visible depuis les axes de circulation environnants.",
      en:"An access-control building for a port-side industrial zone, conceived as a simple, robust landmark visible from the surrounding roads.",
      ar:"مبنى لمراقبة الدخول إلى منطقة صناعية مينائية، صُمم كمعلم بسيط ومتين، مرئي من الطرق المحيطة."
    },
    hero:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
    gallery:[
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=900&auto=format&fit=crop'
    ]
  }
];

const sfItems = [
  { sheet:'A-01', title:{fr:'ARCHITECTURE',en:'ARCHITECTURE',ar:'العمارة'},
    desc:{fr:'Conception, mission complète, études de faisabilité et permis de construire pour projets résidentiels et hôteliers.',
          en:'Design, full-service commissions, feasibility studies and building permits for residential and hospitality projects.',
          ar:'التصميم، المهمة الكاملة، دراسات الجدوى ورخص البناء للمشاريع السكنية والفندقية.'} },
  { sheet:'A-02', title:{fr:'RÉHABILITATION DU PATRIMOINE',en:'HERITAGE REHABILITATION',ar:'ترميم التراث'},
    desc:{fr:"Restauration de riads et de bâtis anciens de la médina, dans le respect des matériaux et des techniques d'origine.",
          en:'Restoration of riads and historic medina buildings, respecting original materials and construction techniques.',
          ar:'ترميم الرياضات والمباني القديمة في المدينة العتيقة، مع احترام المواد والتقنيات الأصلية.'} },
  { sheet:'A-03', title:{fr:'DESIGN INTÉRIEUR',en:'INTERIOR DESIGN',ar:'التصميم الداخلي'},
    desc:{fr:"Aménagements intérieurs, choix des matières et atmosphères, au service de la qualité d'usage des espaces.",
          en:'Interior fit-outs, material selection and atmosphere, serving the everyday quality of each space.',
          ar:'التهيئات الداخلية، اختيار المواد والأجواء، في خدمة جودة استخدام الفضاءات.'} },
  { sheet:'A-04', title:{fr:"MAÎTRISE D'ŒUVRE",en:'SITE SUPERVISION',ar:'إدارة الأشغال'},
    desc:{fr:"Suivi de chantier, direction des travaux, dessins d'exécution jusqu'à la réception de l'ouvrage.",
          en:'Site follow-up, works management and execution drawings through to final handover.',
          ar:'متابعة الورش، إدارة الأشغال، مخططات التنفيذ حتى تسليم المشروع.'} }
];

/* ===================== TRANSLATIONS ===================== */
const dict = {
  fr:{
    tagline:"Atelier d'architecture — Tanger, Maroc",
    scrollCue:'DÉFILER POUR DÉCOUVRIR',
    aboutHeading:'DES ESPACES SOBRES,<br>ANCRÉS ET<br>INTEMPORELS.',
    aboutPara1:"L'Atelier Haytham Mribah conçoit une architecture attentive au site, à la lumière du détroit et aux usages réels de ceux qui habitent les lieux. Basé à Tanger, l'atelier intervient sur des projets résidentiels, hôteliers et de réhabilitation du patrimoine, au Maroc comme à l'international.",
    aboutPara2:"Chaque projet part d'une lecture précise du contexte — climat, matière, topographie — pour aboutir à des espaces clairs, maîtrisés et construits pour durer.",
    stat1:'PROJETS LIVRÉS', stat2:"ANNÉES D'EXERCICE", stat3:'VILLES AU MAROC', stat4:"PAYS D'INTERVENTION",
    eyebrowPortfolio:'Portfolio',
    projectsHeading:'PROJETS<br>SÉLECTIONNÉS',
    projectsDesc:'Une sélection de réalisations récentes, entre résidences privées, programmes hôteliers et réhabilitations du patrimoine.',
    viewTag:'VOIR LE PROJET',
    viewAllBtn:'VOIR TOUS LES PROJETS',
    filterAll:'TOUS', filterArchitecture:'ARCHITECTURE', filterUrbanisme:'URBANISME', filterInterior:'DESIGN INTÉRIEUR',
    viewLessBtn:'AFFICHER MOINS',
    philosophyQuote:"« Construire à Tanger, c'est composer avec la lumière du détroit et la mémoire de la médina — jamais contre elles. »",
    philosophyCite:'— HAYTHAM MRIBAH, FONDATEUR',
    founderPhotoLabel:'PHOTO DU FONDATEUR',
    menuHome:'ACCUEIL', menuAgency:'AGENCE', menuProjects:'PROJETS', menuExpertise:'EXPERTISE', menuContact:'CONTACT', menuBack:'RETOUR',
    eyebrowCompetences:'Compétences',
    sfHeading:'SAVOIR-FAIRE',
    sfDesc:"De l'esquisse à la réception du chantier, une mission complète, précise et suivie.",
    sfSheetLabel:'FEUILLE',
    ctaEyebrow:'Un projet à Tanger ou ailleurs ?',
    ctaHeading:'PARLONS-EN.',
    ctaSub:'CONTACT@ATELIERHM.MA — TANGER, MAROC',
    ctaBtn:'PRENDRE CONTACT',
    footTag:'Atelier Haytham Mribah<br>Architecture, Patrimoine, Design.',
    footAgency:'AGENCE',
    footCity:'Tanger',
    footAddr:'12, Avenue Mohammed VI<br>Résidence Amerchich, étage 3<br>90000 — Tanger, Maroc',
    footContact:'CONTACT',
    footPhone:'Tél. +212 539 00 00 00',
    footInsta:'Instagram — @atelierhaythammribah',
    footCopy:'© 2026 ATELIER HAYTHAM MRIBAH — TOUS DROITS RÉSERVÉS',
    footLegal:'MENTIONS LÉGALES',
    metaCat:'CATÉGORIE', metaYear:'ANNÉE', metaSurf:'SURFACE',
    backToProjects:'RETOUR AUX PROJETS',
    metaLieu:'LIEU', metaProgramme:'PROGRAMME', metaMetier:'MÉTIER', metaAnnee:'ANNÉE', metaSurface:'SURFACE',
    otherProjectsHeading:'AUTRES PROJETS',
    otherProjectsSub:'Continuer la navigation dans les projets.'
  },
  en:{
    tagline:'Architecture studio — Tangier, Morocco',
    scrollCue:'SCROLL TO DISCOVER',
    aboutHeading:'QUIET SPACES,<br>GROUNDED AND<br>TIMELESS.',
    aboutPara1:'Atelier Haytham Mribah designs architecture attentive to its site, to the light of the strait, and to the real habits of the people who use each place. Based in Tangier, the studio works on residential, hospitality and heritage-rehabilitation projects, in Morocco and abroad.',
    aboutPara2:'Every project starts from a precise reading of context — climate, material, topography — to arrive at spaces that are clear, controlled and built to last.',
    stat1:'PROJECTS DELIVERED', stat2:'YEARS IN PRACTICE', stat3:'CITIES IN MOROCCO', stat4:'COUNTRIES OF PRACTICE',
    eyebrowPortfolio:'Portfolio',
    projectsHeading:'SELECTED<br>PROJECTS',
    projectsDesc:'A selection of recent work, spanning private residences, hospitality programmes and heritage rehabilitations.',
    viewTag:'VIEW PROJECT',
    viewAllBtn:'VIEW ALL PROJECTS',
    filterAll:'ALL', filterArchitecture:'ARCHITECTURE', filterUrbanisme:'URBAN PLANNING', filterInterior:'INTERIOR DESIGN',
    viewLessBtn:'VIEW LESS',
    philosophyQuote:'"Building in Tangier means working with the light of the strait and the memory of the medina — never against them."',
    philosophyCite:'— HAYTHAM MRIBAH, FOUNDER',
    founderPhotoLabel:'FOUNDER PHOTO',
    menuHome:'HOME', menuAgency:'STUDIO', menuProjects:'PROJECTS', menuExpertise:'EXPERTISE', menuContact:'CONTACT', menuBack:'BACK',
    eyebrowCompetences:'Expertise',
    sfHeading:'EXPERTISE',
    sfDesc:'From first sketch to final handover, a complete, precise and closely followed commission.',
    sfSheetLabel:'SHEET',
    ctaEyebrow:'A project in Tangier or elsewhere?',
    ctaHeading:"LET'S TALK.",
    ctaSub:'CONTACT@ATELIERHM.MA — TANGIER, MOROCCO',
    ctaBtn:'GET IN TOUCH',
    footTag:'Atelier Haytham Mribah<br>Architecture, Heritage, Design.',
    footAgency:'STUDIO',
    footCity:'Tangier',
    footAddr:'12, Avenue Mohammed VI<br>Amerchich Residence, 3rd floor<br>90000 — Tangier, Morocco',
    footContact:'CONTACT',
    footPhone:'Tel. +212 539 00 00 00',
    footInsta:'Instagram — @atelierhaythammribah',
    footCopy:'© 2026 ATELIER HAYTHAM MRIBAH — ALL RIGHTS RESERVED',
    footLegal:'LEGAL NOTICE',
    metaCat:'CATEGORY', metaYear:'YEAR', metaSurf:'AREA',
    backToProjects:'BACK TO PROJECTS',
    metaLieu:'LOCATION', metaProgramme:'PROGRAMME', metaMetier:'DISCIPLINE', metaAnnee:'YEAR', metaSurface:'AREA',
    otherProjectsHeading:'OTHER PROJECTS',
    otherProjectsSub:'Continue exploring the portfolio.'
  },
  ar:{
    tagline:'مكتب هندسة معمارية — طنجة، المغرب',
    scrollCue:'مرّر للاكتشاف',
    aboutHeading:'فضاءات هادئة،<br>راسخة وخالدة.',
    aboutPara1:'يصمم أتيليه هيثم مريباح عمارة تراعي الموقع، وضوء المضيق، والاستخدام الحقيقي لمن يسكنون الأماكن. ومقره طنجة، يعمل الأتيليه على مشاريع سكنية وفندقية وترميم للتراث، داخل المغرب وخارجه.',
    aboutPara2:'ينطلق كل مشروع من قراءة دقيقة للسياق — المناخ، المادة، الطبوغرافيا — للوصول إلى فضاءات واضحة، مضبوطة ومبنية لتدوم.',
    stat1:'مشروعاً منجزاً', stat2:'سنوات من الممارسة', stat3:'مدن في المغرب', stat4:'دول التدخل',
    eyebrowPortfolio:'أعمال مختارة',
    projectsHeading:'مشاريع مختارة',
    projectsDesc:'مجموعة مختارة من الأعمال الحديثة، بين مساكن خاصة وبرامج فندقية وترميمات تراثية.',
    viewTag:'عرض المشروع',
    viewAllBtn:'عرض جميع المشاريع',
    filterAll:'الكل', filterArchitecture:'العمارة', filterUrbanisme:'التعمير', filterInterior:'التصميم الداخلي',
    viewLessBtn:'عرض أقل',
    philosophyQuote:'«البناء في طنجة يعني التعامل مع ضوء المضيق وذاكرة المدينة العتيقة — لا العمل ضدهما أبداً.»',
    philosophyCite:'— هيثم مريباح، المؤسس',
    founderPhotoLabel:'صورة المؤسس',
    menuHome:'الرئيسية', menuAgency:'المكتب', menuProjects:'المشاريع', menuExpertise:'الخبرات', menuContact:'اتصال', menuBack:'رجوع',
    eyebrowCompetences:'الخبرات',
    sfHeading:'الخبرات',
    sfDesc:'من الرسم الأول إلى تسليم المشروع، مهمة كاملة ودقيقة ومتابَعة عن قرب.',
    sfSheetLabel:'لوحة',
    ctaEyebrow:'مشروع في طنجة أو في مكان آخر؟',
    ctaHeading:'لنتحدث.',
    ctaSub:'CONTACT@ATELIERHM.MA — طنجة، المغرب',
    ctaBtn:'تواصل معنا',
    footTag:'أتيليه هيثم مريباح<br>عمارة، تراث، تصميم.',
    footAgency:'المكتب',
    footCity:'طنجة',
    footAddr:'12، شارع محمد السادس<br>إقامة أمرشيش، الطابق 3<br>90000 — طنجة، المغرب',
    footContact:'اتصال',
    footPhone:'هاتف. 00 00 00 539 212+',
    footInsta:'إنستغرام — atelierhaythammribah@',
    footCopy:'© 2026 أتيليه هيثم مريباح — جميع الحقوق محفوظة',
    footLegal:'الإشعار القانوني',
    metaCat:'الفئة', metaYear:'السنة', metaSurf:'المساحة',
    backToProjects:'العودة إلى المشاريع',
    metaLieu:'الموقع', metaProgramme:'البرنامج', metaMetier:'التخصص', metaAnnee:'السنة', metaSurface:'المساحة',
    otherProjectsHeading:'مشاريع أخرى',
    otherProjectsSub:'تابع استكشاف الأعمال.'
  }
};

let currentLang = 'fr';
let slideIndex = 0;
let slideTimer = null;

/* ===================== NAV MENU ===================== */
const burgerBtn = document.getElementById('burgerBtn');
const menuOverlay = document.getElementById('menuOverlay');

function openMenu(){
  menuOverlay.classList.add('open');
  burgerBtn.classList.add('open');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}
function closeMenu(){
  menuOverlay.classList.remove('open');
  burgerBtn.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}
burgerBtn.addEventListener('click', ()=>{
  menuOverlay.classList.contains('open') ? closeMenu() : openMenu();
});
document.getElementById('menuClose').addEventListener('click', closeMenu);
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

function navigateToSection(targetId){
  const scrollToTarget = () => {
    if(targetId === 'top'){
      window.scrollTo({top:0, left:0, behavior:'smooth'});
    } else {
      const el = document.getElementById(targetId);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }
    history.replaceState(null, '', targetId === 'top' ? location.pathname : '#'+targetId);
  };

  if(currentProjectId){
    // Leaving a project page: go home first, then scroll once it's rendered.
    showHome();
    history.replaceState(null, '', location.pathname);
    requestAnimationFrame(()=> requestAnimationFrame(scrollToTarget));
  } else {
    scrollToTarget();
  }
}

document.querySelectorAll('.menu-links a').forEach(link=>{
  link.addEventListener('click', (e)=>{
    e.preventDefault();
    closeMenu();
    navigateToSection(link.getAttribute('href').slice(1));
  });
});

document.getElementById('logoHome').addEventListener('click', (e)=>{
  e.preventDefault();
  navigateToSection('top');
});

/* ===================== FOUNDER PHOTO FALLBACK =====================
   Shows the placeholder until assets/haytham-mribah-portrait.jpg
   actually exists — swap in the real photo and this handles itself. */
const founderPhoto = document.getElementById('founderPhoto');
const founderPlaceholder = document.getElementById('founderPlaceholder');
if(founderPhoto && founderPlaceholder){
  const showPhoto = () => { founderPhoto.style.display = 'block'; founderPlaceholder.style.display = 'none'; };
  const showPlaceholder = () => { founderPhoto.style.display = 'none'; founderPlaceholder.style.display = 'flex'; };
  if(founderPhoto.complete){
    founderPhoto.naturalWidth > 0 ? showPhoto() : showPlaceholder();
  } else {
    founderPhoto.addEventListener('load', showPhoto);
    founderPhoto.addEventListener('error', showPlaceholder);
  }
}

/* ===================== HERO SCROLL LOCK =====================
   Keeps the hero pinned in view until the visitor makes two distinct
   scroll gestures (wheel/touch/keyboard). The first gesture is
   absorbed (page stays frozen); the second is let through immediately
   so the page actually starts moving on that second scroll. A burst
   of wheel events from one continuous trackpad swipe is debounced to
   count as a single gesture, not many. Deliberate navigation (menu
   links, back button, etc.) still works normally — this only gates
   passive scrolling. */
(function(){
  const REQUIRED_ATTEMPTS = 2;
  const GESTURE_COOLDOWN = 650;
  let locked = true;
  let attempts = 0;
  let cooldown = false;
  let touchStartY = null;

  function unlock(){
    locked = false;
    document.removeEventListener('wheel', onWheel, {passive:false});
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove, {passive:false});
    document.removeEventListener('keydown', onKeydown);
  }

  // Returns true if this gesture should be blocked (page stays frozen),
  // false if it should pass through (either off-cooldown mid-burst, or
  // this is the unlocking gesture and the page should start scrolling).
  function shouldBlock(){
    if(cooldown) return true; // still inside the same continuous gesture burst
    cooldown = true;
    attempts++;
    setTimeout(()=>{ cooldown = false; }, GESTURE_COOLDOWN);
    if(attempts >= REQUIRED_ATTEMPTS){
      unlock();
      return false; // let the unlocking gesture through
    }
    return true;
  }

  function onWheel(e){
    if(!locked) return;
    if(window.scrollY > 4){ unlock(); return; }
    if(e.deltaY <= 0) return;
    if(shouldBlock()) e.preventDefault();
  }

  function onTouchStart(e){
    touchStartY = e.touches[0].clientY;
  }

  function onTouchMove(e){
    if(!locked) return;
    if(window.scrollY > 4){ unlock(); return; }
    if(touchStartY === null) return;
    const delta = touchStartY - e.touches[0].clientY;
    if(delta <= 24) return; // require a real upward swipe (scroll-down intent)
    if(shouldBlock()){ e.preventDefault(); }
    touchStartY = e.touches[0].clientY;
  }

  function onKeydown(e){
    if(!locked) return;
    if(['ArrowDown','PageDown',' '].includes(e.key)){
      if(shouldBlock()) e.preventDefault();
    }
  }

  document.addEventListener('wheel', onWheel, {passive:false});
  document.addEventListener('touchstart', onTouchStart, {passive:true});
  document.addEventListener('touchmove', onTouchMove, {passive:false});
  document.addEventListener('keydown', onKeydown);
})();

/* ===================== HERO MARK ANIMATION ===================== */
const heroMark = document.querySelector('.hero-mark');
requestAnimationFrame(()=>{
  requestAnimationFrame(()=>{
    heroMark.classList.add('loaded', 'filled');
  });
});

/* ===================== RENDER: HERO SLIDER ===================== */
const heroSliderEl = document.getElementById('heroSlider');
function buildSlides(){
  document.querySelectorAll('.slide').forEach(s=>s.remove());
  heroSlides.forEach((s,i)=>{
    const div = document.createElement('div');
    div.className = 'slide' + (i===0 ? ' active' : '');
    div.innerHTML = '<img src="'+s.img+'" alt="'+escapeHTML(s.title[currentLang])+'"><div class="scrim"></div>';
    heroSliderEl.appendChild(div);
  });
}
function renderSliderCaption(){
  const s = heroSlides[slideIndex];
  document.getElementById('sliderCaptionText').innerHTML =
    '<span class="title">'+escapeHTML(s.title[currentLang])+'</span><span>'+escapeHTML(s.loc[currentLang])+'</span>';
  document.querySelectorAll('#sliderDots button').forEach((d,i)=>d.classList.toggle('on', i===slideIndex));
  document.querySelectorAll('.slide').forEach((el,i)=>el.classList.toggle('active', i===slideIndex));
}
function buildDots(){
  const dotsEl = document.getElementById('sliderDots');
  dotsEl.innerHTML='';
  heroSlides.forEach((s,i)=>{
    const b = document.createElement('button');
    if(i===slideIndex) b.classList.add('on');
    b.addEventListener('click', ()=>{ goToSlide(i); resetTimer(); });
    dotsEl.appendChild(b);
  });
}
function goToSlide(i){
  slideIndex = (i + heroSlides.length) % heroSlides.length;
  renderSliderCaption();
}
function resetTimer(){
  clearInterval(slideTimer);
  slideTimer = setInterval(()=>goToSlide(slideIndex+1), 5500);
}
document.getElementById('prevArrow').addEventListener('click', ()=>{ goToSlide(slideIndex-1); resetTimer(); });
document.getElementById('nextArrow').addEventListener('click', ()=>{ goToSlide(slideIndex+1); resetTimer(); });
heroSliderEl.addEventListener('mouseenter', ()=>clearInterval(slideTimer));
heroSliderEl.addEventListener('mouseleave', resetTimer);

/* ===================== RENDER: PROJECTS ===================== */
const projectGrid = document.getElementById('projectGrid');
const projectFilters = document.getElementById('projectFilters');
const viewAllBtn = document.getElementById('viewAllBtn');
const INITIAL_PROJECT_COUNT = 6;
let projectsExpanded = false;
let activeFilter = 'all';
const FILTER_KEYS = ['all', 'architecture', 'urbanisme', 'interior'];

function cardHTML(p){
  return '<a class="card" data-id="'+escapeHTML(p.id)+'" href="#project/'+encodeURIComponent(p.id)+'">'+
      '<div class="imgwrap"><img src="'+p.hero+'" alt="'+escapeHTML(p.title[currentLang])+'"></div>'+
      '<div class="scrim"></div>'+
      '<div class="tag">'+escapeHTML(dict[currentLang].viewTag)+'</div>'+
      '<div class="info">'+
        '<div class="loc">'+escapeHTML(p.loc[currentLang])+'</div>'+
        '<div class="title">'+escapeHTML(p.title[currentLang])+'</div>'+
        '<div class="cat">'+escapeHTML(p.cat[currentLang])+'</div>'+
      '</div>'+
    '</a>';
}

function filterLabelKey(key){
  return { all:'filterAll', architecture:'filterArchitecture', urbanisme:'filterUrbanisme', interior:'filterInterior' }[key];
}

function renderFilters(){
  projectFilters.innerHTML = FILTER_KEYS.map(key=>(
    '<button data-filter="'+key+'" class="'+(key===activeFilter?'active':'')+'">'+
      escapeHTML(dict[currentLang][filterLabelKey(key)])+
    '</button>'
  )).join('');
  projectFilters.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.getAttribute('data-filter');
      if(key === activeFilter) return;
      activeFilter = key;
      projectsExpanded = false;
      renderFilters();
      renderProjects();
    });
  });
}

function filteredProjects(){
  return activeFilter === 'all' ? projects : projects.filter(p => p.categories && p.categories.includes(activeFilter));
}

function renderProjects(){
  const all = filteredProjects();
  const visible = projectsExpanded ? all : all.slice(0, INITIAL_PROJECT_COUNT);
  projectGrid.innerHTML = visible.map(cardHTML).join('');

  if(all.length > INITIAL_PROJECT_COUNT){
    viewAllBtn.style.display = 'inline-block';
    viewAllBtn.textContent = projectsExpanded ? dict[currentLang].viewLessBtn : dict[currentLang].viewAllBtn;
  } else {
    viewAllBtn.style.display = 'none';
  }
}

viewAllBtn.addEventListener('click', ()=>{
  projectsExpanded = !projectsExpanded;
  renderProjects();
  if(!projectsExpanded){
    document.getElementById('projects').scrollIntoView({behavior:'smooth', block:'start'});
  }
});

/* ===================== RENDER: SAVOIR-FAIRE ===================== */
const sfGrid = document.getElementById('sfGrid');
function renderSF(){
  sfGrid.innerHTML = sfItems.map(it=>(
    '<div class="sf-item">'+
      '<div class="sheet">'+escapeHTML(dict[currentLang].sfSheetLabel)+' '+escapeHTML(it.sheet)+'</div>'+
      '<h3>'+escapeHTML(it.title[currentLang])+'</h3>'+
      '<p>'+escapeHTML(it.desc[currentLang])+'</p>'+
      '<div class="cross"></div>'+
    '</div>'
  )).join('');
}

/* ===================== PROJECT DETAIL PAGE + ROUTING ===================== */
const homeView = document.getElementById('homeView');
const projectView = document.getElementById('projectView');
let currentProjectId = null;

function otherProjectsFor(id){
  const idx = projects.findIndex(p=>p.id===id);
  const others = [];
  for(let i=1; i<projects.length && others.length<2; i++){
    others.push(projects[(idx+i) % projects.length]);
  }
  return others;
}

// Sizes an image's container to the image's own aspect ratio, so object-fit:contain
// never has to letterbox — the box always exactly matches that specific photo's shape.
function matchAspectToImage(img){
  const apply = () => {
    if(img.naturalWidth && img.naturalHeight){
      img.parentElement.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
    }
  };
  if(img.complete){ apply(); }
  else { img.addEventListener('load', apply, {once:true}); }
}

function renderProjectPage(id){
  const p = projects.find(x=>x.id===id);
  if(!p) return false;
  currentProjectId = id;

  document.getElementById('ppCat').textContent = p.cat[currentLang];
  document.getElementById('ppTitle').textContent = p.title[currentLang];
  document.getElementById('ppLieu').textContent = p.loc[currentLang];
  document.getElementById('ppProgramme').textContent = p.cat[currentLang];
  document.getElementById('ppMetier').textContent = p.metier ? p.metier[currentLang] : '';
  document.getElementById('ppAnnee').textContent = p.year;
  document.getElementById('ppSurface').textContent = p.surface;
  const heroImg = document.getElementById('ppHeroImg');
  heroImg.src = p.hero;
  heroImg.alt = p.title[currentLang];
  matchAspectToImage(heroImg);
  document.getElementById('ppDesc').textContent = p.desc[currentLang];
  document.getElementById('ppGallery').innerHTML = p.gallery.map(g=>'<div><img src="'+g+'" alt="'+escapeHTML(p.title[currentLang])+'"></div>').join('');
  document.querySelectorAll('#ppGallery img').forEach(matchAspectToImage);

  const others = otherProjectsFor(id);
  document.getElementById('ppOtherGrid').innerHTML = others.map(cardHTML).join('');

  document.title = p.title[currentLang] + ' — Atelier Haytham Mribah';
  return true;
}

let homeScrollY = 0;
let enteredProjectViaClick = false;
document.addEventListener('click', (e)=>{
  const link = e.target.closest('a[href^="#project/"]');
  if(!link) return;
  enteredProjectViaClick = true;
  if(homeView.style.display !== 'none'){
    homeScrollY = window.scrollY;
  }
});

function showHome(restoreScroll){
  homeView.style.display = '';
  projectView.style.display = 'none';
  document.title = "Atelier Haytham Mribah — Architecture, Tanger";
  currentProjectId = null;
  if(restoreScroll){
    window.scrollTo({top:homeScrollY, left:0, behavior:'instant'});
  }
}
function showProjectView(id){
  const ok = renderProjectPage(id);
  if(!ok){ showHome(); return; }
  homeView.style.display = 'none';
  projectView.style.display = 'block';

  const pinToTop = () => window.scrollTo({top:0, left:0, behavior:'instant'});
  const pinIfStillAtTop = () => { if(window.scrollY < 50) pinToTop(); };
  pinToTop();
  requestAnimationFrame(pinToTop);

  // Late-loading resources (the hero image, web fonts) can still shift the
  // layout after we reset scroll — re-pin once they're actually ready, but
  // only if the visitor hasn't already started scrolling on their own.
  const heroImg = document.getElementById('ppHeroImg');
  if(heroImg){
    if(heroImg.complete){ pinIfStillAtTop(); }
    else { heroImg.addEventListener('load', pinIfStillAtTop, {once:true}); }
  }
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(pinIfStillAtTop);
  }
}
function routeFromHash(){
  const m = location.hash.match(/^#project\/(.+)$/);
  const slug = m ? sanitizeSlug(m[1]) : null;
  if(slug){ showProjectView(slug); }
  else { showHome(true); }
}
window.addEventListener('hashchange', routeFromHash);
document.getElementById('ppBack').addEventListener('click', (e)=>{
  e.preventDefault();
  if(enteredProjectViaClick && history.length > 1){
    history.back();
  } else {
    location.hash = '';
  }
});

/* ===================== LANGUAGE ===================== */
function applyStaticText(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[currentLang][key] !== undefined) el.textContent = dict[currentLang][key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{
    const key = el.getAttribute('data-i18n-html');
    if(dict[currentLang][key] !== undefined) el.innerHTML = dict[currentLang][key];
  });
}
function setLanguage(lang){
  currentLang = lang;
  document.body.classList.toggle('rtl', lang==='ar');
  document.documentElement.setAttribute('dir', lang==='ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('#langNav button').forEach(b=>b.classList.toggle('active', b.getAttribute('data-lang')===lang));
  applyStaticText();
  renderSliderCaption();
  renderFilters();
  renderProjects();
  renderSF();
  if(currentProjectId){ renderProjectPage(currentProjectId); }
}
document.querySelectorAll('#langNav button').forEach(b=>{
  b.addEventListener('click', ()=>setLanguage(b.getAttribute('data-lang')));
});

/* ===================== INIT ===================== */
buildSlides();
buildDots();
renderFilters();
renderProjects();
renderSF();
setLanguage('fr');
resetTimer();
routeFromHash();

const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, {threshold:0.15});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));