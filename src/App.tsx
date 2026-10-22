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

  // Calculateur interactif Module 1 (Échantillonnage)
  const [calcFocal, setCalcFocal] = useState<number>(500);
  const [calcPixel, setCalcPixel] = useState<number>(3.76);

  // Calculateur interactif Module 5 (Zone Critique de Focus CFZ & EAF)
  const [calcFokusFD, setCalcFokusFD] = useState<number>(4.8);
  const [calcMicronStep, setCalcMicronStep] = useState<number>(2.5);

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

  const handleSaveStudentName = (val: string) => {
    setStudentName(val);
    try {
      localStorage.setItem('astroberb_student_name', val);
    } catch (e) {}
  };

  // GÉNÉRATEUR DE CERTIFICAT OFFICIEL
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
              ? "Ce diplôme certifie que l'astrophotographe ci-dessous a complété avec succès le cursus technique de la masterclass d'élite, incluant le calcul optique d'échantillonnage, la maîtrise des montures harmoniques, l'automatisation astrométrique nocturne et le traitement astrophysique linéaire et non-linéaire."
              : 'This diploma certifies that the astrophotographer named below has successfully mastered the elite curriculum, including optical sampling physics, strainwave harmonic mount tracking, automated astrometric sequencing, and linear/non-linear astrophysical image processing.'
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

  // GÉNÉRATEUR DE PDF ROBUSTE A4
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
          @page { size: A4; margin: 16mm; }
          body { font-family: 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.55; padding: 15px; background: white; }
          .header { border-bottom: 3px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 22px; font-weight: 900; color: #312e81; }
          .sub { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; }
          h1 { font-size: 22px; color: #0f172a; margin-bottom: 8px; margin-top: 0; }
          .mod-tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; margin-bottom: 14px; }
          .section { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; page-break-inside: avoid; }
          .section h2 { font-size: 15px; color: #1e293b; margin-top: 0; margin-bottom: 8px; }
          ul { margin: 0; padding-left: 18px; }
          li { margin-bottom: 6px; font-size: 13px; color: #334155; }
          .footer { margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 11px; color: #64748b; text-align: center; }
          .no-print { background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .btn-print { background: #06b6d4; color: #0f172a; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span>📄 <strong>${
            lang === 'fr' ? 'Document technique prêt' : 'Technical sheet ready'
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
                ? 'Documentation Technique & Abaques Terrain'
                : 'Official Field Technical Documentation'
            }</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #475569;">Édition 2026</div>
        </div>
        <div class="mod-tag">${moduleTitle}</div>
        <h1>${doc.title}</h1>
        ${sectionsHtml}
        <div class="footer">© ${new Date().getFullYear()} Astroberb Academy — Support : ${SUPPORT_EMAIL}</div>
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
      heroBadge: '✨ Masterclass d’élite • Édition 2026',
      heroDesc:
        'Du débutant passionné à l’astrophotographe chevronné : formules optiques, montures harmoniques (Juwei-17, UMi-17S, AM5), automatisation N.I.N.A./ASIAIR et traitement PixInsight & Siril.',
      trustBadge: '⭐ Noté 4.9/5 par plus de 320 passionnés d’astronomie',
      catalog: 'Catalogue des Cours',
      vipSection: 'Accès Membre / Code',
      unlockBtn: 'Activer mon code',
      buyStripe: 'Carte bancaire',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Obtenir le Pack Intégral (79$ CAD)',
      packBtnShort: '🔥 Pack Intégral',
      accessGranted: 'Code validé avec succès ! Cliquez sur vos formations débloquées :',
      invalidCode:
        "Code d'accès invalide. Vérifiez votre courriel ou contactez le support.",
      accessCourse: '🚀 ACCÉDER À LA MASTERCLASS',
      lockedBadge: '🔒 Module verrouillé',
      unlockedBadge: '🔓 Déverrouillé (Cliquer pour lancer)',
      backToCatalog: '← Retour au catalogue des formations',
      paymentConfirmedModule:
        '🎉 Accès débloqué ! Notez précieusement votre code de sauvegarde multi-appareils : ',
      interactiveModule: 'Studio Pédagogique & Masterclass',
      studioHeader: 'Diaporama Interactif & Conseils de Terrain',
      fullCourseTitle: 'Cours Théorique Approfondi & Études de Cas',
      tutorialSteps: 'Protocole Opérationnel & Checklist Terrain',
      resourcesPdf: 'Fiches Techniques PDF (Générateur A4 Imprimable)',
      generatePdfBtn: 'Générer & Télécharger le PDF',
      successBadge: 'Paiement Validé avec Succès',
      successTitle: 'Bienvenue dans l’élite de l’Astroberb Academy !',
      successDesc:
        'Votre accès intégral est débloqué. Profitez dès maintenant des 7 modules complets, des simulateurs optiques, des quiz et des guides PDF.',
      backupCodeNotice: 'IMPORTANT — Votre code d’accès multi-appareils à conserver :',
      packTitle: 'L’Offre Ultime : Le Pack Intégral 7-en-1',
      packDesc:
        'Obtenez un accès immédiat, illimité et à vie à l’ensemble de nos 7 masterclasses complètes, nos 2 simulateurs optiques, nos quiz interactifs et nos guides PDF (Valeur : 203$ CAD). Économisez 124$ !',
      payCardStripe: '💳 Payer par Carte Sécurisée (Stripe)',
      payWithPaypal: '🅿️ Payer instantanément avec PayPal',
      vipDesc:
        'Entrez votre code personnel reçu après votre achat (ou votre code de sauvegarde) pour débloquer instantanément vos formations sur cet appareil :',
      vipPlaceholder: 'Votre code (ex: PACK-COMPLET-2026 ou ASTRO-MOD1)',
      viewUnlocked: 'Voir mes modules déverrouillés ➔',
      taxNotice:
        'Prix en dollars canadiens (CAD). Paiement 100% sécurisé — Accès immédiat.',
      footerRights: 'Tous droits réservés.',
      termsLink: 'Conditions Générales de Vente (CGV)',
      privacyLink: 'Politique de Confidentialité',
      contactSupport: 'Support VIP',
      closeBtn: 'Fermer',
      prevSlide: '◀ Chapitre précédent',
      nextSlide: 'Chapitre suivant ▶',
      proTipLabel: '💡 Conseil d’expert Astroberb :',
      quickAccessTitle: '⚡ Accès direct à vos formations déverrouillées :',
      calcTitle:
        '🧮 Simulateur Optique : Calculateur d’Échantillonnage & Seeing',
      calcFocalLabel: 'Focale effective du télescope (mm) :',
      calcPixelLabel: 'Taille des pixels de la caméra (µm) :',
      calcResult: 'Votre Échantillonnage : ',
      calcVerdictGreat:
        '✨ Optimal (0.8" à 2.0"/px) ! Vos pixels sont parfaitement accordés au seeing moyen (2" à 3") pour maximiser la finesse sans perdre en rapport signal/bruit.',
      calcVerdictOver:
        '⚠️ Sur-échantillonnage (< 0.8"/px) : Vous grossissez la turbulence atmosphérique. Nécessite un ciel exceptionnel et un guidage sub-0.4", ou utilisez le Binning 2x2.',
      calcVerdictUnder:
        '⚠️ Sous-échantillonnage (> 2.0"/px) : Grand champ idéal pour les vastes nébuleuses, mais les petites étoiles peuvent paraître légèrement carrées (privilégiez le Drizzle au traitement).',
      calcFocusTitle:
        '🔬 Simulateur EAF : Zone Critique de Mise au Point (CFZ)',
      calcFocusFDLabel: 'Rapport d’ouverture du tube (f/D) :',
      calcFocusStepLabel: 'Déplacement EAF par pas (µm/pas) :',
      calcFocusResult: 'Tolérance de mise au point (CFZ) : ',
      calcFocusAdvice: 'Pas maximum recommandés entre deux mesures de la courbe en V : ',
      quizTitle: '📝 Quiz de Validation des Connaissances',
      quizSubmit: 'Valider mes réponses',
      quizScore: 'Votre Score : ',
      quizRetry: 'Réinitialiser le quiz',
      correctAnswer: '✅ Excellente réponse !',
      wrongAnswer: '❌ Réponse incorrecte.',
      markComplete: '✓ Marquer ce module comme terminé',
      markIncomplete: '✓ Module terminé (Cliquer pour annuler)',
      certTitle: '🏆 Télécharger mon Certificat Officiel',
      certNamePlaceholder: 'Entrez votre Prénom et Nom pour le diplôme',
      faqTitle: '❓ Foire Aux Questions (FAQ)',
      faq1Q: 'Ce cursus convient-il si je débute complètement ?',
      faq1A:
        'Absolument ! Chaque module démarre par les fondations expliquées simplement (sans jargon inutile), puis monte progressivement vers les techniques avancées utilisées par les astrophotographes expérimentés.',
      faq2Q: "Comment reçois-je mes accès après l'achat ?",
      faq2A:
        "L'accès est instantané après la transaction ! Votre module se débloque automatiquement et vous obtenez un code de sauvegarde personnel valable à vie sur tous vos appareils (PC, Mac, tablette, smartphone).",
      faq3Q: 'Puis-je utiliser le site sur le terrain la nuit sans m’éblouir ?',
      faq3A:
        'Oui ! Cliquez sur le bouton "🔴 Mode Nuit" en haut de l’écran : toute l’interface bascule en spectre rouge sombre pour préserver à 100 % votre adaptation visuelle nocturne (rhodopsine).',
      testimonialsTitle: '⭐ Ce que disent nos étudiants passionnés',
      t1: '“Grâce au module sur les montures harmoniques (Juwei-17 / UMi-17S) et N.I.N.A., mon erreur RMS est passée de 1.4" à 0.55" et mes nuits tournent 100 % en automatique pendant que je dors !”',
      t1Author: 'Marc D., Astrophotographe amateur (Québec)',
      t2: '“Le cours sur l’échantillonnage, le backfocus à 55 mm et le workflow linéaire Siril / PixInsight (GraXpert + SPCC + GHS) a complètement transformé mes images de galaxies comme NGC 7331.”',
      t2Author: 'Stéphane L., Passionné de ciel profond',
    },
    en: {
      title: 'Astroberb Academy',
      subtitle: 'Master Deep Sky Astrophotography',
      heroBadge: '✨ Elite Masterclass • 2026 Edition',
      heroDesc:
        'From complete beginner to seasoned imager: optical formulas, strainwave mounts (Juwei-17, UMi-17S, AM5), N.I.N.A./ASIAIR automation, and PixInsight & Siril processing.',
      trustBadge: '⭐ Rated 4.9/5 by over 320 astronomy enthusiasts',
      catalog: 'Course Catalog',
      vipSection: 'Member Access / Code',
      unlockBtn: 'Activate Code',
      buyStripe: 'Credit Card',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Get Full Bundle ($79 CAD)',
      packBtnShort: '🔥 Full Bundle',
      accessGranted: 'Code validated! Click any unlocked course below:',
      invalidCode:
        'Invalid access code. Please check your email or contact support.',
      accessCourse: '🚀 START MASTERCLASS',
      lockedBadge: '🔒 Locked Module',
      unlockedBadge: '🔓 Unlocked (Click to launch)',
      backToCatalog: '← Back to course catalog',
      paymentConfirmedModule:
        '🎉 Access unlocked! Please save your multi-device backup code: ',
      interactiveModule: 'Pedagogical Studio & Masterclass',
      studioHeader: 'Interactive Slides & Field Pro Tips',
      fullCourseTitle: 'In-Depth Theoretical Course & Case Studies',
      tutorialSteps: 'Operational Protocol & Field Checklist',
      resourcesPdf: 'PDF Technical Sheets (Printable A4 Generator)',
      generatePdfBtn: 'Generate & Download PDF',
      successBadge: 'Payment Successful',
      successTitle: 'Welcome to the Elite Astroberb Academy!',
      successDesc:
        'Your full bundle is unlocked. Enjoy immediate access to all 7 modules, interactive optical simulators, quizzes, and printable PDF guides.',
      backupCodeNotice: 'IMPORTANT — Save your multi-device backup code:',
      packTitle: 'The Ultimate Offer: 7-in-1 Full Bundle',
      packDesc:
        'Get immediate, lifetime access to all 7 complete masterclasses, 2 interactive optical calculators, quizzes, and PDF field guides ($203 CAD value). Save $124!',
      payCardStripe: '💳 Secure Credit Card (Stripe)',
      payWithPaypal: '🅿️ Pay instantly with PayPal',
      vipDesc:
        'Enter your personal access code received after purchase to instantly unlock your courses on this device:',
      vipPlaceholder: 'Your code (e.g., PACK-COMPLET-2026 or ASTRO-MOD1)',
      viewUnlocked: 'View my unlocked modules ➔',
      taxNotice:
        'Prices in Canadian Dollars (CAD). 100% secure checkout — Instant access.',
      footerRights: 'All rights reserved.',
      termsLink: 'Terms of Sale (TOS)',
      privacyLink: 'Privacy Policy',
      contactSupport: 'VIP Support',
      closeBtn: 'Close',
      prevSlide: '◀ Previous Chapter',
      nextSlide: 'Next Chapter ▶',
      proTipLabel: '💡 Astroberb Pro Tip:',
      quickAccessTitle: '⚡ Direct access to your unlocked courses:',
      calcTitle: '🧮 Optical Simulator: Pixel Scale & Seeing Calculator',
      calcFocalLabel: 'Effective Telescope Focal Length (mm):',
      calcPixelLabel: 'Camera Pixel Size (µm):',
      calcResult: 'Your Pixel Scale: ',
      calcVerdictGreat:
        '✨ Optimal (0.8" to 2.0"/px)! Your sensor is well matched to typical atmospheric seeing (2" to 3") for sharp details and high SNR.',
      calcVerdictOver:
        '⚠️ Oversampled (< 0.8"/px): Magnifying atmospheric turbulence without extra resolution. Requires exceptional seeing and sub-0.4" guiding, or 2x2 Binning.',
      calcVerdictUnder:
        '⚠️ Undersampled (> 2.0"/px): Great widefield framing for large nebulae, though small stars may look slightly blocky (use Drizzle integration when stacking).',
      calcFocusTitle:
        '🔬 EAF Simulator: Critical Focus Zone (CFZ)',
      calcFocusFDLabel: 'Telescope Focal Ratio (f/D):',
      calcFocusStepLabel: 'Focuser Travel per Step (µm/step):',
      calcFocusResult: 'Critical Focus Zone Tolerance (CFZ): ',
      calcFocusAdvice: 'Recommended EAF step size for V-Curve autofocus: ',
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
      faq1A:
        'Yes! Every module starts with clear fundamentals explained step-by-step before diving into advanced techniques for seasoned astrophotographers.',
      faq2Q: 'How do I receive my access after purchase?',
      faq2A:
        'Access is immediate! Your module unlocks automatically and displays your personal multi-device backup code valid for life across PC, Mac, tablet, and mobile.',
      faq3Q: 'Can I use this platform in the field at night?',
      faq3A:
        'Yes! Toggle the "🔴 Night Mode" button in the top bar to switch the entire interface to deep red wavelengths and preserve your night vision.',
      testimonialsTitle: '⭐ What our passionate students say',
      t1: '“Thanks to the strainwave harmonic mount (Juwei-17 / UMi-17S) and N.I.N.A. module, my RMS guiding dropped from 1.4" to 0.55" and my sessions run 100% automatically while I sleep!”',
      t1Author: 'Marc D., Amateur Astrophotographer (Quebec)',
      t2: '“The pixel scale calculator, 55mm backfocus guide, and Siril / PixInsight workflow (GraXpert + SPCC + GHS) completely transformed my galaxy images like NGC 7331.”',
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
      titleFr: 'Module 1 : Choisir son Télescope & ses Optiques',
      titleEn: 'Module 1: Choosing Your Telescope & Optics',
      price: 29,
      badgeFr: 'Fondamental Optique',
      badgeEn: 'Optical Foundations',
      descFr:
        'Lunettes apochromatiques (Triplet ED), Newton, Ritchey-Chrétien : formules optiques, échantillonnage, backfocus 55 mm et correction du tilt.',
      descEn:
        'Apochromatic refractors (ED Triplet), Newtonian, Ritchey-Chrétien: optical designs, pixel scale, 55mm backfocus, and sensor tilt.',
      image:
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module1,
      calculatorType: 'sampling' as const,
      content: {
        fr: {
          intro:
            "Le choix du tube optique détermine 80 % de votre réussite sur le terrain et le type d'objets célestes accessibles. Que vous débutiez avec une lunette apochromatique ou que vous optimisiez un télescope à miroir rapide, ce module vous donne toutes les clés mathématiques et mécaniques.",
          slides: [
            {
              title: "Chapitre 1 : Focale vs Rapport d'ouverture (f/D)",
              subtitle: "Comprendre le cadrage et la vitesse photographique d'un instrument",
              bullets: [
                'Débutant : La longueur focale (ex: 400 mm vs 1200 mm) agit comme le zoom : elle détermine uniquement la taille de la nébuleuse ou galaxie sur votre capteur.',
                "Le rapport d'ouverture (f/D = Focale ÷ Diamètre) agit comme l'ouverture d'un objectif photo : il dicte la vitesse à laquelle les photons s'accumulent sur chaque pixel.",
                'Règle du carré : Passer de f/8 à f/4 concentre 4 fois plus de lumière ! Une pose de 1 heure à f/4 équivaut à 4 heures de pose à f/8.',
              ],
              proTip: "Pour débuter sans frustration, choisissez une lunette apochromatique de 300 à 500 mm de focale ouverte entre f/4.5 et f/5.5 grâce à son réducteur-aplanisseur dédié.",
            },
            {
              title: 'Chapitre 2 : Comparatif des Formules Optiques',
              subtitle: 'Lunette APO (Triplet/Petzval), Newton, Schmidt-Cassegrain & RC',
              bullets: [
                'Lunette Apochromatique (Triplet ED / Petzval) : Sans collimation, contraste maximal, idéale pour les grands champs de nébuleuses. Le Petzval intègre déjà le correcteur sans calcul de backfocus !',
                'Télescope de Newton (f/4 ou f/5) : Le meilleur rapport diamètre/prix et très rapide photographiquement, mais exige un correcteur de coma, une collimation laser/Cheshire rigoureuse et une prise au vent maîtrisée.',
                'Schmidt-Cassegrain (EdgeHD) & Ritchey-Chrétien (RC) : Longues focales (1000 à 2000 mm) taillées pour les petites galaxies (comme NGC 7331 ou M51) et nébuleuses planétaires.',
              ],
              proTip: 'Si vous imagez en nomade, un quadruplet Petzval (type Askar FRA / RedCat) ou un triplet de 70-80 mm vous fait gagner 30 minutes d’installation chaque nuit.',
            },
            {
              title: 'Chapitre 3 : Backfocus 55 mm, Courbure de Champ & Tilt',
              subtitle: "L'alignement mécanique au dixième de millimètre",
              bullets: [
                'Le Backfocus est le tirage mécanique exact entre l’épaulement arrière du réducteur/correcteur et la surface du capteur CMOS (standard universel : 55,0 mm).',
                'Diagnostic visuel dans les coins : Si les étoiles des 4 coins filent vers le centre (en rayons de vélo), le capteur est TROP PROCHE du correcteur (ajoutez 0.5 à 1 mm de bague).',
                'Si les étoiles des coins tournent autour du centre (en arc de cercle), le capteur est TROP LOIN du correcteur (retirez une rondelle de calage). Si un seul coin est flou, il s’agit de Tilt (inclinaison mécanique).',
              ],
              proTip: 'Si vous insérez un filtre de 2 mm d’épaisseur dans votre train optique, ajoutez +0,67 mm (1/3 de l’épaisseur du verre) à votre distance de backfocus cible (soit 55,7 mm).',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: "1. La Physique de l'Échantillonnage et le Critère de Nyquist-Shannon",
              body: "L'échantillonnage (exprimé en secondes d'arc par pixel, \"/px) mesure la portion de ciel capturée par un seul photosite de votre caméra. L'atmosphère terrestre brouille les détails fins : c'est le Seeing (généralement entre 2,0\" et 3,0\" sous nos latitudes). Pour capturer 100 % des détails permis par le ciel sans étaler inutilement la lumière (sur-échantillonnage), votre échantillonnage doit se situer autour du tiers ou de la moitié du Seeing moyen, soit entre 0,8\"/px et 2,0\"/px.",
              highlight: 'Formule fondamentale : Échantillonnage ("/px) = (206,265 × Taille_Pixel_µm) ÷ Focale_mm',
            },
            {
              heading: '2. Pouvoir Séparateur (Critère de Dawes) et Tache d’Airy',
              body: "Même dans l'espace sans atmosphère, la diffraction de la lumière limite la finesse d'un télescope : une étoile ponctuelle forme un minuscule disque lumineux appelé Tache d'Airy. Le pouvoir séparateur ne dépend que du diamètre (D en mm) de votre optique : R = 120 ÷ D. Une lunette de 80 mm résout 1,5\", tandis qu'un tube de 200 mm descend à 0,6\" si le seeing le permet.",
              highlight: 'Diamètre 80 mm = 1,5" max | Diamètre 130 mm = 0,9" max | Diamètre 200 mm = 0,6" max',
            },
            {
              heading: '3. Construire son Train Optique Rigide (Tout Visser en M48 / M54)',
              body: "Bannissez définitivement les coulants à serrage annulaire (1.25\" ou 2\" à vis latérales) pour l'imagerie : sous le poids de la caméra refroidie et de la roue à filtres, ils provoquent de la flexion différentielle et du tilt lorsque le télescope change d'orientation dans le ciel. Privilégiez une chaîne 100 % vissée (filetages M42, M48 ou M54) du porte-oculaire jusqu'au capteur.",
              highlight: 'Empilement standard 55 mm : Caméra (17,5 mm) + Tiroir à filtre (21 mm) + Bague M48 (16,5 mm) = 55,0 mm',
            },
          ] as LessonSection[],
          steps: [
            '1. Calculer son échantillonnage dans le simulateur ci-dessus pour viser la plage optimale de 0,8" à 2,0" par pixel.',
            '2. Assembler le train optique 100 % vissé (M48/M54) et mesurer les 55,0 mm de backfocus au pied à coulisse.',
            '3. Ajouter +0,67 mm en rondelles micrométriques (shims) si un filtre de 2 mm d’épaisseur est présent dans le chemin optique.',
            '4. Inspecter la forme des étoiles dans les 4 coins sur une pose test de 10 secondes (HFR / Aberration Inspector).',
            '5. Équilibrer le tube optique équipé (pare-buée déployé et câbles branchés) sur la queue d’aronde.',
          ],
          quiz: [
            {
              question: "Quel paramètre détermine la vitesse photographique pure d'un télescope (temps nécessaire pour capter un signal donné) ?",
              options: [
                'La longueur focale en millimètres uniquement',
                "Le rapport d'ouverture f/D (Focale divisée par le Diamètre)",
                'La longueur du pare-buée',
              ],
              correct: 1,
              explanation: "Le rapport f/D dicte la concentration de photons par unité de surface sur le capteur. Passer de f/8 à f/4 divise le temps de pose requis par 4.",
            },
            {
              question: "Sur votre image brute, les étoiles situées dans les 4 coins sont étirées en pointant vers le centre de l'image. Quel est le diagnostic ?",
              options: [
                'Votre capteur est trop proche du correcteur/réducteur (il manque du backfocus)',
                'Votre capteur est trop éloigné du correcteur/réducteur (trop de backfocus)',
                'Votre batterie est déchargée',
              ],
              correct: 0,
              explanation: "Des étoiles étirées radialement vers le centre indiquent une sous-correction : augmentez la distance correcteur-capteur avec une bague fine de 0,5 mm ou 1 mm.",
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod1-pdf1',
              name: "Abaque d'Échantillonnage Optique & Diagnostic Backfocus 55 mm (PDF)",
              title: "Guide de Référence : Échantillonnage, Formules Optiques & Backfocus 55 mm",
              sections: [
                {
                  title: '1. Formule Mathématique & Cibles de Seeing',
                  content: [
                    'Formule officielle : Échantillonnage ("/px) = (206,265 × Taille du pixel en µm) ÷ Focale effective en mm.',
                    'Ciel standard (Seeing 2.5" - 3.0") : Visez entre 1.0"/px et 2.0"/px pour un équilibre idéal finesse / rapport signal-bruit.',
                    'Ciel d’exception (Seeing < 2.0") : Descendez entre 0.6"/px et 1.0"/px avec une monture guidée sous 0.5" RMS.',
                  ],
                },
                {
                  title: '2. Schéma Standard du Train Optique ZWO / QHY (55,0 mm)',
                  content: [
                    'Tirage interne caméra refroidie (ex: ASI2600MC/MM, ASI533MC) : 17,5 mm (ou 12,5 mm sans bague de 5 mm).',
                    'Tiroir à filtre (Filter Drawer M42/M48) ou Diviseur Optique (OAG) : 21,0 mm ou 16,5 mm.',
                    'Entretoise d’extension M48 : 16,5 mm -> Total = 17,5 + 21,0 + 16,5 = 55,0 mm exactement.',
                    'Compensation optique des filtres : Ajoutez +1/3 de l’épaisseur du verre (+0,67 mm pour un filtre de 2 mm).',
                  ],
                },
                {
                  title: '3. Diagnostic Express des Coins (Aberration Inspector)',
                  content: [
                    'Étoiles étirées vers le centre (rayons) : Capteur trop proche -> Ajoutez +0,5 mm à +1,5 mm d’espaceurs.',
                    'Étoiles étirées en cercle autour du centre : Capteur trop loin -> Retirez 0,5 mm à 1,5 mm d’espaceurs.',
                    'Étoiles déformées dans 1 ou 2 coins seulement : Présence de Tilt mécanique -> Ajustez la bague de tilt.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Your optical tube assembly dictates 80% of your field experience and target framing. Whether starting with an apochromatic refractor or tuning a fast reflector, this module covers essential optical math and mechanical precision.',
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
            {
              title: 'Chapter 2: Comparing Optical Designs',
              subtitle: 'APO Refractor, Petzval, Newtonian & Ritchey-Chrétien',
              bullets: [
                'APO Triplet / Petzval Refractor: Zero collimation required, crisp stars, ideal for widefield nebulae. Petzval designs require no fixed backfocus distance!',
                'Newtonian Reflector (f/4 - f/5): Unbeatable aperture-per-dollar and fast speed, but requires a coma corrector and precise laser/Cheshire collimation.',
                'Schmidt-Cassegrain (EdgeHD) & RC: Long focal lengths (1000-2000mm) built for compact galaxies like NGC 7331 or M51.',
              ],
              proTip: 'For portable setups, a Petzval quadruplet saves setup time and eliminates backfocus spacing headaches.',
            },
            {
              title: 'Chapter 3: 55mm Backfocus, Field Curvature & Sensor Tilt',
              subtitle: 'Sub-millimeter mechanical alignment',
              bullets: [
                'Backfocus is the exact mechanical distance from the rear shoulder of the flattener/reducer to the CMOS sensor plane (standard: 55.0 mm).',
                'Corner star diagnosis: If corner stars flare radially toward the center, your sensor is TOO CLOSE to the reducer (add 0.5mm-1mm spacer).',
                'If corner stars form concentric arcs around the center, the sensor is TOO FAR (remove spacers). Asymmetric corners indicate mechanical tilt.',
              ],
              proTip: 'When inserting a 2mm thick glass filter into the optical train, add +0.67mm (1/3 of filter thickness) to your backfocus spacing.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Pixel Scale Physics & Atmospheric Seeing',
              body: 'Pixel scale (arcseconds per pixel, "/px) measures the angular resolution of each camera pixel. Earth’s atmosphere blurs fine detail (Seeing, typically 2.0" to 3.0"). By sampling at roughly 1/2 to 1/3 of your seeing (between 0.8"/px and 2.0"/px), you capture maximum detail without wasting signal-to-noise ratio.',
              highlight: 'Core Formula: Pixel Scale ("/px) = (206.265 × Pixel_Size_µm) ÷ Focal_Length_mm',
            },
            {
              heading: '2. Dawes Limit & Airy Disk Diffraction',
              body: 'Even in space, diffraction limits optical resolution based solely on aperture diameter (D in mm): R = 120 ÷ D. An 80mm refractor resolves down to 1.5", while a 200mm reflector reaches 0.6" under calm skies.',
              highlight: '80mm Aperture = 1.5" limit | 130mm = 0.9" limit | 200mm = 0.6" limit',
            },
            {
              heading: '3. Building a Rigid Threaded Optical Train (M48 / M54)',
              body: 'Avoid thumbscrew compression nosepieces for heavy cooled cameras. Use an all-threaded M42/M48/M54 imaging train to prevent differential flexure and sensor tilt as the telescope slews across the sky.',
              highlight: 'Standard 55mm stack: Camera (17.5mm) + Filter Drawer/OAG (21mm) + M48 Spacer (16.5mm) = 55.0mm',
            },
          ] as LessonSection[],
          steps: [
            '1. Calculate your pixel scale in the simulator above to target 0.8" to 2.0" per pixel.',
            '2. Assemble a fully threaded M48/M54 optical train and verify 55.0mm backfocus with digital calipers.',
            '3. Add +0.67mm in fine spacer shims to compensate for a 2mm thick glass filter.',
            '4. Inspect corner stars on a 10-second test frame to verify flat field correction.',
            '5. Balance the fully rigged optical tube (dew shield extended, cables attached) on its dovetail bar.',
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
              question: 'If stars in all four corners point radially toward the center of the frame, what is the issue?',
              options: [
                'Sensor is too close to the flattener/reducer (needs more backfocus)',
                'Sensor is too far from the flattener/reducer',
                'Camera cooling is turned off',
              ],
              correct: 0,
              explanation: 'Radial corner elongation indicates under-correction: add 0.5mm to 1mm of spacing.',
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
                    'Formula: Pixel Scale ("/px) = (206.265 × Pixel Size in µm) ÷ Effective Focal Length in mm.',
                    'Average Seeing (2.5" - 3.0"): Aim for 1.0"/px to 2.0"/px for optimal SNR and sharpness.',
                  ],
                },
                {
                  title: '2. Standard 55.0mm Optical Train Breakdown',
                  content: [
                    'Cooled Camera Sensor Depth (17.5mm) + Filter Drawer/OAG (21.0mm) + Spacer (16.5mm) = 55.0mm.',
                    'Filter glass compensation: Add +1/3 of filter glass thickness (+0.67mm for 2mm filters).',
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
      price: 29,
      badgeFr: 'Matériel & Suivi',
      badgeEn: 'Hardware & Tracking',
      descFr:
        'Maîtriser les montures à réducteurs harmoniques (Juwei-17, Proxisky UMi-17S, ZWO AM5) et l’alignement polaire sub-arcminute.',
      descEn:
        'Master strainwave harmonic mounts (Juwei-17, Proxisky UMi-17S, ZWO AM5) and sub-arcminute polar alignment.',
      image:
        'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module2,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "La monture équatoriale est le cœur battant de votre setup. L'arrivée des réducteurs harmoniques (Strainwave Gear comme les Juwei-17, Proxisky UMi-17S ou ZWO AM5) a révolutionné la discipline : découvrez comment dompter leur mécanique unique pour un suivi chirurgical.",
          slides: [
            {
              title: "Chapitre 1 : Vis sans fin vs Réducteur Harmonique (Strainwave)",
              subtitle: 'Pourquoi la technologie harmonique a tout changé',
              bullets: [
                'Montures classiques (EQ6-R, HEQ5) : Utilisent une roue dentée et une vis sans fin. Très douces, mais lourdes et nécessitent de lourds contrepoids en fonte et un réglage du jeu mécanique (backlash).',
                'Montures Harmoniques (Juwei-17, UMi-17S, AM5) : Une couronne flexible elliptique (flexspline) s’engrène dans une couronne rigide avec un couple phénoménal.',
                'Résultat : Une tête de monture de 4 à 5 kg porte 13 à 18 kg d’équipement SANS contrepoids et avec zéro jeu d’inversion (Zero Backlash) en déclinaison !',
              ],
              proTip: 'Au-delà de 12 kg de charge utile sur une Juwei-17 ou UMi-17S, ajoutez tout de même une petite barre et un contrepoids de 3 à 5 kg non pas pour les moteurs, mais pour éviter le basculement du trépied !',
            },
            {
              title: "Chapitre 2 : Dompter l'Erreur Périodique (PE) Harmonique",
              subtitle: 'Le secret des poses courtes d’autoguidage (0.5s à 1.0s)',
              bullets: [
                'Contrairement aux vis sans fin qui ont une erreur périodique faible mais parfois saccadée, les réducteurs harmoniques ont une erreur périodique d’amplitude plus large (±10" à ±20") mais parfaitement sinusoïdale.',
                'Cependant, la pente de dérive (dérivée temporelle en "/seconde) peut être rapide à certains angles de la couronne elliptique.',
                'Pour figer cette dérive, il est impératif d’autoguider avec des poses courtes de 0,5 s à 1,0 s (au lieu de 2 s ou 3 s sur une monture classique).',
              ],
              proTip: 'Utilisez une caméra de guidage monochrome ultra-sensible (ex: ASI220MM Mini ou ASI120MM Mini) avec un diviseur optique (OAG) ou une lunette guide de 30-50 mm bien rigide.',
            },
            {
              title: "Chapitre 3 : Mise en Station Polaire & Gestion des Câbles",
              subtitle: 'Aligner l’axe AD sur le Pôle Céleste Nord en 3 minutes',
              bullets: [
                'Fini le viseur polaire à genoux dans le froid : l’alignement polaire assisté par caméra (Plate-Solved Polar Align dans N.I.N.A. TPPA ou ASIAIR) prend 3 clichés en tournant l’axe AD de 30°.',
                'Le logiciel calcule l’écart exact avec le vrai Pôle Céleste et vous indique de combien tourner les molettes d’Azimut et d’Altitude.',
                'Attention au Cable Snag (accrochage de câble) : avec le couple énorme d’une Juwei-17 ou AM5, un câble bloqué sera arraché sans que la monture ne ralentisse !',
              ],
              proTip: 'Visez une erreur totale de mise en station inférieure à 1 minute d’arc (< 1\'00") : au-delà de cette précision, serrer les vis de blocage risque de fausser le réglage plus que de l’améliorer.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Comparatif Technique : Juwei-17, Proxisky UMi-17S et ZWO AM5',
              body: "Les montures Juwei-17 et Proxisky UMi-17S utilisent des réducteurs harmoniques de taille 17 (rapport 100:1) sur les deux axes, couplés à une courroie synchrone et un contrôleur OnStep (compatible ASCOM, INDI, N.I.N.A. et ASIAIR). Elles intègrent un frein électromagnétique à manque de courant sur l'axe AD : si l'alimentation 12V coupe brusquement en pleine nuit, le frein bloque instantanément l'axe pour empêcher votre télescope de retomber sous son propre poids.",
              highlight: 'Sécurité absolue : Toujours alimenter la monture en 12V - 5A stable et lester le trépied carbone au centre.',
            },
            {
              heading: '2. Pourquoi une Mise en Station Imparfaite Crée de la Rotation de Champ',
              body: "Si votre axe d'Ascension Droite (AD) n'est pas parallèle à l'axe de rotation de la Terre, votre autoguidage réussira certes à garder l'étoile guide fixe, mais toutes les autres étoiles tourneront lentement autour d'elle sur des poses de 300 secondes ! Une mise en station sous 1 minute d'arc élimine à la fois la dérive en Déclinaison (DEC) et toute rotation de champ résiduelle.",
              highlight: 'Cible de mise en station : Erreur Totale < 1\' (60 secondes d’arc) avant de serrer les molettes.',
            },
          ] as LessonSection[],
          steps: [
            '1. Orienter le trépied vers le Nord, le mettre de niveau et suspendre un poids de lestage (batterie LiFePO4 ou sac de pierres) sous la colonne centrale.',
            '2. Fixer la monture harmonique (Juwei-17 / UMi-17S / AM5), régler la latitude approximative et verrouiller fermement la queue d’aronde du tube.',
            '3. Regrouper tous les câbles dans une gaine tressée souple passant par l’axe de rotation pour éviter tout tirage mécanique (Cable Drag).',
            '4. Lancer l’assistant Polar Alignment (ASIAIR ou N.I.N.A. Three Point Polar Alignment) après la mise au point grossière.',
            '5. Ajuster finement l’Azimut et l’Altitude sous 1 minute d’arc en observant l’impact du serrage final des vis de blocage.',
          ],
          quiz: [
            {
              question: 'Quelle durée de pose d’autoguidage est spécifiquement recommandée pour une monture à réducteurs harmoniques (Juwei-17, UMi-17S, AM5) ?',
              options: [
                'De 0,5 seconde à 1,0 seconde',
                'De 5 à 10 secondes',
                'Aucun autoguidage n’est nécessaire à 1000 mm de focale',
              ],
              correct: 0,
              explanation: "L'erreur périodique des réducteurs harmoniques présente une pente rapide qui exige une fréquence de correction élevée (0,5s à 1,0s) pour maintenir un RMS inférieur à 0,6\".",
            },
            {
              question: 'Quel risque physique majeur présente un trépied carbone ultra-léger utilisé avec une monture harmonique sans contrepoids ?',
              options: [
                'Le centre de gravité se déporte hors du polygone de sustentation et le trépied peut basculer',
                'Le carbone brouille le signal Wi-Fi',
                'La monture tourne deux fois plus vite',
              ],
              correct: 0,
              explanation: 'Sans contrepoids pour centrer la masse, le poids du télescope se déporte sur le côté lorsque l’axe AD tourne : il faut impérativement lester le centre du trépied.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1',
              name: 'Checklist Terrain : Montures Harmoniques & Mise en Station (PDF)',
              title: 'Protocole Opérationnel : Juwei-17 / UMi-17S / AM5 & Alignement Polaire',
              sections: [
                {
                  title: '1. Sécurité Mécanique & Électrique des Montures Harmoniques',
                  content: [
                    'Lestage obligatoire du trépied carbone : Suspendez au moins 4 à 6 kg (batterie LiFePO4) au crochet central.',
                    'Alimentation dédiée : 12V DC (minimum 3A à 5A stabilisés). Une chute de tension sous 11.2V pendant un GoTo rapide peut faire décrocher les moteurs pas-à-pas.',
                    'Frein électromagnétique AD : Ne jamais forcer manuellement l’axe d’Ascension Droite hors tension.',
                  ],
                },
                {
                  title: '2. Protocole de Mise en Station Astrométrique (N.I.N.A. TPPA / ASIAIR)',
                  content: [
                    'Étape 1 : Mise au point préalable sur les étoiles et lancement du Polar Align.',
                    'Étape 2 : Le télescope prend 3 images espacées de 10° à 30° en AD et résout le champ (Plate Solve).',
                    'Étape 3 : Ajustez d’abord l’Azimut (molettes horizontales), puis l’Altitude (vis verticale) en mode rafraîchissement continu (Loop).',
                    'Étape 4 : Serrez les vis de verrouillage progressivement en vérifiant que l’erreur totale reste sous 60" (< 1\').',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Your equatorial mount is the beating heart of your rig. Strainwave harmonic mounts (Juwei-17, Proxisky UMi-17S, ZWO AM5) have revolutionized portable imaging—learn how to master their unique mechanics for sub-arcsecond tracking.',
          slides: [
            {
              title: 'Chapter 1: Worm Gears vs. Strainwave Harmonic Drives',
              subtitle: 'High torque, zero backlash, no counterweights',
              bullets: [
                'Traditional Worm Mounts (EQ6-R, HEQ5): Smooth periodic error, but heavy heads requiring cast-iron counterweights and backlash tuning.',
                'Harmonic Mounts (Juwei-17, UMi-17S, AM5): An elliptical wave generator flexes a toothed spline inside a circular ring with massive torque.',
                'Result: A 4.5kg mount head carries 13kg to 18kg payloads WITHOUT counterweights and with virtually zero DEC backlash!',
              ],
              proTip: 'For payloads above 12kg on a Juwei-17 or UMi-17S, add a small 3-5kg counterweight to keep the center of gravity safely over your tripod.',
            },
            {
              title: 'Chapter 2: Taming Harmonic Periodic Error (PE)',
              subtitle: 'Why 0.5s to 1.0s guide exposures are mandatory',
              bullets: [
                'Strainwave gears exhibit a steeper periodic error slope (±10" to ±20" peak-to-peak) than precision worm gears.',
                'Waiting 2 to 3 seconds between guide corrections allows the mount to drift too far between exposures.',
                'Using fast 0.5s to 1.0s guide exposures with Multi-Star PHD2 guiding locks tracking down to 0.4" - 0.7" total RMS.',
              ],
              proTip: 'Pair your harmonic mount with a sensitive mono guide camera (e.g., ASI220MM Mini) and an Off-Axis Guider (OAG) or rigid 30-50mm guide scope.',
            },
            {
              title: 'Chapter 3: Precision Polar Alignment & Cable Management',
              subtitle: 'Sub-arcminute alignment in under 3 minutes',
              bullets: [
                'Software-assisted polar alignment (N.I.N.A. TPPA or ASIAIR Polar Align) platesolves 3 frames while rotating RA.',
                'Fine-tune Altitude and Azimuth knobs while watching live error feedback on screen.',
                'Prevent cable snags: harmonic drives have enough torque to rip tight USB or power cables right out of their sockets!',
              ],
              proTip: 'Aim for total polar alignment error under 1 arcminute (< 1\'00"). Chasing 0\'01" wastes imaging time as atmospheric refraction shifts the pole slightly anyway.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Hardware Deep Dive: Juwei-17, Proxisky UMi-17S & ZWO AM5',
              body: 'Models like the Juwei-17 and Proxisky UMi-17S feature size-17 dual-axis strainwave reducers driven by synchronous belts and OnStep firmware (fully compatible with ASCOM, INDI, N.I.N.A., and ASIAIR). They include an electromagnetic power-off brake on the RA axis to prevent the telescope from swinging down if 12V power is accidentally disconnected.',
              highlight: 'Safety Rule: Always ballast carbon tripods from the center hook and use a regulated 12V 5A power supply.',
            },
            {
              heading: '2. Why Poor Polar Alignment Causes Field Rotation',
              body: 'If your RA axis is misaligned with the celestial pole, guiding keeps the guide star centered, but the rest of the frame slowly rotates around that star during long exposures. Sub-arcminute polar alignment eliminates both DEC drift and field rotation.',
              highlight: 'Polar Alignment Target: Total Error < 1\' (60 arcseconds) after tightening lock knobs.',
            },
          ] as LessonSection[],
          steps: [
            '1. Point the tripod North, level it, and hang a ballast weight (LiFePO4 battery or weight bag) from the center spreader.',
            '2. Secure the harmonic mount head, set approximate latitude, and firmly clamp the telescope dovetail.',
            '3. Route all power and USB cables through a flexible braided sleeve along the mount axis to prevent cable drag.',
            '4. Run camera-assisted Polar Alignment (ASIAIR or N.I.N.A. TPPA) once stars are focused.',
            '5. Adjust Azimuth and Altitude under 1 arcminute while monitoring shift as locking knobs are tightened.',
          ],
          quiz: [
            {
              question: 'What guide exposure duration is recommended for strainwave harmonic mounts?',
              options: [
                '0.5 to 1.0 second',
                '5 to 10 seconds',
                'Guiding is not needed',
              ],
              correct: 0,
              explanation: 'Fast periodic error slopes on harmonic drives require frequent 0.5s - 1.0s guide pulses.',
            },
            {
              question: 'What is the main physical risk of using a lightweight carbon tripod with a counterweight-less harmonic mount?',
              options: [
                'Off-axis center of gravity can tip the tripod over if not ballasted',
                'Carbon blocks Wi-Fi signals',
                'It doubles tracking speed',
              ],
              correct: 0,
              explanation: 'Without counterweights, the payload swings off-center during tracking—always ballast the tripod.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1-en',
              name: 'Field Checklist: Harmonic Mounts & Polar Alignment (PDF)',
              title: 'Operational Protocol: Juwei-17 / UMi-17S / AM5 & Polar Alignment',
              sections: [
                {
                  title: '1. Mechanical & Power Safety',
                  content: [
                    'Mandatory tripod ballast: Hang 4-6kg from the center column hook.',
                    'Dedicated 12V 5A regulated power supply to prevent voltage drops during slews.',
                  ],
                },
                {
                  title: '2. Astrometric Polar Alignment Procedure',
                  content: [
                    'Run N.I.N.A. TPPA or ASIAIR Polar Align, adjust Azimuth then Altitude under 60 arcseconds.',
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
        'Automatisez 100 % de votre nuit : astrométrie ASTAP, Plate Solving, séquenceur avancé, Dithering et retournement au méridien.',
      descEn:
        'Automate 100% of your night: ASTAP astrometry, Plate Solving, advanced sequencer, Dithering, and Meridian Flip.',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module3,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "Pourquoi passer la nuit dehors par -10°C à vérifier votre cadrage alors qu'un mini-PC sous N.I.N.A. ou un boîtier ZWO ASIAIR peut tout orchestrer au pixel près ? Apprenez à programmer une nuit complète, du crépuscule jusqu'au parcage à l'aube.",
          slides: [
            {
              title: 'Chapitre 1 : Plate Solving Astrométrique (ASTAP)',
              subtitle: 'Centrer une nébuleuse invisible en moins de 3 secondes',
              bullets: [
                'Principe : La caméra prend une photo de 2 à 5 secondes. Le solveur (ASTAP) mesure les triangles formés par les étoiles et les compare à une base de données hors-ligne (D50).',
                'Le logiciel connaît alors les coordonnées exactes (AD/DEC) pointées par le télescope à 0,1 seconde d’arc près !',
                'Il synchronise la monture et effectue un micro-déplacement de correction jusqu’à ce que votre cible soit centrée à moins de 10 pixels près.',
              ],
              proTip: 'Dans N.I.N.A. ou ASIAIR, renseignez toujours la focale réelle exacte de votre tube (avec son réducteur) : une focale erronée de plus de 10 % est la cause n°1 d’échec du Plate Solving !',
            },
            {
              title: 'Chapitre 2 : Le Dithering (Décalage Aléatoire entre Poses)',
              subtitle: 'L’arme absolue contre la trame oblique (Walking Noise)',
              bullets: [
                'Sans Dithering, les pixels chauds et le bruit fixe du capteur tombent presque au même endroit d’une pose à l’autre et forment une horrible pluie de stries obliques à l’empilement.',
                'Le Dithering ordonne à la monture de se décaler aléatoirement de 5 à 10 pixels entre les poses.',
                'Lors de l’empilement (Rejection Sigma Clipping sous Siril ou PixInsight), les défauts fixes sont mathématiquement effacés, laissant un fond de ciel velouté !',
              ],
              proTip: 'Pour gagner du temps d’imagerie, faites un Dithering toutes les 3 poses si vous shootez à 60s/120s, ou à chaque pose si vous faites des poses longues de 300s.',
            },
            {
              title: 'Chapitre 3 : Retournement au Méridien (Meridian Flip) & Séquenceur',
              subtitle: 'Passer le zénith pendant que vous dormez',
              bullets: [
                'Lorsqu’un objet traverse le méridien (son point culminant au Sud), le tube optique risque de heurter un pied du trépied.',
                'Le séquenceur arrête la pose et l’autoguidage, bascule la monture de l’autre côté du pilier (180°), refait un Plate Solve pour retrouver le cadrage exact, relance un Autofocus et reprend les poses !',
                'En fin de nuit, la séquence réchauffe doucement le capteur (Warm-up), parque la monture en position Home et coupe le suivi.',
              ],
              proTip: 'Dans vos paramètres de Meridian Flip, ajoutez un délai de 5 minutes APRÈS le passage du méridien (Post-Meridian Delay) pour éviter que la monture n’hésite pile sur la ligne des 0°.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. ZWO ASIAIR vs Mini-PC N.I.N.A. : Lequel Choisir ?',
              body: "L'ASIAIR (Plus ou Mini) brille par sa simplicité immédiate sur smartphone/tablette : tout est intégré (Wi-Fi, distribution 12V, alignement polaire, Live Stack), mais il vous limite à l'écosystème ZWO pour les caméras et l'EAF. À l'inverse, un Mini-PC (MeLE Quieter 4C sous Windows 11 Pro) avec N.I.N.A., ASCOM et PHD2 est 100 % ouvert à toutes les marques (Player One, QHY, Touptek, Juwei-17/OnStep) et offre un séquenceur logique infiniment plus puissant.",
              highlight: 'ASIAIR = Simplicité clé en main ZWO | N.I.N.A. = Liberté totale multi-marques & Séquençage expert',
            },
            {
              heading: '2. Architecture d’une Séquence Nocturne Infaillible',
              body: "Dans le séquenceur avancé de N.I.N.A., structurez toujours votre nuit en 3 blocs : 1) Démarrage (Refroidir caméra à -10°C -> Déparquer -> Attendre le crépuscule astronomique). 2) Boucle d'acquisition avec Déclencheurs intelligents (Meridian Flip activé, Recentrage si dérive > 1', Autofocus si HFR augmente de 8 % ou ΔT > 1.5°C, Dithering tous les 3 clichés). 3) Clôture (Parquer la monture -> Réchauffer le capteur sur 10 minutes).",
              highlight: 'Règle d’or : Toujours sauvegarder votre séquence en Modèle (Template) réutilisable en 1 clic.',
            },
          ] as LessonSection[],
          steps: [
            '1. Installer le solveur ASTAP et son catalogue stellaire D50, puis vérifier la focale exacte dans le profil d’équipement.',
            '2. Cadrer sa cible dans l’assistant de cadrage (Framing Wizard / SkyAtlas) et envoyer les coordonnées au séquenceur.',
            '3. Activer le Dithering (amplitude de 5 à 8 pixels sur la caméra principale, toutes les 2 ou 3 poses).',
            '4. Activer et vérifier les limites du retournement au méridien automatique (Pause 2 min avant, Flip 5 min après).',
            '5. Programmer l’instruction de fin de nuit : Parcage du télescope (Park Scope) et réchauffement progressif du capteur (Warm Camera).',
          ],
          quiz: [
            {
              question: 'Quelle est la cause numéro 1 d’un échec systématique du Plate Solving (ASTAP) lors de la première nuit ?',
              options: [
                'Une longueur focale ou une taille de pixel mal renseignée dans le logiciel (ou une mise au point complètement floue)',
                'L’absence de filtre Ha',
                'Une batterie chargée à 100 %',
              ],
              correct: 0,
              explanation: "Le solveur astrométrique a besoin de connaître le champ de vision exact (calculé via la focale et la taille du capteur) ainsi que d'étoiles nettes pour reconnaître les constellations.",
            },
            {
              question: 'À quoi sert concrètement le Dithering pendant une séance d’acquisition ?',
              options: [
                'À décaler légèrement la monture de quelques pixels entre les poses pour éliminer le bruit de trame (Walking Noise) à l’empilement',
                'À refroidir le capteur plus vite',
                'À augmenter le grossissement optique',
              ],
              correct: 0,
              explanation: 'En déplaçant aléatoirement le champ de 5 à 10 pixels, les pixels chauds ne s’alignent plus sur les mêmes étoiles et sont rejetés par l’algorithme Sigma Clipping.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1',
              name: 'Architecture de Séquence N.I.N.A. & ASIAIR (PDF)',
              title: 'Blueprint Complet : Séquence Automatisée de A à Z (N.I.N.A. & ASIAIR)',
              sections: [
                {
                  title: '1. Bloc de Préparation & Démarrage',
                  content: [
                    'Cool Camera : Température cible -10°C, durée minimale de descente 5 minutes.',
                    'Unpark Scope & Slew and Center : Pointage GoTo + Plate Solve ASTAP (tolérance d’erreur < 30 secondes d’arc).',
                    'Run Autofocus : Exécution d’une courbe en V initiale avant de lancer le guidage.',
                  ],
                },
                {
                  title: '2. Déclencheurs (Triggers) de la Boucle d’Imagerie',
                  content: [
                    'Meridian Flip : Pause 2 min avant le méridien, retournement 5 min après, Recenter + Autofocus post-flip activés.',
                    'Autofocus Trigger : Relancer l’EAF si la température chute de 1,5°C ou si le HFR moyen augmente de 8 %.',
                    'Dither : Toutes les 3 poses (poses de 60-120s) ou toutes les poses (poses de 300s), déplacement de 5 à 8 px.',
                    'Center After Drift : Re-centrer par Plate Solve si la cible dérive de plus de 1 minute d’arc.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Why freeze outside all night checking your framing when a mini-PC running N.I.N.A. or a ZWO ASIAIR can orchestrate everything down to the pixel? Learn how to automate a complete dusk-to-dawn imaging session.',
          slides: [
            {
              title: 'Chapter 1: Astrometric Plate Solving (ASTAP)',
              subtitle: 'Centering invisible deep-sky targets in 3 seconds',
              bullets: [
                'How it works: The camera takes a 3-second snapshot. ASTAP measures geometric star triangles and matches them against an offline catalog (D50).',
                'The software determines the telescope’s exact RA/DEC pointing coordinates within 0.1 arcsecond.',
                'It automatically syncs the mount and slews until your target is centered within a few pixels.',
              ],
              proTip: 'Always enter your exact effective focal length (including any focal reducer) in N.I.N.A. or ASIAIR—incorrect focal length is the #1 cause of plate solve failures!',
            },
            {
              title: 'Chapter 2: Dithering Between Exposures',
              subtitle: 'Eliminating Walking Noise and fixed pattern artifacts',
              bullets: [
                'Without dithering, hot pixels and fixed sensor noise slowly drift in one direction, creating diagonal streaks ("Walking Noise") in your stacked image.',
                'Dithering shifts the mount randomly by 5 to 10 pixels between exposures.',
                'During Sigma Clipping integration in Siril or PixInsight, fixed sensor defects are mathematically rejected, leaving a clean background!',
              ],
              proTip: 'Dither every 3 frames when shooting 60s-120s subs, or every single frame when shooting 300s narrowband exposures.',
            },
            {
              title: 'Chapter 3: Automated Meridian Flip & Safe Shutdown',
              subtitle: 'Crossing the zenith while you sleep',
              bullets: [
                'When a target crosses the meridian (highest point in the South), the telescope tube risks colliding with the tripod legs.',
                'The sequencer stops guiding, flips the mount 180° to the other side of the pier, plate-solves to restore exact framing, refocuses, and resumes!',
                'At astronomical dawn, the sequence parks the mount in Home position and gently warms up the camera sensor.',
              ],
              proTip: 'Set your Meridian Flip to trigger 5 minutes AFTER crossing the meridian to avoid mount hesitation right on the 0° line.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. ZWO ASIAIR vs. N.I.N.A. Mini-PC: Which Ecosystem?',
              body: 'The ZWO ASIAIR offers turnkey mobile simplicity with built-in 12V power hubs and sky atlas, though it locks you into ZWO cameras and focusers. A Windows 11 Pro Mini-PC running N.I.N.A., ASCOM, and PHD2 supports all hardware brands (Player One, Touptek, QHY, Juwei-17/OnStep) and offers unmatched conditional sequencing power.',
              highlight: 'ASIAIR = Turnkey Mobile Simplicity | N.I.N.A. = Universal Hardware Freedom & Advanced Logic',
            },
            {
              heading: '2. Structuring a Bulletproof Night Sequence',
              body: 'Divide every sequence into 3 blocks: 1) Startup (Cool sensor to -10°C -> Unpark -> Wait for astronomical twilight). 2) Imaging Loop with Triggers (Meridian Flip, Autofocus on 1.5°C drop or 8% HFR rise, Dither every 3 frames, Center After Drift). 3) Shutdown (Park Scope -> Warm Camera over 10 minutes).',
              highlight: 'Save your perfected N.I.N.A. structure as a reusable Sequence Template.',
            },
          ] as LessonSection[],
          steps: [
            '1. Install ASTAP and the D50 star database, and verify exact effective focal length in equipment settings.',
            '2. Frame your target in the Framing Wizard / SkyAtlas and push coordinates to the sequencer.',
            '3. Enable Dithering (5 to 8 pixels shift on the main camera, every 2 to 3 exposures).',
            '4. Configure automated Meridian Flip settings (Pause 2 min before, Flip 5 min after crossing).',
            '5. Add end-of-night safety instructions: Park Scope and Warm Camera.',
          ],
          quiz: [
            {
              question: 'What is the #1 cause of ASTAP Plate Solving failures on a new setup?',
              options: [
                'Incorrect focal length / pixel size entered in settings (or out-of-focus stars)',
                'Missing narrowband filter',
                'Full battery charge',
              ],
              correct: 0,
              explanation: 'Plate solvers require accurate field-of-view parameters and focused stars to match catalog patterns.',
            },
            {
              question: 'What is the primary purpose of Dithering during acquisition?',
              options: [
                'Randomly shifting the mount by a few pixels between subs to eliminate fixed-pattern Walking Noise during stacking',
                'Cooling the camera faster',
                'Increasing focal length',
              ],
              correct: 0,
              explanation: 'Shifting the frame allows Sigma Clipping algorithms to reject hot pixels and fixed sensor noise.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1-en',
              name: 'N.I.N.A. & ASIAIR Sequence Blueprint (PDF)',
              title: 'Complete Automated Sequence Architecture',
              sections: [
                {
                  title: '1. Startup & Loop Triggers',
                  content: [
                    'Cool camera to -10°C, Slew & Plate Solve (< 30" tolerance), Initial V-Curve Autofocus.',
                    'Triggers: Meridian Flip (+5 min post), Autofocus on 1.5°C drop or +8% HFR, Dither every 3 frames.',
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
      titleFr: 'Module 4 : Caméras Refroidies & Filtres Bande Étroite',
      titleEn: 'Module 4: Cooled Cameras & Narrowband Filters',
      price: 29,
      badgeFr: 'Capteurs & Ville',
      badgeEn: 'Sensors & City Imaging',
      descFr:
        'Capteurs CMOS (IMX533, IMX571), Gain HCG, Darks/Flats/Bias et imagerie SHO (Palette Hubble) ou Dual-Band HOO en ville.',
      descEn:
        'CMOS sensors (IMX533, IMX571), HCG Gain, Darks/Flats/Bias, and SHO (Hubble Palette) or Dual-Band HOO city imaging.',
      image:
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module4,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "Photographier des nébuleuses d'une finesse spectaculaire depuis un jardin en pleine ville (Bortle 7-8) ou sous la Pleine Lune est aujourd'hui une réalité grâce aux capteurs CMOS refroidis par effet Peltier et aux filtres interférentiels à bande étroite.",
          slides: [
            {
              title: 'Chapitre 1 : Capteurs CMOS Refroidis, Gain HCG & Offset',
              subtitle: 'Comprendre les courbes des capteurs Sony IMX533, IMX571 & IMX585',
              bullets: [
                'Refroidissement Peltier (TEC) : Stabiliser le capteur à -10°C divise le bruit thermique (courant d’obscurité) par plus de 10 par rapport à l’été à +20°C !',
                'Mode HCG (High Conversion Gain) : Sur les caméras type ASI2600 / ASI533 (Gain 100 chez ZWO), une bascule électronique interne fait chuter brutalement le bruit de lecture de 3,5 e- à seulement 1,5 e- tout en restituant presque 14 stops de dynamique.',
                'L’Offset (Pied d’histogramme, ex: 50) ajoute une constante numérique pour éviter que les pixels les plus sombres ne soient tronqués à zéro (clipping noir).',
              ],
              proTip: 'Ne dépassez jamais 80 % de puissance sur le refroidisseur Peltier : il vaut mieux un capteur stable à -10°C (à 55 % de puissance TEC) qu’un capteur à -20°C qui oscille à 100 % !',
            },
            {
              title: 'Chapitre 2 : Filtres Bande Étroite (Dual-Band HOO vs Mono SHO)',
              subtitle: 'Bloquer 98 % de la pollution lumineuse urbaine',
              bullets: [
                'Les nébuleuses en émission brillent sur des longueurs d’onde atomiques ultra-précises : Hydrogène-Alpha (Ha à 656,3 nm), Oxygène-III (OIII à 500,7 nm) et Soufre-II (SII à 672,4 nm).',
                'Avec une caméra Couleur (OSC) : Un filtre Dual-Band (Ha + OIII en 3nm ou 7nm, type L-Ultimate ou Antlia ALP-T) laisse passer uniquement ces deux raies et bloque toute la lumière parasite de la ville !',
                'Avec une caméra Monochrome : On utilise une roue à filtres avec 3 filtres séparés (SII, Ha, OIII) assignés aux canaux Rouge, Vert et Bleu pour créer la célèbre Palette Hubble (SHO).',
              ],
              proTip: 'Attention : Les galaxies (comme M31 ou NGC 7331) et les amas d’étoiles émettent sur tout le spectre continu ! Ne les photographiez pas avec un filtre Dual-Band strict : imagez-les en large bande (UV/IR Cut ou L-Pro) puis ajoutez une couche Ha pour leurs régions roses.',
            },
            {
              title: 'Chapitre 3 : Les Images de Calibration (Darks, Flats, Dark-Flats)',
              subtitle: 'Nettoyer mathématiquement les défauts optiques et thermiques',
              bullets: [
                'Les Darks (Bruit thermique & pixels chauds) : Poses prises dans le noir absolu avec exactement la MÊME durée, le MÊME gain et la MÊME température (-10°C) que vos brutes (Lights).',
                'Les Flats (Vignettage & poussières) : Poses courtes sur un écran lumineux uniforme (table à flat / t-shirt blanc à l’aube) sans toucher ni à la mise au point ni à la rotation de la caméra, visant un histogramme à 35-50 %.',
                'Les Bias ou Dark-Flats : Soustraits aux Flats pour permettre leur division mathématique exacte.',
              ],
              proTip: 'Créez votre bibliothèque de Master Darks (30 poses de 60s, 120s et 300s à -10°C, Gain 100) un jour de pluie dans votre salon : vous pourrez la réutiliser pendant 6 à 12 mois !',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Pourquoi les Capteurs Modernes (IMX533 / IMX571) Sont "Zero Amp Glow"',
              body: "Les anciennes générations de capteurs (comme l'IMX294 ou l'IMX183) présentaient de l'électroluminescence (Amp Glow) : une lueur infrarouge parasite dans les coins causée par l'électronique du capteur. Les capteurs Sony Starvis rétro-éclairés modernes (IMX533 carré 1 pouce et IMX571 format APS-C 26 MP) disposent d'une architecture 16 bits/14 bits à zéro Amp Glow et d'un rendement quantique (QE) dépassant 80 %.",
              highlight: 'Réglage universel IMX533 / IMX571 (ZWO) : Gain = 100 | Offset = 50 | Température = -10°C',
            },
            {
              heading: '2. Temps de Pose Unitaire : Comment ne ni Sous-exposer ni Brûler les Étoiles',
              body: "Une pose unitaire doit être assez longue pour que le signal du fond de ciel submerge le bruit de lecture du capteur (règle du facteur 5x à 10x RN²), mais assez courte pour ne pas saturer le cœur des étoiles brillantes. En large bande (UV/IR Cut), 60 s à 120 s suffisent généralement à f/5. En bande étroite (Dual-Band 3nm/7nm ou SHO), le filtre bloque tellement de lumière qu'il faut poser 180 s à 300 s par image.",
              highlight: 'Large Bande (Galaxies / Amas) = 60s à 120s | Bande Étroite (Nébuleuses Ha/OIII) = 180s à 300s',
            },
          ] as LessonSection[],
          steps: [
            '1. Configurer sa caméra refroidie sur son point d’inflexion HCG (ex: Gain 100, Offset 50) et lancer la descente thermique à -10°C.',
            '2. Choisir le filtre adapté à la cible : UV/IR Cut pour les galaxies et amas, ou Dual-Band (Ha/OIII) / SHO pour les nébuleuses en émission.',
            '3. En fin de séance (avant de démonter le tube !), poser un panneau lumineux uniforme sur le pare-buée et capturer 25 à 30 Flats (histogramme à 40 %).',
            '4. Capturer immédiatement 25 Bias (poses de 0.001s dans le noir) ou 25 Dark-Flats de même durée que les Flats.',
            '5. Utiliser sa bibliothèque de Master Darks à -10°C correspondant exactement au temps de pose unitaire des brutes.',
          ],
          quiz: [
            {
              question: 'Que se passe-t-il au niveau électronique lorsqu’on passe à Gain 100 (mode HCG) sur une caméra équipée d’un capteur IMX533 ou IMX571 ?',
              options: [
                'Le bruit de lecture chute drastiquement tout en conservant une plage dynamique maximale',
                'La taille physique des pixels double',
                'Le refroidissement Peltier s’éteint',
              ],
              correct: 0,
              explanation: 'Le seuil HCG (High Conversion Gain) active un amplificateur interne qui divise par plus de deux le bruit de lecture, rendant les faibles extensions de nébuleuses beaucoup plus faciles à extraire.',
            },
            {
              question: 'Quelle condition est strictement obligatoire pour réussir ses images de Flats (PLU) ?',
              options: [
                'Ne modifier ni la mise au point (focus), ni l’orientation (rotation) de la caméra et des filtres par rapport aux prises de vue de la nuit',
                'Les prendre dans le noir complet avec le bouchon sur le télescope',
                'Changer de télescope avant de les faire',
              ],
              correct: 0,
              explanation: 'Les Flats corrigent le vignettage et l’ombre des poussières : si la caméra tourne ou si la mise au point bouge, les taches de poussière ne se superposeront plus !',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod4-pdf1',
              name: 'Abaque Gain CMOS, Temps de Pose & Calibration (PDF)',
              title: 'Référence Capteurs CMOS Refroidis, Filtres SHO/HOO & Calibration',
              sections: [
                {
                  title: '1. Réglages Optimaux des Principaux Capteurs CMOS',
                  content: [
                    'Sony IMX571 (ASI2600MC/MM, QHY268, Touptek 2600) : Gain HCG = 100 (ZWO), Offset = 50, Temp = -10°C.',
                    'Sony IMX533 (ASI533MC/MM) : Gain HCG = 100, Offset = 50 ou 70, Temp = -10°C.',
                    'Sony IMX585 (ASI585MC Pro) : Gain HCG = 252, Offset = 30, Temp = -10°C.',
                  ],
                },
                {
                  title: '2. Tableau des Temps de Pose Unitaires (f/4.5 à f/5.5)',
                  content: [
                    'Cibles à spectre continu (Galaxies type NGC 7331, M31, Pléiades) : Filtre UV/IR Cut, poses de 60 s à 120 s.',
                    'Nébuleuses en émission (Cœur, Âme, Voiles, Rosette, Orion) : Filtre Dual-Band (Ha/OIII) ou SHO, poses de 180 s à 300 s.',
                  ],
                },
                {
                  title: '3. Mémento Calibration (DOF : Darks, Offset/Bias, Flats)',
                  content: [
                    '30 Darks : Noir absolu, même Température (-10°C), même Gain (100), même Temps de pose (ex: 180s).',
                    '30 Flats : Écran blanc uniforme, même Focus, même Rotation optique, pic d’histogramme entre 35 % et 50 %.',
                    '30 Bias / Dark-Flats : Noir absolu, même Gain (100) pour calibrer les Flats.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Capturing breathtaking nebulae from light-polluted city backyards (Bortle 7-8) or under a bright Moon is completely achievable using TEC-cooled CMOS cameras and narrowband interference filters.',
          slides: [
            {
              title: 'Chapter 1: Cooled CMOS Sensors, HCG Gain & Offset',
              subtitle: 'Mastering Sony IMX533, IMX571 & IMX585 sensor physics',
              bullets: [
                'Peltier (TEC) Cooling: Stabilizing sensor temperature at -10°C cuts thermal dark current by over 10x compared to warm summer nights.',
                'HCG Mode (High Conversion Gain): At Gain 100 (on ZWO ASI2600 / ASI533), internal circuitry drops read noise from ~3.5e- down to ~1.5e- while preserving nearly 14 stops of dynamic range!',
                'Offset (Pedestal, e.g., 50) adds a small baseline digital value so dark background pixels never clip to zero.',
              ],
              proTip: 'Keep TEC cooler power between 30% and 75%: a rock-solid -10°C is far better for dark calibration than an unstable -20°C running at 100% power.',
            },
            {
              title: 'Chapter 2: Narrowband Filters (Dual-Band HOO vs. Mono SHO)',
              subtitle: 'Blocking 98% of urban light pollution',
              bullets: [
                'Emission nebulae glow at specific atomic wavelengths: Hydrogen-Alpha (Ha at 656.3nm), Oxygen-III (OIII at 500.7nm), and Sulfur-II (SII at 672.4nm).',
                'With Color Cameras (OSC): A Dual-Band filter (3nm or 7nm Ha+OIII) passes only nebula light while rejecting streetlamps and moonlight.',
                'With Mono Cameras: Separate SII, Ha, and OIII filters map to Red, Green, and Blue channels to build the iconic Hubble Palette (SHO).',
              ],
              proTip: 'Galaxies (like M31 or NGC 7331) emit broadband starlight! Shoot galaxies with a UV/IR Cut filter first, then optionally blend Ha data to highlight pink star-forming regions.',
            },
            {
              title: 'Chapter 3: Calibration Frames (Darks, Flats & Bias)',
              subtitle: 'Mathematically removing thermal noise, dust motes, and vignetting',
              bullets: [
                'Darks: Taken in total darkness matching exact exposure time, Gain, and Temperature (-10°C) of your Light frames.',
                'Flats: Short exposures of an evenly illuminated panel without changing focus or camera rotation (target 35-50% histogram peak).',
                'Bias / Dark-Flats: Subtracted from Flats so flat-field division works accurately.',
              ],
              proTip: 'Build a reusable Master Dark library (30 frames each at 60s, 120s, and 300s at -10°C, Gain 100) on a cloudy day—it stays valid for 6 to 12 months!',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Modern Zero-Amp-Glow Back-Illuminated CMOS Sensors',
              body: 'Modern Sony Starvis sensors (IMX533 1-inch square and IMX571 APS-C 26MP) feature zero amp glow, high quantum efficiency (>80% QE), and ultra-low read noise once HCG kicks in.',
              highlight: 'Universal IMX533 / IMX571 Settings (ZWO): Gain = 100 | Offset = 50 | Temp = -10°C',
            },
            {
              heading: '2. Sub-Exposure Duration: Swamping Read Noise Without Clipping Stars',
              body: 'Expose long enough for sky background signal to swamp sensor read noise, without saturating bright star cores. At f/5, 60s to 120s works great for broadband galaxies, while 180s to 300s is ideal for narrowband nebulae.',
              highlight: 'Broadband (Galaxies/Clusters) = 60s-120s | Narrowband (Ha/OIII Nebulae) = 180s-300s',
            },
          ] as LessonSection[],
          steps: [
            '1. Set camera to HCG Gain (e.g., Gain 100, Offset 50) and cool sensor to -10°C.',
            '2. Select the appropriate filter: UV/IR Cut for galaxies/clusters, or Dual-Band / SHO for emission nebulae.',
            '3. Before disassembling the rig, place an even flat panel over the objective and capture 30 Flats (40% histogram).',
            '4. Capture 30 Bias frames (0.001s capped) or matching Dark-Flats.',
            '5. Apply your -10°C Master Dark library matching the exact exposure duration of your Lights.',
          ],
          quiz: [
            {
              question: 'What happens electronically at Gain 100 (HCG mode) on an IMX533 or IMX571 camera?',
              options: [
                'Read noise drops sharply while preserving high dynamic range',
                'Physical pixel size doubles',
                'TEC cooling shuts off',
              ],
              correct: 0,
              explanation: 'High Conversion Gain significantly reduces read noise while keeping full dynamic range.',
            },
            {
              question: 'What is mandatory when capturing Flat frames?',
              options: [
                'Keep focus position and camera rotation identical to your Light frames',
                'Keep the lens cap closed in total darkness',
                'Change the optical reducer first',
              ],
              correct: 0,
              explanation: 'Flats map the exact dust shadows and vignetting of your optical path—focus and rotation must not change.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod4-pdf1-en',
              name: 'CMOS Gain, Sub-Exposure & Calibration Reference (PDF)',
              title: 'Cooled CMOS Sensor Settings, SHO/HOO Filters & Calibration Guide',
              sections: [
                {
                  title: '1. Optimal Sensor Settings & Sub-Exposures',
                  content: [
                    'IMX571 / IMX533: Gain 100, Offset 50, -10°C.',
                    'Broadband targets: 60s - 120s subs | Narrowband targets: 180s - 300s subs.',
                  ],
                },
              ],
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
      price: 29,
      badgeFr: 'Précision & Suivi',
      badgeEn: 'Precision & Guiding',
      descFr:
        'Obtenir des étoiles ponctuelles : courbe en V (HFR), calcul de la CFZ, compensation du backlash et suivi PHD2 sub-arcseconde.',
      descEn:
        'Achieve pinpoint stars: V-curve autofocus (HFR), CFZ calculation, backlash compensation, and sub-arcsecond PHD2 guiding.',
      image:
        'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module5,
      calculatorType: 'focus' as const,
      content: {
        fr: {
          intro:
            "Même la meilleure optique du monde produira une image empâtée si la mise au point dérive de 40 microns avec le froid nocturne ou si le guidage oscille. Maîtrisez l'Autofocus motorisé (EAF) et le calibrage chirurgical de PHD2 Guiding (testez le calculateur de Zone Critique CFZ ci-dessous !).",
          slides: [
            {
              title: 'Chapitre 1 : La Courbe en V (Autofocus EAF & HFR)',
              subtitle: 'Une mise au point au micron près, réajustée toute la nuit',
              bullets: [
                'Pourquoi le masque de Bahtinov ne suffit plus : Lorsque la température extérieure baisse de 2°C la nuit, le tube en aluminium se contracte et décale le point focal !',
                'Le moteur pas-à-pas (EAF) déplace le porte-oculaire en mesurant le HFR (Half Flux Radius = rayon contenant 50 % de la lumière de chaque étoile) sur tout le champ.',
                'En traçant 7 à 9 points de part et d’autre du point focal, l’algorithme ajuste une parabole (Courbe en V) et positionne le capteur au sommet exact de finesse.',
              ],
              proTip: 'Réglez votre taille de pas EAF (Step Size) pour que le HFR aux extrémités de la courbe en V soit environ 3 à 4 fois supérieur au HFR minimal au centre (ex: passer de HFR 2.0 à HFR 7.0).',
            },
            {
              title: 'Chapitre 2 : Éliminer le Backlash de l’EAF (Méthode Overshoot)',
              subtitle: 'Empêcher le jeu d’engrenage de fausser le point final',
              bullets: [
                'Tout système mécanique possède un léger jeu lors d’un changement de sens (Backlash) : si le moteur revient en arrière vers le point focal, il risque de s’arrêter légèrement à côté.',
                'La méthode Overshoot (Dépassement dans N.I.N.A.) résout ce problème à 100 % : le moteur dépasse volontairement la cible d’un grand nombre de pas (ex: 150 pas), puis revient toujours dans le MÊME sens final (vers l’intérieur, contre la gravité) !',
                'Ainsi, les engrenages sont systématiquement en prise directe au moment où la pose démarre.',
              ],
              proTip: 'Dans N.I.N.A. (Options > Autofocus), choisissez Backlash Compensation Method = "Overshoot" et mettez 150 pas dans "Backlash IN" (ou OUT selon le sens qui pousse votre caméra vers le haut).',
            },
            {
              title: 'Chapitre 3 : Autoguidage PHD2 Multi-Star & Diagnostic des Graphes',
              subtitle: 'Atteindre 0,4" à 0,7" RMS d’erreur totale',
              bullets: [
                'Guidage Multi-Étoiles (Multi-Star) : PHD2 suit simultanément 10 à 12 étoiles dans le champ. Cela empêche le logiciel de "chasser la turbulence" (Seeing) d’une seule étoile qui scintille.',
                'Où calibrer PHD2 ? Toujours près de l’Intersection du Méridien et de l’Équateur Céleste (DEC = 0° ± 20°), là où le mouvement apparent des étoiles est maximal.',
                'Diagnostic du graphe : Si l’axe AD (Bleu) oscille de haut en bas après chaque impulsion, votre Agressivité RA est trop haute (baissez-la de 80 % à 60 %).',
              ],
              proTip: 'Utilisez toujours l’Assistant de Guidage (Guiding Assistant) de PHD2 pendant 2 minutes : il mesure votre turbulence réelle et calcule le MinMo (déplacement minimal avant correction) optimal.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. La Formule de la Zone Critique de Mise au Point (CFZ)',
              body: "La Zone Critique de Mise au Point (Critical Focus Zone, en micromètres) est la plage minuscule à l'intérieur de laquelle l'optique est considérée comme parfaitement nette (limitée par la diffraction). Elle dépend du carré du rapport d'ouverture : CFZ (µm) ≈ 4,88 × (f/D)² × λ (soit environ 2,68 × (f/D)² en lumière verte à 550 nm). Sur un tube rapide à f/4, la CFZ ne mesure que 43 microns (moins de l'épaisseur d'un cheveu) ! Sur un tube à f/7, elle atteint 131 microns.",
              highlight: 'À f/4 : CFZ = 43 µm (Ultra-sensible au froid) | À f/5.5 : CFZ = 81 µm | À f/7 : CFZ = 131 µm',
            },
            {
              heading: '2. Lire et Corriger un Graphe PHD2 en Un Coup d’Œil',
              body: "Ce qui compte pour avoir des étoiles parfaitement rondes sur vos brutes n'est pas seulement l'erreur RMS totale (visez une valeur inférieure à la moitié de votre échantillonnage, ex: < 0,7\" RMS), mais surtout l'égalité entre les deux axes : RMS AD ≈ RMS DEC. Si votre RMS AD est à 0,9\" et votre RMS DEC à 0,3\", vos étoiles seront légèrement ovales en Ascension Droite ! Réduisez alors le temps de pose de guidage (0,5s à 1,0s sur monture harmonique) et ajustez l'agressivité RA entre 60 % et 75 %.",
              highlight: 'Cible d’or PHD2 : RMS Total < 0,8" ET Équilibre des axes (RMS RA ≈ RMS DEC)',
            },
          ] as LessonSection[],
          steps: [
            '1. Calculer sa Zone Critique (CFZ) et son Step Size EAF dans le simulateur interactif ci-dessus.',
            '2. Activer la compensation du jeu par dépassement (Overshoot = 100 à 150 pas) et lancer une première courbe en V.',
            '3. Pointer le télescope près du Méridien Sud et de l’Équateur Céleste (DEC entre -10° et +20°) et lancer la calibration PHD2 (Maj + Clic sur Boucler/Guider).',
            '4. Cocher l’option "Use Multiple Stars" (Multi-étoiles) dans PHD2 et régler l’exposition sur 0,5s - 1,0s (monture harmonique) ou 1,5s - 2,5s (monture vis sans fin).',
            '5. Vérifier que le RMS Total se stabilise sous votre échantillonnage et que RMS RA et RMS DEC sont équilibrés.',
          ],
          quiz: [
            {
              question: 'Comment évolue la tolérance de mise au point (Zone Critique CFZ) lorsque l’on utilise un télescope très ouvert (ex: f/4 au lieu de f/8) ?',
              options: [
                'La zone critique devient 4 fois plus étroite et exigeante (quelques dizaines de microns à peine)',
                'La zone critique devient 10 fois plus large',
                'Le rapport f/D n’a aucun impact sur la mise au point',
              ],
              correct: 0,
              explanation: 'La CFZ est proportionnelle au carré du rapport f/D : un instrument deux fois plus ouvert (f/4 vs f/8) a une profondeur de foyer 4 fois plus fine !',
            },
            {
              question: 'Dans quel secteur du ciel faut-il effectuer la calibration initiale de PHD2 Guiding pour une précision mathématique maximale ?',
              options: [
                'Près du méridien et de l’équateur céleste (Déclinaison proche de 0°)',
                'Directement sur l’étoile Polaire (DEC = +90°)',
                'Sur l’horizon Nord à travers les arbres',
              ],
              correct: 0,
              explanation: "À l'équateur céleste (DEC = 0°), la vitesse linéaire apparente des étoiles est maximale, ce qui permet à PHD2 de mesurer parfaitement l'orthogonalité et la vitesse des axes AD et DEC.",
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod5-pdf1',
              name: 'Abaque Réglages EAF (Courbe en V) & Diagnostic PHD2 Guiding (PDF)',
              title: 'Guide de Terrain : Autofocus EAF & Diagnostic Rapide PHD2',
              sections: [
                {
                  title: '1. Paramètres Optimaux de la Courbe en V (N.I.N.A. / ASIAIR)',
                  content: [
                    'Nombre de points de décalage (Offset Steps) : 4 de chaque côté (soit 9 points au total).',
                    'Taille de pas (Step Size) : Environ 1,5x à 2x la Zone Critique (CFZ) pour obtenir un HFR multiplié par 3,5 aux extrémités.',
                    'Compensation du Backlash : Mode "Overshoot" réglé sur 100 à 150 pas dans une seule direction.',
                  ],
                },
                {
                  title: '2. Réglages PHD2 Spécifiques aux Montures Harmoniques (Juwei-17 / UMi-17S / AM5)',
                  content: [
                    'Temps d’exposition : 0.5 s à 1.0 s | Mode Multi-Star : Activé.',
                    'Algorithme RA : Hysteresis (Hystérésis = 10%, Agressivité = 65% à 75%) ou PPEC.',
                    'Algorithme DEC : Resist Switch ou Lowpass2 (Agressivité = 70% à 80%).',
                    'Max RA / Max DEC Duration : 1500 ms à 2000 ms.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Even flagship optics produce soft images if focus drifts by 40 microns during nighttime temperature drops or if guiding oscillates. Master motorized EAF V-curves and surgical PHD2 guiding (test our Critical Focus Zone simulator below!).',
          slides: [
            {
              title: 'Chapter 1: V-Curve Autofocus (EAF & Star HFR)',
              subtitle: 'Micron-level automated focus tracking all night',
              bullets: [
                'Why Bahtinov masks aren’t enough: A 2°C nighttime temperature drop contracts aluminum optical tubes and shifts the focal plane.',
                'The Electronic Automatic Focuser (EAF) moves in precise stepper increments while measuring full-field star HFR (Half Flux Radius).',
                'Fitting a hyperbolic curve across 7 to 9 focus points places your sensor at the exact mathematical vertex of sharpness.',
              ],
              proTip: 'Set your EAF Step Size so the outer wings of your V-curve reach an HFR roughly 3x to 4x higher than the minimum focused HFR.',
            },
            {
              title: 'Chapter 2: Eliminating Focuser Backlash (Overshoot Method)',
              subtitle: 'Preventing gear play from ruining final focus',
              bullets: [
                'Every mechanical focuser has slight gear play (backlash) when reversing direction.',
                'The Overshoot method in N.I.N.A. solves this completely: the motor intentionally travels past the target by 100-150 steps, then approaches the final focus point in one consistent direction (preferably INWARD against gravity).',
                'This ensures gears are always fully meshed when exposures begin.',
              ],
              proTip: 'In N.I.N.A. Autofocus options, select Backlash Compensation = "Overshoot" and enter 150 steps in Backlash IN (or OUT, but never both!).',
            },
            {
              title: 'Chapter 3: PHD2 Multi-Star Guiding & Graph Diagnostics',
              subtitle: 'Achieving 0.4" to 0.7" total RMS tracking',
              bullets: [
                'Multi-Star Guiding: PHD2 tracks 10+ stars simultaneously, preventing the mount from chasing localized atmospheric scintillation ("chasing the seeing").',
                'Where to calibrate: Always calibrate near the Celestial Equator and Meridian (DEC = 0° ± 20°) where apparent star motion is fastest.',
                'Graph diagnosis: If the RA trace zig-zags above and below the centerline after pulses, lower RA Aggressiveness from 80% down to 60-65%.',
              ],
              proTip: 'Run the PHD2 Guiding Assistant for 2 minutes to measure high-frequency star motion and automatically set optimal MinMo thresholds.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Critical Focus Zone (CFZ) Physics',
              body: 'The Critical Focus Zone (in microns) is the narrow focal depth where an optical system remains diffraction-limited: CFZ (µm) ≈ 2.68 × (f/D)² in green light. At f/4, your CFZ is only 43 microns wide! At f/7, it expands to 131 microns.',
              highlight: 'At f/4: CFZ = 43 µm | At f/5.5: CFZ = 81 µm | At f/7: CFZ = 131 µm',
            },
            {
              heading: '2. Reading Your PHD2 Graph Like an Expert',
              body: 'Round stars require both low total RMS error (ideally less than half your pixel scale) AND balanced axes (RA RMS ≈ DEC RMS). On harmonic mounts, use 0.5s to 1.0s exposures with 65-75% aggressiveness.',
              highlight: 'Golden Rule: Total RMS < 0.8" AND RA RMS ≈ DEC RMS',
            },
          ] as LessonSection[],
          steps: [
            '1. Calculate your Critical Focus Zone (CFZ) and EAF step size in the simulator above.',
            '2. Enable Overshoot backlash compensation (100-150 steps) and run an initial V-Curve.',
            '3. Slew near the Meridian and Celestial Equator (DEC 0°) and force a fresh PHD2 Calibration (Shift + Click Guide).',
            '4. Enable Multi-Star guiding and set exposure to 0.5s - 1.0s (harmonic mounts) or 1.5s - 2.5s (worm mounts).',
            '5. Confirm Total RMS stays below your pixel scale with equal RA and DEC RMS values.',
          ],
          quiz: [
            {
              question: 'How does the Critical Focus Zone (CFZ) change when switching from f/8 to a fast f/4 telescope?',
              options: [
                'The focus tolerance becomes 4 times narrower and much more demanding',
                'The focus zone becomes 10 times wider',
                'Focal ratio has no effect on focus depth',
              ],
              correct: 0,
              explanation: 'CFZ scales with the square of the focal ratio—f/4 has 4x tighter focus tolerance than f/8.',
            },
            {
              question: 'Where in the sky should you perform PHD2 Guiding calibration?',
              options: [
                'Near the Meridian and Celestial Equator (DEC near 0°)',
                'Directly on Polaris (DEC +90°)',
                'Below the northern horizon',
              ],
              correct: 0,
              explanation: 'Apparent star speed is highest at DEC 0°, giving PHD2 the cleanest orthogonality and rate measurement.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod5-pdf1-en',
              name: 'EAF V-Curve & PHD2 Harmonic Mount Settings Cheat Sheet (PDF)',
              title: 'Field Guide: EAF Autofocus & PHD2 Guiding Diagnostics',
              sections: [
                {
                  title: '1. V-Curve & PHD2 Settings',
                  content: [
                    'EAF: 9 points, Overshoot backlash 150 steps, refocus on 1.5°C drop.',
                    'PHD2 Harmonic: 0.5s - 1.0s exposure, Multi-Star ON, RA Aggr 65-75%, DEC Aggr 75%.',
                  ],
                },
              ],
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
      price: 29,
      badgeFr: 'Traitement d’Art',
      badgeEn: 'Master Processing',
      descFr:
        "De l'empilement brut au chef-d'œuvre (galaxies type NGC 7331 & nébuleuses) : GraXpert AI, SPCC, déconvolution, Starless et GHS.",
      descEn:
        'From raw stack to masterpiece (galaxies like NGC 7331 & nebulae): GraXpert AI, SPCC, deconvolution, Starless, and GHS.',
      image:
        'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module6,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "L'acquisition sur le terrain ne représente que 50 % d'une astrophoto : l'autre moitié se joue devant l'écran ! Que vous traitiez une galaxie spirale complexe (comme NGC 7331 et son groupe Deer Lick) ou une nébuleuse SHO, maîtrisez le workflow moderne Siril & PixInsight.",
          slides: [
            {
              title: 'Chapitre 1 : Prétraitement & Stade Linéaire Pur',
              subtitle: 'Calibration DOF, recadrage, GraXpert AI & SPCC',
              bullets: [
                'Qu’est-ce qu’une image Linéaire ? À la sortie de l’empilement (WBPP dans PixInsight ou Scripts Siril), l’image paraît toute noire car les pixels sont proportionnels au nombre réel de photons reçus.',
                'Ordre strict au stade linéaire : 1) Recadrer les bords d’empilement (Crop) -> 2) Retirer le gradient de pollution lumineuse avec GraXpert AI -> 3) Calibrer les couleurs par spectrophotométrie (SPCC / PCC).',
                'SPCC identifie chaque étoile de votre image via le catalogue spatial Gaia DR3 et ajuste la balance RVB pour restituer les vraies teintes astrophysiques !',
              ],
              proTip: 'Ne lancez JAMAIS le retrait de gradient (GraXpert) avant d’avoir recadré (Croppé) les bords noirs issus du dithering : ces bords fausseraient complètement le modèle de fond de ciel !',
            },
            {
              title: 'Chapitre 2 : Déconvolution & Séparation Étoiles / Objet (Starless)',
              subtitle: 'Traiter la galaxie ou la nébuleuse sans gonfler les étoiles',
              bullets: [
                'Déconvolution linéaire (BlurXTerminator ou Déconvolution Siril) : Corrige mathématiquement l’étalement dû au Seeing atmosphérique pour affiner les bandes de poussière au cœur des galaxies (ex: NGC 7331).',
                'Séparation Starless (StarNet++ v2 ou StarXTerminator) : Sépare votre image en deux calques : le fond "Starless" (la nébuleuse ou galaxie seule) et le calque "Stars" (les étoiles seules).',
                'Avantage décisif : Vous pouvez pousser le contraste et les extensions ultra-faibles de l’objet sans transformer les étoiles en gros ballons blancs saturés !',
              ],
              proTip: 'Faites votre réduction de bruit majeure (NoiseXTerminator ou GraXpert Denoise AI) juste à la fin du stade linéaire, avant d’étirer l’histogramme.',
            },
            {
              title: 'Chapitre 3 : Étirement Hyperbolique (GHS) & Recombinaison',
              subtitle: 'Passer en non-linéaire avec une maîtrise chirurgicale',
              bullets: [
                'Pourquoi oublier l’ancien Histogram Transformation ? L’outil Generalized Hyperbolic Stretch (GHS, disponible dans Siril et PixInsight) vous permet de placer le "Point de Symétrie (SP)" exactement sur les volutes faibles à révéler.',
                'Utilisez le curseur "Highlight Protection (HP)" dans GHS pour empêcher le bulbe brillant d’une galaxie (ou le trapèze d’Orion) de brûler pendant que vous révélez les bras spiraux.',
                'Étirez le calque des étoiles séparément avec un étirement doux (Arcsinh Stretch) pour préserver leurs couleurs dorées et bleutées, puis recombinez en mode PixelMath / Screen !',
              ],
              proTip: 'Effectuez toujours 3 ou 4 petits étirements GHS successifs plutôt qu’un seul étirement brutal : vous garderez un contrôle total sur la montée du fond de ciel.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Étude de Cas : Traiter une Galaxie Spirale (Exemple : NGC 7331)',
              body: "Les galaxies comme NGC 7331 présentent un défi majeur de plage dynamique : un noyau galactique extrêmement brillant entouré de bras spiraux de poussière et de petites galaxies compagnonnes très faibles en arrière-plan. Le secret consiste à : 1) Appliquer une déconvolution douce au stade linéaire pour sculpter les bandes sombres du disque. 2) Calibrer les couleurs via SPCC (référence Spiral Galaxy) pour faire ressortir le cœur jaune/orangé (étoiles anciennes) et les bras bleus (jeunes étoiles massives). 3) Étirer en GHS par étapes en abaissant systématiquement le curseur de protection des hautes lumières (HP).",
              highlight: 'Formule PixelMath de recombinaison sans brûler : ~((~starless) * (~stars))',
            },
            {
              heading: '2. Palette HOO et SHO : Équilibrer les Couleurs des Nébuleuses',
              body: "En imagerie bande étroite SHO (Palette Hubble : SII=Rouge, Ha=Vert, OIII=Bleu), le signal Hydrogène-Alpha est tellement dominant que l'image brute assemblée est entièrement verte ! Utilisez l'outil SCNR (Suppression du Bruit Vert sous Siril ou PixInsight) réglé entre 0,60 et 0,85, puis utilisez des masques de couleur sélectifs pour faire virer le Soufre/Hydrogène vers l'or cuivré et l'Oxygène vers le bleu cyan profond.",
              highlight: 'Ordre d’or : Crop -> GraXpert -> SPCC -> Déconvolution -> Denoise -> Starless -> GHS -> Couleurs -> Recombinaison',
            },
          ] as LessonSection[],
          steps: [
            '1. Empiler les brutes calibrées par les Masters DOF (pondération par FWHM / WFWHM avec rejet Winsorized Sigma Clipping).',
            '2. Stade Linéaire : Recadrer les bords (Crop), retirer le gradient (GraXpert AI) et calibrer les couleurs par astrométrie (SPCC / PCC).',
            '3. Appliquer la déconvolution, réduire le bruit linéaire (Denoise AI) et séparer les étoiles (StarNet++ / StarXTerminator).',
            '4. Stade Non-Linéaire : Étirer la couche Starless par étapes avec GHS (Generalized Hyperbolic Stretch) en protégeant les hautes lumières.',
            '5. Rehausser la saturation sélective, étirer les étoiles séparément (Arcsinh) et recombiner les deux calques.',
          ],
          quiz: [
            {
              question: 'Pourquoi faut-il impérativement recadrer (Crop) les bords d’empilement AVANT de lancer GraXpert ou l’extraction de gradient ?',
              options: [
                'Parce que les bordures sombres ou bruitées créées par le dithering trompent l’algorithme qui génère alors de faux halos lumineux',
                'Pour agrandir la taille des étoiles',
                'Parce que le format FITS refuse d’enregistrer une image non recadrée',
              ],
              correct: 0,
              explanation: 'Les bandes de recouvrement sur les bords ont un rapport signal/bruit très faible qui fausse le calcul mathématique du modèle de gradient.',
            },
            {
              question: 'Quel est l’avantage majeur de l’étirement GHS (Generalized Hyperbolic Stretch) pour traiter une galaxie comme NGC 7331 ou M31 ?',
              options: [
                'Il permet de choisir précisément le point de symétrie d’étirement tout en protégeant le cœur brillant de la galaxie contre la saturation',
                'Il supprime automatiquement les nuages sur la brute',
                'Il transforme une image noir et blanc en couleur sans filtre',
              ],
              correct: 0,
              explanation: 'Grâce au Symmetry Point (SP) et au Highlight Protection (HP), GHS étire les faibles extensions galactiques sans jamais brûler le noyau.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod6-pdf1',
              name: 'Mémento Workflow Complet Siril & PixInsight Étape par Étape (PDF)',
              title: 'Checklist de Traitement Astrophysique : Du Stade Linéaire au Chef-d’Œuvre',
              sections: [
                {
                  title: '1. Phase 1 : Le Stade Linéaire (Interdiction d’étirer l’histogramme)',
                  content: [
                    'Étape 1 — DynamicCrop / Recadrage : Éliminer les bords d’empilement sur 10 à 20 pixels.',
                    'Étape 2 — GraXpert AI Background Extraction : Smoothing 0.1 à 0.3, mode Correction = Subtraction.',
                    'Étape 3 — Résolution Astrométrique + SPCC (Spectrophotometric Color Calibration) avec base Gaia.',
                    'Étape 4 — Déconvolution (BlurXTerminator / Déconvolution Siril PSF) puis Réduction de bruit linéaire.',
                    'Étape 5 — Séparation StarNet++ / StarXTerminator (cocher "Generate Star Image" en mode linéaire).',
                  ],
                },
                {
                  title: '2. Phase 2 : Le Stade Non-Linéaire (GHS & Finitions)',
                  content: [
                    'Étape 6 — Étirement GHS sur le calque Starless : Placer SP dans le pied de l’histogramme, monter D et B progressivement en3 passes.',
                    'Étape 7 — Contraste local (LocalHistogramEqualization / CLAHE doux) et Saturation des couleurs.',
                    'Étape 8 — Étirement des Étoiles (Mode Arcsinh ou GHS Color) avec légère réduction stellaire.',
                    'Étape 9 — Recombinaison PixelMath : ~((~starless) * (~stars)) et export final TIFF 16 bits / PNG.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Data acquisition is only 50% of astrophotography—the other half happens in processing! Whether revealing faint dust lanes in spiral galaxies like NGC 7331 or crafting Hubble Palette nebulae, master the modern Siril & PixInsight workflow.',
          slides: [
            {
              title: 'Chapter 1: Preprocessing & Pure Linear Stage',
              subtitle: 'Calibration, Cropping, GraXpert AI & SPCC Color Calibration',
              bullets: [
                'What is Linear data? Freshly stacked integrations look almost completely black because pixel values remain strictly proportional to photon counts.',
                'Mandatory Linear Order: 1) Crop stacking artifacts -> 2) Remove light pollution gradients with GraXpert AI -> 3) Spectrophotometric Color Calibration (SPCC).',
                'SPCC matches stars against the Gaia DR3 space catalog to calibrate true astrophysical star and galaxy colors.',
              ],
              proTip: 'NEVER run gradient extraction before cropping away dithered stacking borders—dark edge artifacts will corrupt the background model!',
            },
            {
              title: 'Chapter 2: Deconvolution & Starless Separation',
              subtitle: 'Processing galaxies and nebulae independently from stars',
              bullets: [
                'Linear Deconvolution (BlurXTerminator or Siril PSF Deconvolution) reverses atmospheric seeing blur to sharpen galactic dust lanes (like NGC 7331).',
                'Starless Separation (StarNet++ / StarXTerminator) splits your image into a Starless object layer and a Stars-only layer.',
                'This lets you stretch faint outer galaxy halos aggressively without bloating bright foreground stars!',
              ],
              proTip: 'Perform primary AI noise reduction right at the end of the linear stage before stretching.',
            },
            {
              title: 'Chapter 3: Generalized Hyperbolic Stretch (GHS) & Recombination',
              subtitle: 'Surgical dynamic range control',
              bullets: [
                'GHS lets you place the Symmetry Point (SP) directly on the exact brightness level of faint nebula or galaxy structures.',
                'Use Highlight Protection (HP) in GHS to prevent bright galactic cores from clipping while boosting faint spiral arms.',
                'Stretch the star layer separately using Arcsinh Stretch to preserve rich blue and gold star colors, then screen-blend back together!',
              ],
              proTip: 'Apply 3 to 4 gentle iterative GHS passes rather than one aggressive stretch.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Case Study: Processing Spiral Galaxies (e.g., NGC 7331)',
              body: 'Galaxies like NGC 7331 span huge dynamic range from a blazing core to faint outer spiral arms and background companion galaxies. Use linear deconvolution to resolve dust lanes, SPCC for natural golden core / blue spiral arm color balance, and iterative GHS with Highlight Protection.',
              highlight: 'Unclipped PixelMath Screen Blend Formula: ~((~starless) * (~stars))',
            },
            {
              heading: '2. Narrowband HOO & SHO Color Balancing',
              body: 'In Hubble Palette (SHO), Hydrogen-Alpha mapped to Green initially dominates the frame. Apply SCNR (Green removal at 0.65-0.85) and selective color masks to transition Ha/SII toward warm gold and OIII toward deep cyan.',
              highlight: 'Golden Order: Crop -> GraXpert -> SPCC -> Deconv -> Denoise -> Starless -> GHS -> Recombine',
            },
          ] as LessonSection[],
          steps: [
            '1. Calibrate and stack Light frames weighted by FWHM with Winsorized Sigma Clipping.',
            '2. Linear Stage: Crop stacking edges, run GraXpert AI gradient removal, and run SPCC color calibration.',
            '3. Apply deconvolution, linear AI denoise, and extract stars (StarNet++ / StarXTerminator).',
            '4. Non-Linear Stage: Stretch the Starless layer iteratively using GHS while protecting highlights.',
            '5. Enhance color saturation, stretch stars separately with Arcsinh, and recombine via PixelMath.',
          ],
          quiz: [
            {
              question: 'Why must you crop stacking borders BEFORE running GraXpert gradient extraction?',
              options: [
                'Low-signal dithered borders fool the background model and create artificial vignetting',
                'To make stars larger',
                'FITS files cannot save uncropped images',
              ],
              correct: 0,
              explanation: 'Stacking overlap edges distort polynomial and AI background gradient models.',
            },
            {
              question: 'What is the main advantage of Generalized Hyperbolic Stretch (GHS) on galaxies like NGC 7331?',
              options: [
                'It stretches faint spiral arms around a targeted Symmetry Point while protecting the bright galaxy core from clipping',
                'It removes clouds from raw frames',
                'It cools the camera sensor',
              ],
              correct: 0,
              explanation: 'GHS Symmetry Point and Highlight Protection give unmatched control over extreme dynamic range.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod6-pdf1-en',
              name: 'Complete Siril & PixInsight Step-by-Step Workflow (PDF)',
              title: 'Astrophysical Processing Checklist: Linear to Masterpiece',
              sections: [
                {
                  title: '1. Complete 9-Step Workflow',
                  content: [
                    'Linear: 1. Crop -> 2. GraXpert AI -> 3. SPCC -> 4. Deconvolution -> 5. Linear Denoise & Starless.',
                    'Non-Linear: 6. Iterative GHS -> 7. Selective Saturation -> 8. Arcsinh Star Stretch -> 9. PixelMath Recombine.',
                  ],
                },
              ],
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
      price: 29,
      badgeFr: 'Bonus Exclusif',
      badgeEn: 'Exclusive Bonus',
      descFr:
        'Voyager léger sous les ciels Bortle 1 : traqueurs nomades, règle NPF, Samyang 135mm f/2 et arches de la Voie Lactée.',
      descEn:
        'Travel light under Bortle 1 skies: portable star trackers, NPF rule, Samyang 135mm f/2, and Milky Way arches.',
      image:
        'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.bonus,
      calculatorType: 'none' as const,
      content: {
        fr: {
          intro:
            "Rien ne remplace l'émotion d'une nuit sous un ciel pur de montagne ou de réserve de ciel étoilé (Bortle 1-2). Découvrez comment concevoir un setup ultra-compact tenant dans un sac à dos cabine d'avion pour capturer des arches de la Voie Lactée et de grands champs nébulaires.",
          slides: [
            {
              title: 'Chapitre 1 : Objectifs Rapides, Coma & Règle NPF',
              subtitle: 'Choisir et régler ses optiques grand champ (14mm à 135mm)',
              bullets: [
                'L’erreur classique à pleine ouverture (f/1.4 ou f/1.8) : Dans les coins, les étoiles ressemblent à de petites mouettes ou papillons (Coma sagittale). Fermez toujours votre diaphragme d’un cran (ex: f/2.2 ou f/2.8) pour retrouver des étoiles piquées d’un bord à l’autre !',
                'La Règle NPF (remplaçante moderne de la règle des 500) : Sur simple trépied fixe sans moteur, le temps de pose maximal avant que les étoiles ne filent tient compte de l’ouverture, de la focale ET de la taille des pixels (souvent 8s à 15s à 14-20mm).',
                'La légende du Samyang / Rokinon 135mm f/2 ED : Associé à une petite caméra refroidie ou un boîtier défiltré sur mini-monture, ce téléobjectif capture la boucle de Barnard ou les nébuleuses du Cygne en une seule nuit !',
              ],
              proTip: 'Bloquez toujours la bague de mise au point de votre objectif photo avec un morceau de ruban adhésif (Gaffer / Kapton) une fois la netteté faite au masque de Bahtinov !',
            },
            {
              title: 'Chapitre 2 : Fusion Paysage (Heure Bleue) & Ciel Suivi',
              subtitle: 'Le secret des photos de Voie Lactée nettes du premier plan jusqu’au zénith',
              bullets: [
                'Le dilemme physique : Si votre monture suit les étoiles pendant 120 secondes, les montagnes et les arbres du premier plan deviennent flous !',
                'La méthode Pro en 2 étapes sans bouger le trépied : 1) À la fin de l’heure bleue (crépuscule tardif), monture ÉTEINTE, faites une pose longue (ex: 30s à ISO 800, f/4) mise au point sur le paysage terrestre.',
                '2) Une fois la nuit noire tombée, refaites la mise au point sur les étoiles, ALLUMEZ le suivi sidéral et empilez 15 poses de 90s à 120s sur la Voie Lactée, puis fusionnez les deux calques.',
              ],
              proTip: 'Capturer le paysage au crépuscule tardif (plutôt qu’en pleine nuit noire) offre des détails naturels dans les rochers et les arbres avec zéro bruit numérique !',
            },
            {
              title: 'Chapitre 3 : Réglementation Aérienne IATA & Batteries Nomades',
              subtitle: 'Passer la sécurité de l’aéroport avec son matériel d’astrophoto',
              bullets: [
                'Règle stricte IATA des compagnies aériennes : Toutes les batteries au Lithium (Li-ion / LiFePO4) doivent voyager EN CABINE (interdites en soute) et ne doivent pas dépasser 100 Wh par batterie (160 Wh max avec accord préalable).',
                'Astuce d’alimentation : Au lieu d’une grosse batterie de 300 Wh interdite en avion, emportez 2 ou 3 batteries USB-C Power Delivery (PD 65W) de 99 Wh chacune avec un câble déclencheur USB-C vers 12V (Trigger Cable) !',
                'Protégez toujours vos optiques et caméras en bagage cabine, et mettez uniquement le trépied et les contrepoids/rotules métalliques en bagage de soute.',
              ],
              proTip: 'En climat humide ou froid, alimentez une petite bande chauffante (Dew Heater) en 5V USB autour de la lentille frontale de votre objectif dès le début de la nuit pour éviter toute buée.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. La Formule Complète de la Règle NPF (Trépied Statique)',
              body: "L'ancienne règle des '500 divisé par la focale' date de l'époque de la pellicule argentique et donne des étoiles allongées sur les capteurs modernes haute définition ! La formule NPF officielle calcule le temps maximal en secondes (t) avant l'apparition d'un filé d'étoiles : t = (35 × N + 30 × P) ÷ F, où N est le rapport d'ouverture (f/D), P est la taille d'un pixel en microns (µm), et F est la longueur focale en millimètres.",
              highlight: 'Exemple NPF (20 mm à f/2.0 sur capteur 3.76 µm) : t = (35×2 + 30×3.76) ÷ 20 = 9,1 secondes max',
            },
            {
              heading: '2. Panoramas d’Arche de la Voie Lactée (Mosaïque Multi-Panneaux)',
              body: "Pour photographier l'arche complète de la Voie Lactée du Nord au Sud, installez votre boîtier en orientation verticale (Portrait) sur une base panoramique graduée mise strictement de niveau. Réalisez 6 à 8 panneaux verticaux pour le ciel (avec 30 % à 40 % de recouvrement entre chaque cliché) puis 6 à 8 panneaux pour le sol, avant de les assembler sans couture dans PTGui, Microsoft ICE ou Lightroom/Photoshop.",
              highlight: 'Règle d’or Panorama : Appareil en mode Portrait + Recouvrement de 35 % + Balance des blancs fixe (4000K)',
            },
          ] as LessonSection[],
          steps: [
            '1. Repérer le site Bortle 1-2 et l’orientation exacte du bulbe galactique avec Stellarium ou PhotoPills.',
            '2. Installer le trépied avant la tombée de la nuit et capturer le calque de premier plan terrestre à la fin de l’heure bleue (suivi éteint).',
            '3. Faire la mise au point fine sur une étoile brillante au masque de Bahtinov, fermer l’objectif d’un demi-cran (ex: f/2.2) et scotcher la bague.',
            '4. Activer le suivi sidéral, installer la bande chauffante anti-buée et lancer une série de 15 à 30 poses de 90 s à 120 s.',
            '5. Empiler les poses du ciel sous Sequator ou Siril, puis fusionner avec le calque de premier plan.',
          ],
          quiz: [
            {
              question: 'Quelle est la limite maximale en Watt-heures (Wh) par batterie Lithium autorisée sans déclaration spéciale en bagage cabine d’avion (norme IATA) ?',
              options: [
                '100 Wh maximum par batterie (transport obligatoire en cabine)',
                '1000 Wh en soute',
                'Aucune batterie n’est autorisée en avion',
              ],
              correct: 0,
              explanation: 'La norme aérienne internationale fixe la limite libre à 100 Wh par batterie Li-ion en cabine (ex: emporter plusieurs batteries de 96 Wh ou 99 Wh).',
            },
            {
              question: 'Pourquoi ferme-t-on souvent d’un cran le diaphragme d’un objectif photo très lumineux (ex: passer de f/1.4 à f/2.0 ou f/2.2) en astrophotographie ?',
              options: [
                'Pour éliminer la coma sagittale (étoiles en forme d’oiseaux dans les coins) et réduire le vignettage',
                'Pour réchauffer le capteur',
                'Pour doubler la focale de l’objectif',
              ],
              correct: 0,
              explanation: 'Fermer légèrement le diaphragme masque les rayons marginaux de la lentille frontale, ce qui supprime drastiquement la coma et l’aberration chromatique.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod7-pdf1',
              name: 'Checklist Bagage Cabine IATA, Règle NPF & Astrovoyage (PDF)',
              title: 'Checklist Officielle : Expédition Astrophotographie Nomade & Grand Champ',
              sections: [
                {
                  title: '1. Répartition Bagage Cabine vs Bagage Soute (Avion)',
                  content: [
                    'En Cabine (Sac à dos photo) : Caméras, boîtiers, objectifs (14mm, 35mm, 135mm), tête de monture légère, mini-PC/ASIAIR, et TOUTES les batteries Li-ion (< 100 Wh chacune).',
                    'En Soute (Valise rigide) : Trépied carbone, rotules, barres de contrepoids, outils (clés Allen, tournevis) et sangles de lestage vides.',
                  ],
                },
                {
                  title: '2. Kit de Survie Terrain sous Ciel Bortle 1',
                  content: [
                    'Bande chauffante USB 5V + élastiques (indispensable contre la rosée nocturne).',
                    'Ruban adhésif Kapton / Gaffer pour verrouiller la bague de mise au point.',
                    'Lampe frontale à éclairage rouge direct et intervallomètre de secours.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Nothing beats a night under pristine Bortle 1-2 mountain skies. Learn how to pack an airline-compliant carry-on astro rig to capture sweeping Milky Way arches and widefield nebulae.',
          slides: [
            {
              title: 'Chapter 1: Fast Lenses, Coma & The NPF Rule',
              subtitle: 'Mastering widefield optics from 14mm to 135mm',
              bullets: [
                'Stopping down fast glass: Shooting wide open at f/1.4 often causes "seagull-wing" sagittal coma in the corners. Stopping down to f/2.0 or f/2.2 produces tack-sharp stars across the frame!',
                'The NPF Rule (modern replacement for the 500 rule): Calculates exact untracked exposure limits based on aperture, focal length, AND pixel size.',
                'The legendary Samyang / Rokinon 135mm f/2 ED: Paired with a cooled camera on a small tracker, it captures vast emission complexes in a single night.',
              ],
              proTip: 'Once focused with a Bahtinov mask, tape down the lens focus ring with Kapton or gaffer tape so it never creeps overnight!',
            },
            {
              title: 'Chapter 2: Blue Hour Foreground + Tracked Sky Blending',
              subtitle: 'Sharp landscapes and pinpoint Milky Way cores',
              bullets: [
                'Tracking the sky blurs the ground: instead, shoot your landscape foreground during late Blue Hour (twilight) with the tracker OFF at low ISO.',
                'Once astronomical darkness falls, refocus on the stars, turn the tracker ON, and stack 15-20 long exposures of the Milky Way.',
                'Blend both layers cleanly in post-processing for noise-free shadows and deep nebulosity.',
              ],
              proTip: 'Shooting foregrounds during late twilight yields natural rock and tree detail without noisy long-exposure dark current.',
            },
            {
              title: 'Chapter 3: Airline IATA Rules & Portable Power',
              subtitle: 'Flying safely with astrophotography gear',
              bullets: [
                'Strict IATA Rule: Lithium batteries MUST travel in carry-on luggage (never checked bags) and must be under 100Wh per battery.',
                'Power tip: Instead of one heavy 300Wh power station, pack two or three 99Wh USB-C PD (65W) power banks with 12V USB-C PD trigger cables!',
                'Always pack cameras, lenses, and mount heads in carry-on; place tripods and metal counterweights/tools in checked luggage.',
              ],
              proTip: 'Wrap a 5V USB dew heater strip around your front lens element before starting your sequence.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. The Complete NPF Rule Formula (Static Tripod)',
              body: 'The legacy 500-rule produces star trails on modern high-resolution sensors. Use the NPF formula for untracked exposures in seconds: t = (35 × N + 30 × P) ÷ F, where N is f-number, P is pixel pitch in µm, and F is focal length in mm.',
              highlight: 'NPF Example (20mm at f/2.0 on 3.76µm sensor): t = (35×2 + 30×3.76) ÷ 20 = 9.1 seconds max',
            },
            {
              heading: '2. Multi-Panel Milky Way Arch Panoramas',
              body: 'Mount the camera vertically (portrait orientation) on a leveled panoramic panning base. Shoot 6 to 8 overlapping panels (35% overlap) with fixed White Balance (4000K) and stitch in PTGui or Lightroom.',
              highlight: 'Panorama Golden Rule: Portrait orientation + 35% overlap + Fixed 4000K White Balance',
            },
          ] as LessonSection[],
          steps: [
            '1. Scout Bortle 1-2 dark sites and Milky Way core timing using Stellarium or PhotoPills.',
            '2. Level the tripod before sunset and shoot the static foreground frame during late Blue Hour.',
            '3. Focus on a bright star with a Bahtinov mask, stop down 1/2 to 1 stop (e.g., f/2.2), and tape the focus ring.',
            '4. Engage sidereal tracking, attach the USB dew heater, and shoot 15 to 30 sky exposures.',
            '5. Stack sky frames in Sequator or Siril and blend with the twilight foreground.',
          ],
          quiz: [
            {
              question: 'What is the maximum Watt-hour (Wh) rating per Lithium battery allowed in airline carry-on bags without special airline approval?',
              options: [
                '100 Wh maximum per battery (carry-on only)',
                '1000 Wh in checked luggage',
                'Batteries are prohibited on airplanes',
              ],
              correct: 0,
              explanation: 'IATA regulations allow lithium batteries up to 100Wh each in carry-on cabin luggage.',
            },
            {
              question: 'Why stop down a fast camera lens by 1 stop (e.g., f/1.4 to f/2.2) for astrophotography?',
              options: [
                'To eliminate corner sagittal coma and reduce vignetting',
                'To warm up the sensor',
                'To double focal length',
              ],
              correct: 0,
              explanation: 'Stopping down blocks marginal rays that cause corner coma and chromatic aberration.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod7-pdf1-en',
              name: 'Carry-On IATA Astro Travel & NPF Rule Checklist (PDF)',
              title: 'Official Expedition Checklist: Portable Widefield Astrophotography',
              sections: [
                {
                  title: '1. Carry-On vs. Checked Luggage',
                  content: [
                    'Carry-On: Cameras, lenses, mount head, mini-PC/ASIAIR, and ALL Lithium batteries (<100Wh each).',
                    'Checked Bag: Carbon tripod, counterweight bars, hex keys, and empty weight bags.',
                  ],
                },
              ],
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

  const openModuleDetail = (id: number) => {
    setSelectedModuleId(id);
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

  // Calculateur Optique Module 1 (Échantillonnage)
  const safeFocal = calcFocal > 0 ? calcFocal : 1;
  const pixelScaleResult = ((206.265 * calcPixel) / safeFocal).toFixed(2);
  let calcVerdict = currentT.calcVerdictGreat;
  const scaleNum = parseFloat(pixelScaleResult);
  if (scaleNum < 0.8) calcVerdict = currentT.calcVerdictOver;
  else if (scaleNum > 2.0) calcVerdict = currentT.calcVerdictUnder;

  // Calculateur EAF Module 5 (Zone Critique CFZ & Step Size)
  const safeFD = calcFokusFD > 0 ? calcFokusFD : 1;
  const safeMicronStep = calcMicronStep > 0 ? calcMicronStep : 1;
  const cfzMicrons = Math.round(2.68 * safeFD * safeFD);
  const recommendedSteps = Math.max(5, Math.round((cfzMicrons * 1.6) / safeMicronStep));

  // Calcul du score Quiz du module actif
  const activeQuizList = currentModule ? currentModule.content[lang].quiz : [];
  const correctQuizCount = activeQuizList.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correct ? acc + 1 : acc;
  }, 0);

  return (
    <div
      className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 ${
        nightVision
          ? 'bg-[#120101] text-rose-200 selection:bg-rose-600 selection:text-white'
          : 'bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
      }`}
    >
      {/* EN-TÊTE ULTRA DESIGN AVEC MODE NUIT & GLASSMORPHISM */}
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
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg transition group-hover:scale-105 ${
                  nightVision
                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                    : 'bg-gradient-to-tr from-indigo-600 via-cyan-500 to-indigo-400 text-white shadow-indigo-500/20'
                }`}
              >
                🪐
              </div>
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
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
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
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 font-bold text-xs shadow-lg text-white"
              >
                {currentT.packBtnShort}
              </button>
            </div>
          </div>

          <nav className="flex items-center justify-center space-x-8 text-sm border-t border-slate-800/60 pt-2.5 md:border-t-0 md:pt-0 font-medium">
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

          <div className="hidden md:flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setNightVision(!nightVision)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
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
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 font-bold text-xs shadow-lg hover:opacity-95 transition text-white"
            >
              {currentT.packBtnShort}
            </button>
          </div>
        </div>

        {/* BANDEAU ACCÈS RAPIDE AUX COURS DÉVERROUILLÉS */}
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
                    onClick={() => openModuleDetail(m.id)}
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
              {completedModules.length > 0 && (
                <button
                  type="button"
                  onClick={generateCertificate}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition flex items-center gap-1 ml-2"
                >
                  🏆 {lang === 'fr' ? 'Certificat' : 'Certificate'}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-10 flex-grow w-full">
        {activeTab === 'home' && (
          <div className="space-y-16">
            {/* HERO SECTION */}
            <div
              className={`text-center py-16 px-4 md:px-12 rounded-3xl border space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-sm ${
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

              <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenLink(paymentLinks.packIntegral.stripe)
                  }
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition shadow-xl ${
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

            {/* CATALOGUE DES MODULES */}
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
                    {lang === 'fr' ? 'Programme Complet' : 'Full Curriculum'}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black mt-1">
                    {lang === 'fr'
                      ? 'Les 7 Modules d’Expertise'
                      : 'The 7 Expert Modules'}
                  </h3>
                </div>
                <p
                  className={`text-xs max-w-md ${
                    nightVision ? 'text-rose-300' : 'text-slate-400'
                  }`}
                >
                  {lang === 'fr'
                    ? 'Chaque module inclut des diaporamas interactifs, des cours théoriques détaillés, des quiz de validation et des guides PDF A4 imprimables.'
                    : 'Every module includes interactive slides, deep theoretical lessons, validation quizzes, and printable A4 PDF field guides.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((mod) => {
                  const unlocked = isModuleUnlocked(mod.id);
                  const isDone = completedModules.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => {
                        if (unlocked) openModuleDetail(mod.id);
                      }}
                      className={`group border rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-md ${
                        nightVision
                          ? 'bg-rose-950/20 border-rose-900/60'
                          : 'bg-slate-900/70 border-slate-800/80'
                      } ${
                        unlocked
                          ? 'hover:border-current cursor-pointer hover:-translate-y-1'
                          : 'hover:-translate-y-1'
                      }`}
                    >
                      <div>
                        <div className="h-52 overflow-hidden relative">
                          <img
                            src={mod.image}
                            alt={lang === 'fr' ? mod.titleFr : mod.titleEn}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                          <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 shadow">
                            {lang === 'fr' ? mod.badgeFr : mod.badgeEn}
                          </span>

                          <span className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-indigo-600/90 backdrop-blur-md font-black text-sm shadow-lg text-white">
                            {mod.price}$ CAD
                          </span>

                          {isDone && (
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg">
                              ✓ {lang === 'fr' ? 'Terminé' : 'Completed'}
                            </span>
                          )}
                          {!isDone && unlocked && (
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-lg">
                              {currentT.unlockedBadge.split(' ')[0]} {lang === 'fr' ? 'Débloqué' : 'Unlocked'}
                            </span>
                          )}
                          {!unlocked && (
                            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 text-[11px] font-semibold text-slate-300 border border-white/10">
                              {currentT.lockedBadge}
                            </span>
                          )}
                        </div>

                        <div className="p-6 space-y-3">
                          <h4 className="font-bold text-lg leading-snug">
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

                      <div className="p-6 pt-0 flex flex-col gap-3">
                        {unlocked ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModuleDetail(mod.id);
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION TÉMOIGNAGES */}
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

            {/* SECTION FAQ ACCORDÉON */}
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

        {/* VUE DÉTAILLÉE D'UN MODULE */}
        {activeTab === 'module-detail' && currentModule && (
          <div
            className={`max-w-4xl mx-auto space-y-12 border rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-md ${
              nightVision
                ? 'bg-rose-950/20 border-rose-900'
                : 'bg-slate-900/90 border-slate-800/80'
            }`}
          >
            {/* BANNIÈRE DE CONFIRMATION D'ACHAT INDIVIDUEL + CODE DE SAUVEGARDE */}
            {justPurchasedModule && (
              <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div>
                  <span>{currentT.paymentConfirmedModule}</span>
                  <span className="font-mono font-black text-white bg-black/50 px-3 py-1 rounded-lg border border-emerald-400/40 ml-1">
                    {currentModule.backupCode}
                  </span>
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                  🔑 Code : <strong>{currentModule.backupCode}</strong>
                </span>
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

            {/* 1. STUDIO DIAPORAMA INTERACTIF + PRO TIP */}
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
                    {
                      currentModule.content[lang].slides[currentSlideIndex]
                        .title
                    }
                  </h4>
                  <p
                    className={`text-xs md:text-sm font-semibold ${
                      nightVision ? 'text-rose-400' : 'text-cyan-400'
                    }`}
                  >
                    {
                      currentModule.content[lang].slides[currentSlideIndex]
                        .subtitle
                    }
                  </p>
                </div>

                <ul className="space-y-3">
                  {currentModule.content[lang].slides[
                    currentSlideIndex
                  ].bullets.map((b, i) => (
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

                {/* ENCADRÉ ASTUCE D'EXPERT (PRO TIP) */}
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
                    {currentT.nextSlide}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. SIMULATEUR OPTIQUE MODULE 1 (ÉCHANTILLONNAGE) */}
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

            {/* 2B. SIMULATEUR EAF MODULE 5 (ZONE CRITIQUE CFZ) */}
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

            {/* 3. COURS THÉORIQUE APPROFONDI & ÉTUDES DE CAS */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>📚</span> {currentT.fullCourseTitle}
              </h3>
              <div className="space-y-4">
                {currentModule.content[lang].courseSections.map((sec, idx) => (
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
                ))}
              </div>
            </div>

            {/* 4. CHECKLIST TERRAIN & PROTOCOLE OPÉRATIONNEL */}
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

            {/* 5. QUIZ INTERACTIF D'AUTO-ÉVALUATION */}
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
                      <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs leading-relaxed">
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

            {/* 6. GÉNÉRATEUR DE FICHES PDF A4 */}
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
          </div>
        )}

        {/* PAGE DE CONFIRMATION PACK INTÉGRAL + CERTIFICAT PERSONNALISÉ */}
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

            {/* CODE DE SAUVEGARDE PACK INTÉGRAL */}
            <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 space-y-2">
              <p className="text-xs text-slate-300 font-semibold">
                {currentT.backupCodeNotice}
              </p>
              <div className="text-xl font-mono font-black text-cyan-400 tracking-widest">
                PACK-COMPLET-2026
              </div>
            </div>

            {/* PERSONNALISATION DU NOM SUR LE CERTIFICAT */}
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

        {/* PAGE PACK INTÉGRAL */}
        {activeTab === 'pack' && (
          <div className="max-w-xl mx-auto bg-slate-900 border border-amber-500/40 rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl">
            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest">
              7 Modules + 2 Simulateurs + PDF
            </span>
            <h2 className="text-3xl font-black text-white">
              {currentT.packTitle}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentT.packDesc}
            </p>
            <div className="space-y-1">
              <div className="text-sm text-slate-400 line-through">
                203,00 $ CAD
              </div>
              <div className="text-4xl md:text-5xl font-black text-cyan-400">
                79,00 $ CAD
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleOpenLink(paymentLinks.packIntegral.stripe)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-600 font-extrabold text-slate-950 text-sm shadow-lg hover:opacity-95 transition"
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

        {/* PAGE ACCÈS MEMBRE / CODE VIP */}
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

            {/* SECTION CERTIFICAT DANS L'ESPACE MEMBRE */}
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

      {/* PIED DE PAGE */}
      <footer
        className={`border-t py-10 mt-20 text-xs ${
          nightVision
            ? 'border-rose-900 bg-[#120101] text-rose-300'
            : 'border-slate-800/80 bg-[#010308] text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <span className="text-base">🪐</span>
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

      {/* MODALE LÉGALE COMPLÈTE */}
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
