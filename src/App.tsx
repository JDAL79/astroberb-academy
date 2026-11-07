import React, { useState, useEffect } from 'react';

// ==========================================
// CONFIGURATION DES CODES D'ACCES SECURISES
// ==========================================
const ACCESS_CODES: Record<string, number[]> = {
  'PACK-COMPLET-2026': [1, 2, 3, 4, 5, 6, 7],
  'DAVID-ADMIN-2809': [1, 2, 3, 4, 5, 6, 7],
  'ASTRO-MOD1': [1],
  'ASTRO-MOD2': [2],
  'ASTRO-MOD3': [3],
  'ASTRO-MOD4': [4],
  'ASTRO-MOD5': [5],
  'ASTRO-MOD6': [6],
  'ASTRO-MOD7': [7],
};

const SUPPORT_EMAIL = 'contact@astroberb.com';

// Chemins des fichiers multimédias dans public/
const WELCOME_VIDEO_URL = '/welcome.mp4';
const PROMO_LOGO_VIDEO_URL = '/promo-logo.mp4';
const PROMO_MODULES_VIDEO_URL = '/promo-modules.mp4';
const LOGO_URL = '/logo.png';

type CalculatorType = 'sampling' | 'torque' | 'exposure' | 'focus' | 'compare' | 'npf' | 'none';

interface Slide {
  title: string;
  subtitle: string;
  bullets: string[];
  proTip: string;
}

