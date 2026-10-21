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

  // Calculateur interactif (Module 1)
  const [calcFocal, setCalcFocal] = useState<number>(500);
  const [calcPixel, setCalcPixel] = useState<number>(3.76);

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

  // GÉNÉRATEUR DE CERTIFICAT OFFICIEL
  const generateCertificate = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>Certificat de Maîtrise - Astroberb Academy</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: 'Segoe UI', Roboto, sans-serif; background: #030712; color: #f8fafc; padding: 40px; text-align: center; border: 8px solid #06b6d4; height: 100%; box-sizing: border-box; }
          .container { border: 2px solid #6366f1; padding: 40px; background: #0f172a; border-radius: 12px; }
          h1 { font-size: 36px; color: #38bdf8; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
          .sub { font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 30px; }
          .name { font-size: 32px; font-weight: bold; color: #ffffff; border-bottom: 2px solid #06b6d4; display: inline-block; padding-bottom: 5px; margin: 20px 0; }
          p { font-size: 16px; color: #cbd5e1; max-width: 700px; margin: 0 auto 30px auto; line-height: 1.6; }
          .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 40px; border-top: 1px solid #334155; padding-top: 20px; font-size: 12px; color: #94a3b8; }
          .signature { font-family: cursive; font-size: 22px; color: #38bdf8; }
          .no-print { background: #1e293b; color: white; padding: 10px 20px; border-radius: 8px; margin-bottom: 20px; border: none; font-weight: bold; cursor: pointer; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <button class="no-print" onclick="window.print()">🖨️ Imprimer ou Enregistrer le Certificat PDF</button>
        <div class="container">
          <div style="font-size: 40px; margin-bottom: 10px;">🪐</div>
          <h1>Astroberb Academy</h1>
          <div class="sub">Certificat Officiel de Maîtrise en Astrophotographie</div>
          <p>Ce document certifie que l'élève passionné a complété avec succès le cursus avancé de la masterclass d'élite, comprenant l'optique, le traitement des données et l'automatisation des nuits d'observation.</p>
          <div class="name">Élève d'Élite Astroberb</div>
          <div class="footer">
            <div>Délivré le : ${new Date().toLocaleDateString(
              lang === 'fr' ? 'fr-FR' : 'en-US'
            )}</div>
            <div>Support : ${SUPPORT_EMAIL}</div>
            <div><span class="signature">David Bérubé</span><br/>Fondateur & Formateur</div>
          </div>
        </div>
      </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=1000,height=700');
    if (win) {
      win.document.open();
      win.document.write(htmlContent);
      win.document.close();
    }
  };

  // GÉNÉRATEUR DE PDF ROBUSTE
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
          @page { size: A4; margin: 18mm; }
          body { font-family: 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; padding: 20px; background: white; }
          .header { border-bottom: 3px solid #6366f1; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 22px; font-weight: 900; color: #312e81; }
          .sub { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
          h1 { font-size: 24px; color: #0f172a; margin-bottom: 8px; }
          .mod-tag { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-bottom: 20px; }
          .section { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; page-break-inside: avoid; }
          .section h2 { font-size: 16px; color: #1e293b; margin-top: 0; margin-bottom: 8px; }
          ul { margin: 0; padding-left: 18px; }
          li { margin-bottom: 6px; font-size: 13.5px; color: #334155; }
          .footer { margin-top: 35px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 11px; color: #64748b; text-align: center; }
          .no-print { background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .btn-print { background: #06b6d4; color: #0f172a; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span>📄 <strong>Document prêt</strong> — Cliquez pour enregistrer en PDF ou imprimer.</span>
          <button class="btn-print" onclick="window.print()">🖨️ Enregistrer en PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="brand">🪐 ASTROBERB ACADEMY</div>
            <div class="sub">Documentation Technique Officielle</div>
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
        'Formations expertes de A à Z : formules optiques, montures harmoniques (Juwei-17, UMi-17S, AM5), automatisation N.I.N.A./ASIAIR et traitement PixInsight & Siril.',
      trustBadge: '⭐ Noté 4.9/5 par plus de 320 passionnés d’astronomie',
      catalog: 'Catalogue des Cours',
      vipSection: 'Accès Membre / Code',
      unlockBtn: 'Activer mon code',
      buyStripe: 'Carte bancaire',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Obtenir le Pack Intégral (199$ CAD)',
      packBtnShort: '🔥 Pack Intégral',
      accessGranted: 'Code validé avec succès ! Cliquez sur votre formation :',
      invalidCode:
        "Code d'accès invalide. Vérifiez votre courriel ou contactez le support.",
      accessCourse: '🚀 ACCÉDER À LA MASTERCLASS',
      lockedBadge: '🔒 Module verrouillé',
      unlockedBadge: '🔓 Déverrouillé (Cliquer pour lancer)',
      backToCatalog: '← Retour au catalogue des formations',
      paymentConfirmedModule:
        'Paiement confirmé ! Votre code de sauvegarde multi-appareils : ',
      interactiveModule: 'Studio Pédagogique & Masterclass',
      studioHeader: 'Diaporama Interactif & Conseils d’Experts',
      fullCourseTitle: 'Cours Théorique & Études de Cas Détaillées',
      tutorialSteps: 'Synthèse & Checklists Terrain',
      resourcesPdf: 'Fiches Techniques PDF (Générateur Intégré A4)',
      generatePdfBtn: 'Générer & Télécharger le PDF',
      successBadge: 'Paiement Validé avec Succès',
      successTitle: 'Bienvenue dans l’élite de l’Astroberb Academy !',
      successDesc:
        'Votre accès total est débloqué. Profitez de l’ensemble des 7 modules, des outils interactifs et des guides PDF.',
      backupCodeNotice: 'CONSEIL : Conservez bien votre code multi-appareils :',
      packTitle: 'L’Offre Ultime : Le Pack Intégral 7-en-1',
      packDesc:
        'Obtenez un accès immédiat, illimité et à vie à l’ensemble de nos 7 masterclasses avancées, simulateurs optiques et guides PDF (Valeur totale : 563$ CAD). Économisez 364$ !',
      payCardStripe: '💳 Payer par Carte Sécurisée (Stripe)',
      payWithPaypal: '🅿️ Payer instantanément avec PayPal',
      vipDesc:
        'Entrez votre code personnel reçu après votre achat pour débloquer instantanément vos formations :',
      vipPlaceholder: 'Votre code (ex: ASTRO-XXXX)',
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
      proTipLabel: '💡 Astuce d’expert Astroberb :',
      quickAccessTitle: '⚡ Accès direct à vos formations déverrouillées :',
      calcTitle:
        '🧮 Simulateur Interactif : Calculateur d’Échantillonnage Optique',
      calcFocalLabel: 'Focale du télescope (mm) :',
      calcPixelLabel: 'Taille des pixels de la caméra (µm) :',
      calcResult: 'Votre Échantillonnage : ',
      calcVerdictGreat:
        '✨ Parfait ! Vos pixels sont idéalement accordés au seeing standard.',
      calcVerdictOver:
        '⚠️ Attention : Sur-échantillonnage (Risque d’image molle sans gain de détails).',
      calcVerdictUnder:
        '⚠️ Attention : Sous-échantillonnage (Étoiles grumeleuses ou pixélisées).',
      quizTitle: '📝 Quiz d’Auto-Évaluation des Acquis',
      quizSubmit: 'Valider mes réponses',
      quizScore: 'Votre Score final : ',
      quizRetry: 'Recommencer le quiz',
      correctAnswer: 'Excellente réponse !',
      wrongAnswer: 'Incorrect.',
      markComplete: '✓ Marquer comme terminé',
      markIncomplete: '↺ Reprendre la formation',
      certTitle: '🏆 Obtenir mon Certificat Officiel',
      certDesc:
        'Terminez vos modules et téléchargez votre certificat personnalisé de réussite.',
      faqTitle: '❓ Foire Aux Questions (FAQ)',
      faq1Q: "Comment reçois-je mes accès après l'achat ?",
      faq1A:
        "L'accès est instantané ! Vous recevez un code de déverrouillage personnel et la plateforme débloque immédiatement vos modules.",
      faq2Q: 'Puis-je suivre les cours sur tablette ou mobile ?',
      faq2A:
        'Oui, la plateforme est 100 % responsive et s’adapte à tous vos écrans, sur le terrain comme à la maison.',
      faq3Q: 'Le contenu est-il mis à jour pour les nouvelles technologies ?',
      faq3A:
        'Absolument. Votre achat inclut les mises à jour à vie pour suivre l’évolution des montures harmoniques et des logiciels de traitement.',
      testimonialsTitle: '⭐ Ce que disent nos étudiants passionnés',
      t1: '“Grâce au module sur les montures harmoniques et N.I.N.A., mes nuits d’imagerie se déroulent désormais 100% en automatique pendant que je dors !”',
      t1Author: 'Marc D., Astrophotographe amateur (Québec)',
      t2: '“Le calculateur d’échantillonnage et les fiches PDF m’ont évité de commettre une grosse erreur de choix optique. Une masterclass indispensable.”',
      t2Author: 'Stéphane L., Passionné de ciel profond',
    },
    en: {
      title: 'Astroberb Academy',
      subtitle: 'Master Deep Sky Astrophotography',
      heroBadge: '✨ Elite Masterclass • 2026 Edition',
      heroDesc:
        'Complete expert training from A to Z: optical formulas, strainwave mounts (Juwei-17, UMi-17S, AM5), N.I.N.A./ASIAIR automation, and PixInsight & Siril processing.',
      trustBadge: '⭐ Rated 4.9/5 by over 320 astronomy enthusiasts',
      catalog: 'Course Catalog',
      vipSection: 'Member Access / Code',
      unlockBtn: 'Activate Code',
      buyStripe: 'Credit Card',
      buyPayPal: 'PayPal',
      buyPackFull: '🔥 Get Full Bundle ($199 CAD)',
      packBtnShort: '🔥 Full Bundle',
      accessGranted: 'Code successfully validated! Click any course below:',
      invalidCode:
        'Invalid access code. Please check your email or contact support.',
      accessCourse: '🚀 START MASTERCLASS',
      lockedBadge: '🔒 Locked Module',
      unlockedBadge: '🔓 Unlocked (Click to launch)',
      backToCatalog: '← Back to course catalog',
      paymentConfirmedModule:
        'Payment confirmed! Your multi-device backup code: ',
      interactiveModule: 'Pedagogical Studio & Masterclass',
      studioHeader: 'Interactive Slides & Expert Tips',
      fullCourseTitle: 'Theoretical Course & Detailed Case Studies',
      tutorialSteps: 'Key Takeaways & Field Checklists',
      resourcesPdf: 'PDF Technical Sheets (A4 Built-in Generator)',
      generatePdfBtn: 'Generate & Download PDF',
      successBadge: 'Payment Successful',
      successTitle: 'Welcome to the Elite Astroberb Academy!',
      successDesc:
        'Your full access is unlocked. Enjoy all 7 modules, interactive tools, and PDF guides.',
      backupCodeNotice: 'IMPORTANT: Save your multi-device code:',
      packTitle: 'The Ultimate Offer: 7-in-1 Full Bundle',
      packDesc:
        'Get immediate, lifetime access to all 7 advanced masterclasses, optical simulators, and PDF guides ($563 CAD value). Save $364!',
      payCardStripe: '💳 Secure Credit Card (Stripe)',
      payWithPaypal: '🅿️ Pay instantly with PayPal',
      vipDesc:
        'Enter the personal access code received after your purchase to instantly unlock your courses:',
      vipPlaceholder: 'Your code (e.g., ASTRO-XXXX)',
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
      calcTitle: '🧮 Interactive Simulator: Optical Pixel Scale Calculator',
      calcFocalLabel: 'Telescope Focal Length (mm):',
      calcPixelLabel: 'Camera Pixel Size (µm):',
      calcResult: 'Your Pixel Scale: ',
      calcVerdictGreat:
        '✨ Excellent! Your pixels match average atmospheric seeing.',
      calcVerdictOver:
        '⚠️ Warning: Oversampled (Soft stars without extra detail).',
      calcVerdictUnder: '⚠️ Warning: Undersampled (Blocky or square stars).',
      quizTitle: '📝 Knowledge Validation Quiz',
      quizSubmit: 'Submit Answers',
      quizScore: 'Your Final Score: ',
      quizRetry: 'Retake Quiz',
      correctAnswer: 'Correct!',
      wrongAnswer: 'Incorrect.',
      markComplete: '✓ Mark as completed',
      markIncomplete: '↺ Resume training',
      certTitle: '🏆 Get My Official Certificate',
      certDesc: 'Complete your modules and download your personalized certificate.',
      faqTitle: '❓ Frequently Asked Questions (FAQ)',
      faq1Q: 'How do I receive my access after purchase?',
      faq1A:
        'Access is instant! You receive a personal unlock code and the platform unlocks your modules right away.',
      faq2Q: 'Can I follow the courses on tablet or mobile?',
      faq2A:
        'Yes, the platform is 100% responsive and adapts to all your screens, in the field or at home.',
      faq3Q: 'Is the content updated for new technologies?',
      faq3A:
        'Absolutely. Your purchase includes lifetime updates to keep pace with harmonic mounts and processing software.',
      testimonialsTitle: '⭐ What our passionate students say',
      t1: '“Thanks to the harmonic mount and N.I.N.A. module, my imaging nights now run 100% automatically while I sleep!”',
      t1Author: 'Marc D., Amateur Astrophotographer (Quebec)',
      t2: '“The pixel scale calculator and PDF guides saved me from making a costly optical mistake. An essential masterclass.”',
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
      price: 89,
      badgeFr: 'Fondamental Optique',
      badgeEn: 'Optical Foundations',
      descFr:
        'Lunettes apochromatiques (Triplet ED), Newton, Ritchey-Chrétien : formules optiques, échantillonnage et backfocus.',
      descEn:
        'Apochromatic refractors (ED Triplet), Newtonian, Ritchey-Chrétien: optical designs, pixel scale, and backfocus.',
      image:
        'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module1,
      hasCalculator: true,
      content: {
        fr: {
          intro:
            "Le choix du tube optique détermine 80 % de votre confort sur le terrain et le type d'objets que vous pourrez photographier. Découvrez notre simulateur d'échantillonnage interactif ci-dessous !",
          slides: [
            {
              title: "Leçons d'Optique : Focale vs Rapport f/D",
              subtitle: "Comprendre la vitesse photographique d'un instrument",
              bullets: [
                'La longueur focale (ex: 400mm vs 1000mm) détermine uniquement le cadrage (champ de vision).',
                "Le rapport d'ouverture (f/D) détermine la vitesse à laquelle les photons s'accumulent.",
                'Passer de f/8 à f/4 divise par 4 le temps de pose nécessaire !',
              ],
              proTip:
                "Pour débuter, privilégiez un rapport f/4 à f/5.5 à l'aide d'un réducteur dédié.",
            },
          ] as Slide[],
          courseSections: [
            {
              heading: "1. La Règle d'Or de l'Échantillonnage et du Seeing",
              body: "En astrophotographie, l'atmosphère terrestre brouille les détails fins (Seeing). Pour échantillonner correctement, visez la moitié de votre Seeing moyen avec des caméras modernes de 3,76 µm.",
              highlight: 'Formule clé : E = (206.265 × Pixel_µm) / Focale_mm',
            },
          ] as LessonSection[],
          steps: [
            '1. Calculer son échantillonnage cible entre 0,8" et 2,0" par pixel.',
            '2. Vérifier que le poids équipé respecte la capacité de la monture.',
            '3. Viser un backfocus mécanique exact de 55,0 mm.',
          ],
          quiz: [
            {
              question:
                "Quel paramètre détermine la vitesse photographique pure d'un télescope ?",
              options: [
                'La longueur focale en millimètres',
                "Le rapport d'ouverture f/D",
                'Le diamètre du miroir secondaire uniquement',
              ],
              correct: 1,
              explanation:
                'Le rapport f/D (Focale divisée par le Diamètre) indique la concentration de lumière par unité de surface sur le capteur.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod1-pdf1',
              name: "Guide PDF - Calculateur d'échantillonnage & Backfocus",
              title:
                "Abaque d'Échantillonnage Optique & Diagnostic du Backfocus (55 mm)",
              sections: [
                {
                  title: '1. Formule Mathématique & Cibles de Seeing',
                  content: [
                    'Formule : Échantillonnage ("/px) = (206,265 × Taille du pixel en µm) / Focale en mm.',
                  ],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Your optical tube assembly dictates 80% of your field experience. Test our built-in pixel scale simulator below!',
          slides: [
            {
              title: 'Optics 101: Focal Length vs. Focal Ratio (f/D)',
              subtitle: 'Understanding optical speed',
              bullets: [
                'Focal length determines framing and field of view.',
                'Focal ratio (f/D) determines photographic speed and photon accumulation rate.',
              ],
              proTip: 'For versatile deep-sky imaging, aim for f/4 to f/5.5.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. The Golden Rule of Pixel Scale',
              body: 'Match your pixel scale to atmospheric seeing conditions for optimal resolution.',
              highlight:
                'Formula: Scale = (206.265 × Pixel_µm) / Focal_Length_mm',
            },
          ] as LessonSection[],
          steps: [
            '1. Calculate pixel scale.',
            '2. Check mount payload.',
            '3. Set 55mm backfocus.',
          ],
          quiz: [
            {
              question:
                'What parameter determines a telescope photographic speed?',
              options: [
                'Focal length',
                'Focal ratio (f/D)',
                'Aperture diameter alone',
              ],
              correct: 1,
              explanation:
                'Focal ratio (f/D) controls light concentration on the sensor.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod1-pdf1-en',
              name: 'PDF Guide - Pixel Scale & 55mm Backfocus Chart',
              title: 'Optical Pixel Scale Reference & Backfocus Guide',
              sections: [
                {
                  title: '1. Formula & Seeing Targets',
                  content: [
                    'Formula: Pixel Scale ("/px) = (206.265 × Pixel Size) / Focal Length.',
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
      price: 79,
      badgeFr: 'Matériel & Suivi',
      badgeEn: 'Hardware & Tracking',
      descFr:
        'Maîtriser les montures à réducteurs harmoniques (Juwei-17, Proxisky UMi-17S, ZWO AM5) et l’alignement polaire.',
      descEn:
        'Master strainwave harmonic mounts (Juwei-17, Proxisky UMi-17S, ZWO AM5) and precision polar alignment.',
      image:
        'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module2,
      hasCalculator: false,
      content: {
        fr: {
          intro:
            "Les montures à réducteurs harmoniques (Juwei-17, UMi-17S, AM5) ont révolutionné l'astrophotographie grâce à leur absence de contrepoids.",
          slides: [
            {
              title: "Anatomie d'un Réducteur Harmonique",
              subtitle: 'Couple et zéro backlash',
              bullets: [
                'Capacité de charge élevée sans contrepoids pour une portabilité maximale.',
                'Erreur périodique à pente rapide nécessitant un guidage court (0.5s - 1.0s).',
              ],
              proTip:
                'Lestez toujours votre trépied carbone avec une batterie LiFePO4.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Réglage des montures Strainwave',
              body: "Configurez l'autoguidage entre 0,5s et 1,0s pour compenser la pente rapide de l'erreur périodique harmonique.",
              highlight: 'Cadence de guidage : 0.5s - 1.0s',
            },
          ] as LessonSection[],
          steps: [
            '1. Mettre le trépied de niveau.',
            '2. Fixer la monture.',
            "3. Lancer l'alignement polaire astrométrique.",
          ],
          quiz: [
            {
              question:
                'Quel est le principal avantage des montures harmoniques ?',
              options: [
                'Elles ne nécessitent aucun contrepoids',
                'Elles pèsent 50 kg',
                "Elles n'ont pas besoin d'électricité",
              ],
              correct: 0,
              explanation:
                'Leur réducteur strainwave encaisse le couple sans contrepoids.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1',
              name: 'Checklist Mise en Station Zéro Défaut (PDF)',
              title: 'Protocole de Mise en Station Polaire & Sécurité',
              sections: [
                {
                  title: '1. Étapes',
                  content: ['Vérifier le niveau et lancer le polar align.'],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Strainwave harmonic mounts offer unprecedented portability without counterweights.',
          slides: [
            {
              title: 'Inside a Strainwave Harmonic Drive',
              subtitle: 'High torque and zero backlash',
              bullets: [
                'High payload capacity without counterweights.',
                'Short guide exposures required.',
              ],
              proTip: 'Always ballast your carbon tripod.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Tuning Harmonic Mounts',
              body: 'Guide at 0.5s - 1.0s.',
            },
          ],
          steps: ['1. Level tripod.', '2. Mount head.', '3. Polar align.'],
          quiz: [
            {
              question: 'Main advantage of harmonic mounts?',
              options: [
                'No counterweight needed',
                'Weighs 50kg',
                'No power required',
              ],
              correct: 0,
              explanation:
                'Strainwave gears hold payloads without counterweights.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod2-pdf1-en',
              name: 'Flawless Polar Alignment Checklist (PDF)',
              title: 'Precision Polar Alignment Checklist',
              sections: [
                { title: '1. Steps', content: ['Level and run polar align.'] },
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
      price: 89,
      badgeFr: 'Automatisation',
      badgeEn: 'Automation',
      descFr:
        'Automatisez 100 % de votre nuit : astrométrie, Plate Solving, séquenceur avancé et retournement au méridien.',
      descEn:
        'Automate 100% of your night: astrometry, Plate Solving, advanced sequencer, and Meridian Flip.',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module3,
      hasCalculator: false,
      content: {
        fr: {
          intro:
            'Dormez pendant que votre setup capture des photons grâce au Plate Solving et au séquenceur automatique de N.I.N.A. ou ASIAIR.',
          slides: [
            {
              title: 'Le Plate Solving Astrométrique',
              subtitle: 'Centrage automatique en 2 secondes',
              bullets: [
                "Reconnaissance du champ d'étoiles par catalogue hors-ligne.",
                'Synchronisation et recentrage automatique de la cible.',
              ],
              proTip: 'Installez le solveur ASTAP avec la base D50.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Séquencement Nocturne',
              body: 'Automatisez le refroidissement, le pointage, le guidage et le retournement au méridien.',
            },
          ],
          steps: [
            '1. Configurer N.I.N.A.',
            '2. Activer le Plate Solving',
            '3. Programmer le retournement au méridien.',
          ],
          quiz: [
            {
              question: 'À quoi sert le Plate Solving ?',
              options: [
                'À centrer automatiquement le télescope sur une cible grâce aux étoiles',
                'À nettoyer les miroirs',
                'À recharger la batterie',
              ],
              correct: 0,
              explanation:
                "Le Plate Solving analyse l'image pour recaler la monture aux coordonnées exactes.",
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1',
              name: 'Architecture de Séquence N.I.N.A. & ASIAIR (PDF)',
              title: 'Structure de Séquence Automatisée',
              sections: [
                {
                  title: '1. Paramètres',
                  content: ['Refroidissement -10°C, Plate solve, Dithering.'],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Sleep while your rig captures photons using Plate Solving and N.I.N.A. automation.',
          slides: [
            {
              title: 'Astrometric Plate Solving',
              subtitle: 'Automatic target centering in 2 seconds',
              bullets: [
                'Matches star patterns against offline catalogs.',
                'Syncs and recenters automatically.',
              ],
              proTip: 'Install ASTAP with D50 database.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Night Sequencing',
              body: 'Automate cooling, centering, guiding, and meridian flips.',
            },
          ],
          steps: [
            '1. Setup N.I.N.A.',
            '2. Enable Plate Solving',
            '3. Configure Meridian Flip.',
          ],
          quiz: [
            {
              question: 'What is Plate Solving used for?',
              options: [
                'Automatically centering the telescope using star patterns',
                'Cleaning mirrors',
                'Charging batteries',
              ],
              correct: 0,
              explanation:
                'Plate solving computes exact coordinates from captured star fields.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod3-pdf1-en',
              name: 'N.I.N.A. & ASIAIR Sequence Blueprint (PDF)',
              title: 'Automated Sequence Architecture',
              sections: [
                {
                  title: '1. Settings',
                  content: ['Cool -10°C, Plate solve, Dither.'],
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
      price: 79,
      badgeFr: 'Capteurs & Ville',
      badgeEn: 'Sensors & City Imaging',
      descFr:
        'Imagerie SHO (Palette Hubble) et Dual-Band HOO sous forte pollution lumineuse et calibration CMOS.',
      descEn:
        'SHO (Hubble Palette) and Dual-Band HOO imaging under heavy light pollution and CMOS calibration.',
      image:
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module4,
      hasCalculator: false,
      content: {
        fr: {
          intro:
            'Affranchissez-vous de la Lune et de la pollution lumineuse grâce aux capteurs CMOS refroidis et aux filtres interférentiels Ha, OIII, SII.',
          slides: [
            {
              title: 'Gain HCG et Refroidissement Peltier',
              subtitle: 'Réduction drastique du bruit thermique',
              bullets: [
                "Stabilisation à -10°C pour éliminer le courant d'obscurité.",
                'Utilisation du Gain 100 (HCG) sur capteurs IMX571/533.',
              ],
              proTip: 'Gardez la même bibliothèque de Darks pendant 6 mois.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Imagerie SHO & HOO',
              body: "Isolez les raies d'émission atomiques pour révéler les nébuleuses depuis la ville.",
            },
          ],
          steps: [
            '1. Régler Gain 100 / Offset 50.',
            '2. Stabiliser à -10°C.',
            '3. Capturer Darks et Flats.',
          ],
          quiz: [
            {
              question:
                "Quel est l'avantage du refroidissement Peltier (-10°C) ?",
              options: [
                "Il réduit drastiquement le bruit thermique (courant d'obscurité)",
                'Il éclaire le premier plan',
                'Il équilibre la monture',
              ],
              correct: 0,
              explanation:
                'Refroidir le capteur divise le bruit thermique par 2 tous les 6°C.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod4-pdf1',
              name: 'Guide des Temps de Pose, Gain CMOS & Filtres (PDF)',
              title: 'Référence Gain & Temps de Pose',
              sections: [
                {
                  title: '1. Paramètres',
                  content: ['Gain 100, Offset 50, -10°C.'],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Defeat light pollution using TEC-cooled CMOS sensors and Ha, OIII, SII narrowband filters.',
          slides: [
            {
              title: 'HCG Gain and Peltier Cooling',
              subtitle: 'Drastically cutting thermal noise',
              bullets: [
                'Stabilize at -10°C to eliminate dark current.',
                'Use Gain 100 (HCG) on IMX571/533 sensors.',
              ],
              proTip: 'Reuse your Master Dark library for 6 months.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. SHO & HOO Imaging',
              body: 'Isolate atomic emission lines to image nebulae from the city.',
            },
          ],
          steps: [
            '1. Set Gain 100 / Offset 50.',
            '2. Cool to -10°C.',
            '3. Capture Darks and Flats.',
          ],
          quiz: [
            {
              question: 'Advantage of Peltier cooling (-10°C)?',
              options: [
                'Drastically cuts thermal noise (dark current)',
                'Illuminates foreground',
                'Balances mount',
              ],
              correct: 0,
              explanation: 'Cooling cuts thermal dark current significantly.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod4-pdf1-en',
              name: 'CMOS Gain & Exposure Reference Chart (PDF)',
              title: 'Gain & Exposure Reference',
              sections: [
                {
                  title: '1. Settings',
                  content: ['Gain 100, Offset 50, -10°C.'],
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
      price: 69,
      badgeFr: 'Précision & Suivi',
      badgeEn: 'Precision & Guiding',
      descFr:
        'Obtenir des étoiles ponctuelles : calibration de la courbe en V, compensation du backlash et suivi PHD2 sub-arcseconde.',
      descEn:
        'Achieve pinpoint stars: V-curve autofocus calibration, backlash compensation, and sub-arcsecond PHD2 guiding.',
      image:
        'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module5,
      hasCalculator: true,
      content: {
        fr: {
          intro:
            "Obtenez des étoiles d'une finesse absolue grâce à la mise au point motorisée EAF (courbe en V) et à l'autoguidage multi-étoiles PHD2.",
          slides: [
            {
              title: 'La Courbe en V (Autofocus EAF)',
              subtitle: 'Mise au point automatique au micron près',
              bullets: [
                'Mesure du HFR (Half Flux Radius) à chaque pas du moteur.',
                'Utilisation du mode Overshoot pour éliminer le jeu mécanique (Backlash).',
              ],
              proTip:
                'Programmez un refocus automatique tous les 1,5°C de baisse thermique.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. PHD2 Multi-Star Guiding',
              body: 'Activez le guidage multi-étoiles pour lisser la turbulence atmosphérique.',
            },
          ],
          steps: [
            "1. Installer l'EAF et régler le backlash.",
            '2. Calibrer PHD2 près du méridien.',
            '3. Activer le Multi-Star.',
          ],
          quiz: [
            {
              question: "Que mesure-t-on lors d'une courbe en V autofocus ?",
              options: [
                'Le HFR (rayon de focalisation des étoiles)',
                'La température extérieure',
                'Le poids du tube',
              ],
              correct: 0,
              explanation:
                'Le HFR mesure la netteté des étoiles pour trouver le point focal optimal.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod5-pdf1',
              name: 'Fiche Pratique - Réglages Fins PHD2 Guiding (PDF)',
              title: 'Guide PHD2 Guiding & EAF',
              sections: [
                {
                  title: '1. Paramètres',
                  content: ['Exposition 0.5s-1s sur harmonique.'],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Achieve pinpoint stars using motorized EAF autofocus V-curves and PHD2 multi-star guiding.',
          slides: [
            {
              title: 'The V-Curve (EAF Autofocus)',
              subtitle: 'Micron-level automated focus',
              bullets: [
                'Measures star HFR at each motor step.',
                'Uses overshoot backlash compensation.',
              ],
              proTip: 'Trigger autofocus every 1.5°C temperature drop.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. PHD2 Multi-Star Guiding',
              body: 'Enable multi-star tracking to smooth atmospheric seeing.',
            },
          ],
          steps: [
            '1. Install EAF and set backlash.',
            '2. Calibrate PHD2 near meridian.',
            '3. Enable Multi-Star.',
          ],
          quiz: [
            {
              question: 'What is measured during an autofocus V-curve?',
              options: [
                'Star HFR (Half Flux Radius)',
                'Outside temperature',
                'Tube weight',
              ],
              correct: 0,
              explanation:
                'HFR evaluates star sharpness to find the focal point.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod5-pdf1-en',
              name: 'Cheat Sheet - PHD2 Settings for Harmonic Mounts (PDF)',
              title: 'PHD2 & EAF Guide',
              sections: [
                {
                  title: '1. Settings',
                  content: ['0.5s-1s exposure on harmonic mounts.'],
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
      price: 99,
      badgeFr: 'Traitement d’Art',
      badgeEn: 'Master Processing',
      descFr:
        "De l'empilement brut au chef-d'œuvre (galaxies type NGC 7331 & nébuleuses) : GraXpert, SPCC, déconvolution et GHS.",
      descEn:
        'From raw stack to masterpiece (galaxies like NGC 7331 & nebulae): GraXpert, SPCC, deconvolution, and GHS.',
      image:
        'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.module6,
      hasCalculator: false,
      content: {
        fr: {
          intro:
            'Révélez les plus faibles extensions de galaxies (comme NGC 7331) grâce au workflow non-destructif GraXpert, SPCC et GHS sous Siril et PixInsight.',
          slides: [
            {
              title: 'Le Stade Linéaire (GraXpert & SPCC)',
              subtitle: 'Nettoyage et calibration colorimétrique rigoureuse',
              bullets: [
                'Suppression des gradients de pollution lumineuse avec GraXpert AI.',
                'Calibration colorimétrique par astrométrie (SPCC).',
              ],
              proTip:
                "Ne touchez jamais à l'étirement tant que le traitement linéaire n'est pas terminé.",
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Workflow Starless & GHS',
              body: 'Séparez les étoiles pour étirer la nébuleuse ou la galaxie en douceur.',
            },
          ],
          steps: [
            '1. Retirer le gradient.',
            '2. Calibrer les couleurs (SPCC).',
            '3. Extraire les étoiles et appliquer GHS.',
          ],
          quiz: [
            {
              question:
                'À quel moment doit-on effectuer le retrait de gradient et la calibration des couleurs ?',
              options: [
                "Strictement au stade linéaire (avant tout étirement d'histogramme)",
                'À la toute fin du traitement',
                "Avant l'empilement des Darks",
              ],
              correct: 0,
              explanation:
                'Les algorithmes de calibration exigent des données linéaires pures.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod6-pdf1',
              name: 'Workflow Complet PixInsight & Siril Étape par Étape (PDF)',
              title: 'Mémento Workflow Linéaire & Non-Linéaire',
              sections: [
                {
                  title: '1. Séquence',
                  content: ['Crop -> GraXpert -> SPCC -> GHS.'],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Reveal faint galactic structures (like NGC 7331) using GraXpert, SPCC, and GHS in Siril and PixInsight.',
          slides: [
            {
              title: 'Linear Stage (GraXpert & SPCC)',
              subtitle: 'Gradient removal and rigorous color calibration',
              bullets: [
                'Remove light pollution gradients with GraXpert AI.',
                'Calibrate true astrophysical colors via SPCC.',
              ],
              proTip:
                'Never stretch until linear processing is fully complete.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Starless Workflow & GHS',
              body: 'Separate stars to stretch nebulae and galaxies gently.',
            },
          ],
          steps: [
            '1. Remove gradient.',
            '2. Calibrate colors (SPCC).',
            '3. Extract stars and apply GHS.',
          ],
          quiz: [
            {
              question:
                'When should gradient removal and color calibration be performed?',
              options: [
                'Strictly in the linear stage (before histogram stretching)',
                'At the very end',
                'Before dark calibration',
              ],
              correct: 0,
              explanation: 'Calibration algorithms require purely linear data.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod6-pdf1-en',
              name: 'Complete PixInsight & Siril Step-by-Step Workflow (PDF)',
              title: 'Linear to Non-Linear Workflow Checklist',
              sections: [
                {
                  title: '1. Sequence',
                  content: ['Crop -> GraXpert -> SPCC -> GHS.'],
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
      price: 59,
      badgeFr: 'Bonus Exclusif',
      badgeEn: 'Exclusive Bonus',
      descFr:
        'Voyager léger sous les ciels Bortle 1 : traqueurs nomades, objectifs photo rapides et arches de la Voie Lactée.',
      descEn:
        'Travel light under Bortle 1 skies: portable star trackers, fast camera lenses, and Milky Way arches.',
      image:
        'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=900&q=80',
      links: paymentLinks.bonus,
      hasCalculator: false,
      content: {
        fr: {
          intro:
            'Partez sous les ciels purs de montagne avec un équipement en bagage cabine et réalisez de superbes panoramas de la Voie Lactée.',
          slides: [
            {
              title: 'Objectifs Rapides & Règle NPF',
              subtitle: 'Maîtriser le grand champ nomade',
              bullets: [
                "Fermer d'un cran les objectifs lumineux (ex: f/1.4 à f/2.2) pour éliminer la coma.",
                "Utiliser la règle NPF pour calculer le temps de pose sans filé d'étoiles sur trépied fixe.",
              ],
              proTip:
                'Le Samyang 135mm f/2 est le roi incontesté du grand champ nomade.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Fusion Paysage & Ciel Suivi',
              body: 'Photographiez le premier plan au crépuscule puis fusionnez-le avec le ciel suivi.',
            },
          ],
          steps: [
            '1. Planifier avec Stellarium.',
            '2. Capturer le premier plan.',
            '3. Activer le traqueur pour le ciel.',
          ],
          quiz: [
            {
              question:
                "Pourquoi ferme-t-on d'un cran un objectif photo très lumineux (ex: de f/1.4 à f/2.2) ?",
              options: [
                'Pour supprimer la coma dans les coins et augmenter le piqué',
                'Pour économiser la batterie',
                'Pour zoomer',
              ],
              correct: 0,
              explanation:
                "Fermer d'un cran élimine les aberrations optiques des objectifs ouverts au max.",
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod7-pdf1',
              name: 'Checklist Bagage Cabine & Astrovoyage (PDF)',
              title: 'Checklist Expédition Astro',
              sections: [
                {
                  title: '1. Bagages',
                  content: ['Cabine : Optiques et batteries Li < 100Wh.'],
                },
              ],
            },
          ] as DownloadDoc[],
        },
        en: {
          intro:
            'Travel under pristine dark skies with a carry-on rig and capture stunning Milky Way panoramas.',
          slides: [
            {
              title: 'Fast Lenses & NPF Rule',
              subtitle: 'Mastering portable widefield imaging',
              bullets: [
                'Stop down fast lenses by 1 stop to eliminate corner coma.',
                'Use the NPF rule for pinpoint stars on fixed tripods.',
              ],
              proTip:
                'The Samyang 135mm f/2 is the king of widefield nebula lenses.',
            },
          ] as Slide[],
          courseSections: [
            {
              heading: '1. Landscape + Tracked Sky Blending',
              body: 'Shoot foreground during blue hour, then blend with tracked sky frames.',
            },
          ],
          steps: [
            '1. Plan with Stellarium.',
            '2. Capture foreground.',
            '3. Turn on tracker for sky.',
          ],
          quiz: [
            {
              question:
                'Why stop down a fast lens by 1 stop (e.g., f/1.4 to f/2.2)?',
              options: [
                'To eliminate corner coma and sharpen stars',
                'To save battery',
                'To zoom in',
              ],
              correct: 0,
              explanation:
                'Stopping down cleans up optical aberrations at wide apertures.',
            },
          ] as QuizQuestion[],
          downloads: [
            {
              id: 'mod7-pdf1-en',
              name: 'Carry-On Astro Travel Gear Checklist (PDF)',
              title: 'Astro Expedition Checklist',
              sections: [
                {
                  title: '1. Luggage',
                  content: ['Cabin: Optics and Li batteries < 100Wh.'],
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

  // Calculateur optique
  const pixelScaleResult = ((206265 * calcPixel) / calcFocal).toFixed(2);
  let calcVerdict = currentT.calcVerdictGreat;
  const scaleNum = parseFloat(pixelScaleResult);
  if (scaleNum < 0.8) calcVerdict = currentT.calcVerdictOver;
  else if (scaleNum > 2.0) calcVerdict = currentT.calcVerdictUnder;

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
              🔴 Mode Nuit
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
              className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 font-bold text-xs shadow-lg hover:opacity-95 transition text-white"
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
                  🏆 Certificat
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
            {/* HERO SECTION DE CLASSE INTERNATIONALE */}
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
                    Programme Complet
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black mt-1">
                    Les 7 Modules d’Expertise
                  </h3>
                </div>
                <p
                  className={`text-xs max-w-md ${
                    nightVision ? 'text-rose-300' : 'text-slate-400'
                  }`}
                >
                  Chaque module inclut des masterclasses vidéo/diaporamas, des
                  simulateurs interactifs et des guides PDF imprimables.
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
                              ✓ Terminé
                            </span>
                          )}
                          {!isDone && unlocked && (
                            <span className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-lg">
                              🚀 Débloqué
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
                    className={`italic text-sm ${
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
                    className={`italic text-sm ${
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

        {activeTab === 'module-detail' && currentModule && (
          <div
            className={`max-w-4xl mx-auto space-y-10 border rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-md ${
              nightVision
                ? 'bg-rose-950/20 border-rose-900'
                : 'bg-slate-900/90 border-slate-800/80'
            }`}
          >
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

            <div className="space-y-3">
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

            {/* STUDIO MASTERCLASS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>🎬</span> {currentT.studioHeader}
                </h3>
                <span className="text-xs font-mono px-3 py-1 rounded-lg bg-black/40 border border-white/10">
                  Chapitre {currentSlideIndex + 1} /{' '}
                  {currentModule.content[lang].slides.length}
                </span>
              </div>

              <div className="rounded-3xl bg-black/50 border border-white/10 p-6 md:p-10 shadow-2xl space-y-6">
                <h4 className="text-xl md:text-2xl font-black">
                  {
                    currentModule.content[lang].slides[currentSlideIndex]
                      .title
                  }
                </h4>
                <ul className="space-y-3">
                  {currentModule.content[lang].slides[
                    currentSlideIndex
                  ].bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3.5 bg-white/5 border border-white/10 p-4 rounded-2xl text-sm md:text-base leading-relaxed"
                    >
                      <span className="text-cyan-400 font-bold mt-0.5">✦</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={currentSlideIndex === 0}
                    onClick={() =>
                      setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
                    }
                    className="px-5 py-2.5 rounded-xl bg-slate-800 disabled:opacity-30 text-xs font-bold transition"
                  >
                    {currentT.prevSlide}
                  </button>
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
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 disabled:opacity-30 text-xs font-bold text-white transition"
                  >
                    {currentT.nextSlide}
                  </button>
                </div>
              </div>
            </div>

            {/* CALCULATEUR INTERACTIF */}
            {currentModule.hasCalculator && (
              <div className="space-y-5 bg-black/40 border border-cyan-500/30 p-6 md:p-8 rounded-3xl shadow-xl">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span>🧮</span> {currentT.calcTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcFocalLabel}
                    </label>
                    <input
                      type="number"
                      value={calcFocal}
                      onChange={(e) => setCalcFocal(Number(e.target.value))}
                      className="w-full px-4.5 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5">
                      {currentT.calcPixelLabel}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={calcPixel}
                      onChange={(e) => setCalcPixel(Number(e.target.value))}
                      className="w-full px-4.5 py-3 rounded-2xl bg-black border border-white/20 text-white font-mono text-sm focus:outline-none"
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
                  <p className="text-xs font-bold text-emerald-400">
                    {calcVerdict}
                  </p>
                </div>
              </div>
            )}

            {/* GÉNÉRATEUR PDF */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>📄</span> {currentT.resourcesPdf}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentModule.content[lang].downloads.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 rounded-3xl bg-black/50 border border-white/10 flex flex-col justify-between gap-5 shadow-xl"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-extrabold">
                        PDF Officiel A4
                      </span>
                      <h4 className="font-bold text-sm md:text-base mt-3 leading-snug">
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
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition"
                    >
                      <span>📥</span> {currentT.generatePdfBtn}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'success' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-4xl">
              ✨
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-white">
                {currentT.successTitle}
              </h2>
              <p className="text-slate-300 text-sm md:text-base max-w-lg mx-auto">
                {currentT.successDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={generateCertificate}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition"
            >
              {currentT.certTitle}
            </button>
          </div>
        )}

        {activeTab === 'pack' && (
          <div className="max-w-xl mx-auto bg-slate-900 border border-amber-500/40 rounded-3xl p-8 md:p-10 text-center space-y-6 shadow-2xl">
            <h2 className="text-3xl font-black text-white">
              {currentT.packTitle}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentT.packDesc}
            </p>
            <div className="text-4xl md:text-5xl font-black text-cyan-400">
              199,00 $ CAD
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleOpenLink(paymentLinks.packIntegral.stripe)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-600 font-extrabold text-slate-950 text-sm"
              >
                {currentT.payCardStripe}
              </button>
              <button
                type="button"
                onClick={() => handleOpenLink(paymentLinks.packIntegral.paypal)}
                className="flex-1 py-4 rounded-2xl bg-cyan-600 font-extrabold text-white text-sm"
              >
                {currentT.payWithPaypal}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-center">
              {currentT.vipSection}
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
                className="w-full px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-center uppercase tracking-widest focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 font-bold text-white text-sm"
              >
                {currentT.unlockBtn}
              </button>
            </form>
            {vipStatus === 'success' && (
              <p className="text-emerald-400 text-sm font-bold text-center">
                ✅ {currentT.accessGranted}
              </p>
            )}
            {vipStatus === 'error' && (
              <p className="text-rose-400 text-xs text-center font-medium">
                ⚠️ {currentT.invalidCode}
              </p>
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

      {/* MODALE LÉGALE */}
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
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {legalModal === 'terms'
                ? 'Produits numériques et formations en ligne accessibles immédiatement.'
                : 'Paiements traités de manière 100% sécurisée par Stripe et PayPal.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
