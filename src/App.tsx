import React, { useState, useEffect } from 'react';

// ==========================================
// CONFIGURATION DES CODES D'ACCÈS SÉCURISÉS
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

interface Slide {
  title: string;
  subtitle: string;
  bullets: string[];
  proTip: string;
}

interface LessonSection {
  level: string;
  heading: string;
  body: string;
  highlight?: string;
}

interface TroubleshootingItem {
  symptom: string;
  cause: string;
  solution: string;
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
  const [vipCode, setVipCode] = useState('');
  const [studentName, setStudentName] = useState<string>('');
  const [unlockedModules, setUnlockedModules] = useState<number[]>([]);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [vipStatus, setVipStatus] = useState<'success' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<
    'home' | 'vip' | 'pack' | 'success' | 'module-detail'
  >('home');
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [justPurchasedModule, setJustPurchasedModule] =
    useState<boolean>(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(
    null
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Simulateur 1 : Échantillonnage & Résolution (Module 1)
  const [calcFocal, setCalcFocal] = useState<number>(500);
  const [calcAperture, setCalcAperture] = useState<number>(90);
  const [calcPixel, setCalcPixel] = useState<number>(3.76);

  // Simulateur 2 : Zone Critique de Focus CFZ & EAF (Module 5)
  const [calcFokusFD, setCalcFokusFD] = useState<number>(4.8);
  const [calcMicronStep, setCalcMicronStep] = useState<number>(2.5);

  // Simulateur 3 : Règle NPF Grand Champ sans suivi (Module 7)
  const [npfFocal, setNpfFocal] = useState<number>(24);
  const [npfAperture, setNpfAperture] = useState<number>(2.0);
  const [npfPixel, setNpfPixel] = useState<number>(3.76);

  // Quiz Interactif
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
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
      const savedSteps = localStorage.getItem('astroberb_checked_steps');
      if (savedSteps) setCheckedSteps(JSON.parse(savedSteps));
    } catch (e) {
      console.error('Erreur de lecture locale', e);
    }

    const params = new URLSearchParams(window.location.search);
    const unlockParam = params.get('unlock');
    const successParam = params.get('success');

    if (unlockParam === 'all' || successParam === 'true') {
      currentUnlocked = [1, 2, 3, 4, 5, 6, 7];
      try {
        localStorage.setItem(
          'astroberb_unlocked',
          JSON.stringify(currentUnlocked)
        );
      } catch (e) {}
      setActiveTab('success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (unlockParam) {
      const modId = parseInt(unlockParam, 10);
      if (modId >= 1 && modId <= 7) {
        if (!currentUnlocked.includes(modId)) {
          currentUnlocked = [...currentUnlocked, modId];
          try {
            localStorage.setItem(
              'astroberb_unlocked',
              JSON.stringify(currentUnlocked)
            );
          } catch (e) {}
        }
        setSelectedModuleId(modId);
        setJustPurchasedModule(true);
        setActiveTab('module-detail');
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
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

  const toggleStepCheck = (modId: number, stepIdx: number) => {
    const key = `${modId}-${stepIdx}`;
    const updated = { ...checkedSteps, [key]: !checkedSteps[key] };
    setCheckedSteps(updated);
    try {
      localStorage.setItem('astroberb_checked_steps', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSaveStudentName = (val: string) => {
    setStudentName(val);
    try {
      localStorage.setItem('astroberb_student_name', val);
    } catch (e) {}
  };

  // GÉNÉRATEUR DE CERTIFICAT OFFICIEL A4 PAYSAGE
  const generateCertificate = () => {
    const displayName =
      studentName.trim() ||
      (lang === 'fr' ? "Élève d'Élite Astroberb" : 'Astroberb Elite Student');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>Certificat de Maîtrise - Astroberb Academy</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          body { font-family: 'Segoe UI', Roboto, sans-serif; background: #030712; color: #f8fafc; padding: 30px; text-align: center; border: 8px solid #06b6d4; box-sizing: border-box; }
          .container { border: 2px solid #6366f1; padding: 40px; background: #0f172a; border-radius: 12px; }
          h1 { font-size: 36px; color: #38bdf8; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
          .sub { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 25px; }
          .name { font-size: 34px; font-weight: 900; color: #ffffff; border-bottom: 2px solid #06b6d4; display: inline-block; padding: 0 20px 8px 20px; margin: 20px 0; }
          p { font-size: 16px; color: #cbd5e1; max-width: 720px; margin: 0 auto 30px auto; line-height: 1.6; }
          .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 35px; border-top: 1px solid #334155; padding-top: 20px; font-size: 12px; color: #94a3b8; }
          .signature { font-family: 'Brush Script MT', cursive, sans-serif; font-size: 24px; color: #38bdf8; }
          .no-print { background: #06b6d4; color: #0f172a; padding: 12px 24px; border-radius: 8px; margin-bottom: 20px; border: none; font-weight: 900; cursor: pointer; font-size: 14px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <button class="no-print" onclick="window.print()">🖨️ ${
          lang === 'fr'
            ? 'Imprimer ou Enregistrer le Certificat en PDF'
            : 'Print or Save Certificate as PDF'
        }</button>
        <div class="container">
          <div style="font-size: 42px; margin-bottom: 10px;">🪐</div>
          <h1>Astroberb Academy</h1>
          <div class="sub">${
            lang === 'fr'
              ? 'Certificat Officiel de Maîtrise en Astrophotographie'
              : 'Official Certificate of Mastery in Astrophotography'
          }</div>
          <p>${
            lang === 'fr'
              ? "Ce diplôme certifie que l'astrophotographe ci-dessous a complété avec succès le cursus technique complet de la masterclass d'élite, incluant l'optique instrumentale, le réglage des montures harmoniques, l'automatisation astrométrique nocturne et le traitement astrophysique linéaire et non-linéaire."
              : 'This diploma certifies that the astrophotographer named below has mastered the complete elite curriculum, including optical sampling physics, strainwave harmonic mount tracking, automated astrometric sequencing, and linear/non-linear astrophysical image processing.'
          }</p>
          <div class="name">${displayName}</div>
          <div class="footer">
            <div>${lang === 'fr' ? 'Délivré le' : 'Issued on'} : ${new Date().toLocaleDateString(
              lang === 'fr' ? 'fr-FR' : 'en-US'
            )}</div>
            <div>Modules validés : ${completedModules.length} / 7 • Support : ${SUPPORT_EMAIL}</div>
            <div><span class="signature">David Bérubé</span><br/>${
              lang === 'fr'
                ? 'Fondateur & Formateur Principal'
                : 'Founder & Lead Instructor'
            }</div>
          </div>
        </div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=1050,height=750');
    if (win) {
      win.document.open();
      win.document.write(htmlContent);
      win.document.close();
    }
  };

  // GÉNÉRATEUR DE MANUELS PDF TECHNIQUES A4
  const generateAndDownloadPDF = (doc: DownloadDoc, moduleTitle: string) => {
    const sectionsHtml = doc.sections
      .map(
        (sec) => `
        <div class="section">
          <h2>${sec.title}</h2>
          <ul>
            ${sec.content.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>${doc.name} - Astroberb Academy</title>
        <style>
          @page { size: A4; margin: 14mm; }
          body { font-family: 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.5; padding: 12px; background: white; }
          .header { border-bottom: 3px solid #6366f1; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 20px; font-weight: 900; color: #312e81; }
          .sub { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
          h1 { font-size: 20px; color: #0f172a; margin-bottom: 8px; margin-top: 0; }
          .mod-tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; margin-bottom: 12px; }
          .section { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; page-break-inside: avoid; }
          .section h2 { font-size: 14px; color: #1e293b; margin-top: 0; margin-bottom: 6px; }
          ul { margin: 0; padding-left: 18px; }
          li { margin-bottom: 5px; font-size: 12.5px; color: #334155; }
          .footer { margin-top: 24px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 11px; color: #64748b; text-align: center; }
          .no-print { background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .btn-print { background: #06b6d4; color: #0f172a; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span>📄 <strong>${
            lang === 'fr' ? 'Manuel technique A4 prêt' : 'Technical A4 sheet ready'
          }</strong> — ${
            lang === 'fr'
              ? 'Cliquez pour enregistrer en PDF ou imprimer.'
              : 'Click to save as PDF or print.'
          }</span>
          <button class="btn-print" onclick="window.print()">🖨️ ${
            lang === 'fr' ? 'Enregistrer en PDF' : 'Save as PDF'
          }</button>
        </div>
        <div class="header">
          <div>
            <div class="brand">🪐 ASTROBERB ACADEMY</div>
            <div class="sub">${
              lang === 'fr'
                ? 'Manuel Technique Opérationnel & Abaques Terrain'
                : 'Official Field Manual & Technical Reference'
            }</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #475569;">Édition 2026</div>
        </div>
        <div class="mod-tag">${moduleTitle}</div>
        <h1>${doc.title}</h1>
        ${sectionsHtml}
        <div class="footer">© ${new Date().getFullYear()} Astroberb Academy — Par David Bérubé — Support : ${SUPPORT_EMAIL}</div>
        <script>setTimeout(() => { window.print(); }, 400);</script>
      </body>
      </html>
    `;
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
      subtitle: "Maîtrisez l'Astrophotographie du Ciel Profond",
      heroBadge: '✨ Masterclass Complète • Du Débutant à l’Expert • Édition 2026',
      heroDesc:
        'Un programme pas-à-pas ultra-détaillé : montage mécanique de A à Z, optique et backfocus 55 mm, montures harmoniques (Juwei-17, UMi-17S, AM5), automatisation N.I.N.A./ASIAIR et traitement complet Siril & PixInsight.',
      trustBadge: '⭐ Noté 4.9/5 par plus de 320 passionnés • Contenu 100% Pratique & Terrain',
      catalog: 'Catalogue des Cours',
      vipSection: 'Accès Membre / Code',
      unlockBtn: 'Activer mon code',
      buyStripe: 'Carte bancaire',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Obtenir le Pack Intégral 7 Modules (79$ CAD)',
      packBtnShort: '🔥 Pack Intégral',
      accessGranted: 'Code validé avec succès ! Cliquez sur vos formations débloquées :',
      invalidCode:
        "Code d'accès invalide. Vérifiez votre courriel ou contactez le support.",
      accessCourse: '🚀 OUVRIR LA MASTERCLASS COMPLÈTE',
      lockedBadge: '🔒 Module verrouillé',
      unlockedBadge: '🔓 Déverrouillé',
      backToCatalog: '← Retour au catalogue des formations',
      paymentConfirmedModule:
        '🎉 Accès débloqué ! Notez précieusement votre code de sauvegarde multi-appareils : ',
      interactiveModule: 'Masterclass Complète : Débutant ➔ Expert',
      studioHeader: '1. Diaporama Pédagogique Chapitré (4 Chapitres)',
      fullCourseTitle: '2. Cours Technique Complet & Protocoles Détaillés',
      troubleshootTitle: '3. Diagnostic des Pannes & Dépannage Nocturne sur le Terrain',
      tutorialSteps: '4. Checklist Opérationnelle Interactive (Cochez sur le terrain)',
      quizTitle: '5. Quiz de Validation des Acquis (3 Questions)',
      resourcesPdf: '6. Manuel Technique Imprimable (Générateur PDF A4)',
      generatePdfBtn: 'Générer & Télécharger le Manuel PDF',
      successBadge: 'Paiement Validé avec Succès',
      successTitle: 'Bienvenue dans l’élite de l’Astroberb Academy !',
      successDesc:
        'Votre accès intégral est débloqué. Vous avez désormais accès à vie aux 7 modules complets, aux 3 calculateurs optiques, aux tables de dépannage et aux manuels PDF.',
      backupCodeNotice: 'IMPORTANT — Votre code d’accès multi-appareils à conserver :',
      packTitle: 'L’Offre Ultime : Le Pack Intégral 7-en-1',
      packDesc:
        'Accès immédiat, illimité et à vie aux 7 masterclasses complètes (28 chapitres, 28 leçons approfondies, 3 simulateurs optiques, 21 diagnostics de pannes terrain et 7 manuels PDF A4). Valeur : 203$ CAD — Économisez 124$ !',
      payCardStripe: '💳 Payer par Carte Sécurisée (Stripe)',
      payWithPaypal: '🅿️ Payer instantanément avec PayPal',
      vipDesc:
        'Entrez votre code personnel reçu après votre achat (ou votre code de sauvegarde) pour débloquer instantanément vos formations sur cet appareil :',
      vipPlaceholder: 'Votre code (ex: PACK-COMPLET-2026 ou ASTRO-MOD1)',
      viewUnlocked: 'Voir mes modules déverrouillés ➔',
      taxNotice:
        'Prix en dollars canadiens (CAD). Paiement 100% sécurisé — Accès immédiat sans abonnement.',
      footerRights: 'Tous droits réservés.',
      termsLink: 'Conditions Générales de Vente (CGV)',
      privacyLink: 'Politique de Confidentialité',
      contactSupport: 'Support VIP',
      closeBtn: 'Fermer',
      prevSlide: '◀ Chapitre précédent',
      nextSlide: 'Chapitre suivant ▶',
      proTipLabel: '💡 Conseil Terrain de David (Astroberb) :',
      quickAccessTitle: '⚡ Accès direct à vos formations déverrouillées :',
      calcTitle:
        '🧮 Simulateur Optique : Échantillonnage, Rapport f/D & Limite de Dawes',
      calcFocalLabel: 'Focale effective du télescope (mm) :',
      calcApertureLabel: 'Diamètre de l’optique (mm) :',
      calcPixelLabel: 'Taille des pixels caméra (µm) :',
      calcResult: 'Échantillonnage : ',
      calcVerdictGreat:
        '✨ Optimal (0.8" à 2.0"/px) ! Parfaitement accordé au seeing standard (2" à 3") pour maximiser la finesse sans perdre en rapport signal/bruit.',
      calcVerdictOver:
        '⚠️ Sur-échantillonnage (< 0.8"/px) : Vous grossissez la turbulence atmosphérique. Exige un ciel calme exceptionnel et un guidage < 0.45", ou passez en Binning 2x2.',
      calcVerdictUnder:
        '⚠️ Sous-échantillonnage (> 2.0"/px) : Grand champ très lumineux idéal pour les grandes nébuleuses, mais activez l’option Drizzle x2 lors de l’empilement pour arrondir les petites étoiles.',
      calcFocusTitle:
        '🔬 Simulateur EAF : Zone Critique de Mise au Point (CFZ) & Step Size',
      calcFocusFDLabel: 'Rapport d’ouverture du tube (f/D) :',
      calcFocusStepLabel: 'Déplacement de votre EAF par pas (µm/pas) :',
      calcFocusResult: 'Zone Critique de netteté absolue (CFZ) : ',
      calcFocusAdvice: 'Taille de pas EAF recommandée (Step Size pour Courbe en V) : ',
      calcNpfTitle:
        '📸 Simulateur Grand Champ : Règle NPF (Temps de Pose Max Sans Suivi)',
      calcNpfFocalLabel: 'Focale de l’objectif photo (mm) :',
      calcNpfApertureLabel: 'Ouverture du diaphragme (f/) :',
      calcNpfPixelLabel: 'Taille des pixels du boîtier (µm) :',
      calcNpfResult: 'Pose max sur trépied fixe (Étoiles 100% ponctuelles) : ',
      quizSubmit: 'Valider mes réponses',
      quizScore: 'Score : ',
      quizRetry: 'Recommencer le quiz',
      correctAnswer: '✅ Exact !',
      wrongAnswer: '❌ Incorrect.',
      markComplete: '✓ Marquer ce module comme terminé',
      markIncomplete: '✓ Module terminé (Cliquer pour annuler)',
      certTitle: '🏆 Télécharger mon Certificat Officiel',
      certNamePlaceholder: 'Entrez votre Prénom et Nom pour le diplôme',
      faqTitle: '❓ Foire Aux Questions (FAQ)',
      faq1Q: 'Je pars de zéro avec mon premier télescope, vais-je tout comprendre ?',
      faq1A:
        'Oui ! Chaque module commence par le niveau "Fondations Débutant" qui explique comment visser, brancher, équilibrer et allumer votre matériel étape par étape, avant d’aborder les réglages "Expert" pour aller chercher la perfection.',
      faq2Q: "Et si j'ai déjà de l'expérience (ASIAIR, N.I.N.A., monture harmonique) ?",
      faq2A:
        'Vous allez adorer les sections avancées : réglage fin des algorithmes PPEC/Hysteresis sur réducteurs Strainwave, calcul de la CFZ, diagnostic du tilt optique, exposition au fond de ciel (Swamp Factor 10x RN²) et workflow linéaire PixInsight/Siril (SPCC, Déconvolution PSF, GHS).',
      faq3Q: 'Que faire si j’ai un problème sur le terrain à 2h du matin ?',
      faq3A:
        'Chaque module intègre une table de "Diagnostic des Pannes & Dépannage Nocturne" consultable en Mode Nuit Rouge (🔴) directement sur votre téléphone, ainsi que des manuels PDF téléchargeables hors-ligne.',
      testimonialsTitle: '⭐ Ce que disent nos étudiants passionnés',
      t1: '“Grâce au module sur les montures harmoniques (Juwei-17 / UMi-17S) et N.I.N.A., mon erreur RMS est passée de 1.4" à 0.52" et mes séquences tournent toute la nuit sans aucune erreur de retournement au méridien !”',
      t1Author: 'Marc D., Astrophotographe amateur (Québec)',
      t2: '“La section de dépannage sur le backfocus à 55 mm et le cours pas-à-pas sur Siril & PixInsight (GraXpert + SPCC + GHS) m’ont permis de sortir ma plus belle image de la galaxie NGC 7331 dès le premier essai.”',
      t2Author: 'Stéphane L., Passionné de ciel profond',
    },
    en: {
      title: 'Astroberb Academy',
      subtitle: 'Master Deep Sky Astrophotography',
      heroBadge: '✨ Complete Masterclass • Beginner to Expert • 2026 Edition',
      heroDesc:
        'A comprehensive step-by-step curriculum: mechanical assembly from A to Z, 55mm backfocus optics, strainwave mounts (Juwei-17, UMi-17S, AM5), N.I.N.A./ASIAIR automation, and Siril & PixInsight processing.',
      trustBadge: '⭐ Rated 4.9/5 by over 320 enthusiasts • 100% Practical Field Content',
      catalog: 'Course Catalog',
      vipSection: 'Member Access / Code',
      unlockBtn: 'Activate Code',
      buyStripe: 'Credit Card',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Get Full 7-Module Bundle ($79 CAD)',
      packBtnShort: '🔥 Full Bundle',
      accessGranted: 'Code validated! Click any unlocked course below:',
      invalidCode:
        'Invalid access code. Please check your email or contact support.',
      accessCourse: '🚀 OPEN FULL MASTERCLASS',
      lockedBadge: '🔒 Locked Module',
      unlockedBadge: '🔓 Unlocked',
      backToCatalog: '← Back to course catalog',
      paymentConfirmedModule:
        '🎉 Access unlocked! Please save your multi-device backup code: ',
      interactiveModule: 'Complete Masterclass: Beginner ➔ Expert',
      studioHeader: '1. Chaptered Interactive Slides (4 Chapters)',
      fullCourseTitle: '2. In-Depth Technical Course & Step-by-Step Protocols',
      troubleshootTitle: '3. Field Troubleshooting & Nighttime Diagnostics',
      tutorialSteps: '4. Interactive Field Checklist (Check off in the field)',
      quizTitle: '5. Knowledge Validation Quiz (3 Questions)',
      resourcesPdf: '6. Printable Technical Manual (A4 PDF Generator)',
      generatePdfBtn: 'Generate & Download PDF Manual',
      successBadge: 'Payment Successful',
      successTitle: 'Welcome to the Elite Astroberb Academy!',
      successDesc:
        'Your full bundle is unlocked. Enjoy lifetime access to all 7 modules, 3 optical calculators, troubleshooting tables, and printable PDF manuals.',
      backupCodeNotice: 'IMPORTANT — Save your multi-device backup code:',
      packTitle: 'The Ultimate Offer: 7-in-1 Full Bundle',
      packDesc:
        'Immediate lifetime access to all 7 masterclasses (28 slide chapters, 28 deep lessons, 3 optical calculators, 21 field troubleshooting guides, and 7 A4 PDF manuals). $203 CAD value — Save $124!',
      payCardStripe: '💳 Secure Credit Card (Stripe)',
      payWithPaypal: '🅿️ Pay instantly with PayPal',
      vipDesc:
        'Enter your personal access code received after purchase to instantly unlock your courses on this device:',
      vipPlaceholder: 'Your code (e.g., PACK-COMPLET-2026 or ASTRO-MOD1)',
      viewUnlocked: 'View my unlocked modules ➔',
      taxNotice:
        'Prices in Canadian Dollars (CAD). 100% secure checkout — Instant lifetime access.',
      footerRights: 'All rights reserved.',
      termsLink: 'Terms of Sale (TOS)',
      privacyLink: 'Privacy Policy',
      contactSupport: 'VIP Support',
      closeBtn: 'Close',
      prevSlide: '◀ Previous Chapter',
      nextSlide: 'Next Chapter ▶',
      proTipLabel: '💡 David’s Field Pro Tip (Astroberb):',
      quickAccessTitle: '⚡ Direct access to your unlocked courses:',
      calcTitle: '🧮 Optical Simulator: Pixel Scale, Focal Ratio & Dawes Limit',
      calcFocalLabel: 'Effective Telescope Focal Length (mm):',
      calcApertureLabel: 'Optics Aperture Diameter (mm):',
      calcPixelLabel: 'Camera Pixel Size (µm):',
      calcResult: 'Pixel Scale: ',
      calcVerdictGreat:
        '✨ Optimal (0.8" to 2.0"/px)! Well matched to typical atmospheric seeing (2" to 3") for sharp details and high SNR.',
      calcVerdictOver:
        '⚠️ Oversampled (< 0.8"/px): Magnifying atmospheric turbulence. Requires exceptional seeing and sub-0.45" guiding, or 2x2 Binning.',
      calcVerdictUnder:
        '⚠️ Undersampled (> 2.0"/px): Great fast widefield framing for large nebulae; use 2x Drizzle integration when stacking to keep small stars round.',
      calcFocusTitle:
        '🔬 EAF Simulator: Critical Focus Zone (CFZ) & Step Size',
      calcFocusFDLabel: 'Telescope Focal Ratio (f/D):',
      calcFocusStepLabel: 'Focuser Travel per Step (µm/step):',
      calcFocusResult: 'Critical Focus Zone Tolerance (CFZ): ',
      calcFocusAdvice: 'Recommended EAF Step Size for V-Curve autofocus: ',
      calcNpfTitle:
        '📸 Widefield Simulator: NPF Rule (Max Untracked Exposure Time)',
      calcNpfFocalLabel: 'Camera Lens Focal Length (mm):',
      calcNpfApertureLabel: 'Lens Aperture (f/):',
      calcNpfPixelLabel: 'Camera Pixel Pitch (µm):',
      calcNpfResult: 'Max Static Tripod Exposure (Pinpoint Stars): ',
      quizSubmit: 'Submit Answers',
      quizScore: 'Score: ',
      quizRetry: 'Reset Quiz',
      correctAnswer: '✅ Correct!',
      wrongAnswer: '❌ Incorrect.',
      markComplete: '✓ Mark module as completed',
      markIncomplete: '✓ Completed (Click to undo)',
      certTitle: '🏆 Download My Official Certificate',
      certNamePlaceholder: 'Enter your Full Name for the diploma',
      faqTitle: '❓ Frequently Asked Questions (FAQ)',
      faq1Q: 'I am a complete beginner with my first telescope. Will I understand everything?',
      faq1A:
        'Yes! Every module starts with "Beginner Foundations" showing how to assemble, thread, balance, and power your gear step by step before progressing to "Expert Optimization".',
      faq2Q: 'What if I already have experience with ASIAIR, N.I.N.A., or harmonic mounts?',
      faq2A:
        'You will love the advanced sections: strainwave PPEC/Hysteresis tuning, CFZ math, optical tilt diagnostics, 10x RN² sky-background exposure calculation, and PixInsight/Siril linear workflows (SPCC, PSF Deconvolution, GHS).',
      faq3Q: 'What if I run into an issue in the field at 2 AM?',
      faq3A:
        'Every module includes a "Field Troubleshooting & Diagnostics" table viewable in Red Night Vision mode (🔴) on your phone, plus offline printable A4 PDF manuals.',
      testimonialsTitle: '⭐ What our passionate students say',
      t1: '“Thanks to the strainwave harmonic mount (Juwei-17 / UMi-17S) and N.I.N.A. module, my RMS guiding dropped from 1.4" to 0.52" and my sessions run all night without a single meridian flip issue!”',
      t1Author: 'Marc D., Amateur Astrophotographer (Quebec)',
      t2: '“The 55mm backfocus troubleshooting guide and the Siril & PixInsight workflow (GraXpert + SPCC + GHS) helped me process my sharpest image of galaxy NGC 7331 on the first try.”',
      t2Author: 'Stéphane L., Deep Sky Enthusiast',
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
      titleFr: 'Module 1 : Choisir & Assembler son Télescope et ses Optiques',
      titleEn: 'Module 1: Choosing & Assembling Your Telescope & Optics',
      price: 29,
      badgeFr: 'Fondamental Optique',
      badgeEn: 'Optical Foundations',
      descFr:
        'Du déballage au réglage expert : Lunettes APO, Petzval, Newton, RC, montage vissé M48, backfocus exact à 55,0 mm, échantillonnage et correction du tilt.',
      descEn:
        'From unboxing to expert tuning: APO refractors, Petzval, Newtonian, RC, M48 threaded assembly, exact 55.0mm backfocus, pixel scale, and sensor tilt.',
      image:
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module1,
      calculatorType: 'sampling' as const,
      content: {
        fr: {
          intro:
            "Ce premier module est conçu pour que le débutant comprenne exactement quel instrument choisir et comment visser chaque bague sans se tromper, tout en offrant à l'astrophotographe aguerri les formules exactes d'échantillonnage, de compensation d'épaisseur des filtres et de diagnostic de courbure de champ et de tilt.",
          slides: [
            {
              title: "Chapitre 1 : Focale vs Rapport d'ouverture (f/D)",
              subtitle: "Comprendre le cadrage (zoom) et la vitesse d'accumulation des photons",
              bullets: [
                'Débutant — La Longueur Focale (ex: 400 mm vs 1200 mm) : Elle détermine uniquement votre cadrage. À 300-500 mm, vous cadrez d’immenses nébuleuses (Andromède, Orion, América). À 1000-2000 mm, vous zoomez sur de petites galaxies (M51, NGC 7331).',
                'Débutant — Le Diamètre (ex: 80 mm vs 200 mm) : Plus le diamètre de la lentille ou du miroir est grand, plus son pouvoir séparateur (finesse théorique des détails) est élevé.',
                "Expert — Le Rapport d'Ouverture (f/D = Focale ÷ Diamètre) : Il dicte la vitesse photographique pure. Selon la loi en carré inverse, passer de f/8 à f/4 concentre 4 fois plus de photons par pixel : 1 heure de pose à f/4 donne le même rapport signal/bruit que 4 heures à f/8 !",
              ],
              proTip: "Si vous débutez, fuyez les longues focales (> 1000 mm) à f/8 ou f/10 : elles sont sombres et amplifient la moindre erreur de suivi. Une lunette apochromatique de 70 à 90 mm ouverte entre f/4.5 et f/5.5 garantit des images nettes dès la première nuit.",
            },
            {
              title: 'Chapitre 2 : Comparatif Complet des Formules Optiques',
              subtitle: 'Triplet APO, Quadruplet Petzval, Newton f/4, Schmidt-Cassegrain & RC',
              bullets: [
                'Lunette Apochromatique (Doublet/Triplet ED) : Zéro collimation (les lentilles sont fixes), contraste maximal, insensible à la turbulence interne. Nécessite l’ajout d’un correcteur/réducteur à l’arrière avec un backfocus de 55 mm.',
                'Lunette Petzval (4 ou 5 lentilles, ex: Askar FRA, RedCat) : Le correcteur de champ est intégré d’usine à l’intérieur du tube ! Aucun calcul de backfocus n’est requis : dès que vous êtes au point, le champ est plat.',
                'Télescope de Newton (f/4 ou f/5) & Ritchey-Chrétien (RC) : Aucune aberration chromatique (miroirs purs) et grand diamètre abordable, mais nécessite un correcteur de coma (Newton) et une collimation rigoureuse des miroirs avant chaque séance.',
              ],
              proTip: 'Attention au porte-oculaire sur les tubes économiques : vérifiez toujours qu’il s’agit d’une crémaillère (Rack & Pinion) avec démultiplication 1:10 plutôt qu’un simple Crayford à friction qui risque de glisser au zénith sous le poids de la caméra.',
            },
            {
              title: 'Chapitre 3 : Assembler ses Bagues & Réussir le Backfocus 55,0 mm',
              subtitle: 'Guide mécanique pas-à-pas pour visser son train optique',
              bullets: [
                'Pourquoi 55,0 mm ? Les lentilles d’un correcteur ou réducteur sont taillées pour focaliser une image plane à exactement 55,0 mm derrière leur filetage arrière M48.',
                'Le calcul universel ZWO / QHY / Player One : Profondeur du capteur dans la caméra refroidie (17,5 mm) + Tiroir à filtre ou Roue à filtres ou Diviseur Optique (21,0 mm) + Bague d’allonge M48 fournie (16,5 mm) = 55,0 mm exactement !',
                'Interdiction du coulant à vis : Ne glissez jamais votre caméra dans un porte-oculaire à serrage par vis latérales. Dévissez le porte-oculaire et vissez directement votre correcteur en filetage M48 ou M54 pour une rigidité absolue.',
              ],
              proTip: 'Règle optique des filtres : Le verre d’un filtre recule le point focal d’environ 1/3 de son épaisseur. Si vous utilisez un filtre de 2,0 mm d’épaisseur, votre distance idéale passe de 55,0 mm à 55,7 mm (ajoutez une rondelle fine de 0,5 à 0,7 mm) !',
            },
            {
              title: 'Chapitre 4 : Diagnostic Visuel des Coins & Correction du Tilt',
              subtitle: 'Lire la forme des étoiles dans les 4 coins comme un opticien',
              bullets: [
                'Cas n°1 — Étoiles étirées vers le centre (effet "vitesse lumière" / rayons de vélo) : Votre capteur est TROP PROCHE du correcteur. Ajoutez +0,5 mm ou +1,0 mm de rondelles d’espacement (shims).',
                'Cas n°2 — Étoiles étirées en cercle autour du centre (effet "tourbillon" tangentiel) : Votre capteur est TROP ÉLOIGNÉ du correcteur. Retirez 0,5 mm ou 1,0 mm d’espacement.',
                'Cas n°3 — 2 coins sont parfaits à gauche, mais les 2 coins de droite sont flous/allongés : Votre backfocus est bon, mais votre capteur souffre de TILT (il n’est pas parfaitement perpendiculaire à l’axe optique).',
              ],
              proTip: 'Utilisez l’outil gratuit "Aberration Inspector" (dans N.I.N.A. HFR Analysis ou ASTAP Tilt Inspection) : il découpe automatiquement votre image en une mosaïque 3x3 des coins et trace le polygone exact d’inclinaison de votre capteur !',
            },
          ] as Slide[],
          courseSections: [
            {
              level: 'Niveau Débutant — Montage Mécanique',
              heading: '1. Comment Monter et Équilibrer son Tube Optique Pas à Pas',
              body: "Avant même de brancher un câble : 1) Glissez la queue d'aronde (barre métallique type Vixen ou Losmandy sous le télescope) dans la mâchoire de la monture et serrez fermement les vis de sécurité. 2) Déployez complètement le pare-buée à l'avant de la lunette et retirez le bouchon. 3) Vissez votre correcteur/réducteur, vos bagues de 55 mm et votre caméra à l'arrière. 4) Desserrez légèrement l'embrayage de Déclinaison (DEC) à l'horizontale : le tube ne doit pencher ni vers l'avant ni vers l'arrière. S'il penche, faites-le coulisser d'un centimètre dans ses colliers.",
              highlight: 'Ordre mécanique : Tube dans colliers -> Pare-buée sorti -> Train optique vissé (55 mm) -> Équilibrage horizontal DEC',
            },
            {
              level: 'Niveau Intermédiaire — Mathématiques Optiques',
              heading: "2. L'Échantillonnage, le Seeing Atmosphérique et le Critère de Nyquist",
              body: "L'échantillonnage (en secondes d'arc par pixel, \"/px) indique la taille angulaire d'un seul pixel sur le ciel. L'atmosphère terrestre fait scintiller et étale les étoiles sur un disque appelé Seeing (souvent entre 2,0\" et 3,0\" en plaine). D'après le théorème d'échantillonnage de Nyquist-Shannon, pour résoudre les détails les plus fins sans perdre de sensibilité, la taille d'un pixel sur le ciel doit représenter entre la moitié et le tiers du Seeing, soit idéalement entre 0,8\"/px et 2,0\"/px.",
              highlight: 'Formule clé : Échantillonnage ("/px) = (206,265 × Taille_Pixel_µm) ÷ Focale_Effective_mm',
            },
            {
              level: 'Niveau Avancé — Collimation & Réflecteurs',
              heading: '3. Collimation Chirurgicale des Télescopes Newton et Ritchey-Chrétien',
              body: "Sur un télescope à miroirs (Newton f/4 ou RC), un décalage de 0,5 mm de l'axe optique détruit la finesse des étoiles. La procédure en 3 étapes sur Newton : 1) Centrer et orienter le miroir secondaire sous le porte-oculaire à l'aide d'un œilleton Cheshire ou d'une caméra Concenter. 2) Aligner l'axe du miroir secondaire sur le centre du miroir primaire au laser collimaté. 3) Aligner le retour du miroir primaire, puis affiner sur une étoile réelle légèrement défocalisée au centre du champ (les anneaux de diffraction de la tache d'Airy doivent être parfaitement concentriques).",
              highlight: 'Règle d’or Newton : Toujours faire la collimation finale avec le tube incliné à 45°-60° (dans sa position réelle de prise de vue).',
            },
            {
              level: 'Niveau Expert — Métrologie Optique',
              heading: '4. Cercle d’Image Corrigé (APS-C vs Full Frame 24x36) et Réglage du Tilt',
              body: "Un capteur APS-C (comme l'IMX571 / ASI2600) possède une diagonale de 28,3 mm, tandis qu'un capteur Plein Format 24x36 (IMX455 / ASI6200) atteint 43,3 mm de diagonale. Si le cercle d'image corrigé par votre lunette est de 32 mm, un capteur APS-C sera parfait d'un coin à l'autre, mais un Plein Format présentera du vignettage sévère et des étoiles déformées dans les extrêmes coins. Pour corriger le Tilt sur grand capteur, utilisez la méthode Tirer/Pousser (Push-Pull) sur la plaque frontale de la caméra par quarts de tour (1/4 de tour = ~125 microns) en observant la carte HFR dans ASTAP.",
              highlight: 'Diagonale IMX533 = 16,0 mm | Diagonale APS-C (IMX571) = 28,3 mm | Diagonale Full Frame (IMX455) = 43,3 mm',
            },
          ] as LessonSection[],
          troubleshooting: [
            {
              symptom: "Impossible de faire la mise au point : même en sortant ou rentrant le porte-oculaire à fond, les étoiles restent d'énormes disques flous.",
              cause: 'Le point focal mécanique du télescope se trouve en dehors de la course du porte-oculaire (il manque une bague d’allonge en mode sans réducteur, ou il y a une bague en trop).',
              solution: 'Vérifiez que vous avez retiré le renvoi coudé visuel ! En astrophoto directe avec réducteur, la caméra doit être à 55 mm derrière le réducteur. Sans réducteur, ajoutez un tube d’allonge de 40 à 50 mm.',
            },
            {
              symptom: 'Les étoiles au centre sont fines et rondes, mais dans les 4 coins elles ressemblent à des traits pointant vers le centre.',
              cause: 'Sous-correction optique : la distance entre votre correcteur/réducteur et le capteur est inférieure aux 55,0 mm requis.',
              solution: 'Insérez une rondelle de calage fine (spacer M48 de 0,5 mm ou 1,0 mm) entre le correcteur et le tiroir à filtre, puis refaites la mise au point.',
            },
            {
              symptom: 'En cours de nuit, après 1 heure de pose, les étoiles deviennent brusquement grosses, floues et entourées d’un halo laiteux.',
              cause: 'De la buée (rosée nocturne) ou du givre s’est déposé sur la lentille frontale de la lunette ou sur le miroir secondaire.',
              solution: 'Installez impérativement un collier chauffant (Dew Heater) autour du barillet de la lentille frontale (juste derrière le pare-buée) dès le début de la soirée.',
            },
          ] as TroubleshootingItem[],
          steps: [
            '1. Calculer son échantillonnage dans le simulateur ci-dessus (viser entre 0,8" et 2,0" par pixel).',
            '2. Retirer tout accessoire visuel (renvoi coudé, oculaire) et visser le correcteur/réducteur directement sur le porte-oculaire en M48/M54.',
            '3. Assembler les bagues derrière le correcteur pour obtenir exactement 55,0 mm jusqu’au capteur (+0,67 mm si filtre de 2 mm).',
            '4. Installer le collier chauffant anti-buée autour de l’optique frontale et déployer le pare-buée.',
            '5. Équilibrer le tube optique sur son rail (queue d’aronde) avec tous les accessoires et câbles en place.',
            '6. Prendre une pose test de 10 secondes sur un champ d’étoiles et vérifier la rondeur des étoiles dans les 4 coins.',
          ],
          quiz: [
            {
              question: "Quel paramètre détermine la vitesse photographique pure d'un télescope (le temps nécessaire pour capter un signal donné) ?",
              options: [
                'La longueur focale en millimètres uniquement',
                "Le rapport d'ouverture f/D (Focale divisée par le Diamètre)",
                'La longueur du pare-buée',
              ],
              correct: 1,
              explanation: "Le rapport f/D dicte la concentration de photons par unité de surface sur le capteur. Passer de f/8 à f/4 divise le temps de pose requis par 4.",
            },
            {
              question: "Sur votre image test, les étoiles situées dans les 4 coins s'étirent en pointant vers le centre de l'image. Quel est le diagnostic exact ?",
              options: [
                'Votre capteur est trop proche du correcteur/réducteur (il manque du backfocus)',
                'Votre capteur est trop éloigné du correcteur/réducteur (trop de backfocus)',
                'Votre batterie 12V est faible',
              ],
              correct: 0,
              explanation: "Des étoiles étirées radialement vers le centre indiquent une sous-correction : augmentez la distance correcteur-capteur avec une bague fine de 0,5 mm ou 1 mm.",
            },
            {
              question: 'Quelle épaisseur faut-il ajouter à votre backfocus mécanique de 55,0 mm lorsque vous insérez un filtre en verre de 2,1 mm dans le chemin optique ?',
              options: [
                '+0,7 mm (soit un tiers de l’épaisseur du filtre, portant la cible à 55,7 mm)',
                'Il faut retirer 10 mm',
                'Les filtres en verre n’ont aucun effet sur la réfraction de la lumière',
              ],
              correct: 0,
              explanation: "L'indice de réfraction du verre recule le foyer optique d'environ 1/3 de l'épaisseur traversée (+0,7 mm pour un filtre de 2,1 mm).",
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod1-pdf1',
              name: "Manuel PDF Complet : Échantillonnage, Montage M48 & Diagnostic Backfocus 55 mm",
              title: "Manuel Technique Module 1 : Optiques, Train Vissé 55 mm, Tilt & Échantillonnage",
              sections: [
                {
                  title: '1. Formules Optiques Fondamentales & Cibles de Terrain',
                  content: [
                    'Échantillonnage ("/px) = (206,265 × Taille du pixel en µm) ÷ Focale effective en mm.',
                    'Pouvoir séparateur théorique (Critère de Dawes en secondes d’arc) = 116 ÷ Diamètre en mm.',
                    'Rapport d’ouverture effectif avec réducteur = (Focale native ÷ Diamètre) × Facteur de réduction (ex: f/6 × 0,8x = f/4.8).',
                    'Plage d’or d’échantillonnage sous seeing courant (2,0" à 3,0") : entre 0,80"/px et 2,00"/px.',
                  ],
                },
                {
                  title: '2. Schéma d’Assemblage Universel 55,0 mm (Caméras Refroidies ZWO / QHY / Touptek)',
                  content: [
                    'Élément A — Caméra refroidie (distance bride frontale -> capteur CMOS) : 17,5 mm (ou 12,5 mm si bague de 5 mm retirée).',
                    'Élément B — Tiroir à filtre M48 (Filter Drawer) ou Diviseur Optique (OAG) : 21,0 mm (ou 16,5 mm sur anciens modèles).',
                    'Élément C — Bague d’extension M48-M42 : 16,5 mm.',
                    'Total Mécanique = 17,5 mm + 21,0 mm + 16,5 mm = 55,0 mm (Ajoutez +0,7 mm de rondelle fine si filtre de 2 mm).',
                  ],
                },
                {
                  title: '3. Table de Diagnostic Express des Coins (Aberration Inspector)',
                  content: [
                    'Étoiles des 4 coins filant vers le centre (Rayons) : Capteur trop proche -> Ajoutez +0,5 mm à +1,5 mm d’espaceurs.',
                    'Étoiles des 4 coins tournant autour du centre (Arcs) : Capteur trop loin -> Retirez 0,5 mm à 1,5 mm d’espaceurs.',
                    'Asymétrie gauche/droite ou haut/bas : Tilt mécanique -> Vérifiez le serrage annulaire (passez en tout-vissé) et ajustez la bague de tilt.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'This first module guides beginners through selecting an optical tube and threading every adapter accurately, while providing seasoned astrophotographers with exact sampling equations, filter thickness compensation, and field curvature / sensor tilt diagnostics.',
          slides: [
            {
              title: 'Chapter 1: Focal Length vs. Focal Ratio (f/D)',
              subtitle: 'Understanding framing (magnification) and photon collection speed',
              bullets: [
                'Beginner — Focal Length (e.g., 400mm vs. 1200mm): Dictates your field of view. At 300-500mm, you frame vast nebulae (Andromeda, Orion, North America). At 1000-2000mm, you zoom in on compact galaxies (M51, NGC 7331).',
                'Beginner — Aperture Diameter (e.g., 80mm vs. 200mm): Larger diameter optics provide higher theoretical angular resolution (Dawes Limit).',
                'Expert — Focal Ratio (f/D = Focal Length ÷ Aperture): Controls pure photographic speed. Moving from f/8 to f/4 concentrates 4x more photons per pixel—1 hour at f/4 equals 4 hours at f/8!',
              ],
              proTip: 'Beginners should avoid slow, long-focal-length scopes (>1000mm at f/8-f/10). A 70-90mm APO refractor at f/4.5 to f/5.5 delivers pinpoint results on night one.',
            },
            {
              title: 'Chapter 2: Complete Comparison of Optical Designs',
              subtitle: 'APO Triplet, Petzval Quadruplet, f/4 Newtonian, EdgeHD & RC',
              bullets: [
                'APO Refractor (ED Doublet/Triplet): Zero collimation needed, high contrast, immune to internal tube currents. Requires a rear flattener/reducer spaced at 55mm backfocus.',
                'Petzval Refractor (4-5 elements, e.g., Askar FRA, RedCat): Built-in flat-field corrector! Zero backfocus calculation required—once focused, the field is flat.',
                'Newtonian (f/4 - f/5) & Ritchey-Chrétien (RC): Pure mirror optics with zero chromatic aberration and fast speed, but require a coma corrector (Newtonian) and careful mirror collimation.',
              ],
              proTip: 'Ensure your focuser uses a geared Rack & Pinion mechanism rather than a basic friction Crayford that can slip near the zenith under heavy camera loads.',
            },
            {
              title: 'Chapter 3: Threading Adapters & Achieving Exact 55.0mm Backfocus',
              subtitle: 'Step-by-step mechanical assembly of your optical train',
              bullets: [
                'Why 55.0mm? Optical flatteners and reducers are computed to project a flat image plane exactly 55.0mm behind their rear M48 shoulder.',
                'Standard ZWO / QHY / Player One Stack: Cooled camera sensor depth (17.5mm) + Filter Drawer / Filter Wheel / OAG (21.0mm) + M48 spacer ring (16.5mm) = 55.0mm!',
                'Ban thumbscrew nosepieces: Never slide a heavy imaging train into a 2" visual compression ring. Unscrew the visual adapter and thread everything directly using M48 or M54 threads.',
              ],
              proTip: 'Filter refraction rule: Glass filters push the focal point back by 1/3 of their thickness. For a 2.0mm thick filter, your target backfocus becomes 55.7mm (add a 0.5-0.7mm shim)!',
            },
            {
              title: 'Chapter 4: Corner Star Diagnostics & Sensor Tilt Correction',
              subtitle: 'Reading corner star shapes like an optical engineer',
              bullets: [
                'Case 1 — Corner stars flare radially toward the center ("warp speed" spokes): Sensor is TOO CLOSE to the corrector. Add +0.5mm to +1.0mm spacer shims.',
                'Case 2 — Corner stars form circular arcs around the center: Sensor is TOO FAR from the corrector. Remove 0.5mm to 1.0mm of spacing.',
                'Case 3 — Left corners are sharp, right corners are elongated: Your backfocus spacing is fine, but the sensor has mechanical TILT.',
              ],
              proTip: 'Use the 3x3 Aberration Inspector in N.I.N.A. or ASTAP Tilt Inspection to map HFR across corners and adjust your tilt plate systematically.',
            },
          ] as Slide[],
          courseSections: [
            {
              level: 'Beginner Level — Mechanical Assembly',
              heading: '1. Step-by-Step Tube Mounting & Balancing',
              body: '1) Slide the telescope dovetail bar into the mount saddle and tighten safety locks. 2) Extend the front dew shield fully and remove the lens cap. 3) Thread the reducer, 55mm spacer stack, and camera onto the rear focuser drawtube. 4) Loosen the DEC clutch horizontally and slide the tube slightly in its rings until it balances without tipping forward or backward.',
              highlight: 'Mechanical Sequence: Dovetail clamped -> Dew shield out -> 55mm threaded stack -> Horizontal DEC balance',
            },
            {
              level: 'Intermediate Level — Optical Math',
              heading: '2. Pixel Scale, Atmospheric Seeing & Nyquist Sampling',
              body: 'Pixel scale ("/px) measures the sky angle covered by a single pixel. Earth’s atmosphere blurs stars into a seeing disk (typically 2.0" to 3.0"). Sampling at 1/2 to 1/3 of your seeing (between 0.8"/px and 2.0"/px) captures all available detail without starving pixels of light.',
              highlight: 'Core Formula: Pixel Scale ("/px) = (206.265 × Pixel_Size_µm) ÷ Effective_Focal_Length_mm',
            },
            {
              level: 'Advanced Level — Reflector Collimation',
              heading: '3. Precision Collimation for Newtonians & Ritchey-Chrétiens',
              body: 'Fast reflectors (f/4 Newtonians) require sub-millimeter mirror alignment: 1) Center and round the secondary mirror under the focuser using a Concenter or Cheshire eyepiece. 2) Align the secondary beam to the primary center mark. 3) Align the primary mirror return beam and verify concentric diffraction rings on a slightly defocused star.',
              highlight: 'Always perform final collimation with the telescope tilted at 45°-60° matching imaging altitude.',
            },
            {
              level: 'Expert Level — Optical Metrology',
              heading: '4. Corrected Image Circle (APS-C vs. Full Frame) & Push-Pull Tilt Tuning',
              body: 'An APS-C sensor (IMX571) has a 28.3mm diagonal, whereas Full Frame (IMX455) spans 43.3mm. Ensure your corrector’s illuminated image circle exceeds your sensor diagonal. Adjust push-pull tilt screws in 1/4-turn increments while monitoring ASTAP’s HFR tilt polygon.',
              highlight: 'IMX533 Diagonal = 16.0mm | APS-C (IMX571) = 28.3mm | Full Frame (IMX455) = 43.3mm',
            },
          ] as LessonSection[],
          troubleshooting: [
            {
              symptom: 'Cannot reach focus: stars remain huge blurry donuts across the entire focuser travel range.',
              cause: 'The focal plane lies outside the focuser drawtube range (visual diagonal left in place, or missing extension tube when shooting native focal length).',
              solution: 'Remove any 90° visual diagonal! With a reducer, space the sensor at 55mm. Without a reducer, add a 40-50mm M48 extension tube.',
            },
            {
              symptom: 'Center stars are pinpoint, but all 4 corners show stars pointing radially toward the center.',
              cause: 'Under-corrected spacing: sensor is closer than 55.0mm to the reducer.',
              solution: 'Insert a 0.5mm or 1.0mm M48 spacer ring behind the reducer and refocus.',
            },
            {
              symptom: 'After 1 hour of imaging, stars suddenly bloat and lose contrast.',
              cause: 'Dew or frost has condensed on the front objective lens or secondary mirror.',
              solution: 'Wrap a regulated Dew Heater strap around the front lens cell before starting your session.',
            },
          ] as TroubleshootingItem[],
          steps: [
            '1. Calculate pixel scale in the simulator above (target 0.8" to 2.0" per pixel).',
            '2. Remove all visual adapters and thread the corrector/reducer directly onto the focuser drawtube.',
            '3. Assemble the 55.0mm spacer stack (+0.67mm shim if using a 2mm glass filter).',
            '4. Attach the dew heater strap around the front lens cell and extend the dew shield.',
            '5. Balance the fully rigged telescope horizontally on its dovetail bar.',
            '6. Take a 10-second star test shot and inspect corner star roundness.',
          ],
          quiz: [
            {
              question: 'What parameter determines a telescope’s pure photographic speed?',
              options: [
                'Focal length in millimeters alone',
                'Focal ratio (f/D)',
                'Dew shield length',
              ],
              correct: 1,
              explanation: 'Focal ratio (f/D) controls photon concentration per unit area on the sensor.',
            },
            {
              question: 'If stars in all four corners point radially toward the center of the frame, what is the diagnosis?',
              options: [
                'Sensor is too close to the flattener/reducer (needs more backfocus)',
                'Sensor is too far from the flattener/reducer',
                '12V battery is low',
              ],
              correct: 0,
              explanation: 'Radial corner elongation indicates under-correction: add 0.5mm to 1.0mm of spacing.',
            },
            {
              question: 'How much spacing should you add to a 55.0mm backfocus train when inserting a 2.1mm thick glass filter?',
              options: [
                '+0.7mm (one-third of filter thickness, bringing total target to 55.7mm)',
                'Remove 10mm',
                'Glass filters have zero optical effect',
              ],
              correct: 0,
              explanation: 'Glass refraction shifts the focal point back by roughly 1/3 of the filter thickness.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod1-pdf1-en',
              name: 'Complete PDF Manual: Pixel Scale, M48 Assembly & 55mm Backfocus Diagnostics',
              title: 'Module 1 Technical Manual: Optics, 55mm Threaded Train, Tilt & Sampling',
              sections: [
                {
                  title: '1. Core Optical Equations & Targets',
                  content: [
                    'Pixel Scale ("/px) = (206.265 × Pixel Size µm) ÷ Effective Focal Length mm.',
                    'Dawes Resolution Limit (") = 116 ÷ Aperture Diameter mm.',
                    'Target sampling under 2.0"-3.0" seeing: 0.80"/px to 2.00"/px.',
                  ],
                },
                {
                  title: '2. Universal 55.0mm Spacer Breakdown & Corner Diagnostics',
                  content: [
                    'Camera (17.5mm) + Filter Drawer/OAG (21.0mm) + M48 Spacer (16.5mm) = 55.0mm (+0.7mm for 2mm filter).',
                    'Radial corner stars = Add 0.5-1mm | Tangential circular corner stars = Remove 0.5-1mm.',
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
      titleFr: 'Module 2 : Montures Harmoniques, Équilibrage & Mise en Station',
      titleEn: 'Module 2: Harmonic Mounts, Balancing & Polar Alignment',
      price: 29,
      badgeFr: 'Matériel & Suivi',
      badgeEn: 'Hardware & Tracking',
      descFr:
        'De la première installation au suivi sub-arcseconde : Montures à réducteurs harmoniques (Juwei-17, Proxisky UMi-17S, ZWO AM5), alimentation 12V et alignement polaire.',
      descEn:
        'From first setup to sub-arcsecond tracking: Strainwave harmonic mounts (Juwei-17, Proxisky UMi-17S, ZWO AM5), 12V power, and polar alignment.',
      image:
        'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module2,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "Une optique d'exception ne vaut rien sur une monture mal installée. Ce module accompagne le débutant dès la sortie du carton (orientation Nord, réglage de la latitude, position Home) et livre aux utilisateurs de montures harmoniques (Juwei-17, UMi-17S, AM5) et classiques tous les secrets mécaniques pour un suivi parfait.",
          slides: [
            {
              title: 'Chapitre 1 : Comprendre la Monture Équatoriale & la Position "Home"',
              subtitle: 'Comment la monture compense la rotation de la Terre',
              bullets: [
                'Débutant — Pourquoi le ciel tourne ? La Terre tourne sur elle-même d’Ouest en Est en 23h 56m 04s (Jour Sidéral). Sans suivi motorisé, les étoiles deviennent des traits en quelques secondes.',
                'Débutant — Le principe Équatorial : Au lieu de bouger en escalier (Haut/Bas et Gauche/Droite), l’axe principal de la monture (Ascension Droite / AD) est incliné exactement au même angle que votre latitude (ex: 47° au Québec / en France) pour pointer l’axe de rotation terrestre.',
                'La Position "Home" (Zéro) : Avant d’allumer la monture, le tube doit pointer vers le Pôle Nord Céleste (axe DEC à +90°) et le corps de la monture doit être bien droit. C’est le point de référence absolu du GoTo !',
              ],
              proTip: 'Collez deux petits morceaux de ruban adhésif réfléchissant en face l’un de l’autre sur les axes AD et DEC de votre monture : vous retrouverez votre Position Home exacte en 2 secondes dans le noir !',
            },
            {
              title: 'Chapitre 2 : Montures Harmoniques (Juwei-17, UMi-17S, AM5) vs Vis sans fin',
              subtitle: 'Anatomie mécanique des réducteurs Strainwave',
              bullets: [
                'Montures classiques à vis sans fin (EQ6-R, HEQ5) : Excellente régularité mécanique, mais lourdes (15 à 25 kg avec contrepoids) et sensibles au jeu d’engrenage (Backlash) lors des inversions en Déclinaison.',
                'Montures Harmoniques (Juwei-17, Proxisky UMi-17S, ZWO AM5) : Utilisent un générateur d’onde elliptique déformant une couronne dentée flexible (rapport 100:1 + courroie). Couple massif permettant de porter 13 à 18 kg SANS contrepoids pour seulement 4,5 kg sur la balance !',
                'Particularité critique : Les montures harmoniques n’ont aucun jeu d’inversion (Zero Backlash), mais leur erreur périodique naturelle (±10" à ±20") monte et descend vite, ce qui rend l’autoguidage rapide (0,5s à 1,0s) obligatoire.',
              ],
              proTip: 'Sur une Juwei-17 ou UMi-17S sans contrepoids, ne déployez jamais les 3 sections fines d’un trépied carbone léger au maximum : gardez le trépied bas et suspendez votre batterie LiFePO4 de 5 kg sous la colonne centrale !',
            },
            {
              title: 'Chapitre 3 : Mise en Station Polaire Assistée par Caméra',
              subtitle: 'Aligner l’axe AD sous la minute d’arc en 3 minutes chrono',
              bullets: [
                'Oubliez le viseur polaire optique : Même si vous ne voyez pas l’étoile Polaire (cachée par un toit ou un arbre), le plugin "Three Point Polar Alignment" (TPPA) de N.I.N.A. fonctionne sur n’importe quelle zone du ciel !',
                'Procédure : La caméra prend un premier cliché, la monture tourne de 10° ou 30° en AD, prend un deuxième cliché, puis un troisième. Par trigonométrie astrométrique, l’écran affiche votre erreur d’Azimut (Gauche/Droite) et d’Altitude (Haut/Bas).',
                'Action mécanique : Desserrez d’un quart de tour les vis de blocage de la base, tournez doucement les molettes micrométriques d’Azimut puis d’Altitude jusqu’à obtenir un smiley vert (< 1 minute d’arc), puis resserrez en surveillant l’écran.',
              ],
              proTip: 'Lorsque vous resserrez les vis de verrouillage après la mise en station, serrez-les simultanément (gauche et droite en même temps) pour empêcher le bloc de la monture de dévier de 2 minutes d’arc !',
            },
            {
              title: 'Chapitre 4 : Alimentation 12V, Frein Électromagnétique & Cable Management',
              subtitle: 'Éviter les pannes électriques et les arrachements de câbles',
              bullets: [
                'Le piège de la chute de tension (Voltage Drop) : Les contrôleurs OnStep (Juwei-17 / UMi-17S) et AM5 exigent un 12V à 13,8V parfaitement stable (3A à 5A). Une prise allume-cigare bas de gamme qui chute à 10,8V pendant un GoTo rapide fait décrocher les moteurs !',
                'Frein électromagnétique AD : Les montures harmoniques possèdent un frein de sécurité sur l’axe AD qui bloque tout mouvement hors tension. Ne forcez jamais l’axe à la main.',
                'Gestion des câbles (Cable Management) : Faites monter un seul faisceau souple (Alimentation 12V + USB) le long de l’axe de Déclinaison jusqu’à un hub fixé SUR le tube optique.',
              ],
              proTip: 'En hiver québécois ou européen (sous 0°C), les câbles PVC deviennent durs comme du bois et tirent sur la monture : remplacez tous vos câbles par des câbles en silicone souple (Silicone Jacketed Cables) !',
            },
          ] as Slide[],
          courseSections: [
            {
              level: 'Niveau Débutant — Première Installation',
              heading: '1. Installer sa Monture de A à Z en 5 Minutes',
              body: "1) Posez le trépied sur un sol ferme (évitez les terrasses en bois qui vibrent au moindre pas !) en orientant le repère 'N' vers le Nord (aidez-vous de la boussole de votre téléphone). 2) Réglez l'angle de latitude sur l'échelle graduée latérale de la monture (ex: 46° pour le Québec/France centrale). 3) Vissez la tête de monture sur le trépied et suspendez le sac de lestage. 4) Installez le télescope en Position Home (tube pointant vers le Nord, bien droit) avant de mettre sous tension.",
              highlight: 'Sol dur (terre/béton) + Repère Nord + Latitude réglée + Lestage central + Position Home = Base 100% saine',
            },
            {
              level: 'Niveau Intermédiaire — Spécificités OnStep (Juwei-17 / UMi-17S)',
              heading: '2. Configurer les Pilotes ASCOM OnStep, l’Heure UTC et le GPS',
              body: "Sur les montures utilisant l'architecture OnStep (comme la Juwei-17 ou la Proxisky UMi-17S), l'erreur de pointage GoTo la plus fréquente au premier démarrage vient d'un décalage d'heure ou de fuseau horaire (UTC Offset). Dans le pilote ASCOM OnStep ou dans N.I.N.A. (Options > Équipement > Télescope), activez l'option 'Synchroniser l'heure et les coordonnées GPS du PC vers la monture à la connexion'. Dès le premier Plate Solve, la monture sera parfaitement recalée.",
              highlight: 'Vitesse de suivi : Sidérale (Sidereal Rate) | Vitesse de guidage : 0.5x à 0.9x Sidereal',
            },
            {
              level: 'Niveau Avancé — Dynamique du Suivi',
              heading: '3. Pourquoi l’Erreur Périodique Harmonique Exige un Guidage Réactif',
              body: "Un réducteur harmonique (Strainwave) de taille 17 effectue une révolution de son générateur d'onde toutes les ~430 secondes environ. Durant ce cycle, l'erreur périodique décrit une sinusoïde d'environ 20 à 30 secondes d'arc crête-à-crête, avec une dérivée première pouvant atteindre 0,25\" par seconde. Si vous guidez avec des poses de 3 secondes, la monture aura dérivé de 0,75\" avant même que PHD2 n'envoie une correction ! En réduisant l'exposition de guidage à 0,5s ou 1,0s, PHD2 corrige la pente 3 à 6 fois plus souvent et maintient l'erreur sous 0,5\" RMS.",
              highlight: 'Loi des montures harmoniques : Fréquence d’autoguidage de 0,5 s à 1,0 s obligatoire',
            },
            {
              level: 'Niveau Expert — Énergétique de Terrain',
              heading: '4. Calculer l’Autonomie de sa Batterie LiFePO4 par Grand Froid',
              body: "Une station électrique au Lithium-Fer-Phosphate (LiFePO4, ex: 300 Wh à 512 Wh) supporte beaucoup mieux le froid que le Lithium-Ion classique et délivre une tension stable de 12,8V. Consommation typique d'un setup complet en nuit froide : Monture harmonique en suivi (0,8A) + Caméra refroidie à -10°C (1,5A) + Mini-PC ou ASIAIR (1,0A) + 2 Bandes chauffantes à 50 % (1,2A) = 4,5 Ampères sous 12V, soit ~54 Watts par heure. Pour une nuit d'hiver de 10 heures, prévoyez une batterie d'au moins 500 Wh (ou 45 Ah en 12V).",
              highlight: 'Consommation moyenne setup complet = ~50W/h -> Batterie LiFePO4 de 512 Wh = 9 à 10 heures d’autonomie réelle',
            },
          ] as LessonSection[],
          troubleshooting: [
            {
              symptom: 'Lors du premier GoTo de la soirée, le télescope pointe complètement à côté de la cible (voire vers le sol) !',
              cause: 'La monture n’était pas en Position Home au démarrage, ou la date/heure/fuseau UTC/coordonnées GPS sont inversés (Est/Ouest) dans le contrôleur.',
              solution: 'Arrêtez immédiatement le mouvement, remettez manuellement la monture en Position Home (DEC 90°, contrepoids/base vers le bas), synchronisez l’heure et la longitude exacte depuis le PC/tablette, puis lancez un GoTo avec Plate Solve.',
            },
            {
              symptom: 'La monture émet un sifflement aigu ou s’arrête brusquement pendant un déplacement rapide (Slew) avec un message de déconnexion.',
              cause: 'Chute de tension électrique (Voltage Drop) sous 11V lorsque les deux moteurs tirent leur courant maximal, ou câble d’alimentation trop fin.',
              solution: 'Branchez l’alimentation de la monture sur une sortie 12V-5A dédiée (ou 13,8V régulé) avec un câble court de section 16 AWG ou 18 AWG.',
            },
            {
              symptom: 'Le guidage est bon à 0,5" RMS pendant 10 minutes, puis fait soudainement un pic énorme à 4" avant de revenir.',
              cause: 'Un câble pend derrière le télescope et s’accroche légèrement sur une molette d’azimut ou sur la prise du trépied (Cable Snag), ou une bourrasque de vent secoue le pare-buée.',
              solution: 'Attachez le faisceau de câbles sur le corps mobile de la monture avec une boucle souple en vérifiant que rien ne touche la base fixe.',
            },
          ] as TroubleshootingItem[],
          steps: [
            '1. Poser le trépied sur un sol stable orienté vers le Nord, le mettre de niveau et accrocher 5 kg de lestage sous la colonne centrale.',
            '2. Régler l’échelle de latitude mécanique de la monture sur votre latitude locale et fixer solidement la tête de monture.',
            '3. Installer le tube optique en Position Home (pointant le Pôle Nord) et sécuriser les molettes de la queue d’aronde.',
            '4. Attacher le faisceau de câbles (alimentation 12V 5A + USB) sans tension mécanique.',
            '5. Allumer le système, faire la mise au point sur les étoiles et lancer le Polar Align (ASIAIR ou N.I.N.A. TPPA).',
            '6. Régler l’Azimut puis l’Altitude pour descendre sous 1 minute d’arc (< 60") et serrer symétriquement les vis de blocage.',
          ],
          quiz: [
            {
              question: 'Quelle durée de pose d’autoguidage est spécifiquement requise pour dompter la pente d’erreur périodique d’une monture harmonique (Juwei-17, UMi-17S, AM5) ?',
              options: [
                'De 0,5 seconde à 1,0 seconde',
                'De 5 à 10 secondes',
                'Aucun autoguidage n’est requis à longue focale',
              ],
              correct: 0,
              explanation: "La pente rapide des réducteurs harmoniques exige des corrections fréquentes toutes les 0,5 à 1,0 seconde pour maintenir le suivi sous 0,6\" RMS.",
            },
            {
              question: 'Quelle est la cause la plus fréquente lorsque votre monture pointe vers le sol lors du tout premier GoTo de la nuit ?',
              options: [
                'La monture n’était pas en Position Home au démarrage, ou l’heure / la longitude GPS est erronée',
                'Le capteur de la caméra est trop froid',
                'Il manque un filtre anti-pollution lumineuse',
              ],
              correct: 0,
              explanation: 'Le modèle du ciel interne de la monture calcule la position des étoiles à partir de la Position Home initiale, de l’heure exacte et des coordonnées géographiques.',
            },
            {
              question: 'Quelle capacité de batterie LiFePO4 faut-il prévoir pour alimenter un setup astrophoto complet (consommant ~50W) pendant une nuit entière de 9 à 10 heures ?',
              options: [
                'Environ 500 Wh (ex: station LiFePO4 de 512 Wh / 40-45 Ah en 12V)',
                'Une simple batterie de téléphone de 10 Wh',
                '50 Wh suffisent largement',
              ],
              correct: 0,
              explanation: '50 Watts × 10 heures = 500 Wh. Une batterie LiFePO4 de 512 Wh garantit de finir la nuit avec le refroidissement caméra et les bandes chauffantes sans coupure.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1',
              name: 'Manuel PDF Complet : Montures Harmoniques (Juwei-17 / UMi-17S / AM5) & Mise en Station',
              title: 'Manuel Technique Module 2 : Réducteurs Harmoniques, Alimentation 12V & Alignement Polaire',
              sections: [
                {
                  title: '1. Procédure de Démarrage Matériel & Position Home',
                  content: [
                    '1. Trépied orienté Nord sur sol dur + Lestage central obligatoire (4 à 6 kg) sur trépied carbone.',
                    '2. Vérification de la Position Home physique (Axe AD vertical, Axe DEC à 90° pointant vers le Pôle).',
                    '3. Alimentation 12V DC - 5A régulée connectée avant le démarrage du logiciel.',
                    '4. Synchronisation automatique de l’heure UTC et des coordonnées GPS PC/Tablette -> Monture (OnStep / ZWO).',
                  ],
                },
                {
                  title: '2. Protocole de Mise en Station Astrométrique Sub-Arcminute',
                  content: [
                    'Lancer N.I.N.A. TPPA (Three Point Polar Alignment) ou ASIAIR Polar Align.',
                    'Desserrez légèrement les vis de blocage Azimut/Altitude avant d’agir sur les vis poussantes.',
                    'Cible de précision : Erreur Totale < 1\'00" (60 secondes d’arc). Serrez les molettes gauche/droite simultanément.',
                  ],
                },
                {
                  title: '3. Bilan Énergétique & Câblage Hiver',
                  content: [
                    'Consommation type : Monture (0.8A) + Caméra TEC (1.5A) + Mini-PC (1.0A) + Bandes chauffantes (1.2A) = ~4.5A (54W).',
                    'Utiliser exclusivement des câbles USB et 12V gainés en silicone souple pour éviter tout tirage (Cable Drag) sous 0°C.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'World-class optics are useless on a poorly configured mount. This module walks beginners through unboxing, North orientation, latitude setting, and Home position, while giving harmonic mount users (Juwei-17, UMi-17S, AM5) every mechanical secret for sub-arcsecond tracking.',
          slides: [
            {
              title: 'Chapter 1: Equatorial Mount Basics & "Home" Position',
              subtitle: 'How equatorial mounts counter Earth’s sidereal rotation',
              bullets: [
                'Beginner — Why stars trail: Earth rotates West to East every 23h 56m 04s (Sidereal Day). Without motorized tracking, stars streak within seconds.',
                'Beginner — Equatorial Principle: The main Right Ascension (RA) axis tilts to match your exact local latitude (e.g., 47°N) so it stays parallel to Earth’s rotational axis.',
                'Home Position (Zero Index): Before powering on, point the telescope at the Celestial Pole (DEC at +90°) with the mount body centered vertically. Every GoTo slew relies on this starting index!',
              ],
              proTip: 'Stick two small pieces of reflective tape across the RA and DEC seams at exact Home position so you can align them in 2 seconds in the dark.',
            },
            {
              title: 'Chapter 2: Strainwave Harmonic Mounts (Juwei-17, UMi-17S, AM5) vs. Worm Gears',
              subtitle: 'Mechanical anatomy of strainwave reducers',
              bullets: [
                'Traditional Worm Mounts (EQ6-R, HEQ5): Smooth periodic error, but heavy (15-25kg with counterweights) and prone to DEC reversal backlash.',
                'Harmonic Mounts (Juwei-17, Proxisky UMi-17S, ZWO AM5): An elliptical wave generator flexes a toothed spline (100:1 ratio + belt). Massive torque carries 13-18kg WITHOUT counterweights in a 4.5kg head!',
                'Critical trait: Harmonic drives have zero backlash, but their natural periodic error (±10" to ±20") has a steep slope requiring fast 0.5s to 1.0s autoguiding.',
              ],
              proTip: 'On a counterweight-less Juwei-17 or UMi-17S, keep carbon tripod legs low and hang a 5kg LiFePO4 battery from the center column hook!',
            },
            {
              title: 'Chapter 3: Camera-Assisted Polar Alignment',
              subtitle: 'Sub-arcminute alignment in 3 minutes flat',
              bullets: [
                'No polar scope needed: Even if Polaris is blocked by trees or a roof, N.I.N.A.’s Three Point Polar Alignment (TPPA) works anywhere in the sky!',
                'How it works: The camera takes 3 snapshots while rotating RA by 10°-30°. Plate solving calculates exact Azimuth (Left/Right) and Altitude (Up/Down) error.',
                'Mechanical adjustment: Slightly loosen base locking screws, turn micro-adjustment knobs until total error drops below 1 arcminute (< 60"), then lock down evenly.',
              ],
              proTip: 'Tighten left and right azimuth locking knobs simultaneously so the mount head does not shift by 2 arcminutes on the final turn!',
            },
            {
              title: 'Chapter 4: 12V Power Stability, Electromagnetic Brakes & Cable Routing',
              subtitle: 'Preventing brownouts and cable snags',
              bullets: [
                'Voltage drop trap: OnStep (Juwei-17 / UMi-17S) and AM5 controllers require steady 12V-13.8V (3A-5A). Cheap thin cables dropping below 11V during fast slews will stall stepper motors!',
                'RA Electromagnetic Brake: Harmonic mounts use a power-off safety brake on RA. Never force the RA axis manually.',
                'Cable Management: Route a single flexible umbilical (12V Power + USB) up through the DEC axis pivot to a hub mounted directly ON the telescope tube.',
              ],
              proTip: 'In freezing temperatures, standard PVC cables stiffen and tug on the mount—switch to flexible Silicone-jacketed USB and DC cables!',
            },
          ] as Slide[],
          courseSections: [
            {
              level: 'Beginner Level — First Setup',
              heading: '1. Setting Up Your Mount from Scratch in 5 Minutes',
              body: '1) Place the tripod on solid ground (avoid wooden decks that vibrate when walking!) pointing North. 2) Set your local latitude angle on the mount’s altitude scale. 3) Bolt the mount head onto the tripod and hang center ballast weight. 4) Clamp the telescope in Home Position (pointing North) before turning power on.',
              highlight: 'Solid ground + North alignment + Latitude set + Center ballast + Home position = Rock-solid foundation',
            },
            {
              level: 'Intermediate Level — OnStep (Juwei-17 / UMi-17S) Configuration',
              heading: '2. Configuring ASCOM OnStep Drivers, UTC Time & GPS Sync',
              body: 'On OnStep-powered mounts (Juwei-17, Proxisky UMi-17S), first-slew pointing errors almost always stem from incorrect UTC time offset or East/West longitude sign. Enable "Sync PC Time and GPS Site to Mount on Connect" in N.I.N.A. or the ASCOM driver.',
              highlight: 'Tracking Rate: Sidereal | Guide Rate: 0.5x to 0.9x Sidereal',
            },
            {
              level: 'Advanced Level — Tracking Dynamics',
              heading: '3. Why Strainwave Periodic Error Demands Fast Guiding',
              body: 'A size-17 harmonic drive completes a wave generator rotation roughly every 430 seconds, producing a smooth 20"-30" peak-to-peak sine wave with slopes up to 0.25"/sec. Guiding at 0.5s to 1.0s samples this slope 3 to 6 times faster than 3s exposures, holding total RMS below 0.5".',
              highlight: 'Harmonic Mount Law: 0.5s to 1.0s guide exposures are mandatory',
            },
            {
              level: 'Expert Level — Field Power Engineering',
              heading: '4. Sizing Your LiFePO4 Battery for Cold Nights',
              body: 'A complete rig draws roughly 4.5 Amps at 12V (~54 Watts/hour): Mount tracking (0.8A) + Cooled camera at -10°C (1.5A) + Mini-PC/ASIAIR (1.0A) + 2 Dew heaters (1.2A). For a 10-hour winter night, use a 500Wh+ LiFePO4 power station.',
              highlight: 'Average Full Rig Draw = ~50W/h -> 512Wh LiFePO4 station = 9 to 10 hours runtime',
            },
          ] as LessonSection[],
          troubleshooting: [
            {
              symptom: 'On the very first GoTo slew of the night, the telescope points at the ground!',
              cause: 'Mount was not in Home Position at power-on, or UTC time / GPS longitude is inverted.',
              solution: 'Stop the slew immediately, return physically to Home Position, sync PC time/GPS to the mount, and plate-solve.',
            },
            {
              symptom: 'Mount stalls with a high-pitched whine or disconnects during a fast GoTo slew.',
              cause: '12V voltage drop below 11.0V under peak dual-axis motor load.',
              solution: 'Use a regulated 12V 5A (or 13.8V) power port with short 16-18 AWG DC cabling.',
            },
            {
              symptom: 'Guiding runs smoothly at 0.5" RMS, then suddenly spikes to 4" for one frame.',
              cause: 'A hanging cable snagged on an azimuth knob or tripod leg (Cable Snag).',
              solution: 'Tie a strain-relief loop onto the moving mount saddle so cables never touch fixed base parts.',
            },
          ] as TroubleshootingItem[],
          steps: [
            '1. Set tripod on firm ground pointing North, level it, and hang 5kg ballast from the center hook.',
            '2. Set mechanical latitude scale and bolt the harmonic mount head firmly.',
            '3. Mount the optical tube in Home Position (pointing North) and tighten dovetail clamps.',
            '4. Route 12V 5A power and USB cables in a snag-free loop.',
            '5. Power on, focus stars, and run camera-assisted Polar Alignment (N.I.N.A. TPPA or ASIAIR).',
            '6. Adjust Azimuth and Altitude under 1 arcminute (< 60") and tighten locking knobs evenly.',
          ],
          quiz: [
            {
              question: 'What guide exposure time is required to tame periodic error slopes on harmonic mounts?',
              options: [
                '0.5 to 1.0 second',
                '5 to 10 seconds',
                'Guiding is not required',
              ],
              correct: 0,
              explanation: 'Fast periodic error slopes on strainwave drives require 0.5s - 1.0s guide exposures.',
            },
            {
              question: 'What is the most common reason a mount points toward the ground on its first GoTo slew?',
              options: [
                'Mount was not started in Home Position, or UTC time / GPS coordinates are incorrect',
                'Camera sensor is too cold',
                'Missing light pollution filter',
              ],
              correct: 0,
              explanation: 'Pointing models calculate sky coordinates relative to physical Home Position, UTC time, and site coordinates.',
            },
            {
              question: 'What LiFePO4 battery capacity is needed to run a complete 50W astro rig for a 10-hour night?',
              options: [
                'Around 500 Wh (e.g., 512Wh LiFePO4 station)',
                'A 10 Wh phone powerbank',
                '50 Wh is plenty',
              ],
              correct: 0,
              explanation: '50 Watts × 10 hours = 500 Wh.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1-en',
              name: 'Complete PDF Manual: Harmonic Mounts (Juwei-17 / UMi-17S / AM5) & Polar Alignment',
              title: 'Module 2 Technical Manual: Strainwave Mounts, 12V Power & Polar Alignment',
              sections: [
                {
                  title: '1. Hardware Startup & Polar Alignment',
                  content: [
                    'Ballast carbon tripods with 4-6kg; verify physical Home Position before powering on.',
                    'Use regulated 12V 5A power; sync PC time and GPS coordinates; polar align under 60 arcseconds.',
                  ],
                },
              ],
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
      price: 29,
      badgeFr: 'Automatisation',
      badgeEn: 'Automation',
      descFr:
        'Piloter 100 % de sa nuit : Configuration ASCOM, Plate Solving ASTAP, cadrage SkyAtlas, Dithering, retournement au méridien et séquenceur N.I.N.A. / ASIAIR.',
      descEn:
        'Automate 100% of your night: ASCOM setup, ASTAP Plate Solving, SkyAtlas framing, Dithering, Meridian Flip, and N.I.N.A. / ASIAIR sequencing.',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module3,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "Ce module vous apprend à transformer votre télescope en un robot autonome. Que vous débutiez avec un boîtier ZWO ASIAIR sur tablette ou que vous configuriez un Mini-PC sous Windows avec N.I.N.A., vous saurez connecter chaque appareil, centrer une cible invisible par astrométrie et programmer votre nuit jusqu'à l'aube.",
          slides: [
            {
              title: 'Chapitre 1 : Connecter son Matériel (ASIAIR vs Mini-PC N.I.N.A.)',
              subtitle: 'Comprendre la chaîne logicielle : Caméra, Monture, EAF et PHD2',
              bullets: [
                'Débutant — L’option ZWO ASIAIR : Boîtier rouge tout-en-un piloté en Wi-Fi depuis un iPad ou smartphone. Aucun pilote à installer, mais compatible uniquement avec les caméras/accessoires ZWO (et montures supportées).',
                'Débutant & Expert — L’option Mini-PC (ex: MeLE Quieter 4C fixé sur le tube) : Vous installez 3 briques gratuites : 1) La plateforme ASCOM (le traducteur universel), 2) Les pilotes constructeurs (ZWO, Player One, OnStep), 3) N.I.N.A. + PHD2 + ASTAP.',
                'Contrôle à distance au chaud : Connectez votre tablette ou PC de salon au Mini-PC du télescope via Bureau à Distance Windows (RDP) ou RustDesk en Wi-Fi !',
              ],
              proTip: 'Dans N.I.N.A. (Options > Général > Profils), créez un profil distinct pour chaque configuration optique (ex: "Lunette 400mm Avec Réducteur" et "Newton 800mm") afin de ne jamais mélanger vos focales !',
            },
            {
              title: 'Chapitre 2 : Le Plate Solving Astrométrique (ASTAP)',
              subtitle: 'Comment le télescope sait exactement où il regarde en 2 secondes',
              bullets: [
                'Pourquoi l’alignement sur 3 étoiles à l’oculaire est obsolète : Le Plate Solving prend une photo de 3 secondes, détecte les étoiles et compare géométriquement leurs triangles au catalogue stellaire hors-ligne D50 (ASTAP).',
                'En moins de 2 secondes, N.I.N.A. ou l’ASIAIR trouve les coordonnées exactes (AD/DEC) du centre de l’image à une fraction de seconde d’arc près !',
                'Si le télescope est décalé de 2° par rapport à votre nébuleuse, le logiciel calcule l’écart, déplace la monture, reprend une photo de contrôle et centre la cible à moins de 10 pixels.',
              ],
              proTip: 'Pour que ASTAP fonctionne du premier coup dans N.I.N.A., téléchargez l’exécutable ASTAP ET la base d’étoiles "D50 Star Database", puis réglez le temps de pose de Plate Solve sur 3s à 5s (Gain 200 ou 300).',
            },
            {
              title: 'Chapitre 3 : Le Dithering (Décalage Aléatoire entre les Poses)',
              subtitle: 'Éradiquer définitivement le bruit de trame oblique (Walking Noise)',
              bullets: [
                'Le problème physique : Aucun capteur n’est parfait (pixels chauds, pixels tièdes, non-uniformité). Si la monture suit légèrement de travers d’un dixième de pixel par minute, ces défauts dessinent une pluie de traits obliques sur l’image empilée !',
                'La solution Dithering : Entre les poses, N.I.N.A. ou l’ASIAIR demande à PHD2 de déplacer l’étoile guide de 5 à 8 pixels dans une direction aléatoire.',
                'À l’empilement (Sigma Clipping), les étoiles sont réalignées mais les pixels chauds se retrouvent dispersés partout et sont effacés à 100 % !',
              ],
              proTip: 'Ne faites pas un Dithering à chaque pose si vous shootez des poses courtes de 60s (vous perdriez 20 % de votre nuit à attendre la stabilisation) : réglez "Dither every 3 frames" (toutes les 3 poses) !',
            },
            {
              title: 'Chapitre 4 : Retournement au Méridien (Meridian Flip) & Fin de Nuit',
              subtitle: 'Dormir sur ses deux oreilles pendant que le télescope travaille',
              bullets: [
                'Qu’est-ce que le Méridien ? C’est la ligne imaginaire Nord-Sud au-dessus de votre tête où un astre culmine. Une fois cette ligne franchie, le tube optique descend et risque de cogner le trépied.',
                'Le Meridian Flip automatique : Le séquenceur met la pose en pause, fait basculer la monture de 180° de l’autre côté, refait un Plate Solve pour recadrer l’objet au pixel près (l’image sera juste inversée à 180°, ce que l’empilement gère tout seul), relance PHD2 et reprend les poses !',
                'Sécurité à l’aube : Dès le crépuscule nautique du matin, la séquence arrête tout, parque la monture à l’horizontale/Home et réchauffe doucement le capteur.',
              ],
              proTip: 'Testez toujours votre premier retournement au méridien en pointant une étoile proche du Sud en début de soirée et en restant à côté du télescope pour vérifier qu’aucun câble n’est trop court !',
            },
          ] as Slide[],
          courseSections: [
            {
              level: 'Niveau Débutant — Premiers Pas Logiciels',
              heading: '1. Cadrer sa Première Nébuleuse dans le Framing Wizard / SkyAtlas',
              body: "1) Dans N.I.N.A., ouvrez l'onglet 'SkyAtlas' ou 'Framing' (Assistant de cadrage). 2) Tapez le nom de votre cible (ex: 'NGC 7331', 'M31' ou 'IC 1805') et cliquez sur 'Load Image' (via HIPS2FITS ou NASA SkyView). 3) Un rectangle blanc représentant la taille exacte de votre capteur apparaît sur la photo de la nébuleuse ! Déplacez ce rectangle à la souris pour composer votre cadrage artistique. 4) Cliquez sur 'Slew and Center' (Pointer et Centrer) : la monture démarre et centre exactement ce cadre dans le ciel.",
              highlight: 'SkyAtlas / Framing -> Taper le catalogue (M / NGC / IC) -> Ajuster le rectangle -> Slew and Center',
            },
            {
              level: 'Niveau Intermédiaire — Paramétrage ASTAP',
              heading: '2. Calculer le Nombre de Pixels de Dithering entre Lunette Guide et Imageur',
              body: "Dans PHD2, le Dithering est exprimé en pixels de la caméra de guidage, alors que dans N.I.N.A. ou ASIAIR vous souhaitez décaler la caméra principale de 5 à 8 pixels ! Si votre lunette guide a une focale de 120 mm et votre télescope principal une focale de 480 mm (ratio 1:4), un décalage de 1 pixel sur la caméra guide déplace la caméra principale de 4 pixels. Heureusement, N.I.N.A. calcule ce ratio automatiquement si les deux focales sont bien renseignées.",
              highlight: 'Cible de Dithering sur le capteur principal : Déplacement aléatoire de 5 à 10 pixels toutes les 2 à 3 poses',
            },
            {
              level: 'Niveau Avancé — Séquenceur Avancé N.I.N.A.',
              heading: '3. Construire une Séquence Multi-Cibles avec Déclencheurs Intelligents',
              body: "Une cible reste rarement bien haute toute la nuit. Dans le Séquenceur Avancé de N.I.N.A., utilisez la condition de boucle 'Loop Until Altitude Below 30°' (Boucler tant que la cible n'est pas descendue sous 30° de hauteur) sur votre première galaxie, puis enchaînez automatiquement un bloc d'instructions vers une deuxième nébuleuse qui vient de se lever à l'Est ! Ajoutez le déclencheur 'Restore Guiding' et 'Center After Drift' (tolérance 1 minute d'arc) : si un nuage passe pendant 15 minutes, N.I.N.A. attendra que les étoiles reviennent, recalera le champ par Plate Solve et reprendra la pose tout seul !",
              highlight: 'Récupération anti-nuages : Trigger "Center After Drift" + "Restore Guiding" = Nuit sauvée',
            },
            {
              level: 'Niveau Expert — Paramètres du Méridien',
              heading: '4. Réglage Millimétré du Meridian Flip sur Montures Harmoniques (OnStep / AM5)',
              body: "La cause n°1 d'échec du retournement au méridien se produit lorsque N.I.N.A. ordonne le retournement à 00m 00s pile au méridien alors que le contrôleur interne de la monture (OnStep ou ZWO) considère que la cible est encore à 0,01° du côté Est : la monture fait alors un simple micro-déplacement sans s'inverser ! Pour éviter ce conflit, réglez dans le pilote de la monture une limite Est/Ouest de +3° (12 minutes après le méridien), et réglez dans N.I.N.A. : 'Minutes After Meridian = 3 min' et 'Max Minutes After Meridian = 8 min' avec 'Pause Before Meridian = 1 min'.",
              highlight: 'Réglage infaillible N.I.N.A. Flip : Pause Before = 1 min | Minutes After = 3 min | Max After = 8 min | Recenter = ON',
            },
          ] as LessonSection[],
          troubleshooting: [
            {
              symptom: 'ASTAP affiche systématiquement "Plate Solve Failed" (Échec de résolution astrométrique).',
              cause: 'Soit la focale renseignée dans N.I.N.A./ASIAIR est fausse (ex: vous avez oublié de multiplier par 0.8x pour votre réducteur), soit la mise au point est trop floue, soit le temps de pose (1s) est trop court avec un filtre Dual-Band.',
              solution: 'Vérifiez la focale exacte dans Options > Équipement, faites d’abord une bonne mise au point sur les étoiles, et augmentez la pose de Plate Solve à 5s ou 8s (Gain 250) si vous avez un filtre étroit.',
            },
            {
              symptom: 'Au moment du retournement au méridien, le télescope bouge à peine de quelques millimètres au lieu de basculer de l’autre côté du trépied.',
              cause: 'N.I.N.A. a envoyé la commande GoTo trop tôt (exactement sur la ligne 0° du méridien), avant que la monture n’autorise le basculement côté Est.',
              solution: 'Dans N.I.N.A. (Options > Imaging > Meridian Flip), réglez "Minutes After Meridian" sur 3 minutes et "Max Minutes" sur 8 minutes.',
            },
            {
              symptom: 'Après un Dithering, PHD2 met plus de 45 secondes à se stabiliser ("Settling Timeout") avant de lancer la pose suivante.',
              cause: 'Votre seuil de tolérance de stabilisation (Settle Pixel Tolerance) est trop strict par rapport à la turbulence du soir.',
              solution: 'Passez la tolérance de stabilisation (Settle Tolerance) de 0,3 pixel à 1,2 ou 1,5 pixel pendant 5 secondes minimum.',
            },
          ] as TroubleshootingItem[],
          steps: [
            '1. Connecter Caméra, Monture, EAF et PHD2 dans N.I.N.A. ou l’ASIAIR, et vérifier que la focale effective est exacte.',
            '2. Lancer le refroidissement du capteur à -10°C.',
            '3. Choisir sa cible dans l’Assistant de Cadrage (Framing / SkyAtlas) et cliquer sur "Slew and Center" (Plate Solve ASTAP).',
            '4. Lancer une courbe en V d’Autofocus et démarrer l’autoguidage PHD2.',
            '5. Vérifier dans la séquence que le Dithering (toutes les 3 poses), le Meridian Flip automatique et l’Autofocus thermique (-1,5°C) sont actifs.',
            '6. Vérifier que l’instruction de fin de séquence contient "Park Scope" et "Warm Camera", puis appuyer sur Play (▶️) !',
          ],
          quiz: [
            {
              question: 'Quelle est la cause numéro 1 d’un échec du Plate Solving (ASTAP) lors de la première utilisation d’un nouveau télescope ?',
              options: [
                'Une longueur focale ou taille de pixel mal renseignée dans le profil du logiciel (ou une mise au point floue)',
                'L’absence de contrepoids sur la monture',
                'Une batterie chargée à 100 %',
              ],
              correct: 0,
              explanation: "ASTAP calcule la taille exacte du champ en degrés à partir de votre focale et de la taille du capteur : si la focale entrée est fausse de plus de 10 %, la recherche échoue.",
            },
            {
              question: 'Pourquoi le Dithering est-il indispensable entre vos prises de vue ?',
              options: [
                'Il décale aléatoirement la monture de quelques pixels pour que l’empilement élimine les pixels chauds et la trame oblique (Walking Noise)',
                'Il augmente la focale du télescope',
                'Il refroidit la caméra à -20°C',
              ],
              correct: 0,
              explanation: 'Sans Dithering, les défauts fixes du capteur s’alignent en diagonale au fil de la légère dérive mécanique et créent le redouté Walking Noise.',
            },
            {
              question: 'Comment éviter qu’une monture n’échoue à basculer lors du retournement au méridien (Meridian Flip) ?',
              options: [
                'Programmer le retournement quelques minutes APRÈS le passage du méridien (ex: 3 à 5 minutes après) pour garantir que la cible a bien franchi l’axe Sud',
                'Débrancher la monture à minuit',
                'Désactiver le Plate Solving',
              ],
              correct: 0,
              explanation: 'Attendre 3 à 5 minutes après le passage du méridien garantit que le contrôleur de la monture bascule franchement de l’autre côté du pilier.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1',
              name: 'Manuel PDF Complet : Architecture Séquenceur N.I.N.A. & ASIAIR + Dépannage ASTAP',
              title: 'Manuel Technique Module 3 : Automatisation Nocturne, ASTAP, Dithering & Meridian Flip',
              sections: [
                {
                  title: '1. Structure Complète d’une Séquence N.I.N.A. (De 20h00 à 06h00)',
                  content: [
                    'Bloc 1 (Démarrage) : Cool Camera (-10°C, 5 min) -> Unpark Scope -> Wait for Astronomical Dusk -> Slew, Center and Rotate.',
                    'Bloc 2 (Préparation Cible) : Run Autofocus -> Start Guiding (Forcer calibration si nouveau setup).',
                    'Bloc 3 (Triggers / Déclencheurs actifs) : Meridian Flip | AF After Temperature Change (1.5°C) | AF After HFR Increase (8%) | Restore Guiding | Center After Drift (1 arcmin) | Dither every 3 frames.',
                    'Bloc 4 (Clôture à l’aube) : Stop Guiding -> Park Scope -> Warm Camera (10 min).',
                  ],
                },
                {
                  title: '2. Paramètres Infaillibles du Meridian Flip (N.I.N.A. & Montures Harmoniques)',
                  content: [
                    'Pause Before Meridian : 1 minute | Minutes After Meridian : 3 minutes | Max Minutes After Meridian : 8 minutes.',
                    'Recenter After Flip : ON (Plate Solve automatique post-retournement).',
                    'Autofocus After Flip : ON (Compense le léger déplacement mécanique du miroir ou du train optique après inversion).',
                  ],
                },
                {
                  title: '3. Check-up Rapide en Cas d’Échec du Plate Solve ASTAP',
                  content: [
                    '1. Vérifier Focale Effective = Focale Native × Réducteur (ex: 500 mm × 0.8 = 400 mm).',
                    '2. Si filtre Dual-Band (Ha/OIII 3nm ou 7nm) installé : Passer la pose de Plate Solve à 6 secondes et Gain 250.',
                    '3. Vérifier que le catalogue stellaire ASTAP D50 est bien installé et sélectionné dans Options > Plate Solving.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Turn your telescope into an autonomous robot. Whether starting with a ZWO ASIAIR on a tablet or configuring a Windows Mini-PC running N.I.N.A., learn how to connect every device, plate-solve invisible targets, and automate your session until dawn.',
          slides: [
            {
              title: 'Chapter 1: Connecting Your Rig (ASIAIR vs. N.I.N.A. Mini-PC)',
              subtitle: 'Understanding the software chain: Camera, Mount, EAF, and PHD2',
              bullets: [
                'Beginner — ZWO ASIAIR: All-in-one smart Wi-Fi unit controlled from a tablet or phone. Zero drivers needed, works seamlessly within the ZWO ecosystem.',
                'Beginner & Expert — Windows Mini-PC (e.g., MeLE Quieter 4C mounted on the scope): Install 3 free building blocks: 1) ASCOM Platform, 2) Hardware drivers (ZWO, Player One, OnStep), 3) N.I.N.A. + PHD2 + ASTAP.',
                'Warm indoor control: Connect your laptop or tablet to the telescope’s Mini-PC via Windows Remote Desktop (RDP) or RustDesk over Wi-Fi!',
              ],
              proTip: 'Create separate Equipment Profiles in N.I.N.A. for each optical setup (e.g., "400mm Refractor Reduced" vs "800mm Native") so focal lengths never get mixed up!',
            },
            {
              title: 'Chapter 2: Astrometric Plate Solving (ASTAP)',
              subtitle: 'Pinpointing exact sky coordinates in 2 seconds',
              bullets: [
                'Why visual 3-star alignment is obsolete: Plate solving takes a 3-second photo, detects stars, and matches geometric star triangles against the offline D50 star database.',
                'In under 2 seconds, N.I.N.A. or ASIAIR determines the exact RA/DEC center coordinates of your camera sensor.',
                'If the telescope is off by 2°, the software calculates the offset, slews the mount, takes a verification shot, and centers the target within 10 pixels.',
              ],
              proTip: 'Install both the ASTAP program AND the "D50 Star Database", and set Plate Solve exposure to 4-6 seconds at high gain when using narrowband filters.',
            },
            {
              title: 'Chapter 3: Dithering Between Exposures',
              subtitle: 'Eliminating diagonal Walking Noise permanently',
              bullets: [
                'The physical issue: Every sensor has warm pixels and slight non-uniformity. As the sky drifts slightly over hours, these fixed defects streak diagonally across your stacked image ("Walking Noise").',
                'The Dithering solution: Between exposures, N.I.N.A. or ASIAIR commands PHD2 to shift the guide star by 5 to 8 pixels in a random direction.',
                'During Sigma Clipping stacking, stars align while hot pixels scatter randomly and get mathematically rejected!',
              ],
              proTip: 'Dither every 3 frames when shooting short 60s-120s exposures so you don’t waste 20% of your clear night waiting for dither settling.',
            },
            {
              title: 'Chapter 4: Automated Meridian Flip & Dawn Shutdown',
              subtitle: 'Sleeping peacefully while your telescope works',
              bullets: [
                'What is the Meridian? The North-South line overhead where targets reach their highest point. Past this line, the camera end of the telescope can hit the tripod legs.',
                'Automated Meridian Flip: The sequencer pauses imaging, flips the mount 180° to the other side of the pier, plate-solves to re-center the target, runs autofocus, restarts PHD2, and resumes shooting!',
                'Dawn safety: At morning astronomical dawn, the sequence stops guiding, parks the mount in Home position, and warms the sensor gently.',
              ],
              proTip: 'Always test your first meridian flip early in the evening while watching your cables to ensure nothing snags during the 180° rotation!',
            },
          ] as Slide[],
          courseSections: [
            {
              level: 'Beginner Level — Software First Steps',
              heading: '1. Framing Your First Nebula in the Framing Wizard / SkyAtlas',
              body: '1) Open the Framing Assistant in N.I.N.A. or SkyAtlas in ASIAIR. 2) Type your target catalog ID (e.g., "NGC 7331", "M31", or "IC 1805") and load the sky survey image. 3) Drag the sensor field-of-view rectangle to compose your shot. 4) Click "Slew and Center"—the mount slews, plate-solves, and centers that exact frame!',
              highlight: 'Framing Wizard -> Search Catalog ID -> Drag Sensor Box -> Slew and Center',
            },
            {
              level: 'Intermediate Level — Dither Math',
              heading: '2. Matching Dither Pixel Scale Between Guide Scope and Main Camera',
              body: 'A 5-pixel dither on the main imaging camera is ideal. Because guide scopes typically have shorter focal lengths (e.g., 120mm guide vs. 480mm main = 1:4 ratio), N.I.N.A. automatically scales the PHD2 pulse command when both focal lengths are properly configured.',
              highlight: 'Target Main Sensor Dither: 5 to 10 pixels shift every 2 to 3 frames',
            },
            {
              level: 'Advanced Level — N.I.N.A. Advanced Sequencer',
              heading: '3. Multi-Target Sequencing & Cloud Recovery Triggers',
              body: 'Use "Loop Until Altitude Below 30°" on target #1, then automatically transition to target #2 rising in the East. Add "Restore Guiding" and "Center After Drift (1 arcmin)" triggers: if clouds pass through for 20 minutes, N.I.N.A. waits, re-centers via Plate Solve once stars return, and continues imaging!',
              highlight: 'Cloud Recovery: "Center After Drift" + "Restore Guiding" triggers save unattended nights',
            },
            {
              level: 'Expert Level — Meridian Flip Timing',
              heading: '4. Bulletproof Meridian Flip Timing on Harmonic Mounts',
              body: 'Never trigger a flip at 00m 00s exactly on the meridian line—if the mount firmware thinks the target is still 0.01° East, it will just nudge instead of flipping piers! Set N.I.N.A. to: Pause Before = 1 min, Minutes After = 3 min, Max Minutes After = 8 min, Recenter = ON, Autofocus After Flip = ON.',
              highlight: 'Fail-Safe Flip Settings: Pause Before = 1m | Minutes After = 3m | Max After = 8m | Recenter = ON',
            },
          ] as LessonSection[],
          troubleshooting: [
            {
              symptom: 'ASTAP repeatedly returns "Plate Solve Failed".',
              cause: 'Incorrect effective focal length entered in settings, out-of-focus stars, or exposure too short through a narrowband filter.',
              solution: 'Verify effective focal length (Native × Reducer), check focus, and increase Plate Solve exposure to 5-8s at Gain 250.',
            },
            {
              symptom: 'During a Meridian Flip, the mount barely moves instead of flipping 180° across the pier.',
              cause: 'Flip command was sent too early right on the 0° line before the mount controller allowed a pier side change.',
              solution: 'Set "Minutes After Meridian" to 3 minutes and "Max Minutes After" to 8 minutes.',
            },
            {
              symptom: 'After dithering, PHD2 takes over 45 seconds and times out ("Settling Timeout").',
              cause: 'Settle pixel tolerance is set too tight for current atmospheric seeing.',
              solution: 'Increase Settle Pixel Tolerance from 0.3 px to 1.2 - 1.5 px over 5 seconds.',
            },
          ] as TroubleshootingItem[],
          steps: [
            '1. Connect Camera, Mount, EAF, and PHD2 in N.I.N.A. or ASIAIR, verifying exact effective focal length.',
            '2. Start camera TEC cooling down to -10°C.',
            '3. Frame your target in Framing Wizard / SkyAtlas and click "Slew and Center" (ASTAP Plate Solve).',
            '4. Run an initial V-Curve Autofocus and start PHD2 guiding.',
            '5. Verify Dithering (every 3 frames), Automated Meridian Flip, and Temperature Refocus (-1.5°C) triggers are active.',
            '6. Confirm "Park Scope" and "Warm Camera" are set at sequence end, then press Play (▶️)!',
          ],
          quiz: [
            {
              question: 'What is the #1 cause of ASTAP Plate Solving failures on a new setup?',
              options: [
                'Incorrect focal length or pixel size entered in settings (or out-of-focus stars)',
                'Missing counterweight',
                'Full battery charge',
              ],
              correct: 0,
              explanation: 'ASTAP requires accurate field-of-view dimensions (computed from focal length and sensor size) and sharp stars.',
            },
            {
              question: 'Why is Dithering essential between exposures?',
              options: [
                'It shifts the mount randomly by a few pixels so stacking algorithms reject hot pixels and diagonal Walking Noise',
                'It increases focal length',
                'It cools the sensor to -20°C',
              ],
              correct: 0,
              explanation: 'Random pixel shifts prevent fixed sensor defects from aligning into diagonal streaks.',
            },
            {
              question: 'How do you prevent a mount from failing to flip sides during an automated Meridian Flip?',
              options: [
                'Set the flip to trigger 3 to 5 minutes AFTER crossing the meridian so the mount controller cleanly switches pier sides',
                'Unplug power at midnight',
                'Disable Plate Solving',
              ],
              correct: 0,
              explanation: 'Waiting 3-5 minutes past the meridian guarantees the target is firmly in the Western hemisphere.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1-en',
              name: 'Complete PDF Manual: N.I.N.A. & ASIAIR Sequence Blueprint + ASTAP Troubleshooting',
              title: 'Module 3 Technical Manual: Night Automation, ASTAP, Dithering & Meridian Flip',
              sections: [
                {
                  title: '1. Complete Dusk-to-Dawn Sequence Architecture',
                  content: [
                    'Startup: Cool (-10°C) -> Unpark -> Slew & Center -> V-Curve AF -> Start Guiding.',
                    'Loop Triggers: Meridian Flip (+3m post) | AF on 1.5°C drop or +8% HFR | Dither every 3 frames | Center After Drift (1\').',
                    'Shutdown: Stop Guiding -> Park Scope -> Warm Camera (10m).',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
      },
    },
    {
      id: 4,
      backupCode: 'ASTRO-MOD4',
      titleFr: 'Module 4 : Caméras Refroidies, Gain, Calibration DOF & Filtres SHO/HOO',
      titleEn: 'Module 4: Cooled Cameras, Gain, DOF Calibration & SHO/HOO Filters',
      price: 29,
      badgeFr: 'Capteurs & Ville',
      badgeEn: 'Sensors & City Imaging',
      descFr:
        'Tout maîtriser : Capteurs CMOS (IMX533, IMX571, IMX585), Gain HCG, calcul du temps de pose unitaire, Darks/Flats/Bias et filtres Dual-Band / SHO en ville.',
      descEn:
        'Master it all: CMOS sensors (IMX533, IMX571, IMX585), HCG Gain, sub-exposure math, Darks/Flats/Bias, and Dual-Band / SHO city imaging.',
      image:
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module4,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "Quel Gain régler ? Combien de secondes poser par photo ? Comment réussir ses Flats du premier coup et photographier sous la Pleine Lune ou en pleine ville ? Ce module répond à toutes les questions du débutant tout en donnant à l'expert les formules électroniques des capteurs Sony Starvis.",
          slides: [
            {
              title: 'Chapitre 1 : Capteurs CMOS Refroidis, Gain HCG & Offset',
              subtitle: 'Comprendre enfin le Gain, l’Offset et le refroidissement Peltier (-10°C)',
              bullets: [
                'Débutant — Le Refroidissement Peltier (TEC) : Contrairement à un appareil photo classique dont le capteur chauffe à +35°C et génère des milliers de points colorés parasites, une caméra astro stabilise son capteur à -10°C (hiver comme été) et divise ce bruit thermique par plus de 15 !',
                'Débutant & Expert — Le Gain HCG (High Conversion Gain) : Sur les capteurs modernes (ASI2600/IMX571, ASI533/IMX533), ne touchez jamais au Gain au hasard ! À exactement Gain = 100 (chez ZWO), le mode HCG s’enclenche : le bruit de lecture s’effondre de 3,5 e- à 1,5 e- tout en récupérant 14 stops de plage dynamique.',
                'L’Offset (Pied d’histogramme = 50) : Ajoute une marge de sécurité (ex: 500 ADU) à tous les pixels pour qu’aucun signal faible de nébuleuse ne soit coupé à zéro (clipping noir).',
              ],
              proTip: 'Règle de simplicité absolue : Sur une caméra à capteur IMX533 ou IMX571 (type ASI533 / ASI2600), réglez Gain = 100, Offset = 50 et Température = -10°C pour 100 % de vos cibles (galaxies comme nébuleuses) !',
            },
            {
              title: 'Chapitre 2 : Choisir le Bon Filtre selon la Cible et la Pollution Lumineuse',
              subtitle: 'Galaxies en Spectre Continu vs Nébuleuses en Bande Étroite (HOO / SHO)',
              bullets: [
                'Règle fondamentale : Tous les objets du ciel profond n’émettent pas la même lumière !',
                '1) Les Galaxies (NGC 7331, M31, M51), Amas d’étoiles et Nébuleuses par réflexion (Pléiades, Iris) brillent sur TOUT l’arc-en-ciel (spectre continu). Utilisez un filtre large UV/IR Cut (Luminance). Si vous mettez un filtre Dual-Band serré, vous éteignez 90 % de la galaxie !',
                '2) Les Nébuleuses en Émission (Orion, Rosette, Cœur, Voiles, Cygne) brillent uniquement sur 3 raies atomiques précises : Hydrogène (Ha 656,3nm), Oxygène (OIII 500,7nm) et Soufre (SII 672,4nm). Avec un filtre Dual-Band (3nm à 7nm sur caméra couleur) ou SHO (sur caméra mono), vous bloquez 98 % de la ville et de la Lune !',
              ],
              proTip: 'Astuce d’expert sur les galaxies : Photographiez votre galaxie (ex: NGC 7331 ou M33) pendant 4 heures avec un filtre UV/IR Cut, puis ajoutez 2 heures avec un filtre Dual-Band (Ha) pour injecter de superbes pépites roses de formation d’étoiles dans ses bras spiraux !',
            },
            {
              title: 'Chapitre 3 : Réussir ses Images de Calibration (Darks, Flats, Bias)',
              subtitle: 'Éliminer 100 % des taches de poussière, du vignettage et des pixels chauds',
              bullets: [
                'Les Lights (Brutes) : Vos photos de la nébuleuse ou de la galaxie prises pendant la nuit.',
                'Les Darks (30 clichés) : Bouchon fermé dans le noir total, exactement à la MÊME température (-10°C), au MÊME Gain (100) et à la MÊME durée (ex: 180s) que vos brutes. Ils soustraient les pixels chauds.',
                'Les Flats / PLU (30 clichés) : Poses courtes sur une surface blanche uniforme (écran à flat ou iPad avec feuille blanche posé sur le pare-buée) SANS toucher à la mise au point ni tourner la caméra. Ils effacent l’assombrissement des coins (vignettage) et les anneaux de poussière !',
                'Les Bias / Offsets (30 clichés) : Poses les plus courtes possibles (0,001s) dans le noir à Gain 100, indispensables pour calibrer mathématiquement les Flats.',
              ],
              proTip: 'Utilisez l’outil "Flat Wizard" (Assistant de Flats) de N.I.N.A. ou le mode "Auto-Flat" de l’ASIAIR : il calcule tout seul le temps de pose exact (souvent entre 0,5s et 3s) pour placer le pic d’histogramme à 40 % !',
            },
            {
              title: 'Chapitre 4 : Combien de Temps Poser par Image Unitaire ?',
              subtitle: 'Trouver l’équilibre entre bruit de lecture et saturation des étoiles',
              bullets: [
                'Si votre pose unitaire est trop courte (ex: 5 secondes en bande étroite), le signal de la nébuleuse se noie dans le bruit électronique de lecture du capteur.',
                'Si votre pose unitaire est trop longue (ex: 600 secondes sans filtre en ville), la pollution lumineuse sature l’image et toutes les étoiles deviennent des disques blancs brûlés sans couleur !',
                'Repères éprouvés à f/5 (Gain 100) : En Large Bande (UV/IR Cut sur Galaxies) = 60 s à 120 s par pose. En Bande Étroite (Dual-Band Ha/OIII ou SHO sur Nébuleuses) = 180 s à 300 s par pose.',
              ],
              proTip: 'Ce qui fait la beauté d’une astrophoto finale n’est pas une seule pose de 10 minutes, mais le TEMPS D’INTÉGRATION TOTAL empilé : visez au minimum 3 à