interface LessonSection {
  heading: string;
  body: string;
  highlight?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface DownloadDoc {
  id: string;
  name: string;
  title: string;
  sections: { title: string; content: string[] }[];
}

interface GlossaryItem {
  termFr: string;
  termEn: string;
  defFr: string;
  defEn: string;
  moduleRef: number;
}

const GLOSSARY_TERMS: GlossaryItem[] = [
  {
    termFr: 'Backfocus',
    termEn: 'Backfocus',
    defFr: "Distance mécanique exacte (généralement 55,0 mm) entre la bague arrière de votre correcteur/réducteur et la surface du capteur CMOS.",
    defEn: "The exact mechanical distance (typically 55.0mm) between the rear shoulder of your flattener/reducer and the CMOS sensor plane.",
    moduleRef: 1,
  },
  {
    termFr: 'Tilt',
    termEn: 'Sensor Tilt',
    defFr: "Défaut d'alignement mécanique où le plan du capteur n'est pas parfaitement orthogonal à l'axe optique, créant des coins flous.",
    defEn: "Mechanical misalignment where the sensor plane is not perfectly orthogonal to the optical axis, causing blurry corners.",
    moduleRef: 1,
  },
  {
    termFr: 'Échantillonnage',
    termEn: 'Pixel Scale',
    defFr: "Portion de ciel en secondes d'arc capturée par un pixel unique de votre caméra (exprimé en ''/px). Doit être adapté au seeing.",
    defEn: "The portion of the sky in arcseconds captured by a single camera pixel (''/px). Must match atmospheric seeing.",
    moduleRef: 1,
  },
  {
    termFr: 'Monture Harmonique',
    termEn: 'Harmonic Mount',
    defFr: "Monture équatoriale légère à réducteurs Strainwave offrant un couple élevé sans nécessiter de contrepoids lourds.",
    defEn: "Lightweight equatorial mount using strainwave gear reducers providing high torque without heavy counterweights.",
    moduleRef: 2,
  },
  {
    termFr: 'Plate Solving',
    termEn: 'Plate Solving',
    defFr: "Technique astrométrique où le logiciel analyse une photo du ciel pour identifier instantanément les coordonnées de pointage exactes.",
    defEn: "Astrometric technique where software analyzes a sky photo to instantly identify exact pointing coordinates.",
    moduleRef: 3,
  },
  {
    termFr: 'Dithering',
    termEn: 'Dithering',
    defFr: "Décalage aléatoire de quelques pixels entre les poses pour éliminer le bruit de trame (Walking Noise) à l'empilement.",
    defEn: "Random shifting of a few pixels between exposures to eliminate fixed-pattern walking noise during stacking.",
    moduleRef: 3,
  },
  {
    termFr: 'Gain HCG',
    termEn: 'HCG Gain',
    defFr: "Seuil de conversion à haut gain sur les capteurs CMOS Sony (ex: Gain 100) qui fait chuter drastiquement le bruit de lecture.",
    defEn: "High Conversion Gain threshold on Sony CMOS sensors (e.g. Gain 100) that drastically reduces read noise.",
    moduleRef: 4,
  },
  {
    termFr: 'Filtre Dual-Band',
    termEn: 'Dual-Band Filter',
    defFr: "Filtre interférentiel à bande étroite (ex: 3nm ou 7nm) ne laissant passer que les raies Ha et OIII pour imager en ville.",
    defEn: "Narrowband interference filter passing only Ha and OIII emission lines for city imaging with color cameras.",
    moduleRef: 4,
  },
  {
    termFr: 'CFZ (Zone Critique de Focus)',
    termEn: 'CFZ (Critical Focus Zone)',
    defFr: "Plage microscopique de mise au point où l'optique reste parfaitement diffraction-limitée.",
    defEn: "The microscopic focus range where optics remain diffraction-limited.",
    moduleRef: 5,
  },
  {
    termFr: 'HFR (Half Flux Radius)',
    termEn: 'HFR (Half Flux Radius)',
    defFr: "Rayon contenant 50 % de l'énergie lumineuse d'une étoile. Indicateur universel de la qualité de focalisation.",
    defEn: "Radius containing 50% of a star's light energy. Universal indicator of focus quality.",
    moduleRef: 5,
  },
  {
    termFr: 'GHS (Generalized Hyperbolic Stretch)',
    termEn: 'GHS Stretch',
    defFr: "Outil d'étirement d'histogramme non-linéaire permettant de révéler les extensions faibles tout en protégeant les cœurs brillants.",
    defEn: "Non-linear histogram stretch tool designed to reveal faint extensions while protecting bright cores.",
    moduleRef: 6,
  },
  {
    termFr: 'SPCC',
    termEn: 'SPCC Calibration',
    defFr: "Étalonnage colorimétrique spectrophotométrique basé sur le catalogue Gaia pour restituer les vraies teintes des astres.",
    defEn: "Spectrophotometric color calibration using the Gaia star catalog to render true astronomical colors.",
    moduleRef: 6,
  },
  {
    termFr: 'Règle NPF',
    termEn: 'NPF Rule',
    defFr: "Formule moderne calculant le temps de pose maximal sans filé d'étoiles sur trépied fixe en tenant compte du capteur et de l'optique.",
    defEn: "Modern formula calculating maximum untracked exposure time on a static tripod based on sensor and optics.",
    moduleRef: 7,
  },
];

export default function App() {
  const [lang, setLang] = useState<'fr' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('astroberb_lang');
      return saved === 'en' ? 'en' : 'fr';
    } catch {
      return 'fr';
    }
  });

  const [nightVision, setNightVision] = useState<boolean>(false);
  const [fieldMode, setFieldMode] = useState<boolean>(false); // NOUVEAU : Mode Nomade / Plein Écran Terrain
  const [vipCode, setVipCode] = useState('');
  const [studentName, setStudentName] = useState<string>('');
  const [unlockedModules, setUnlockedModules] = useState<number[]>([]);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [vipStatus, setVipStatus] = useState<'success' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'vip' | 'pack' | 'success' | 'module-detail' | 'glossary'>('home');
  const [glossarySearch, setGlossarySearch] = useState<string>(''); // NOUVEAU : Recherche lexique
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [justPurchasedModule, setJustPurchasedModule] = useState<boolean>(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Simulateur Module 1 (Echantillonnage)
  const [calcFocal, setCalcFocal] = useState<number>(500);
  const [calcPixel, setCalcPixel] = useState<number>(3.76);

  // Simulateur Module 2 (Couple Monture Harmonique & Contrepoids)
  const [calcPayloadKg, setCalcPayloadKg] = useState<number>(9.5);
  const [calcTubeRadiusCm, setCalcTubeRadiusCm] = useState<number>(14);

  // Simulateur Module 4 (Temps de Pose Unitaire & Pollution Lumineuse)
  const [calcBortle, setCalcBortle] = useState<number>(5);
  const [calcFilterBand, setCalcFilterBand] = useState<'broadband' | 'dualband' | 'sho'>('dualband');

  // Simulateur Module 5 (Zone Critique de Focus CFZ & EAF)
  const [calcFokusFD, setCalcFokusFD] = useState<number>(4.8);
  const [calcMicronStep, setCalcMicronStep] = useState<number>(2.5);

  // Simulateur Module 6 (Comparateur Avant / Apres Traitement)
  const [compareSlider, setCompareSlider] = useState<number>(65);

  // Simulateur Module 7 (Regle NPF Trepied Statique)
  const [npfFocal, setNpfFocal] = useState<number>(24);
  const [npfAperture, setNpfAperture] = useState<number>(2.0);
  const [npfPixel, setNpfPixel] = useState<number>(3.76);

  // Quiz Interactif
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('astroberb_lang', lang);
    } catch (e) {}
  }, [lang]);

  useEffect(() => {
    let currentUnlocked: number[] = [];
    let currentCompleted: number[] = [];
    try {
      const saved = localStorage.getItem('astroberb_unlocked');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentUnlocked = parsed.map(Number);
      }
      const savedComp = localStorage.getItem('astroberb_completed');
      if (savedComp) {
        const parsedComp = JSON.parse(savedComp);
        if (Array.isArray(parsedComp)) currentCompleted = parsedComp.map(Number);
      }
      const savedName = localStorage.getItem('astroberb_student_name');
      if (savedName) setStudentName(savedName);
    } catch (e) {
      console.error('Erreur de lecture locale', e);
    }

    const params = new URLSearchParams(window.location.search);
    const unlockParam = params.get('unlock');
    const successParam = params.get('success');

    if (unlockParam === 'all' || successParam === 'true') {
      currentUnlocked = [1, 2, 3, 4, 5, 6, 7];
      try {
        localStorage.setItem('astroberb_unlocked', JSON.stringify(currentUnlocked));
      } catch (e) {}
      setActiveTab('success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (unlockParam) {
      const modId = parseInt(unlockParam, 10);
      if (modId >= 1 && modId <= 7) {
        if (!currentUnlocked.includes(modId)) {
          currentUnlocked = [...currentUnlocked, modId];
          try {
            localStorage.setItem('astroberb_unlocked', JSON.stringify(currentUnlocked));
          } catch (e) {}
        }
        setSelectedModuleId(modId);
        setIsPreviewMode(false);
        setJustPurchasedModule(true);
        setActiveTab('module-detail');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    setUnlockedModules(currentUnlocked);
    setCompletedModules(currentCompleted);
  }, []);

  const saveUnlockedModules = (newModules: number[]) => {
    const cleanArray = Array.from(new Set(newModules.map((n) => Number(n))));
    setUnlockedModules(cleanArray);
    try {
      localStorage.setItem('astroberb_unlocked', JSON.stringify(cleanArray));
    } catch (e) {}
  };

  const toggleCompleteModule = (id: number) => {
    let updated: number[];
    if (completedModules.includes(id)) {
      updated = completedModules.filter((m) => m !== id);
    } else {
      updated = [...completedModules, id];
    }
    setCompletedModules(updated);
    try {
      localStorage.setItem('astroberb_completed', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSaveStudentName = (val: string) => {
    setStudentName(val);
    try {
      localStorage.setItem('astroberb_student_name', val);
    } catch (e) {}
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch (e) {}
  };

  // COMPOSANT LOGO OFFICIEL AVEC LA MASCOTTE DU PETIT TÉLESCOPE ANIMÉ
  const AstroberbLogo = ({ className = 'w-10 h-10' }: { className?: string }) => (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl border border-cyan-500/40 bg-black transition-transform duration-300 group-hover:scale-105 shrink-0 flex items-center justify-center ${className}`}>
      <img
        src={LOGO_URL}
        alt="Astroberb Academy Logo"
        className={`w-full h-full object-contain ${
          nightVision ? 'sepia hue-rotate-[-50deg] saturate-200 brightness-75' : ''
        }`}
      />
    </div>
  );

  // GENERATEUR DE CERTIFICAT OFFICIEL
  const generateCertificate = () => {
    const displayName =
      studentName.trim() ||
      (lang === 'fr' ? "Élève d'Élite Astroberb" : 'Astroberb Elite Student');

    const htmlContent = [
      '<!DOCTYPE html>',
      `<html lang="${lang}">`,
      '<head>',
      '<meta charset="UTF-8">',
      '<title>Certificat de Maîtrise - Astroberb Academy</title>',
      '<style>',
      '@page { size: A4 landscape; margin: 12mm; }',
      "body { font-family: 'Segoe UI', Roboto, sans-serif; background: #030712; color: #f8fafc; padding: 30px; text-align: center; border: 8px solid #06b6d4; box-sizing: border-box; }",
      '.container { border: 2px solid #6366f1; padding: 40px; background: #0f172a; border-radius: 12px; }',
      'h1 { font-size: 36px; color: #38bdf8; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }',
      '.sub { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 25px; }',
      '.name { font-size: 34px; font-weight: 900; color: #ffffff; border-bottom: 2px solid #06b6d4; display: inline-block; padding: 0 20px 8px 20px; margin: 20px 0; }',
      'p { font-size: 16px; color: #cbd5e1; max-width: 720px; margin: 0 auto 30px auto; line-height: 1.6; }',
      '.footer { display: flex; justify-content: space-between; align-items: center; margin-top: 35px; border-top: 1px solid #334155; padding-top: 20px; font-size: 12px; color: #94a3b8; }',
      '.signature { font-family: cursive, sans-serif; font-size: 24px; color: #38bdf8; }',
      '.no-print { background: #06b6d4; color: #0f172a; padding: 12px 24px; border-radius: 8px; margin-bottom: 20px; border: none; font-weight: 900; cursor: pointer; font-size: 14px; }',
      '@media print { .no-print { display: none; } }',
      '</style>',
      '</head>',
      '<body>',
      `<button class="no-print" onclick="window.print()">🖨️ ${lang === 'fr' ? 'Imprimer ou Enregistrer le Certificat en PDF' : 'Print or Save Certificate as PDF'}</button>`,
      '<div class="container">',
      '<div style="font-size: 42px; margin-bottom: 10px;">🪐</div>',
      '<h1>Astroberb Academy</h1>',
      `<div class="sub">${lang === 'fr' ? 'Certificat Officiel de Maîtrise en Astrophotographie' : 'Official Certificate of Mastery in Astrophotography'}</div>`,
      `<p>${lang === 'fr' ? "Ce diplôme certifie que l'astrophotographe ci-dessous a complété avec succès le cursus technique de notre collectif, incluant le calcul optique d'échantillonnage, la maîtrise des montures harmoniques, l'automatisation astrométrique nocturne et le traitement astrophysique." : 'This diploma certifies that the astrophotographer named below has successfully mastered our collective curriculum, including optical sampling physics, strainwave harmonic mount tracking, automated astrometric sequencing, and astrophysical image processing.'}</p>`,
      `<div class="name">${displayName}</div>`,
      '<div class="footer">',
      `<div>${lang === 'fr' ? 'Délivré le' : 'Issued on'} : ${new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</div>`,
      `<div>Modules validés : ${completedModules.length} / 7 • Support : ${SUPPORT_EMAIL}</div>`,
      `<div><span class="signature">L'Équipe Astroberb</span><br/>${lang === 'fr' ? 'Le Collectif d’Astronomes Amateurs' : 'The Amateur Astronomers Collective'}</div>`,
      '</div>',
      '</div>',
      '</body>',
      '</html>',
    ].join('\n');

    const win = window.open('', '_blank', 'width=1050,height=750');
    if (win) {
      win.document.open();
      win.document.write(htmlContent);
      win.document.close();
    }
  };

  // GENERATEUR DE PDF ROBUSTE A4
  const generateAndDownloadPDF = (doc: DownloadDoc, moduleTitle: string) => {
    const sectionsHtml = doc.sections
      .map(
        (sec) =>
          `<div class="section"><h2>${sec.title}</h2><ul>${sec.content
            .map((item) => `<li>${item}</li>`)
            .join('')}</ul></div>`
      )
      .join('');

    const htmlContent = [
      '<!DOCTYPE html>',
      `<html lang="${lang}">`,
      '<head>',
      '<meta charset="UTF-8">',
      `<title>${doc.name} - Astroberb Academy</title>`,
      '<style>',
      '@page { size: A4; margin: 16mm; }',
      "body { font-family: 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.55; padding: 15px; background: white; }",
      '.header { border-bottom: 3px solid #6366f1; padding-bottom: 12mm; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }',
      '.brand { font-size: 22px; font-weight: 900; color: #312e81; }',
      '.sub { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }',
      'h1 { font-size: 22px; color: #0f172a; margin-bottom: 8px; margin-top: 0; }',
      '.mod-tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; margin-bottom: 14px; }',
      '.section { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; page-break-inside: avoid; }',
      '.section h2 { font-size: 15px; color: #1e293b; margin-top: 0; margin-bottom: 8px; }',
      'ul { margin: 0; padding-left: 18px; }',
      'li { margin-bottom: 6px; font-size: 13px; color: #334155; }',
      '.footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 11px; color: #64748b; text-align: center; }',
      '.no-print { background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }',
      '.btn-print { background: #06b6d4; color: #0f172a; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }',
      '@media print { .no-print { display: none; } }',
      '</style>',
      '</head>',
      '<body>',
      '<div class="no-print">',
      `<span>📄 <strong>${lang === 'fr' ? 'Document technique prêt' : 'Technical sheet ready'}</strong> — ${lang === 'fr' ? 'Cliquez pour enregistrer en PDF ou imprimer.' : 'Click to save as PDF or print.'}</span>`,
      `<button class="btn-print" onclick="window.print()">🖨️ ${lang === 'fr' ? 'Enregistrer en PDF' : 'Save as PDF'}</button>`,
      '</div>',
      '<div class="header">',
      '<div>',
      '<div class="brand">🪐 ASTROBERB ACADEMY</div>',
      `<div class="sub">${lang === 'fr' ? 'Documentation Technique & Abaques Terrain' : 'Official Field Technical Documentation'}</div>`,
      '</div>',
      '<div style="text-align: right; font-size: 12px; color: #475569;">Édition 2026</div>',
      '</div>',
      `<div class="mod-tag">${moduleTitle}</div>`,
      `<h1>${doc.title}</h1>`,
      sectionsHtml,
      `<div class="footer">© ${new Date().getFullYear()} Astroberb Academy — Support : ${SUPPORT_EMAIL}</div>`,
      '<script>setTimeout(function() { window.print(); }, 400);</script>',
      '</body>',
      '</html>',
    ].join('\n');

    const win = window.open('', '_blank', 'width=900,height=800');
    if (win) {
      win.document.open();
      win.document.write(htmlContent);
      win.document.close();
    }
  };

  const t = {
    fr: {
      title: 'Astroberb Academy',
      subtitle: "Le Collectif d'Astronomes Amateurs — Astrophotographie du Ciel Profond",
      heroBadge: "⚡ SUPER PROMO • TOUT LE SAVOIR-FAIRE DU TERRAIN",
      heroDesc: "Bienvenue sur notre plateforme ! Nous sommes un groupe de passionnés d'astronomie réunis pour partager nos astuces de terrain : formules optiques, montures harmoniques (Juwei-17, UMi-17S, AM5), automatisation N.I.N.A./ASIAIR et traitement PixInsight & Siril.",
      benefitsTitle: 'Ce que vous saurez faire après les cours',
      benefit1Title: 'Maîtriser son matériel',
      benefit1Desc: 'Fini les prises de tête avec le backfocus, le tilt ou le choix des filtres. Vous assemblez un train optique rigide et parfaitement réglé.',
      benefit2Title: 'Automatiser ses nuits',
      benefit2Desc: "Programmez des sessions de A à Z (Plate solving, autofocus EAF, meridian flip, guidage PHD2) pour dormir l'esprit tranquille.",
      benefit3Title: 'Sublimer ses images',
      benefit3Desc: 'Obtenez des galaxies et des nébuleuses dignes des plus grands observatoires grâce à GraXpert, SPCC et l’étirement GHS.',
      videoSectionBadge: '🎬 Présentation de notre Collectif',
      videoSectionTitle: 'Bienvenue dans notre Observatoire Virtuel !',
      videoSectionSub: 'Installez-vous confortablement avec un café chaud : nous vous montrons comment nous préparons nos nuits d’observation de A à Z.',
      modulesVideoBadge: '🚀 Visite Guidée des Modules',
      modulesVideoTitle: 'Ce que nous partageons avec vous dans nos Masterclasses',
      modulesVideoSub: 'Découvrez en images comment nos outils et nos modules vous simplifient la vie sous les étoiles.',
      originStoryTitle: '🔭 L’idée originale de notre collectif',
      originStoryText: "L'idée originale du site formateur Astroberb est de rassembler tous nos trucs, astuces et connaissances en un seul endroit, accessibles en tout temps, surtout durant les séances d'astronomie. De rendre plus agréable l'approfondissement de vos connaissances en astronomie et astrophoto, et tout ça, dans la simplicité !",
      phase1Badge: '1. AVANT LA NUIT',
      phase1Desc: 'Calcul d’échantillonnage, backfocus 55 mm & équilibrage harmonique.',
      phase2Badge: '2. PENDANT LA NUIT',
      phase2Desc: 'Mise en station polaire, séquenceur N.I.N.A./ASIAIR, EAF & guidage PHD2.',
      phase3Badge: '3. APRÈS LA NUIT',
      phase3Desc: 'Calibration DOF, GraXpert AI, SPCC & étirement GHS (Siril / PixInsight).',
      trustBadge: "⭐ Noté 4.9/5 par notre communauté de passionnés",
      catalog: 'Catalogue des Cours',
      vipSection: 'Accès Membre / Code',
      glossaryNav: '📖 Lexique Astro',
      fieldModeBtn: '🌙 Mode Nomade (Terrain)',
      exitFieldMode: '✕ Quitter le Mode Nomade',
      unlockBtn: 'Activer mon code',
      buyStripe: 'Carte bancaire',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Obtenir le Pack Intégral (49.99$ CAD)',
      packBtnShort: '⚡ SUPER PROMO : Pack Intégral (49.99$)',
      freePreviewBtn: '👁️ Essayer la Démo Gratuite (Simulateur + Chapitre 1)',
      previewBannerTitle: '👁️ MODE APERÇU GRATUIT — Module 1',
      previewBannerDesc: "Testez notre simulateur d'échantillonnage et le Chapitre 1 ! Profitez de notre super promo pour tout débloquer.",
      accessGranted: 'Code validé avec succès ! Cliquez sur vos formations débloquées :',
      invalidCode: "Code d'accès invalide. Vérifiez votre courriel ou contactez le support.",
      accessCourse: '🚀 ACCÉDER À LA MASTERCLASS',
      lockedBadge: '🔒 Module verrouillé',
      unlockedBadge: '🔓 Déverrouillé (Cliquer pour lancer)',
      backToCatalog: '← Retour au catalogue des formations',
      paymentConfirmedModule: '🎉 Accès débloqué ! Votre code de sauvegarde multi-appareils : ',
      copyBtn: '📋 Copier le code',
      copiedBtn: '✅ Code copié !',
      progressLabel: 'Progression de votre cursus :',
      interactiveModule: 'Studio Pédagogique & Masterclass',
      studioHeader: 'Diaporama Interactif & Astuces de notre Collectif',
      fullCourseTitle: 'Cours Théorique Approfondi & Retours de Terrain',
      tutorialSteps: 'Protocole Opérationnel & Checklist Personnelle',
      resourcesPdf: 'Fiches Techniques PDF (Générateur A4 Imprimable)',
      generatePdfBtn: 'Générer & Télécharger le PDF',
      successBadge: 'Paiement Validé avec Succès',
      successTitle: "Bienvenue dans la famille Astroberb Academy !",
      successDesc: 'Votre accès intégral est débloqué. Profitez dès maintenant de tous nos modules, simulateurs et guides PDF.',
      backupCodeNotice: "IMPORTANT — Votre code d'accès multi-appareils à conserver :",
      packTitle: "⚡ OFFRE DU COLLECTIF : Le Pack Intégral 7-en-1",
      packDesc: "Rejoignez notre communauté en obtenant un accès immédiat, illimité et à vie à l'ensemble de nos 7 masterclasses, nos 6 simulateurs et nos guides PDF.",
      payCardStripe: '💳 Payer par Carte Sécurisée (Stripe)',
      payWithPaypal: '🅿️ Payer instantanément avec PayPal',
      vipDesc: 'Entrez votre code personnel reçu après votre achat pour débloquer instantanément vos formations sur cet appareil :',
      vipPlaceholder: 'Votre code (ex: PACK-COMPLET-2026 ou ASTRO-MOD1)',
      viewUnlocked: 'Voir mes modules déverrouillés ➔',
      taxNotice: '🔒 Paiement 100% sécurisé via Stripe & PayPal — Accès immédiat et illimité à vie.',
      footerRights: 'Tous droits réservés.',
      termsLink: 'Conditions Générales de Vente (CGV)',
      privacyLink: 'Politique de Confidentialité',
      contactSupport: 'Support du Collectif',
      closeBtn: 'Fermer',
      prevSlide: '◀ Chapitre précédent',
      nextSlide: 'Chapitre suivant ▶',
      proTipLabel: "💡 L'astuce de notre équipe :",
      quickAccessTitle: '⚡ Accès direct à vos formations déverrouillées :',
      calcTitle: "🧮 Simulateur Optique : Calculateur d'Échantillonnage & Seeing",
      calcFocalLabel: 'Focale effective du télescope (mm) :',
      calcPixelLabel: 'Taille des pixels de la caméra (µm) :',
      calcResult: 'Votre Échantillonnage : ',
      calcVerdictGreat: "✨ Optimal (0.8'' à 2.0''/px) ! Vos pixels sont parfaitement accordés au seeing moyen (2'' à 3'') pour maximiser la finesse sans perdre en signal.",
      calcVerdictOver: "⚠️ Sur-échantillonnage (< 0.8''/px) : Vous grossissez la turbulence atmosphérique. Nécessite un ciel exceptionnel ou le Binning 2x2.",
      calcVerdictUnder: "⚠️ Sous-échantillonnage (> 2.0''/px) : Grand champ idéal pour les vastes nébuleuses (privilégiez le Drizzle au traitement).",
      calcTorqueTitle: '⚖️ Simulateur Mécanique : Couple Harmonique & Contrepoids (Juwei-17 / UMi-17S / AM5)',
      calcPayloadLabel: 'Poids total équipé du tube optique (kg) :',
      calcRadiusLabel: "Déport du centre de gravité par rapport à l'axe AD (cm) :",
      calcTorqueResult: 'Couple exercé sur le réducteur harmonique : ',
      calcFocusTitle: '🔬 Simulateur EAF : Zone Critique de Mise au Point (CFZ)',
      calcFocusFDLabel: "Rapport d'ouverture du tube (f/D) :",
      calcFocusStepLabel: 'Déplacement EAF par pas (µm/pas) :',
      calcFocusResult: 'Tolérance de mise au point (CFZ) : ',
      calcFocusAdvice: 'Pas recommandés (Step Size) pour la courbe en V : ',
      calcExpTitle: '⏱️ CMOS Simulator: Temps de Pose Unitaire Optimal (Swamp Factor)',
      calcBortleLabel: 'Qualité de votre ciel (Échelle de Bortle 1 à 9) :',
      calcFilterLabel: 'Type de filtre utilisé :',
      calcExpResult: 'Temps de pose unitaire recommandé (à f/5, Gain 100) : ',
      calcCompareTitle: '🎨 Comparateur Interactif : Brute Linéaire vs Traitement Final (GraXpert + SPCC + GHS)',
      calcNpfTitle: '📸 Simulateur Grand Champ : Calculateur de la Règle NPF (Trépied Statique)',
      calcNpfFocalLabel: "Focale de l'objectif photo (mm) :",
      calcNpfApertureLabel: 'Ouverture du diaphragme (f/) :',
      calcNpfResult: "Temps de pose max sans filé d'étoiles : ",
      quizTitle: '📝 Quiz de Validation des Connaissances',
      quizSubmit: 'Valider mes réponses',
      quizScore: 'Votre Score : ',
      quizRetry: 'Réinitialiser le quiz',
      correctAnswer: '✅ Bien joué !',
      wrongAnswer: '❌ Pas tout à fait.',
      markComplete: '✓ Marquer ce module comme terminé',
      markIncomplete: '✓ Module terminé (Cliquer pour annuler)',
      certTitle: '🏆 Télécharger mon Certificat Officiel',
      certNamePlaceholder: 'Entrez votre Prénom et Nom pour le diplôme',
      faqTitle: '❓ Foire Aux Questions (FAQ)',
      faq1Q: 'Ce cursus convient-il si nous débutons complètement ?',
      faq1A: 'Absolument ! Nous avons conçu chaque module en partant des bases les plus simples avant de monter pas à pas vers les techniques avancées que nous utilisons lors de nos soirées astro.',
      faq2Q: "Sous quel format et combien de temps ai-je accès aux cours ?",
      faq2A: "L'accès est immédiat, illimité et à vie directement depuis votre navigateur sur PC, Mac, tablette ou mobile. Vous pouvez également consulter et imprimer vos fiches techniques PDF A4 sur le terrain dès que vous en avez besoin !",
      faq3Q: "Puis-je utiliser le site sur le terrain la nuit sans m'éblouir ?",
      faq3A: "Oui ! Cliquez sur le bouton Mode Nuit en haut de l'écran : toute l'interface bascule en spectre rouge pour préserver votre vision nocturne (rhodopsine).",
      testimonialsTitle: '⭐ Ce que disent les membres de notre communauté',
      t1: "« Grâce aux conseils du collectif sur les montures harmoniques et N.I.N.A., mon erreur RMS est passée sous la barre des 0.6'' et mes nuits tournent toutes seules ! »",
      t1Author: 'Marc D., Membre du collectif (Québec)',
      t2: "« Le simulateur d'échantillonnage et les fiches PDF m'ont fait économiser des semaines de tests sur mon matériel. Merci l'équipe ! »",
      t2Author: 'Stéphane L., Astrophotographe amateur',
    },
    en: {
      title: 'Astroberb Academy',
      subtitle: 'The Amateur Astronomers Collective — Master Deep Sky',
      heroBadge: '⚡ SPECIAL PROMO • ALL FIELD EXPERTISE',
      heroDesc: 'Welcome to our platform! We are a group of astronomy enthusiasts sharing our field tips: optical formulas, strainwave mounts (Juwei-17, UMi-17S, AM5), N.I.N.A./ASIAIR automation, and PixInsight & Siril processing.',
      benefitsTitle: 'What you will be able to do after the courses',
      benefit1Title: 'Master your gear',
      benefit1Desc: 'No more headaches with backfocus, tilt, or filter selection. Assemble a rigid and perfectly tuned optical train.',
      benefit2Title: 'Automate your nights',
      benefit2Desc: 'Program sessions from A to Z (plate solving, EAF autofocus, meridian flip, PHD2 guiding) to sleep with peace of mind.',
      benefit3Title: 'Enhance your images',
      benefit3Desc: 'Capture galaxies and nebulae worthy of top observatories using GraXpert, SPCC, and GHS stretching.',
      videoSectionBadge: '🎬 Meet Our Collective',
      videoSectionTitle: 'Welcome to Our Virtual Observatory!',
      videoSectionSub: 'Grab a hot coffee: we take you behind the scenes of how we prepare our deep-sky observation nights from A to Z.',
      modulesVideoBadge: '🚀 Modules Preview',
      modulesVideoTitle: 'What We Share With You in Our Masterclasses',
      modulesVideoSub: 'Watch our exclusive video showcasing our interactive tools and simulators.',
      originStoryTitle: '🔭 The Original Idea Behind Our Collective',
      originStoryText: "The original idea behind Astroberb is to gather all our tips, tricks, and knowledge in one single place, accessible at all times, especially during astronomy sessions. To make deepening your knowledge in astronomy and astrophotography more enjoyable, and all of that, in complete simplicity!",
      phase1Badge: '1. BEFORE THE NIGHT',
      phase1Desc: 'Pixel scale calculation, 55mm backfocus & harmonic mount balancing.',
      phase2Badge: '2. DURING THE NIGHT',
      phase2Desc: 'Polar alignment, N.I.N.A./ASIAIR sequencing, EAF autofocus & PHD2 guiding.',
      phase3Badge: '3. AFTER THE NIGHT',
      phase3Desc: 'Calibration frames, GraXpert AI, SPCC & GHS stretching (Siril / PixInsight).',
      trustBadge: '⭐ Rated 4.9/5 by our community of enthusiasts',
      catalog: 'Course Catalog',
      vipSection: 'Member Access / Code',
      glossaryNav: '📖 Astro Glossary',
      fieldModeBtn: '🌙 Field Mode (Nomad)',
      exitFieldMode: '✕ Exit Field Mode',
      unlockBtn: 'Activate Code',
      buyStripe: 'Credit Card',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Get Full Bundle ($49.99 CAD)',
      packBtnShort: '⚡ SUPER PROMO: Full Bundle ($49.99)',
      freePreviewBtn: '👁️ Try Free Demo (Simulator + Chapter 1)',
      previewBannerTitle: '👁️ FREE PREVIEW MODE — Module 1',
      previewBannerDesc: 'Test our pixel scale simulator and Chapter 1! Take advantage of our special promo to unlock full access.',
      accessGranted: 'Code validated! Click any unlocked course below:',
      invalidCode: 'Invalid access code. Please check your email or contact support.',
      accessCourse: '🚀 START MASTERCLASS',
      lockedBadge: '🔒 Locked Module',
      unlockedBadge: '🔓 Unlocked (Click to launch)',
      backToCatalog: '← Back to course catalog',
      paymentConfirmedModule: '🎉 Access unlocked! Your multi-device backup code: ',
      copyBtn: '📋 Copy code',
      copiedBtn: '✅ Copied!',
      progressLabel: 'Your curriculum progress:',
      interactiveModule: 'Pedagogical Studio & Masterclass',
      studioHeader: 'Interactive Slides & Collective Pro Tips',
      fullCourseTitle: 'In-Depth Theoretical Course & Field Notes',
      tutorialSteps: 'Operational Protocol & Personal Checklist',
      resourcesPdf: 'PDF Technical Sheets (Printable A4 Generator)',
      generatePdfBtn: 'Generate & Download PDF',
      successBadge: 'Payment Successful',
      successTitle: 'Welcome to the Astroberb Academy Family!',
      successDesc: 'Your full bundle is unlocked. Enjoy immediate access to all 7 modules, simulators, and guides.',
      backupCodeNotice: 'IMPORTANT — Save your multi-device backup code:',
      packTitle: '⚡ COLLECTIVE SPECIAL: 7-in-1 Full Bundle',
      packDesc: 'Join our community with lifetime access to all 7 complete masterclasses, 6 interactive calculators, and PDF field guides.',
      payCardStripe: '💳 Secure Credit Card (Stripe)',
      payWithPaypal: '🅿️ Pay instantly with PayPal',
      vipDesc: 'Enter your personal access code received after purchase to instantly unlock your courses on this device:',
      vipPlaceholder: 'Your code (e.g., PACK-COMPLET-2026 or ASTRO-MOD1)',
      viewUnlocked: 'View my unlocked modules ➔',
      taxNotice: '🔒 100% Secure Checkout via Stripe & PayPal — Instant lifetime access.',
      footerRights: 'All rights reserved.',
      termsLink: 'Terms of Sale (TOS)',
      privacyLink: 'Privacy Policy',
      contactSupport: 'Collective Support',
      closeBtn: 'Close',
      prevSlide: '◀ Previous Chapter',
      nextSlide: 'Next Chapter ▶',
      proTipLabel: '💡 Team Pro Tip:',
      quickAccessTitle: '⚡ Direct access to your unlocked courses:',
      calcTitle: '🧮 Optical Simulator: Pixel Scale & Seeing Calculator',
      calcFocalLabel: 'Effective Telescope Focal Length (mm):',
      calcPixelLabel: 'Camera Pixel Size (µm):',
      calcResult: 'Your Pixel Scale: ',
      calcVerdictGreat: "✨ Optimal (0.8'' to 2.0''/px)! Your sensor is well matched to typical atmospheric seeing for sharp details.",
      calcVerdictOver: "⚠️ Oversampled (< 0.8''/px): Magnifying atmospheric turbulence without extra resolution.",
      calcVerdictUnder: "⚠️ Undersampled (> 2.0''/px): Great widefield framing for large nebulae.",
      calcTorqueTitle: '⚖️ Mechanical Simulator: Harmonic Mount Torque & Counterweight (Juwei-17 / UMi-17S / AM5)',
      calcPayloadLabel: 'Total Rigged Payload Weight (kg):',
      calcRadiusLabel: 'Center of Gravity Offset from RA Axis (cm):',
      calcTorqueResult: 'Torque Load on Strainwave Gear: ',
      calcFocusTitle: '🔬 EAF Simulator: Critical Focus Zone (CFZ)',
      calcFocusFDLabel: 'Telescope Focal Ratio (f/D):',
      calcFocusStepLabel: 'Focuser Travel per Step (µm/step):',
      calcFocusResult: 'Critical Focus Zone Tolerance (CFZ): ',
      calcFocusAdvice: 'Recommended EAF step size for V-Curve autofocus: ',
      calcExpTitle: '⏱️ CMOS Simulator: Optimal Sub-Exposure Calculator (Swamp Factor)',
      calcBortleLabel: 'Sky Darkness (Bortle Scale 1 to 9):',
      calcFilterLabel: 'Filter Type:',
      calcExpResult: 'Recommended Sub-Exposure (at f/5, Gain 100): ',
      calcCompareTitle: '🎨 Interactive Before / After: Raw Linear Stack vs. Final Processed (GraXpert + SPCC + GHS)',
      calcNpfTitle: '📸 Widefield Simulator: NPF Rule Untracked Exposure Calculator',
      calcNpfFocalLabel: 'Camera Lens Focal Length (mm):',
      calcNpfApertureLabel: 'Lens Aperture (f/):',
      calcNpfResult: 'Max Untracked Exposure: ',
      quizTitle: '📝 Knowledge Validation Quiz',
      quizSubmit: 'Submit Answers',
      quizScore: 'Your Score: ',
      quizRetry: 'Reset Quiz',
      correctAnswer: '✅ Correct!',
      wrongAnswer: '❌ Incorrect.',
      markComplete: '✓ Mark module as completed',
      markIncomplete: '✓ Completed (Click to undo)',
      certTitle: '🏆 Download My Official Certificate',
      certNamePlaceholder: 'Enter your Full Name for the diploma',
      faqTitle: '❓ Frequently Asked Questions (FAQ)',
      faq1Q: 'Is this curriculum suitable for complete beginners?',
      faq1A: 'Yes! We designed each module starting from simple fundamentals before stepping up to advanced techniques.',
      faq2Q: 'What format are the courses in and how long do I have access?',
      faq2A: 'Access is immediate, unlimited, and lifetime directly from your browser on PC, Mac, tablet, or mobile. You can also view and print your A4 PDF technical sheets in the field whenever you need them!',
      faq3Q: 'Can I use this platform in the field at night?',
      faq3A: 'Yes! Toggle the Night Mode button in the top bar to switch the entire interface to deep red wavelengths.',
      testimonialsTitle: '⭐ What our community members say',
      t1: "« Thanks to the collective's advice on harmonic mounts and N.I.N.A., my RMS guiding dropped below 0.6''! »",
      t1Author: 'Marc D., Community Member (Quebec)',
      t2: "« The sampling simulator and PDF guides saved me weeks of testing. Thanks team! »",
      t2Author: 'Stéphane L., Amateur Astrophotographer',
    },
  };

  const currentT = t[lang];

  const paymentLinks = {
    module1: {
      stripe: 'https://buy.stripe.com/5kQ3cobAhfqab6T8dO7EQ01',
      paypal: 'https://www.paypal.com/ncp/payment/LMB2SKR5RZWKC',
    },
    module2: {
      stripe: 'https://buy.stripe.com/cNiaEQ1ZH91Mgrd0Lm7EQ02',
      paypal: 'https://www.paypal.com/ncp/payment/8Z9ZB45RMLB3U',
    },
    module3: {
      stripe: 'https://buy.stripe.com/3cI5kwbAh2Do3ErgKk7EQ03',
      paypal: 'https://www.paypal.com/ncp/payment/AFDTR97B9X2FA',
    },
    module4: {
      stripe: 'https://buy.stripe.com/cNi00c33L3Hsej551C7EQ04',
      paypal: 'https://www.paypal.com/ncp/payment/EGRE68P5BA67U',
    },
    module5: {
      stripe: 'https://buy.stripe.com/bJeeV6eMtcdYcaXcu47EQ05',
      paypal: 'https://www.paypal.com/ncp/payment/25J3HYPPFY574',
    },
    module6: {
      stripe: 'https://buy.stripe.com/6oU3cocElb9Udf179K7EQ06',
      paypal: 'https://www.paypal.com/ncp/payment/W8TSC7CLEJKXJ',
    },
    bonus: {
      stripe: 'https://buy.stripe.com/00w4gsawdb9U3Erbq07EQ07',
      paypal: 'https://www.paypal.com/ncp/payment/9EZATTGH4W2GE',
    },
    packIntegral: {
      stripe: 'https://buy.stripe.com/14A6oA1ZHa5Qb6T79K7EQ08',
      paypal: 'https://www.paypal.com/ncp/payment/ZWL6BDVYDR5XG',
    },
  };

  const modules = [
    {
      id: 1,
      backupCode: 'ASTRO-MOD1',
      titleFr: 'Module 1 : Choisir son Télescope & ses Optiques',
      titleEn: 'Module 1: Choosing Your Telescope & Optics',
      priceDisplay: '9,99 $',
      price: 9.99,
      badgeFr: '⚡ SUPER PROMO',
      badgeEn: '⚡ SPECIAL PROMO',
      descFr: 'Lunettes apochromatiques (Triplet ED), Newton, Ritchey-Chrétien : formules optiques, échantillonnage, backfocus 55 mm et correction du tilt.',
      descEn: 'Apochromatic refractors (ED Triplet), Newtonian, Ritchey-Chrétien: optical designs, pixel scale, 55mm backfocus, and sensor tilt.',
      image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module1,
      calculatorType: 'sampling' as CalculatorType,
      content: {
        fr: {
          intro: "Le choix du tube optique détermine 80 % de notre réussite sur le terrain et le type d'objets célestes accessibles. Que vous débutiez avec une lunette apochromatique ou que vous optimisiez un télescope à miroir rapide, ce module vous donne toutes les clés mathématiques, physiques et mécaniques.",
          slides: [
            {
              title: "Chapitre 1 : Focale vs Rapport d'ouverture (f/D)",
              subtitle: "Comprendre le cadrage et la vitesse photographique d'un instrument",
              bullets: [
                'Débutant : La longueur focale (ex: 400 mm vs 1200 mm) agit comme le zoom : elle détermine uniquement la taille de la nébuleuse ou galaxie sur votre capteur.',
                "Le rapport d'ouverture (f/D = Focale ÷ Diamètre) agit comme l'ouverture d'un objectif photo : il dicte la vitesse à laquelle les photons s'accumulent sur chaque pixel.",
                'Règle du carré : Passer de f/8 à f/4 concentre 4 fois plus de lumière ! Une pose de 1 heure à f/4 équivaut à 4 heures de pose à f/8.',
              ],
              proTip: 'Pour débuter sans frustration, choisissez une lunette apochromatique de 300 à 500 mm de focale ouverte entre f/4.5 et f/5.5 grâce à son réducteur-aplanisseur dédié.',
            },
            {
              title: 'Chapitre 2 : Comparatif des Formules Optiques',
              subtitle: 'Lunette APO (Triplet/Petzval), Newton, Schmidt-Cassegrain & RC',
              bullets: [
                'Lunette Apochromatique (Triplet ED / Petzval) : Sans collimation, contraste maximal, idéale pour les grands champs de nébuleuses. Le Petzval intègre déjà le correcteur sans calcul de backfocus !',
                'Télescope de Newton (f/4 ou f/5) : Le meilleur rapport diamètre/prix et très rapide photographiquement, mais exige un correcteur de coma, une collimation laser/Cheshire rigoureuse et une prise au vent maîtrisée.',
                'Schmidt-Cassegrain (EdgeHD) & Ritchey-Chrétien (RC) : Longues focales (1000 à 2000 mm) taillées pour les petites galaxies (comme NGC 7331 ou M51) et nébuleuses planétaires.',
              ],
              proTip: "Si vous imagez en nomade, un quadruplet Petzval (type Askar FRA / RedCat) ou un triplet de 70-80 mm vous fait gagner 30 minutes d'installation chaque nuit.",
            },
            {
              title: 'Chapitre 3 : Backfocus 55 mm, Courbure de Champ & Tilt',
              subtitle: "L'alignement mécanique au dixième de millimètre",
              bullets: [
                "Le Backfocus est le tirage mécanique exact entre l'épaulement arrière du réducteur/correcteur et la surface du capteur CMOS (standard universel : 55,0 mm).",
                'Diagnostic visuel dans les coins : Si les étoiles des 4 coins filent vers le centre (en rayons de vélo), le capteur est TROP PROCHE du correcteur (ajoutez 0.5 à 1 mm de bague).',
                "Si les étoiles des coins tournent autour du centre (en arc de cercle), le capteur est TROP LOIN du correcteur (retirez une rondelle de calage). Si un seul coin est flou, il s'agit de Tilt (inclinaison mécanique).",
              ],
              proTip: "Si vous insérez un filtre de 2 mm d'épaisseur dans votre train optique, ajoutez +0,67 mm (1/3 de l'épaisseur du verre) à votre distance de backfocus cible (soit 55,7 mm).",
            },
          ] as Slide[],
          courseSections: [
            {
              heading: "1. La Physique de l'Échantillonnage et le Critère de Nyquist-Shannon",
              body: "L'échantillonnage (exprimé en secondes d'arc par pixel, ''/px) mesure la portion de ciel capturée par un seul photosite de votre caméra. L'atmosphère terrestre brouille les détails fins : c'est le Seeing (généralement entre 2,0'' et 3,0'' sous nos latitudes). Pour capturer 100 % des détails permis par le ciel sans étaler inutilement la lumière, votre échantillonnage doit se situer autour du tiers ou de la moitié du Seeing moyen, soit entre 0,8''/px et 2,0''/px.",
              highlight: "Formule fondamentale : Échantillonnage (''/px) = (206,265 × Taille_Pixel_µm) ÷ Focale_mm",
            },
          ] as LessonSection[],
          steps: [
            "1. Calculer son échantillonnage dans le simulateur ci-dessus pour viser la plage optimale de 0,8'' à 2,0'' par pixel.",
            '2. Assembler le train optique 100 % vissé (M48/M54) et mesurer les 55,0 mm de backfocus au pied à coulisse.',
            '3. Inspecter la forme des étoiles dans les 4 coins sur une pose test de 10 secondes.',
          ],
          quiz: [
            {
              question: "Quel paramètre détermine la vitesse photographique pure d'un télescope ?",
              options: [
                'La longueur focale en millimètres uniquement',
                "Le rapport d'ouverture f/D (Focale divisée par le Diamètre)",
                'La longueur du pare-buée',
              ],
              correct: 1,
              explanation: 'Le rapport f/D dicte la concentration de photons par unité de surface sur le capteur.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod1-pdf1',
              name: "Abaque d'Échantillonnage Optique & Diagnostic Backfocus 55 mm (PDF)",
              title: 'Guide de Référence : Échantillonnage, Formules Optiques & Backfocus 55 mm',
              sections: [
                {
                  title: '1. Formule Mathématique & Cibles de Seeing',
                  content: [
                    "Formule officielle : Échantillonnage (''/px) = (206,265 × Taille du pixel en µm) ÷ Focale effective en mm.",
                    "Ciel standard (Seeing 2.5'' - 3.0'') : Visez entre 1.0''/px et 2.0''/px pour un équilibre idéal.",
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro: 'Your optical tube assembly dictates 80% of your field experience and target framing. Whether starting with an apochromatic refractor or tuning a fast reflector, this module covers essential optical math and mechanical precision.',
          slides: [
            {
              title: 'Chapter 1: Focal Length vs. Focal Ratio (f/D)',
              subtitle: 'Understanding field of view and photographic speed',
              bullets: [
                'Beginner: Focal length (e.g., 400mm vs. 1200mm) determines magnification and field of view on your sensor.',
                'Focal ratio (f/D = Focal Length ÷ Aperture) dictates photographic speed—how fast photons accumulate on each pixel.',
                'Inverse square law: Moving from f/8 to f/4 concentrates 4x more light, cutting required exposure time by a factor of 4!',
              ],
              proTip: 'For stress-free deep-sky imaging, start with a 300mm to 500mm apochromatic refractor operating between f/4.5 and f/5.5.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Pixel Scale Physics & Atmospheric Seeing',
              body: "Pixel scale (arcseconds per pixel, ''/px) measures the angular resolution of each camera pixel. Earth's atmosphere blurs fine detail (Seeing, typically 2.0'' to 3.0'').",
              highlight: "Core Formula: Pixel Scale (''/px) = (206.265 × Pixel_Size_µm) ÷ Focal_Length_mm",
            },
          ] as LessonSection[],
          steps: [
            "1. Calculate your pixel scale in the simulator above to target 0.8'' to 2.0'' per pixel.",
            '2. Assemble a fully threaded M48/M54 optical train and verify 55.0mm backfocus.',
          ],
          quiz: [
            {
              question: "What parameter determines a telescope's pure photographic speed?",
              options: [
                'Focal length in millimeters alone',
                'Focal ratio (f/D)',
                'Dew shield length',
              ],
              correct: 1,
              explanation: 'Focal ratio (f/D) controls photon concentration per unit area on the sensor.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod1-pdf1-en',
              name: 'Optical Pixel Scale & 55mm Backfocus Diagnostic Chart (PDF)',
              title: 'Optical Pixel Scale Reference & 55mm Backfocus Guide',
              sections: [
                {
                  title: '1. Mathematical Formula & Seeing Targets',
                  content: [
                    "Formula: Pixel Scale (''/px) = (206.265 × Pixel Size in µm) ÷ Effective Focal Length in mm.",
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
      },
    },
    {
      id: 2,
      backupCode: 'ASTRO-MOD2',
      titleFr: 'Module 2 : Montures Harmoniques & Mise en Station',
      titleEn: 'Module 2: Harmonic Mounts & Polar Alignment',
      priceDisplay: '9,99 $',
      price: 9.99,
      badgeFr: '⚡ SUPER PROMO',
      badgeEn: '⚡ SPECIAL PROMO',
      descFr: "Maîtriser les montures à réducteurs harmoniques (Juwei-17, Proxisky UMi-17S, ZWO AM5) et l'alignement polaire sub-arcminute.",
      descEn: 'Master strainwave harmonic mounts (Juwei-17, Proxisky UMi-17S, ZWO AM5) and sub-arcminute polar alignment.',
      image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module2,
      calculatorType: 'torque' as CalculatorType,
      content: {
        fr: {
          intro: "La monture équatoriale est le cœur battant de votre setup nomade ou fixe. L'avènement des réducteurs harmoniques (Strainwave Gear comme les Juwei-17, Proxisky UMi-17S ou ZWO AM5) a redéfini les standards de portabilité et de charge utile.",
          slides: [
            {
              title: 'Chapitre 1 : Vis sans fin vs Réducteur Harmonique (Strainwave)',
              subtitle: 'Pourquoi la technologie harmonique a tout changé',
              bullets: [
                'Montures classiques (EQ6-R, HEQ5) : Utilisent une roue dentée et une vis sans fin. Très douces, mais lourdes et nécessitent de lourds contrepoids.',
                "Montures Harmoniques (Juwei-17, UMi-17S, AM5) : Une couronne flexible s'engrène dans une couronne rigide avec un couple phénoménal.",
                "Résultat : Une tête de monture de 4 à 5 kg porte 13 à 18 kg d'équipement SANS contrepoids et avec zéro jeu d'inversion en déclinaison !",
              ],
              proTip: 'Au-delà de 12 kg de charge utile, ajoutez tout de même une petite barre et un contrepoids de 3 à 5 kg pour éviter le basculement du trépied !',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Comparatif Technique : Juwei-17, Proxisky UMi-17S et ZWO AM5',
              body: "Les montures Juwei-17 et Proxisky UMi-17S utilisent des réducteurs harmoniques de taille 17 sur les deux axes, couplés à une courroie synchrone et un contrôleur OnStep. Elles intègrent un frein électromagnétique à manque de courant.",
              highlight: 'Sécurité absolue : Toujours alimenter la monture en 12V - 5A stable et lester le trépied au centre.',
            },
          ] as LessonSection[],
          steps: ['1. Orienter le trépied vers le Nord, le mettre de niveau et suspendre un poids de lestage.'],
          quiz: [
            {
              question: 'Quelle durée de pose dote un autoguidage PHD2 performant sur une monture harmonique ?',
              options: ['De 0,5 seconde à 1,0 seconde', 'De 5 à 10 secondes', "Aucun autoguidage n'est nécessaire"],
              correct: 0,
              explanation: "L'erreur périodique des réducteurs harmoniques exige une fréquence de correction élevée (0,5s à 1,0s).",
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1',
              name: 'Checklist Terrain : Montures Harmoniques & Mise en Station (PDF)',
              title: 'Protocole Opérationnel : Juwei-17 / UMi-17S / AM5 & Alignement Polaire',
              sections: [{ title: '1. Sécurité Mécanique', content: ['Lestage obligatoire du trépied carbone.'] }],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro: 'Your equatorial mount is the beating heart of your rig. Strainwave harmonic mounts have revolutionized portable imaging.',
          slides: [
            {
              title: 'Chapter 1: Worm Gears vs. Strainwave Harmonic Drives',
              subtitle: 'High torque, zero backlash, no counterweights',
              bullets: ['Harmonic mounts carry heavy payloads without heavy counterweights.'],
              proTip: 'For heavy payloads, add a small 3-5kg counterweight for extra safety.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Hardware Deep Dive',
              body: 'Strainwave reducers provide exceptional portability.',
              highlight: 'Safety Rule: Always ballast your tripod.',
            },
          ] as LessonSection[],
          steps: ['1. Point tripod North and level.'],
          quiz: [
            {
              question: 'What guide exposure duration is recommended for strainwave harmonic mounts?',
              options: ['0.5 to 1.0 second', '5 to 10 seconds', 'Guiding is not needed'],
              correct: 0,
              explanation: 'Fast periodic error slopes on harmonic drives require frequent 0.5s - 1.0s guide pulses.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1-en',
              name: 'Field Checklist: Harmonic Mounts & Polar Alignment (PDF)',
              title: 'Operational Protocol',
              sections: [{ title: '1. Mechanical & Power Safety', content: ['Mandatory tripod ballast.'] }],
            },
          ] as DownloadDoc[],
        },
      },
    },
    {
      id: 3,
      backupCode: 'ASTRO-MOD3',
      titleFr: 'Module 3 : Acquisition Automatisée (ASIAIR & N.I.N.A.)',
      titleEn: 'Module 3: Automated Acquisition (ASIAIR & N.I.N.A.)',
      priceDisplay: '9,99 $',
      price: 9.99,
      badgeFr: '⚡ SUPER PROMO',
      badgeEn: '⚡ SPECIAL PROMO',
      descFr: 'Automatisez 100 % de votre nuit : astrométrie ASTAP, Plate Solving, séquenceur avancé, Dithering et retournement au méridien.',
      descEn: 'Automate 100% of your night: ASTAP astrometry, Plate Solving, advanced sequencer, Dithering, and Meridian Flip.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module3,
      calculatorType: 'none' as CalculatorType,
      content: {
        fr: {
          intro: "Pourquoi passer la nuit dehors par -10°C alors qu'un mini-PC sous N.I.N.A. ou un boîtier ASIAIR peut tout orchestrer au pixel près ?",
          slides: [
            {
              title: 'Chapitre 1 : Plate Solving Astrométrique (ASTAP)',
              subtitle: 'Centrer une nébuleuse invisible en moins de 3 secondes',
              bullets: ['Le solveur mesure les triangles stellaires et trouve les coordonnées exactes à 0.1 arc-sec près.'],
              proTip: 'Renseignez toujours la focale exacte dans votre profil logiciel.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. ZWO ASIAIR vs Mini-PC N.I.N.A.',
              body: 'ASIAIR offre une simplicité clé en main, tandis que N.I.N.A. sur Mini-PC offre une liberté multi-marques totale.',
              highlight: 'ASIAIR = Simplicité | N.I.N.A. = Liberté totale',
            },
          ] as LessonSection[],
          steps: ['1. Installer ASTAP et le catalogue D50.'],
          quiz: [
            {
              question: 'Quelle est la cause numéro 1 d’un échec du Plate Solving ?',
              options: ['Une focale ou taille de pixel mal renseignée', 'Un filtre manquant', 'Une batterie chargée'],
              correct: 0,
              explanation: 'Le solveur a besoin de paramètres de champ exacts.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1',
              name: 'Architecture de Séquence N.I.N.A. & ASIAIR (PDF)',
              title: 'Blueprint Complet',
              sections: [{ title: '1. Démarrage', content: ['Refroidissement caméra et Plate Solve.'] }],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro: 'Automate your dusk-to-dawn imaging sessions using N.I.N.A. or ASIAIR.',
          slides: [
            {
              title: 'Chapter 1: Astrometric Plate Solving',
              subtitle: 'Centering targets automatically',
              bullets: ['ASTAP matches star patterns in seconds.'],
              proTip: 'Always verify your focal length in settings.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. ASIAIR vs N.I.N.A.',
              body: 'Choose based on your hardware preferences.',
              highlight: 'Turnkey vs Open flexibility.',
            },
          ] as LessonSection[],
          steps: ['1. Install ASTAP and D50 catalog.'],
          quiz: [
            {
              question: 'What is the #1 cause of Plate Solving failure?',
              options: ['Incorrect focal length or pixel size', 'Missing filter', 'Full battery'],
              correct: 0,
              explanation: 'Accurate field of view parameters are essential.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1-en',
              name: 'N.I.N.A. & ASIAIR Sequence Blueprint (PDF)',
              title: 'Sequence Architecture',
              sections: [{ title: '1. Startup', content: ['Cool camera and plate solve.'] }],
            },
          ] as DownloadDoc[],
        },
      },
    },
    {
      id: 4,
      backupCode: 'ASTRO-MOD4',
      titleFr: 'Module 4 : Caméras Refroidies & Filtres Bande Étroite',
      titleEn: 'Module 4: Cooled Cameras & Narrowband Filters',
      priceDisplay: '9,99 $',
      price: 9.99,
      badgeFr: '⚡ SUPER PROMO',
      badgeEn: '⚡ SPECIAL PROMO',
      descFr: 'Capteurs CMOS (IMX533, IMX571), Gain HCG, Darks/Flats/Bias et imagerie SHO (Palette Hubble) ou Dual-Band HOO en ville.',
      descEn: 'CMOS sensors (IMX533, IMX571), HCG Gain, Darks/Flats/Bias, and SHO (Hubble Palette) or Dual-Band HOO city imaging.',
      image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module4,
      calculatorType: 'exposure' as CalculatorType,
      content: {
        fr: {
          intro: "Photographier des nébuleuses depuis un jardin en pleine ville (Bortle 7-8) est possible grâce aux capteurs CMOS refroidis et aux filtres à bande étroite.",
          slides: [
            {
              title: 'Chapitre 1 : Capteurs CMOS Refroidis & Gain HCG',
              subtitle: 'Comprendre les courbes des capteurs Sony',
              bullets: ['Le refroidissement à -10°C réduit drastiquement le bruit thermique.'],
              proTip: 'Gardez une puissance Peltier stable entre 40% et 70%.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Capteurs IMX533 / IMX571',
              body: 'Ces capteurs modernes disposent d’un rendement quantique élevé et d’un bruit de lecture minime.',
              highlight: 'Gain = 100 | Offset = 50 | Temp = -10°C',
            },
          ] as LessonSection[],
          steps: ['1. Configurer la caméra sur le mode HCG.'],
          quiz: [
            {
              question: 'Que se passe-t-il au gain 100 (HCG) sur un capteur IMX571 ?',
              options: ['Le bruit de lecture chute drastiquement', 'La taille des pixels double', 'La caméra chauffe'],
              correct: 0,
              explanation: 'Le mode HCG active un amplificateur interne réduisant le bruit.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod4-pdf1',
              name: 'Abaque Gain CMOS, Temps de Pose & Calibration (PDF)',
              title: 'Référence Capteurs CMOS',
              sections: [{ title: '1. Réglages', content: ['Gain 100, Offset 50, -10°C.'] }],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro: 'Capture breathtaking nebulae from light-polluted city backyards using TEC-cooled CMOS cameras.',
          slides: [
            {
              title: 'Chapter 1: Cooled CMOS & HCG Gain',
              subtitle: 'Mastering Sony sensor physics',
              bullets: ['TEC cooling at -10°C drastically cuts thermal noise.'],
              proTip: 'Keep TEC power stable.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Modern Zero-Amp-Glow Sensors',
              body: 'Starvis sensors offer high quantum efficiency and low read noise.',
              highlight: 'Gain = 100 | Offset = 50 | Temp = -10°C',
            },
          ] as LessonSection[],
          steps: ['1. Set camera to HCG gain.'],
          quiz: [
            {
              question: 'What happens electronically at Gain 100 (HCG mode)?',
              options: ['Read noise drops sharply', 'Pixel size doubles', 'Cooling shuts off'],
              correct: 0,
              explanation: 'High Conversion Gain reduces read noise significantly.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod4-pdf1-en',
              name: 'CMOS Gain, Sub-Exposure & Calibration Reference (PDF)',
              title: 'Sensor Reference Guide',
              sections: [{ title: '1. Settings', content: ['Gain 100, Offset 50, -10°C.'] }],
            },
          ] as DownloadDoc[],
        },
      },
    },
    {
      id: 5,
      backupCode: 'ASTRO-MOD5',
      titleFr: 'Module 5 : Autofocus EAF & Autoguidage PHD2',
      titleEn: 'Module 5: EAF Autofocus & PHD2 Guiding',
      priceDisplay: '9,99 $',
      price: 9.99,
      badgeFr: '⚡ SUPER PROMO',
      badgeEn: '⚡ SPECIAL PROMO',
      descFr: 'Obtenir des étoiles ponctuelles : courbe en V (HFR), calcul de la CFZ, compensation du backlash et suivi PHD2 sub-arcseconde.',
      descEn: 'Achieve pinpoint stars: V-curve autofocus (HFR), CFZ calculation, backlash compensation, and sub-arcsecond PHD2 guiding.',
      image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module5,
      calculatorType: 'focus' as CalculatorType,
      content: {
        fr: {
          intro: "Maîtrisez l'Autofocus motorisé (EAF) et le calibrage de PHD2 Guiding pour des étoiles d'une finesse absolue.",
          slides: [
            {
              title: 'Chapitre 1 : La Courbe en V (Autofocus EAF & HFR)',
              subtitle: 'Une mise au point au micron près',
              bullets: ['Le moteur ajuste le foyer en mesurant le HFR sur tout le champ stellaire.'],
              proTip: 'Réglez un pas de focalisation adapté à votre rapport f/D.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. La Zone Critique de Mise au Point (CFZ)',
              body: 'La CFZ représente la tolérance de mise au point. Sur un instrument ouvert à f/4, elle est extrêmement fine.',
              highlight: 'À f/4 : CFZ = 43 µm | À f/7 : CFZ = 131 µm',
            },
          ] as LessonSection[],
          steps: ['1. Calculer la CFZ et configurer l’EAF.'],
          quiz: [
            {
              question: 'Comment évolue la tolérance de mise au point (CFZ) avec un télescope à f/4 au lieu de f/8 ?',
              options: ['Elle devient 4 fois plus étroite et exigeante', 'Elle devient 10 fois plus large', 'Aucun impact'],
              correct: 0,
              explanation: 'La CFZ est proportionnelle au carré du rapport f/D.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod5-pdf1',
              name: 'Abaque Réglages EAF & Diagnostic PHD2 Guiding (PDF)',
              title: 'Guide de Terrain : EAF & PHD2',
              sections: [{ title: '1. V-Curve', content: ['Utiliser la méthode Overshoot.'] }],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro: 'Master motorized EAF V-curves and surgical PHD2 guiding for pinpoint stars.',
          slides: [
            {
              title: 'Chapter 1: V-Curve Autofocus',
              subtitle: 'Micron-level automated focus',
              bullets: ['The EAF moves stepper increments while measuring star HFR.'],
              proTip: 'Set proper step size.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Critical Focus Zone (CFZ)',
              body: 'CFZ is the narrow focal depth where optics remain diffraction-limited.',
              highlight: 'At f/4: CFZ = 43 µm | At f/7: CFZ = 131 µm',
            },
          ] as LessonSection[],
          steps: ['1. Calculate CFZ in simulator.'],
          quiz: [
            {
              question: 'How does CFZ change when switching from f/8 to a fast f/4 telescope?',
              options: ['Focus tolerance becomes 4 times narrower', 'Focus zone becomes wider', 'No effect'],
              correct: 0,
              explanation: 'CFZ scales with the square of the focal ratio.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod5-pdf1-en',
              name: 'EAF V-Curve & PHD2 Harmonic Mount Settings (PDF)',
              title: 'Field Guide',
              sections: [{ title: '1. Settings', content: ['Use overshoot backlash compensation.'] }],
            },
          ] as DownloadDoc[],
        },
      },
    },
    {
      id: 6,
      backupCode: 'ASTRO-MOD6',
      titleFr: 'Module 6 : Traitement Avancé (Siril, PixInsight & PS)',
      titleEn: 'Module 6: Advanced Processing (Siril, PixInsight & PS)',
      priceDisplay: '9,99 $',
      price: 9.99,
      badgeFr: '⚡ SUPER PROMO',
      badgeEn: '⚡ SPECIAL PROMO',
      descFr: "De l'empilement brut au chef-d'œuvre : GraXpert AI, SPCC, déconvolution, Starless et GHS.",
      descEn: 'From raw stack to masterpiece: GraXpert AI, SPCC, deconvolution, Starless, and GHS.',
      image: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module6,
      calculatorType: 'compare' as CalculatorType,
      content: {
        fr: {
          intro: "L'acquisition ne représente que 50 % d'une astrophoto : maîtrisez le workflow moderne Siril & PixInsight pour sublimer vos images.",
          slides: [
            {
              title: 'Chapitre 1 : Prétraitement & Stade Linéaire Pur',
              subtitle: 'GraXpert AI, SPCC et calibration colorimétrique',
              bullets: ['Traitez toujours vos images au stade linéaire avant d’étirer l’histogramme.'],
              proTip: 'Recadrez toujours les bords d’empilement avant d’extraire les gradients.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Étude de Cas : Traitement d’une Galaxie Spirale',
              body: 'Les galaxies demandent un étirement minutieux avec GHS et une protection des hautes lumières.',
              highlight: 'Formule PixelMath : ~((~starless) * (~stars))',
            },
          ] as LessonSection[],
          steps: ['1. Empiler, recadrer et extraire les gradients.'],
          quiz: [
            {
              question: 'Pourquoi faut-il recadrer les bords d’empilement avant GraXpert ?',
              options: ['Pour éviter que les bordures sombres faussent le modèle de gradient', 'Pour agrandir les étoiles', 'Obligatoire pour les fichiers FITS'],
              correct: 0,
              explanation: 'Les bordures de dithering ont un signal faible qui perturbe le calcul.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod6-pdf1',
              name: 'Mémento Workflow Complet Siril & PixInsight (PDF)',
              title: 'Checklist de Traitement Astrophysique',
              sections: [{ title: '1. Linéaire', content: ['Crop -> GraXpert -> SPCC -> Starless'] }],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro: 'Master the modern Siril & PixInsight workflow from raw stack to breathtaking masterpiece.',
          slides: [
            {
              title: 'Chapter 1: Linear Stage Processing',
              subtitle: 'GraXpert AI, SPCC, and calibration',
              bullets: ['Process data while in the linear state before stretching.'],
              proTip: 'Always crop dithered borders first.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Processing Spiral Galaxies',
              body: 'Manage extreme dynamic range using GHS and highlight protection.',
              highlight: 'PixelMath Screen Blend: ~((~starless) * (~stars))',
            },
          ] as LessonSection[],
          steps: ['1. Stack, crop and remove gradients.'],
          quiz: [
            {
              question: 'Why crop stacking borders before gradient extraction?',
              options: ['Low-signal dithered borders distort background models', 'To make stars larger', 'Required for FITS'],
              correct: 0,
              explanation: 'Edge overlap artifacts distort background models.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod6-pdf1-en',
              name: 'Complete Siril & PixInsight Workflow (PDF)',
              title: 'Processing Checklist',
              sections: [{ title: '1. Linear', content: ['Crop -> GraXpert -> SPCC -> Starless'] }],
            },
          ] as DownloadDoc[],
        },
      },
    },
    {
      id: 7,
      backupCode: 'ASTRO-MOD7',
      titleFr: 'Module Bonus : Setup Nomade & Grand Champ',
      titleEn: 'Bonus Module: Travel Setup & Widefield Milky Way',
      priceDisplay: '9,99 $',
      price: 9.99,
      badgeFr: '⚡ SUPER PROMO',
      badgeEn: '⚡ SPECIAL PROMO',
      descFr: 'Voyager léger sous les ciels Bortle 1 : traqueurs nomades, règle NPF, Samyang 135mm f/2 et arches de la Voie Lactée.',
      descEn: 'Travel light under Bortle 1 skies: portable star trackers, NPF rule, Samyang 135mm f/2, and Milky Way arches.',
      image: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.bonus,
      calculatorType: 'npf' as CalculatorType,
      content: {
        fr: {
          intro: "Voyagez léger et capturez la Voie Lactée sous les plus beaux ciels étoilés du monde.",
          slides: [
            {
              title: 'Chapitre 1 : Objectifs Rapides & Règle NPF',
              subtitle: 'Maîtriser le grand champ sans filé',
              bullets: ['Fermez votre objectif d’un cran pour éliminer la coma dans les coins.'],
              proTip: 'Verrouillez votre bague de mise au point avec du ruban adhésif.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. La Règle NPF pour trépieds statiques',
              body: 'La formule NPF calcule le temps de pose limite en tenant compte de l’ouverture, de la focale et de la taille des pixels.',
              highlight: 'Formule NPF : t = (35 × N + 30 × P) ÷ F',
            },
          ] as LessonSection[],
          steps: ['1. Calculer le temps NPF et préparer son trépied.'],
          quiz: [
            {
              question: 'Quelle est la limite de Watt-heures (Wh) par batterie en cabine d’avion (norme IATA) ?',
              options: ['100 Wh maximum par batterie', '1000 Wh en soute', 'Interdit en avion'],
              correct: 0,
              explanation: 'Les batteries au lithium de moins de 100 Wh sont autorisées en cabine.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod7-pdf1',
              name: 'Checklist Bagage Cabine IATA & Règle NPF (PDF)',
              title: 'Checklist Officielle : Voyage & Grand Champ',
              sections: [{ title: '1. Transport', content: ['Toutes les batteries Li-ion en cabine (< 100 Wh).'] }],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro: 'Travel light and capture stunning Milky Way panoramas under pristine dark skies.',
          slides: [
            {
              title: 'Chapter 1: Fast Lenses & NPF Rule',
              subtitle: 'Sharp widefield imaging',
              bullets: ['Stop down fast lenses by one stop to eliminate corner coma.'],
              proTip: 'Tape down your focus ring securely.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. The NPF Rule Formula',
              body: 'Calculate untracked exposure limits precisely based on optics and sensor specs.',
              highlight: 'NPF Formula: t = (35 × N + 30 × P) ÷ F',
            },
          ] as LessonSection[],
          steps: ['1. Calculate Npf limit and prepare your tracker.'],
          quiz: [
            {
              question: 'What is the maximum Watt-hour (Wh) rating per lithium battery allowed in carry-on bags (IATA)?',
              options: ['100 Wh maximum per battery', '1000 Wh in checked bags', 'Prohibited'],
              correct: 0,
              explanation: 'IATA allows lithium batteries under 100Wh in cabin luggage.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod7-pdf1-en',
              name: 'Carry-On IATA Astro Travel & NPF Rule Checklist (PDF)',
              title: 'Expedition Checklist',
              sections: [{ title: '1. Transport', content: ['Keep all Li-ion batteries in cabin (< 100 Wh).'] }],
            },
          ] as DownloadDoc[],
        },
      },
    },
  ];

  const handleOpenLink = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleValidateVip = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = vipCode.trim().toUpperCase();
    const modulesToUnlock = ACCESS_CODES[cleanCode];

    if (modulesToUnlock) {
      saveUnlockedModules([...unlockedModules, ...modulesToUnlock]);
      setVipStatus('success');
      setVipCode('');
    } else {
      setVipStatus('error');
    }
  };

  const openModuleDetail = (id: number, preview = false) => {
    setSelectedModuleId(id);
    setIsPreviewMode(preview);
    setCurrentSlideIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setJustPurchasedModule(false);
    setActiveTab('module-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentModule = modules.find((m) => m.id === selectedModuleId);
  const isModuleUnlocked = (id: number) =>
    unlockedModules.map(Number).includes(Number(id));

  // 1. Calculateur Optique Module 1 (Echantillonnage)
  const safeFocal = calcFocal > 0 ? calcFocal : 1;
  const pixelScaleResult = ((206.265 * calcPixel) / safeFocal).toFixed(2);
  let calcVerdict = currentT.calcVerdictGreat;
  const scaleNum = parseFloat(pixelScaleResult);
  if (scaleNum < 0.8) calcVerdict = currentT.calcVerdictOver;
  else if (scaleNum > 2.0) calcVerdict = currentT.calcVerdictUnder;

  // 2. Calculateur Couple Module 2 (Monture Harmonique)
  const torqueNm = (calcPayloadKg * 9.81 * (calcTubeRadiusCm / 100)).toFixed(1);
  const torqueNum = parseFloat(torqueNm);
  const needsCounterweight = torqueNum > 14.5 || calcPayloadKg > 12;

  // 3. Calculateur Temps de Pose Module 4 (Swamp Factor CMOS)
  const baseDarkSkySec =
    calcFilterBand === 'broadband' ? 180 : calcFilterBand === 'dualband' ? 300 : 360;
  const bortleFactor = Math.pow(1.42, calcBortle - 3);
  const recommendedSubSec = Math.max(
    15,
    Math.min(600, Math.round(baseDarkSkySec / bortleFactor / 15) * 15)
  );

  // 4. Calculateur EAF Module 5 (Zone Critique CFZ & Step Size)
  const safeFD = calcFokusFD > 0 ? calcFokusFD : 1;
  const safeMicronStep = calcMicronStep > 0 ? calcMicronStep : 1;
  const cfzMicrons = Math.round(2.68 * safeFD * safeFD);
  const recommendedSteps = Math.max(5, Math.round((cfzMicrons * 1.6) / safeMicronStep));

  // 5. Calculateur Regle NPF Module 7
  const safeNpfFocal = npfFocal > 0 ? npfFocal : 1;
  const npfSeconds = ((35 * npfAperture + 30 * npfPixel) / safeNpfFocal).toFixed(1);

  // Calcul du score Quiz du module actif
  const activeQuizList = currentModule ? currentModule.content[lang].quiz : [];
  const correctQuizCount = activeQuizList.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correct ? acc + 1 : acc;
  }, 0);

  const progressPercentage = Math.round((completedModules.length / 7) * 100);

  // Filtrage du lexique
  const filteredGlossary = GLOSSARY_TERMS.filter((item) => {
    const term = lang === 'fr' ? item.termFr : item.termEn;
    const def = lang === 'fr' ? item.defFr : item.defEn;
    const query = glossarySearch.toLowerCase();
    return term.toLowerCase().includes(query) || def.toLowerCase().includes(query);
  });

  return (
    <div
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 ${
        nightVision
          ? 'bg-[#120101] text-rose-200 selection:bg-rose-600 selection:text-white'
          : 'bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
      }`}
    >
      {/* EN-TETE AVEC MODE NUIT & MODE NOMADE TERRAIN */}
      {!fieldMode && (
        <header
          className={`border-b sticky top-0 z-50 backdrop-blur-md ${
            nightVision
              ? 'border-rose-900/60 bg-[#120101]/95 text-rose-100'
              : 'border-slate-800/80 bg-[#030712]/90'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3.5 md:h-20 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => setActiveTab('home')}
              >
                <AstroberbLogo className="w-10 h-10" />
                <h1
                  className={`font-extrabold text-lg tracking-tight ${
                    nightVision
                      ? 'text-rose-300'
                      : 'bg-gradient-to-r from-white via-indigo-200 to-cyan-400 bg-clip-text text-transparent'
                  }`}
                >
                  {currentT.title}
                </h1>
              </div>

              <div className="flex md:hidden items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                  className={`px-2 py-1.5 rounded-xl text-xs font-bold border transition ${
                    nightVision
                      ? 'bg-rose-950 border-rose-800 text-rose-300'
                      : 'bg-slate-900/90 border-slate-700/80'
                  }`}
                >
                  🌐 {lang.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={() => setNightVision(!nightVision)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    nightVision
                      ? 'bg-rose-900 border-rose-700 text-white'
                      : 'bg-slate-900/90 border-slate-700 text-rose-400'
                  }`}
                  title="Mode Nuit Rouge"
                >
                  🔴
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pack')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 font-bold text-xs shadow-lg text-white animate-pulse"
                >
                  {currentT.packBtnShort}
                </button>
              </div>
            </div>

            <nav className="flex items-center justify-center space-x-6 text-sm border-t border-slate-800/60 pt-2.5 md:border-t-0 md:pt-0 font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={
                  activeTab === 'home'
                    ? `${
                        nightVision ? 'text-rose-400' : 'text-cyan-400'
                      } font-bold border-b-2 border-current pb-1 md:pb-0 md:border-b-0 transition`
                    : 'hover:opacity-80 transition'
                }
              >
                ✨ {currentT.catalog}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('glossary')}
                className={
                  activeTab === 'glossary'
                    ? `${
                        nightVision ? 'text-rose-400' : 'text-cyan-400'
                      } font-bold border-b-2 border-current pb-1 md:pb-0 md:border-b-0 transition`
                    : 'hover:opacity-80 transition'
                }
              >
                📖 {currentT.glossaryNav}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVipStatus(null);
                  setActiveTab('vip');
                }}
                className={
                  activeTab === 'vip'
                    ? `${
                        nightVision ? 'text-rose-400' : 'text-cyan-400'
                      } font-bold border-b-2 border-current pb-1 md:pb-0 md:border-b-0 transition`
                    : 'hover:opacity-80 transition'
                }
              >
                🔑 {currentT.vipSection}
              </button>
            </nav>

            <div className="hidden md:flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setFieldMode(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 transition flex items-center gap-1.5"
                title="Mode plein écran épuré pour le terrain"
              >
                🌙 {lang === 'fr' ? 'Mode Nomade' : 'Field Mode'}
              </button>
              <button
                type="button"
                onClick={() => setNightVision(!nightVision)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                  nightVision
                    ? 'bg-rose-950 border-rose-700 text-white'
                    : 'bg-slate-900 border-slate-700 text-rose-400 hover:border-rose-500'
                }`}
                title="Préserver la vision nocturne"
              >
                🔴 {lang === 'fr' ? 'Mode Nuit' : 'Night Mode'}
              </button>
              <button
                type="button"
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  nightVision
                    ? 'bg-rose-950 border-rose-800 text-rose-300'
                    : 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500'
                }`}
              >
                🌐 {lang.toUpperCase()}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pack')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 font-bold text-xs shadow-lg hover:opacity-95 transition text-white animate-pulse"
              >
                {currentT.packBtnShort}
              </button>
            </div>
          </div>

          {/* BANDEAU ACCES RAPIDE AUX COURS DEVERROUILLES + PROGRESSION */}
          {unlockedModules.length > 0 && (
            <div
              className={`border-t py-2.5 px-4 ${
                nightVision
                  ? 'bg-rose-950/80 border-rose-900 text-rose-200'
                  : 'bg-gradient-to-r from-emerald-950/90 via-slate-950 to-emerald-950/90 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2.5">
                <span className="text-xs font-bold mr-2 flex items-center gap-1.5">
                  <span>⭐</span> {currentT.quickAccessTitle}
                </span>
                {modules.map((m) => {
                  if (!isModuleUnlocked(m.id)) return null;
                  const isSelected =
                    activeTab === 'module-detail' && selectedModuleId === m.id;
                  const isDone = completedModules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => openModuleDetail(m.id, false)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 ${
                        isSelected
                          ? nightVision
                            ? 'bg-rose-600 text-white ring-2 ring-white scale-105'
                            : 'bg-cyan-400 text-slate-950 ring-2 ring-white scale-105'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                      }`}
                    >
                      <span>{isDone ? '✓' : '🚀'}</span>{' '}
                      {m.id === 7 ? 'Bonus' : `Mod. ${m.id}`}
                    </button>
                  );
                })}
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 ml-1">
                  {completedModules.length}/7 ({progressPercentage}%)
                </span>
                {completedModules.length > 0 && (
                  <button
                    type="button"
                    onClick={generateCertificate}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition flex items-center gap-1"
                  >
                    🏆 {lang === 'fr' ? 'Certificat' : 'Certificate'}
                  </button>
                )}
              </div>
            </div>
          )}
        </header>
      )}

      {/* BARRE HAUTE EN MODE NOMADE (PLEIN ÉCRAN TERRAIN) */}
      {fieldMode && (
        <div className={`p-4 border-b flex items-center justify-between sticky top-0 z-50 shadow-2xl ${nightVision ? 'bg-rose-950 border-rose-900 text-white' : 'bg-slate-950 border-cyan-500/40 text-cyan-300'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">🔭</span>
            <div>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-wider">{lang === 'fr' ? 'Astroberb — Mode Nomade Terrain' : 'Astroberb Field Mode'}</h2>
              <p className="text-[10px] text-slate-400">{lang === 'fr' ? 'Interface épurée pour vos nuits sous les étoiles' : 'Streamlined interface for observation nights'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setNightVision(!nightVision)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${nightVision ? 'bg-rose-900 border-rose-700 text-white' : 'bg-slate-900 border-slate-700 text-rose-400'}`}
            >
              🔴 {nightVision ? 'Mode Nuit ON' : 'Mode Nuit'}
            </button>
            <button
              type="button"
              onClick={() => setFieldMode(false)}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition shadow"
            >
              {currentT.exitFieldMode}
            </button>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-10 flex-grow w-full">
        {/* VUE LEXIQUE / GLOSSAIRE */}
        {activeTab === 'glossary' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-extrabold uppercase tracking-widest border border-cyan-500/30">
                📚 Dictionnaire Technique
              </span>
              <h2 className="text-3xl md:text-4xl font-black">{lang === 'fr' ? 'Le Lexique Astrophotographie' : 'Astrophotography Glossary'}</h2>
              <p className={`text-sm md:text-base max-w-xl mx-auto ${nightVision ? 'text-rose-200' : 'text-slate-300'}`}>
                {lang === 'fr' ? 'Retrouvez toutes les définitions des termes techniques utilisés dans nos masterclasses.' : 'Find definitions for all technical terms used in our masterclasses.'}
              </p>
              <div className="pt-2 max-w-md mx-auto">
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder={lang === 'fr' ? 'Rechercher un terme (ex: Backfocus, Tilt...)' : 'Search a term (e.g. Backfocus, Tilt...)'}
                  className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGlossary.map((item, idx) => (
                <div key={idx} className={`p-5 rounded-3xl border space-y-2 backdrop-blur-md ${nightVision ? 'bg-rose-950/30 border-rose-900' : 'bg-slate-900/80 border-slate-800'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-black text-base md:text-lg ${nightVision ? 'text-rose-300' : 'text-cyan-300'}`}>
                      {lang === 'fr' ? item.termFr : item.termEn}
                    </h3>
                    <button
                      type="button"
                      onClick={() => openModuleDetail(item.moduleRef, false)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600/60 hover:bg-indigo-600 text-white transition"
                    >
                      Module {item.moduleRef} ➔
                    </button>
                  </div>
                  <p className={`text-xs md:text-sm leading-relaxed ${nightVision ? 'text-rose-200' : 'text-slate-300'}`}>
                    {lang === 'fr' ? item.defFr : item.defEn}
                  </p>
                </div>
              ))}
              {filteredGlossary.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                  {lang === 'fr' ? 'Aucun terme trouvé pour cette recherche.' : 'No term found for this query.'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-16">
            {/* HERO SECTION */}
            <div
              className={`text-center py-14 px-4 md:px-12 rounded-3xl border space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-sm ${
                nightVision
                  ? 'bg-rose-950/30 border-rose-900/50'
                  : 'bg-gradient-to-b from-indigo-950/50 via-slate-900/40 to-slate-950/20 border-indigo-500/30'
              }`}
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                  nightVision
                    ? 'bg-rose-900/40 text-rose-300 border border-rose-800'
                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {currentT.heroBadge}
              </div>

              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
                {currentT.subtitle}
              </h2>

              <p
                className={`max-w-2xl mx-auto text-base md:text-lg leading-relaxed ${
                  nightVision ? 'text-rose-200' : 'text-slate-300'
                }`}
              >
                {currentT.heroDesc}
              </p>

              {/* SECTION BÉNÉFICES CONCRETS */}
              <div className="max-w-5xl mx-auto pt-6 pb-2">
                <h3 className={`text-xl md:text-2xl font-black mb-6 ${nightVision ? 'text-rose-200' : 'text-white'}`}>
                  {currentT.benefitsTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className={`p-6 rounded-3xl border space-y-3 ${nightVision ? 'bg-rose-950/40 border-rose-900/60' : 'bg-slate-950/60 border-cyan-500/30'}`}>
                    <div className="text-3xl">🎯</div>
                    <h4 className="font-extrabold text-base text-cyan-400">{currentT.benefit1Title}</h4>
                    <p className={`text-xs md:text-sm leading-relaxed ${nightVision ? 'text-rose-200' : 'text-slate-300'}`}>
                      {currentT.benefit1Desc}
                    </p>
                  </div>
                  <div className={`p-6 rounded-3xl border space-y-3 ${nightVision ? 'bg-rose-950/40 border-rose-900/60' : 'bg-slate-950/60 border-indigo-500/30'}`}>
                    <div className="text-3xl">🌌</div>
                    <h4 className="font-extrabold text-base text-indigo-400">{currentT.benefit2Title}</h4>
                    <p className={`text-xs md:text-sm leading-relaxed ${nightVision ? 'text-rose-200' : 'text-slate-300'}`}>
                      {currentT.benefit2Desc}
                    </p>
                  </div>
                  <div className={`p-6 rounded-3xl border space-y-3 ${nightVision ? 'bg-rose-950/40 border-rose-900/60' : 'bg-slate-950/60 border-emerald-500/30'}`}>
                    <div className="text-3xl">🎨</div>
                    <h4 className="font-extrabold text-base text-emerald-400">{currentT.benefit3Title}</h4>
                    <p className={`text-xs md:text-sm leading-relaxed ${nightVision ? 'text-rose-200' : 'text-slate-300'}`}>
                      {currentT.benefit3Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* VIDEO PROMO DU LOGO EN HAUT DE PAGE */}
              <div
                className={`max-w-4xl mx-auto mt-8 p-4 md:p-6 rounded-3xl border shadow-2xl text-left space-y-4 ${
                  nightVision
                    ? 'bg-black/60 border-rose-800/70'
                    : 'bg-slate-950/80 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span
                      className={`text-[11px] font-black uppercase tracking-widest ${
                        nightVision ? 'text-rose-400' : 'text-cyan-400'
                      }`}
                    >
                      {currentT.videoSectionBadge}
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-white mt-0.5">
                      {currentT.videoSectionTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                    ✨ Logo Trailer
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 aspect-video shadow-2xl">
                  <video
                    src={PROMO_LOGO_VIDEO_URL}
                    poster="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80"
                    controls
                    playsInline
                    preload="metadata"
                    className={`w-full h-full object-cover ${
                      nightVision ? 'sepia hue-rotate-[-50deg] saturate-200 brightness-75' : ''
                    }`}
                  >
                    {lang === 'fr'
                      ? 'Votre navigateur ne supporte pas la lecture de vidéos HTML5.'
                      : 'Your browser does not support HTML5 video playback.'}
                  </video>
                </div>
                <p
                  className={`text-xs md:text-sm text-center leading-relaxed ${
                    nightVision ? 'text-rose-200' : 'text-slate-300'
                  }`}
                >
                  {currentT.videoSectionSub}
                </p>
              </div>

              {/* LECTEUR VIDEO DE BIENVENUE CLASSIQUE */}
              <div
                className={`max-w-4xl mx-auto p-4 md:p-6 rounded-3xl border shadow-2xl text-left space-y-5 ${
                  nightVision
                    ? 'bg-black/60 border-rose-800/70'
                    : 'bg-slate-950/80 border-cyan-500/30'
                }`}
              >
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 aspect-video shadow-2xl">
                  <video
                    src={WELCOME_VIDEO_URL}
                    poster="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80"
                    controls
                    playsInline
                    preload="metadata"
                    className={`w-full h-full object-cover ${
                      nightVision ? 'sepia hue-rotate-[-50deg] saturate-200 brightness-75' : ''
                    }`}
                  >
                    {lang === 'fr'
                      ? 'Votre navigateur ne supporte pas la lecture de vidéos HTML5.'
                      : 'Your browser does not support HTML5 video playback.'}
                  </video>
                </div>

                {/* LES 3 PILIERS : AVANT, PENDANT & APRES LA NUIT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      nightVision
                        ? 'bg-rose-950/40 border-rose-900/60'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div
                      className={`text-xs font-black uppercase tracking-wider mb-1 ${
                        nightVision ? 'text-rose-300' : 'text-cyan-400'
                      }`}
                    >
                      🔭 {currentT.phase1Badge}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentT.phase1Desc}
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      nightVision
                        ? 'bg-rose-950/40 border-rose-900/60'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div
                      className={`text-xs font-black uppercase tracking-wider mb-1 ${
                        nightVision ? 'text-rose-300' : 'text-indigo-400'
                      }`}
                    >
                      🌌 {currentT.phase2Badge}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentT.phase2Desc}
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      nightVision
                        ? 'bg-rose-950/40 border-rose-900/60'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div
                      className={`text-xs font-black uppercase tracking-wider mb-1 ${
                        nightVision ? 'text-rose-300' : 'text-emerald-400'
                      }`}
                    >
                      🎨 {currentT.phase3Badge}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentT.phase3Desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* ENCADRE : HISTORIQUE / IDEE ORIGINALE DU SITE */}
              <div
                className={`max-w-4xl mx-auto p-6 md:p-8 rounded-3xl border shadow-xl text-left flex flex-col md:flex-row items-center gap-6 backdrop-blur-md ${
                  nightVision
                    ? 'bg-rose-950/40 border-rose-800'
                    : 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-cyan-500/40'
                }`}
              >
                <div className="w-24 h-24 shrink-0 rounded-2xl bg-black border-2 border-cyan-400/60 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🔭</span>
                </div>
                <div className="space-y-2">
                  <h3 className={`text-lg md:text-xl font-black ${nightVision ? 'text-rose-300' : 'text-cyan-300'}`}>
                    {currentT.originStoryTitle}
                  </h3>
                  <p className={`text-xs md:text-sm leading-relaxed ${nightVision ? 'text-rose-100' : 'text-slate-300'}`}>
                    {currentT.originStoryText}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenLink(paymentLinks.packIntegral.stripe)
                  }
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition shadow-xl animate-pulse ${
                    nightVision
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-indigo-600 text-slate-950'
                  }`}
                >
                  <span>💳</span> {currentT.buyPackFull} ({currentT.buyStripe})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenLink(paymentLinks.packIntegral.paypal)
                  }
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition shadow-xl ${
                    nightVision
                      ? 'bg-rose-800 text-white hover:bg-rose-700'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  <span>🅿️</span> {currentT.buyPackFull} ({currentT.buyPayPal})
                </button>
              </div>

              {/* BOUTON DEMO GRATUITE MODULE 1 */}
              {!isModuleUnlocked(1) && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openModuleDetail(1, true)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-cyan-300 transition"
                  >
                    {currentT.freePreviewBtn}
                  </button>
                </div>
              )}

              <div className="pt-3 flex flex-col items-center gap-1.5">
                <span
                  className={`text-xs font-semibold ${
                    nightVision ? 'text-rose-300' : 'text-amber-300'
                  }`}
                >
                  {currentT.trustBadge}
                </span>
                <span
                  className={`text-xs ${
                    nightVision ? 'text-rose-400/80' : 'text-slate-400'
                  }`}
                >
                  {currentT.taxNotice}
                </span>
              </div>
            </div>

            {/* BARRE DE PROGRESSION DU CURSUS */}
            {unlockedModules.length > 0 && (
              <div
                className={`p-6 rounded-3xl border space-y-3 ${
                  nightVision
                    ? 'bg-rose-950/20 border-rose-900'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs md:text-sm font-bold">
                  <span>
                    📈 {currentT.progressLabel} {completedModules.length} / 7{' '}
                    {lang === 'fr' ? 'modules validés' : 'modules completed'}
                  </span>
                  <span className="text-cyan-400 font-mono">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden border border-white/10">
                  <div
                    className={`h-full transition-all duration-500 ${
                      nightVision
                        ? 'bg-rose-600'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* CATALOGUE DES COURSES ET OFFRE INTÉGRALE */}
            <div className="space-y-8">
              <div
                className={`flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4 ${
                  nightVision ? 'border-rose-900' : 'border-slate-800'
                }`}
              >
                <div>
                  <span
                    className={`text-xs font-extrabold uppercase tracking-widest ${
                      nightVision ? 'text-rose-400' : 'text-cyan-400'
                    }`}
                  >
                    {lang === 'fr' ? ' Programme Complet' : 'Full Curriculum'}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black mt-1">
                    {lang === 'fr'
                      ? "Les 7 Modules d'Expertise & Offre Intégrale"
                      : 'The 7 Expert Modules & Full Bundle'}
                  </h3>
                </div>
                <p
                  className={`text-xs max-w-md ${
                    nightVision ? 'text-rose-300' : 'text-slate-400'
                  }`}
                >
                  {lang === 'fr'
                    ? 'Choisissez vos modules à la carte ou optez pour le Pack Intégral super promo pour tout débloquer instantanément.'
                    : 'Choose modules individually or select the Super Promo Full Bundle to unlock everything instantly.'}
                </p>
              </div>

              {/* VIDEO DE PROMO DES MODULES JUSTE AVANT LA GRILLE */}
              <div
                className={`max-w-4xl mx-auto p-4 md:p-6 rounded-3xl border shadow-2xl text-left space-y-4 ${
                  nightVision
                    ? 'bg-black/60 border-rose-800/70'
                    : 'bg-slate-950/80 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span
                      className={`text-[11px] font-black uppercase tracking-widest ${
                        nightVision ? 'text-rose-400' : 'text-cyan-400'
                      }`}
                    >
                      {currentT.modulesVideoBadge}
                    </span>
                    <h3 className="text-lg md:text-xl font-black text-white mt-0.5">
                      {currentT.modulesVideoTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                    🔭 Modules Preview
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/15 aspect-video shadow-2xl">
                  <video
                    src={PROMO_MODULES_VIDEO_URL}
                    poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
                    controls
                    playsInline
                    preload="metadata"
                    className={`w-full h-full object-cover ${
                      nightVision ? 'sepia hue-rotate-[-50deg] saturate-200 brightness-75' : ''
                    }`}
                  >
                    {lang === 'fr'
                      ? 'Votre navigateur ne supporte pas la lecture de vidéos HTML5.'
                      : 'Your browser does not support HTML5 video playback.'}
                  </video>
                </div>
                <p
                  className={`text-xs md:text-sm text-center leading-relaxed ${
                    nightVision ? 'text-rose-200' : 'text-slate-300'
                  }`}
                >
                  {currentT.modulesVideoSub}
                </p>
              </div>

              {/* GRILLE DES 7 MODULES + CARTE DU PACK INTÉGRAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {modules.map((mod) => {
                  const unlocked = isModuleUnlocked(mod.id);
                  const isDone = completedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        if (unlocked) openModuleDetail(mod.id, false);
                      }}
                      className={`group relative border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-md hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:border-cyan-400 ${
                        nightVision
                          ? 'bg-rose-950/20 border-rose-900/60'
                          : 'bg-slate-900/70 border-slate-800/80'
                      } ${
                        unlocked
                          ? 'cursor-pointer hover:-translate-y-1'
                          : 'hover:-translate-y-1'
                      }`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div>
                        <div className="h-52 overflow-hidden relative">
                          <img
                            src={mod.image}
                            alt={lang === 'fr' ? mod.titleFr : mod.titleEn}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-amber-500 backdrop-blur-md text-[11px] font-black text-slate-950 border border-amber-300 shadow">
                            {lang === 'fr' ? mod.badgeFr : mod.badgeEn}
                          </span>

                          <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-indigo-600/90 backdrop-blur-md shadow-lg flex items-center gap-2 text-white">
                            <span className="font-black text-sm text-cyan-300">{mod.priceDisplay}</span>
                          </div>

                          {isDone && (
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg">
                              ✓ {lang === 'fr' ? 'Terminé' : 'Completed'}
                            </span>
                          )}
                          {!isDone && unlocked && (
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-lg">
                              🔓 {lang === 'fr' ? 'Débloqué' : 'Unlocked'}
                            </span>
                          )}
                          {!unlocked && (
                            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-semibold text-slate-300 border border-white/10">
                              {currentT.lockedBadge}
                            </span>
                          )}
                        </div>

                        <div className="p-6 space-y-3 relative z-10">
                          <h4 className="font-bold text-lg leading-snug group-hover:text-cyan-300 transition-colors">
                            {lang === 'fr' ? mod.titleFr : mod.titleEn}
                          </h4>
                          <p
                            className={`text-sm leading-relaxed ${
                              nightVision ? 'text-rose-300' : 'text-slate-400'
                            }`}
                          >
                            {lang === 'fr' ? mod.descFr : mod.descEn}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0 flex flex-col gap-2.5 relative z-10">
                        {unlocked ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModuleDetail(mod.id, false);
                            }}
                            className={`w-full py-3.5 rounded-xl font-black text-xs shadow-lg transition text-center uppercase tracking-wider flex items-center justify-center gap-2 ${
                              nightVision
                                ? 'bg-rose-600 text-white hover:bg-rose-500'
                                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950'
                            }`}
                          >
                            <span>▶️</span> {currentT.accessCourse}
                          </button>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-2.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenLink(mod.links.stripe);
                                }}
                                className="py-3 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md text-center transition flex items-center justify-center gap-1"
                              >
                                <span>💳</span> {currentT.buyStripe}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenLink(mod.links.paypal);
                                }}
                                className="py-3 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md text-center transition flex items-center justify-center gap-1"
                              >
                                <span>🅿️</span> {currentT.buyPayPal}
                              </button>
                            </div>
                            {mod.id === 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModuleDetail(1, true);
                                }}
                                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-cyan-300 transition"
                              >
                                {currentT.freePreviewBtn}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* CARTE SPECIALE DU PACK INTEGRAL DANS LA GRILLE */}
                <div className="group relative border-2 border-amber-500/80 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 hover:scale-105 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div>
                    <div className="h-52 overflow-hidden relative bg-slate-950 flex items-center justify-center p-6 text-center">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
                      <div className="relative space-y-2">
                        <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-widest shadow">
                          🔥 Offre Ultime 7-en-1
                        </span>
                        <div className="text-3xl font-black text-white pt-2 group-hover:text-amber-300 transition-colors">
                          Pack Intégral
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <span className="text-2xl font-black text-cyan-300">49,99 $ CAD</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-3 relative z-10">
                      <h4 className="font-bold text-lg leading-snug text-amber-200">
                        {lang === 'fr' ? "Accès Complet à Tous les Modules" : "Full Access to All Modules"}
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {lang === 'fr' 
                          ? "Débloquez instantanément les 7 masterclasses, les 6 simulateurs optiques interactifs, les quiz et les guides PDF A4 imprimables." 
                          : "Instantly unlock all 7 masterclasses, 6 interactive optical simulators, quizzes, and printable A4 PDF guides."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex flex-col gap-2.5 relative z-10">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenLink(paymentLinks.packIntegral.stripe)}
                        className="py-3 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-slate-950 shadow-md text-center transition flex items-center justify-center gap-1 animate-pulse"
                      >
                        <span>💳</span> {currentT.buyStripe}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenLink(paymentLinks.packIntegral.paypal)}
                        className="py-3 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md text-center transition flex items-center justify-center gap-1"
                      >
                        <span>🅿️</span> {currentT.buyPayPal}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION TEMOIGNAGES */}
            <div className="space-y-6 pt-6">
              <h3 className="text-2xl font-black text-center">
                {currentT.testimonialsTitle}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`p-6 rounded-3xl border space-y-3 ${
                    nightVision
                      ? 'bg-rose-950/20 border-rose-900'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <p
                    className={`italic text-sm leading-relaxed ${
                      nightVision ? 'text-rose-200' : 'text-slate-300'
                    }`}
                  >
                    {currentT.t1}
                  </p>
                  <div className="text-xs font-bold text-cyan-400">
                    {currentT.t1Author}
                  </div>
                </div>
                <div
                  className={`p-6 rounded-3xl border space-y-3 ${
                    nightVision
                      ? 'bg-rose-950/20 border-rose-900'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <p
                    className={`italic text-sm leading-relaxed ${
                      nightVision ? 'text-rose-200' : 'text-slate-300'
                    }`}
                  >
                    {currentT.t2}
                  </p>
                  <div className="text-xs font-bold text-cyan-400">
                    {currentT.t2Author}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION FAQ ACCORDEON */}
            <div className="space-y-4 pt-6 max-w-3xl mx-auto">
              <h3 className="text-2xl font-black text-center">
                {currentT.faqTitle}
              </h3>
              {[
                { q: currentT.faq1Q, a: currentT.faq1A },
                { q: currentT.faq2Q, a: currentT.faq2A },
                { q: currentT.faq3Q, a: currentT.faq3A },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition ${
                    nightVision
                      ? 'bg-rose-950/30 border-rose-900'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                    }
                    className="w-full p-4 text-left font-bold text-sm md:text-base flex justify-between items-center"
                  >
                    <span>{faq.q}</span>
                    <span>{openFaqIndex === idx ? '−' : '+'}</span>
                  </button>
                  {openFaqIndex === idx && (
                    <div
                      className={`p-4 pt-0 text-xs md:text-sm leading-relaxed border-t ${
                        nightVision
                          ? 'border-rose-900/50 text-rose-200'
                          : 'border-slate-800 text-slate-300'
                      }`}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE DETAILLEE D'UN MODULE */}
        {activeTab === 'module-detail' && currentModule && (
          <div
            className={`max-w-4xl mx-auto space-y-12 border rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-md ${
              nightVision
                ? 'bg-rose-950/20 border-rose-900'
                : 'bg-slate-900/90 border-slate-800/80'
            }`}
          >
            {/* BANNIERE MODE APERÇU GRATUIT */}
            {isPreviewMode && !isModuleUnlocked(currentModule.id) && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-indigo-950/80 to-slate-900 border border-amber-500/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                    {currentT.previewBannerTitle}
                  </span>
                  <span className="text-xs font-bold text-cyan-300">
                    {currentModule.priceDisplay} CAD (ou Pack 7-en-1 à 49.99$ CAD)
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {currentT.previewBannerDesc}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenLink(currentModule.links.stripe)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                  >
                    💳 {currentT.buyStripe} ({currentModule.priceDisplay} CAD)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenLink(currentModule.links.paypal)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow"
                  >
                    🅿️ {currentT.buyPayPal} ({currentModule.priceDisplay} CAD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pack')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow"
                  >
                    {currentT.buyPackFull}
                  </button>
                </div>
              </div>
            )}

            {/* BANNIERE DE CONFIRMATION D'ACHAT + COPIE CODE */}
            {justPurchasedModule && (
              <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <span>{currentT.paymentConfirmedModule}</span>
                  <span className="font-mono font-black text-white bg-black/50 px-3 py-1 rounded-lg border border-emerald-400/40">
                    {currentModule.backupCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentModule.backupCode)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    {copiedCode === currentModule.backupCode
                      ? currentT.copiedBtn
                      : currentT.copyBtn}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setJustPurchasedModule(false)}
                  className="text-xs underline opacity-80 hover:opacity-100"
                >
                  {currentT.closeBtn}
                </button>
              </div>
            )}

            {/* NAVIGATION HAUT DE MODULE */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  nightVision
                    ? 'bg-rose-900 text-white'
                    : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                }`}
              >
                {currentT.backToCatalog}
              </button>
              {isModuleUnlocked(currentModule.id) && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(currentModule.backupCode)}
                    className="text-xs font-mono px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 transition"
                  >
                    🔑 {currentModule.backupCode} (
                    {copiedCode === currentModule.backupCode
                      ? currentT.copiedBtn
                      : currentT.copyBtn}
                    )
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCompleteModule(currentModule.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      completedModules.includes(currentModule.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {completedModules.includes(currentModule.id)
                      ? currentT.markIncomplete
                      : currentT.markComplete}
                  </button>
                </div>
              )}
            </div>

            {/* TITRE & INTRODUCTION DU MODULE */}
            <div className="space-y-3 border-b border-white/10 pb-6">
              <span
                className={`inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg ${
                  nightVision
                    ? 'bg-rose-900/50 text-rose-300'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}
              >
                {currentT.interactiveModule}
              </span>
              <h2 className="text-2xl md:text-4xl font-black leading-tight">
                {lang === 'fr' ? currentModule.titleFr : currentModule.titleEn}
              </h2>
              <p
                className={`text-base md:text-lg leading-relaxed ${
                  nightVision ? 'text-rose-200' : 'text-slate-300'
                }`}
              >
                {currentModule.content[lang].intro}
              </p>
            </div>

            {/* 1. STUDIO DIAPORAMA INTERACTIF */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>🎬</span> {currentT.studioHeader}
                </h3>
                <span className="text-xs font-mono px-3 py-1 rounded-lg bg-black/40 border border-white/10">
                  {lang === 'fr' ? 'Chapitre' : 'Chapter'}{' '}
                  {currentSlideIndex + 1} /{' '}
                  {currentModule.content[lang].slides.length}
                </span>
              </div>

              <div className="rounded-3xl bg-black/50 border border-white/10 p-6 md:p-10 shadow-2xl space-y-6">
                <div className="space-y-1">
                  <h4 className="text-xl md:text-2xl font-black text-white">
                    {currentModule.content[lang].slides[currentSlideIndex].title}
                  </h4>
                  <p
                    className={`text-xs md:text-sm font-semibold ${
                      nightVision ? 'text-rose-400' : 'text-cyan-400'
                    }`}
                  >
                    {currentModule.content[lang].slides[currentSlideIndex].subtitle}
                  </p>
                </div>

                <ul className="space-y-3">
                  {currentModule.content[lang].slides[currentSlideIndex].bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3.5 bg-white/5 border border-white/10 p-4 rounded-2xl text-sm md:text-base leading-relaxed"
                    >
                      <span
                        className={`font-bold mt-0.5 ${
                          nightVision ? 'text-rose-400' : 'text-cyan-400'
                        }`}
                      >
                        ✦
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`p-4 rounded-2xl border text-xs md:text-sm leading-relaxed ${
                    nightVision
                      ? 'bg-rose-950/60 border-rose-700 text-rose-200'
                      : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200'
                  }`}
                >
                  <strong className="block mb-1 font-extrabold">
                    {currentT.proTipLabel}
                  </strong>
                  {currentModule.content[lang].slides[currentSlideIndex].proTip}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={currentSlideIndex === 0}
                    onClick={() =>
                      setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
                    }
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold transition"
                  >
                    {currentT.prevSlide}
                  </button>
                  <div className="flex gap-1.5">
                    {currentModule.content[lang].slides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isPreviewMode && !isModuleUnlocked(currentModule.id) && idx > 0}
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition ${
                          currentSlideIndex === idx
                            ? nightVision
                              ? 'bg-rose-500 scale-125'
                              : 'bg-cyan-400 scale-125'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={
                      (isPreviewMode && !isModuleUnlocked(currentModule.id)) ||
                      currentSlideIndex ===
                        currentModule.content[lang].slides.length - 1
                    }
                    onClick={() =>
                      setCurrentSlideIndex((prev) =>
                        Math.min(
                          currentModule.content[lang].slides.length - 1,
                          prev + 1
                        )
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-xs font-bold text-white transition"
                  >
                    {isPreviewMode && !isModuleUnlocked(currentModule.id)
                      ? '🔒 Chapitre 2'
                      : currentT.nextSlide}
                  </button>
                </div>
              </div>
            </div>

            {/* SIMULATEURS */}
            {currentModule.calculatorType === 'sampling' && (
              <div className="space-y-5 bg-black/40 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {currentT.calcTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcFocalLabel}
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={calcFocal}
                      onChange={(e) => setCalcFocal(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcPixelLabel}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="20"
                      value={calcPixel}
                      onChange={(e) => setCalcPixel(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 text-center space-y-2">
                  <div className="text-sm font-bold">
                    {currentT.calcResult}
                    <span className="text-2xl font-black text-cyan-400 font-mono ml-2">
                      {pixelScaleResult} &quot;/pixel
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-400 max-w-xl mx-auto leading-relaxed">
                    {calcVerdict}
                  </p>
                </div>
              </div>
            )}

            {currentModule.calculatorType === 'torque' && (
              <div className="space-y-5 bg-black/40 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {currentT.calcTorqueTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcPayloadLabel}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      value={calcPayloadKg}
                      onChange={(e) => setCalcPayloadKg(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcRadiusLabel}
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="5"
                      max="40"
                      value={calcTubeRadiusCm}
                      onChange={(e) =>
                        setCalcTubeRadiusCm(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 text-center space-y-2">
                  <div className="text-sm font-bold">
                    {currentT.calcTorqueResult}
                    <span className="text-2xl font-black text-cyan-400 font-mono ml-2">
                      {torqueNm} N·m
                    </span>
                  </div>
                  <p
                    className={`text-xs font-bold ${
                      needsCounterweight ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {needsCounterweight
                      ? lang === 'fr'
                        ? '⚠️ Couple élevé : Ajoutez un contrepoids de 3 à 5 kg sur la barre pour soulager le réducteur et stabiliser le trépied.'
                        : '⚠️ High torque load: Add a 3kg to 5kg counterweight to stabilize your tripod and assist the strainwave gear.'
                      : lang === 'fr'
                      ? '✨ Charge nominale parfaite : Aucun contrepoids requis sur Juwei-17 / UMi-17S / AM5 (lestez uniquement le trépied).'
                      : '✨ Optimal torque load: No counterweight needed on Juwei-17 / UMi-17S / AM5 (ballast tripod center only).'}
                  </p>
                </div>
              </div>
            )}

            {currentModule.calculatorType === 'exposure' && (
              <div className="space-y-5 bg-black/40 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {currentT.calcExpTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcBortleLabel} (Bortle {calcBortle})
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="9"
                      value={calcBortle}
                      onChange={(e) => setCalcBortle(Number(e.target.value))}
                      className="w-full accent-cyan-400 mt-3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcFilterLabel}
                    </label>
                    <select
                      value={calcFilterBand}
                      onChange={(e) =>
                        setCalcFilterBand(
                          e.target.value as 'broadband' | 'dualband' | 'sho'
                        )
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white text-xs font-bold focus:outline-none"
                    >
                      <option value="broadband">
                        UV/IR Cut — Large Bande (Galaxies / Amas)
                      </option>
                      <option value="dualband">
                        Dual-Band 7nm (Ha/OIII Couleur)
                      </option>
                      <option value="sho">
                        Bande Étroite 3nm (SHO Monochrome)
                      </option>
                    </select>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 text-center space-y-2">
                  <div className="text-sm font-bold">
                    {currentT.calcExpResult}
                    <span className="text-2xl font-black text-cyan-400 font-mono ml-2">
                      {recommendedSubSec} sec
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-bold">
                    {lang === 'fr'
                      ? '✨ Ce temps de pose submerge le bruit de lecture (Gain 100) sans saturer le cœur des étoiles.'
                      : '✨ This sub-exposure swamps sensor read noise (Gain 100) without clipping bright star cores.'}
                  </p>
                </div>
              </div>
            )}

            {currentModule.calculatorType === 'focus' && (
              <div className="space-y-5 bg-black/40 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {currentT.calcFocusTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcFocusFDLabel}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.2"
                      max="20"
                      value={calcFokusFD}
                      onChange={(e) => setCalcFokusFD(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcFocusStepLabel}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="20"
                      value={calcMicronStep}
                      onChange={(e) =>
                        setCalcMicronStep(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 text-center space-y-2">
                  <div className="text-sm font-bold">
                    {currentT.calcFocusResult}
                    <span className="text-2xl font-black text-cyan-400 font-mono ml-2">
                      {cfzMicrons} µm
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-400">
                    {currentT.calcFocusAdvice}
                    <span className="font-mono text-white underline ml-1">
                      ~{recommendedSteps} steps
                    </span>
                  </p>
                </div>
              </div>
            )}

            {currentModule.calculatorType === 'compare' && (
              <div className="space-y-4 bg-black/40 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold">
                  {currentT.calcCompareTitle}
                </h3>
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-white/15 select-none">
                  <img
                    src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1000&q=80"
                    alt="Final Processed"
                    className="w-full h-full object-cover saturate-150 contrast-125"
                  />
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-cyan-400"
                    style={{ width: `${compareSlider}%` }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1000&q=80"
                      alt="Raw Linear"
                      className="w-full h-full object-cover brightness-[0.18] contrast-75 saturate-0"
                    />
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 text-[10px] font-bold text-slate-300">
                    {lang === 'fr' ? 'AVANT : Brute Linéaire' : 'BEFORE: Linear Stack'}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded bg-cyan-500/90 text-[10px] font-black text-slate-950">
                    {lang === 'fr'
                      ? 'APRÈS : GraXpert + SPCC + GHS'
                      : 'AFTER: GraXpert + SPCC + GHS'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={compareSlider}
                  onChange={(e) => setCompareSlider(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-ew-resize"
                />
              </div>
            )}

            {currentModule.calculatorType === 'npf' && (
              <div className="space-y-5 bg-black/40 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold">{currentT.calcNpfTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcNpfFocalLabel}
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="200"
                      value={npfFocal}
                      onChange={(e) => setNpfFocal(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcNpfApertureLabel}
                    </label>
                    <input
                      type="number"
                      step="0.2"
                      min="1.2"
                      max="11"
                      value={npfAperture}
                      onChange={(e) => setNpfAperture(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcPixelLabel}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="12"
                      value={npfPixel}
                      onChange={(e) => setNpfPixel(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 text-center space-y-1">
                  <div className="text-sm font-bold">
                    {currentT.calcNpfResult}
                    <span className="text-2xl font-black text-cyan-400 font-mono ml-2">
                      {npfSeconds} sec
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTIONS RESERVEES AUX ELEVES DEBLOQUES */}
            {isModuleUnlocked(currentModule.id) && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>📚</span> {currentT.fullCourseTitle}
                  </h3>
                  <div className="space-y-4">
                    {currentModule.content[lang].courseSections.map(
                      (sec, idx) => (
                        <div
                          key={idx}
                          className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3"
                        >
                          <h4 className="font-black text-base md:text-lg text-white">
                            {sec.heading}
                          </h4>
                          <p
                            className={`text-sm md:text-base leading-relaxed ${
                              nightVision ? 'text-rose-200' : 'text-slate-300'
                            }`}
                          >
                            {sec.body}
                          </p>
                          {sec.highlight && (
                            <div
                              className={`p-3.5 rounded-xl font-mono text-xs md:text-sm font-bold border ${
                                nightVision
                                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                                  : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                              }`}
                            >
                              ⚡ {sec.highlight}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>✅</span> {currentT.tutorialSteps}
                  </h3>
                  <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
                    {currentModule.content[lang].steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-sm md:text-base"
                      >
                        <span className="text-emerald-400 font-black">✔</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5 bg-black/50 border border-indigo-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {currentT.quizTitle}
                    </h3>
                    {quizSubmitted && (
                      <span className="px-3.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                        {currentT.quizScore} {correctQuizCount} /{' '}
                        {activeQuizList.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {activeQuizList.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                      >
                        <p className="font-bold text-sm md:text-base">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[qIdx] === oIdx;
                            const isCorrect = q.correct === oIdx;
                            let btnStyle =
                              'bg-black/50 border-white/10 hover:border-white/30';
                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnStyle =
                                  'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                              } else if (isSelected && !isCorrect) {
                                btnStyle =
                                  'bg-rose-950/80 border-rose-500 text-rose-200';
                              }
                            } else if (isSelected) {
                              btnStyle =
                                'bg-indigo-600/40 border-cyan-400 text-white font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={quizSubmitted}
                                onClick={() =>
                                  setSelectedAnswers((prev) => ({
                                    ...prev,
                                    [qIdx]: oIdx,
                                  }))
                                }
                                className={`w-full text-left p-3.5 rounded-xl border text-xs md:text-sm transition flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <span>✓</span>}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs leading-relaxed">
                            <strong
                              className={
                                selectedAnswers[qIdx] === q.correct
                                  ? 'text-emerald-400'
                                  : 'text-rose-400'
                              }
                            >
                              {selectedAnswers[qIdx] === q.correct
                                ? currentT.correctAnswer
                                : currentT.wrongAnswer}
                            </strong>{' '}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    {!quizSubmitted ? (
                      <button
                        type="button"
                        onClick={() => setQuizSubmitted(true)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
                      >
                        {currentT.quizSubmit}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                      >
                        {currentT.quizRetry}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>📄</span> {currentT.resourcesPdf}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {currentModule.content[lang].downloads.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-6 rounded-3xl bg-black/50 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-extrabold">
                            PDF Officiel A4 Imprimable
                          </span>
                          <h4 className="font-bold text-sm md:text-base leading-snug pt-1">
                            {doc.name}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            generateAndDownloadPDF(
                              doc,
                              lang === 'fr'
                                ? currentModule.titleFr
                                : currentModule.titleEn
                            )
                          }
                          className="shrink-0 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition hover:opacity-95 shadow-lg"
                        >
                          <span>📥</span> {currentT.generatePdfBtn}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'success' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-4xl">
              ✨
            </div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
              {currentT.successBadge}
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white">
                {currentT.successTitle}
              </h2>
              <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto">
                {currentT.successDesc}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 space-y-3">
              <p className="text-xs text-slate-300 font-semibold">
                {currentT.backupCodeNotice}
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl font-mono font-black text-cyan-400 tracking-widest">
                  PACK-COMPLET-2026
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode('PACK-COMPLET-2026')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black"
                >
                  {copiedCode === 'PACK-COMPLET-2026'
                    ? currentT.copiedBtn
                    : currentT.copyBtn}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2 max-w-md mx-auto">
              <input
                type="text"
                value={studentName}
                onChange={(e) => handleSaveStudentName(e.target.value)}
                placeholder={currentT.certNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-black border border-slate-700 text-white text-center text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={generateCertificate}
                className="w-full px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition"
              >
                {currentT.certTitle}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-cyan-400 hover:underline"
              >
                {currentT.viewUnlocked}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pack' && (
          <div className="max-w-xl mx-auto bg-slate-900 border border-amber-500/40 rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
              ⚡ SUPER PROMO — 7 Modules + 6 Simulateurs + PDF
            </span>
            <h2 className="text-3xl font-black text-white">
              {currentT.packTitle}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentT.packDesc}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl md:text-5xl font-black text-cyan-400">49,99 $ CAD</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleOpenLink(paymentLinks.packIntegral.stripe)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-600 font-extrabold text-slate-950 text-sm shadow-lg hover:opacity-95 transition animate-pulse"
              >
                {currentT.payCardStripe}
              </button>
              <button
                type="button"
                onClick={() => handleOpenLink(paymentLinks.packIntegral.paypal)}
                className="flex-1 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 font-extrabold text-white text-sm shadow-lg transition"
              >
                {currentT.payWithPaypal}
              </button>
            </div>
            <p className="text-xs text-slate-400">{currentT.taxNotice}</p>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-center">
              🔑 {currentT.vipSection}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 text-center leading-relaxed">
              {currentT.vipDesc}
            </p>
            <form onSubmit={handleValidateVip} className="space-y-4">
              <input
                type="text"
                value={vipCode}
                onChange={(e) => setVipCode(e.target.value)}
                placeholder={currentT.vipPlaceholder}
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-center uppercase tracking-widest focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 font-bold text-white text-sm shadow-lg hover:opacity-95 transition"
              >
                {currentT.unlockBtn}
              </button>
            </form>
            {vipStatus === 'success' && (
              <div className="space-y-3 text-center">
                <p className="text-emerald-400 text-sm font-bold">
                  ✅ {currentT.accessGranted}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  {currentT.viewUnlocked}
                </button>
              </div>
            )}
            {vipStatus === 'error' && (
              <p className="text-rose-400 text-xs text-center font-medium">
                ⚠️ {currentT.invalidCode}
              </p>
            )}

            {unlockedModules.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3 text-center">
                <h3 className="text-sm font-bold text-amber-400">
                  {currentT.certTitle}
                </h3>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => handleSaveStudentName(e.target.value)}
                  placeholder={currentT.certNamePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-center text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={generateCertificate}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition"
                >
                  🖨️ {currentT.certTitle}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {!fieldMode && (
        <footer
          className={`border-t py-10 mt-20 text-xs ${
            nightVision
              ? 'border-rose-900 bg-[#120101] text-rose-300'
              : 'border-slate-800/80 bg-[#010308] text-slate-400'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2.5">
              <AstroberbLogo className="w-6 h-6" />
              <span className="font-bold">Astroberb Academy</span>
              <span>
                — © {new Date().getFullYear()} {currentT.footerRights}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 font-medium">
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:underline transition"
              >
                {currentT.termsLink}
              </button>
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:underline transition"
              >
                {currentT.privacyLink}
              </button>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="hover:underline transition"
              >
                ✉️ {currentT.contactSupport} ({SUPPORT_EMAIL})
              </a>
            </div>
          </div>
        </footer>
      )}

      {legalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {legalModal === 'terms'
                  ? currentT.termsLink
                  : currentT.privacyLink}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            {legalModal === 'terms' ? (
              <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-3">
                <p>
                  <strong>1. Objet :</strong> Les présentes Conditions Générales
                  de Vente encadrent l’accès aux formations numériques,
                  simulateurs optiques et fiches PDF d’Astroberb Academy.
                </p>
                <p>
                  <strong>2. Accès immédiat & Licence :</strong> Dès validation
                  du paiement via Stripe ou PayPal, l’accès aux modules achetés
                  est débloqué immédiatement et un code de sauvegarde personnel
                  multi-appareils est fourni à l’élève. L’accès est personnel,
                  illimité dans le temps et inclut les mises à jour.
                </p>
                <p>
                  <strong>3. Produits numériques :</strong> S’agissant de
                  contenus numériques accessibles et téléchargeables
                  instantanément, l’acheteur bénéficie d’un support réactif à
                  l’adresse {SUPPORT_EMAIL} pour toute assistance technique ou
                  récupération de code d’accès.
                </p>
              </div>
            ) : (
              <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-3">
                <p>
                  <strong>1. Sécurité des transactions :</strong> Tous les
                  règlements sont traités de manière 100 % chiffrée (SSL/TLS)
                  directement par nos partenaires certifiés Stripe et PayPal.
                  Astroberb Academy ne stocke aucune coordonnée bancaire.
                </p>
                <p>
                  <strong>2. Stockage local :</strong> Votre progression, votre
                  choix de langue et vos modules débloqués sont enregistrés
                  localement sur votre navigateur (LocalStorage) sans pistage
                  publicitaire tiers.
                </p>
                <p>
                  <strong>3. Contact & Droit d’accès :</strong> Pour toute
                  question relative à vos données ou à votre compte membre,
                  contactez-nous à {SUPPORT_EMAIL}.
                </p>
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                {currentT.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
