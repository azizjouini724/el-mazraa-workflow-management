const express = require('express');
const PDFDocument = require('pdfkit');
const ProductArticle = require('../models/ProductArticle');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/articles/:id/pdf', auth, async (req, res) => {
  try {
    const article = await ProductArticle.findById(req.params.id)
      .populate('creator', 'name email')
      .populate({
        path: 'validations',
        populate: { path: 'validator', select: 'name email' }
      }).lean();

    if (!article) return res.status(404).json({ message: 'Article non trouvé' });

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="article-${String(article._id).slice(-6)}.pdf"`);
    doc.pipe(res);

    const W  = doc.page.width;   // 595
    const H  = doc.page.height;  // 842
    const M  = 56;               // marge gauche/droite

    // ── PALETTE MINIMALISTE ─────────────────────────────────────────
    const BLACK  = '#0d0d0d';
    const DARK   = '#2a2a2a';
    const MID    = '#666666';
    const LIGHT  = '#999999';
    const BORDER = '#e0e0e0';
    const BG     = '#fafafa';
    const WHITE  = '#ffffff';
    const ACCENT = '#1a1a1a';   // ligne d'accent = noir, pas de couleur

    // ════════════════════════════════════════════════════════════════
    // HEADER — tout blanc, sobre
    // ════════════════════════════════════════════════════════════════

    // Ligne fine noire tout en haut (signature visuelle)
    doc.rect(0, 0, W, 4).fill(BLACK);

    // Nom société — grand, à gauche
    doc.fontSize(11).font('Helvetica').fillColor(LIGHT)
       .text('EL-MAZRAA', M, 22, { characterSpacing: 3 });

    // Réf + date — à droite, discret
    doc.fontSize(8.5).font('Helvetica').fillColor(LIGHT)
       .text(`Réf. ${String(article._id).slice(-8).toUpperCase()}`, 0, 22,
             { width: W - M, align: 'right' });
    doc.fontSize(8.5).fillColor(LIGHT)
       .text(new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
             0, 35, { width: W - M, align: 'right' });

    // Ligne de séparation fine
    doc.rect(M, 56, W - M * 2, 0.7).fill(BORDER);

    let y = 76;

    // ════════════════════════════════════════════════════════════════
    // TITRE PRINCIPAL
    // ════════════════════════════════════════════════════════════════

    // Label type document — petit, espacé
    doc.fontSize(8).font('Helvetica').fillColor(LIGHT)
       .text('FICHE ARTICLE PRODUIT', M, y, { characterSpacing: 2 });
    y += 22;

    // Titre — très grand
    doc.fontSize(26).font('Helvetica-Bold').fillColor(BLACK)
       .text(article.description1 || 'Sans titre', M, y, { width: W - M * 2 });
    y = doc.y + 10;

    if (article.description2) {
      doc.fontSize(13).font('Helvetica').fillColor(MID)
         .text(article.description2, M, y, { width: W - M * 2 });
      y = doc.y + 10;
    }

    // Statut pill — très sobre
    const st = statusInfo(article.status);
    doc.roundedRect(M, y, 110, 22, 2).fill(st.bg);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(st.color)
       .text(st.label, M, y + 7, { width: 110, align: 'center', characterSpacing: 1 });
    y += 40;

    // Ligne séparatrice
    doc.rect(M, y, W - M * 2, 0.7).fill(BORDER);
    y += 28;

    // ════════════════════════════════════════════════════════════════
    // PHOTO + INFOS CÔTE À CÔTE
    // ════════════════════════════════════════════════════════════════
    const photoW = 170;
    const photoH = 170;
    const infoX  = M + photoW + 28;
    const infoW  = W - M - infoX;

    // --- PHOTO ---
    doc.rect(M, y, photoW, photoH).fill(BG);
    doc.rect(M, y, photoW, photoH).stroke(BORDER).lineWidth(0.7);

    let photoOk = false;
    if (article.photo) {
      try {
        let buf = article.photo.startsWith('data:image')
          ? Buffer.from(article.photo.split(',')[1], 'base64')
          : Buffer.from(article.photo, 'base64');
        if (buf.length > 0) {
          doc.image(buf, M + 8, y + 8, {
            fit: [photoW - 16, photoH - 16],
            align: 'center', valign: 'center'
          });
          photoOk = true;
        }
      } catch (e) { /* silent */ }
    }
    if (!photoOk) {
      doc.fontSize(9).font('Helvetica').fillColor(BORDER)
         .text('Aucune photo', M, y + photoH / 2 - 6, { width: photoW, align: 'center' });
    }

    // --- INFOS DROITE ---
    // Chaque champ = label gris + valeur noire grande
    const infoFields = [
      ['Société',      article.societe        || '—'],
      ['Nature',       article.nature         || '—'],
      ['Famille',      article.familleArticle || '—'],
      ['Type Article', article.typeArticle    || '—'],
      ['Créé par',     article.creator?.name  || '—'],
      ['Date création',new Date(article.createdAt).toLocaleDateString('fr-FR')],
    ];
    if (article.qadCode) infoFields.push(['Code QAD', article.qadCode]);

    let iy = y;
    infoFields.forEach(([label, value], i) => {
      if (i > 0) {
        doc.rect(infoX, iy, infoW, 0.5).fill(BORDER);
        iy += 1;
      }
      doc.fontSize(8.5).font('Helvetica').fillColor(LIGHT)
         .text(label.toUpperCase(), infoX, iy + 4, { characterSpacing: 1 });
      doc.fontSize(11).font('Helvetica-Bold').fillColor(DARK)
         .text(value, infoX, iy + 17, { width: infoW });
      iy += 26;
    });

    y += photoH + 36;

    // Ligne séparatrice
    doc.rect(M, y, W - M * 2, 0.7).fill(BORDER);
    y += 28;

    // ════════════════════════════════════════════════════════════════
    // DONNÉES TECHNIQUES
    // ════════════════════════════════════════════════════════════════
    const fd = article.finalData || {};

    const techSections = [
      {
        title: 'Marketing',
        fields: [
          ['Sous-Famille', fd.sousFamille],
          ['Gamme',        fd.gamme],
        ]
      },
      {
        title: 'Production',
        fields: [
          ['Unité de vente',     fd.uniteVente],
          ['Facteur conversion', fd.facteurConversion],
          ['Tare',               fd.tare ? `${fd.tare} kg` : null],
          ['Max remplissage',    fd.maxRemplissage],
          ['Max matière',        fd.maxMatiere],
          ['Coût de revient',    fd.coutRevient],
          ['Emballage',          fd.emballage],
        ]
      },
      {
        title: 'Qualité',
        fields: [
          ['Durée DLC', fd.dlc ? `${fd.dlc} jours` : null],
          ['Durée DLV', fd.dlv ? `${fd.dlv} jours` : null],
        ]
      },
      {
        title: 'Finance',
        fields: [
          ['Taux TVA',        fd.tauxTVA != null ? `${fd.tauxTVA} %` : null],
          ['Compte de vente', fd.compteVente],
        ]
      },
      {
        title: 'Commercial',
        fields: [
          ['Prix Gros HT',    fd.prixGrosHT    ? `${fd.prixGrosHT} DT`    : null],
          ['Prix Gros TTC',   fd.prixGrosTTC   ? `${fd.prixGrosTTC} DT`   : null],
          ['Prix Détail TTC', fd.prixDetailTTC ? `${fd.prixDetailTTC} DT` : null],
        ]
      },
      {
        title: 'Contrôle de Gestion',
        fields: [
          ['Charge par KG', fd.chargeParKG],
          ['Commentaire',   fd.commentaireControle],
        ]
      },
    ]
    .map(s => ({ ...s, fields: s.fields.filter(([, v]) => v != null && v !== '') }))
    .filter(s => s.fields.length > 0);

    if (techSections.length > 0) {
      // Titre section
      doc.fontSize(8).font('Helvetica').fillColor(LIGHT)
         .text('DONNÉES TECHNIQUES', M, y, { characterSpacing: 2 });
      y += 20;

      for (const section of techSections) {
        if (y > H - 140) {
          doc.addPage();
          newPageHeader(doc, W, M, BLACK, LIGHT, BORDER);
          y = 70;
        }

        // Nom sous-section
        doc.fontSize(12).font('Helvetica-Bold').fillColor(DARK)
           .text(section.title, M, y);
        y += 18;

        // Grille 3 colonnes — grandes valeurs
        const cellW = (W - M * 2) / 3;
        const rows  = Math.ceil(section.fields.length / 3);

        section.fields.forEach(([label, value], idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const cx  = M + col * cellW;
          const cy  = y + row * 52;

          // Fond très léger alterné
          if (col === 0 && row % 2 === 0) {
            doc.rect(M, cy, W - M * 2, 52).fill(BG);
          }

          // Bordure bas de chaque cellule
          doc.rect(cx + 8, cy + 50, cellW - 16, 0.5).fill(BORDER);

          // Label petit gris
          doc.fontSize(7.5).font('Helvetica').fillColor(LIGHT)
             .text(label.toUpperCase(), cx + 8, cy + 8,
                   { width: cellW - 16, characterSpacing: 0.3 });

          // Valeur grande noire
          doc.fontSize(13).font('Helvetica-Bold').fillColor(BLACK)
             .text(String(value), cx + 8, cy + 20, { width: cellW - 16 });
        });

        y += rows * 52 + 20;
      }

      // Ligne séparatrice
      doc.rect(M, y, W - M * 2, 0.7).fill(BORDER);
      y += 28;
    }

    // ════════════════════════════════════════════════════════════════
    // WORKFLOW
    // ════════════════════════════════════════════════════════════════
    if (y > H - 160) {
      doc.addPage();
      newPageHeader(doc, W, M, BLACK, LIGHT, BORDER);
      y = 70;
    }

    doc.fontSize(8).font('Helvetica').fillColor(LIGHT)
       .text('ÉTAT DU WORKFLOW', M, y, { characterSpacing: 2 });
    y += 20;

    const steps = workflowSteps(article);
    const sw    = (W - M * 2) / steps.length;

    steps.forEach((step, i) => {
      const info = stepInfo(step.key, article.validations);
      const sx   = M + i * sw;
      const cellH = 64;

      // Fond blanc
      doc.rect(sx, y, sw, cellH).fill(WHITE);

      // Bordure droite séparation
      if (i < steps.length - 1) {
        doc.rect(sx + sw, y + 8, 0.5, cellH - 16).fill(BORDER);
      }

      // Ligne top — noire si approuvé, gris clair sinon
      doc.rect(sx + 4, y, sw - 8, info.approved ? 2.5 : 1).fill(info.approved ? BLACK : BORDER);

      // Numéro
      doc.fontSize(18).font('Helvetica-Bold')
         .fillColor(info.approved ? BLACK : BORDER)
         .text(`${i + 1}`, sx, y + 10, { width: sw, align: 'center' });

      // Nom service
      doc.fontSize(7).font('Helvetica-Bold').fillColor(info.approved ? DARK : LIGHT)
         .text(step.label, sx, y + 34, { width: sw, align: 'center', characterSpacing: 0.3 });

      // Statut texte
      doc.fontSize(6.5).font('Helvetica').fillColor(info.approved ? MID : BORDER)
         .text(info.label, sx, y + 46, { width: sw, align: 'center' });
    });

    // Bordure extérieure workflow
    doc.rect(M, y, W - M * 2, 64).stroke(BORDER).lineWidth(0.7);
    y += 80;

    // ════════════════════════════════════════════════════════════════
    // FOOTER
    // ════════════════════════════════════════════════════════════════

    // Ligne fine noire en bas
    doc.rect(0, H - 4, W, 4).fill(BLACK);

    doc.fontSize(8).font('Helvetica').fillColor(LIGHT)
       .text('EL-MAZRAA — Workflow Management System', M, H - 26, { width: 260 });
    doc.fontSize(8).fillColor(LIGHT)
       .text('Document confidentiel', 0, H - 26, { width: W, align: 'center' });
    doc.fontSize(8).fillColor(LIGHT)
       .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 0, H - 26,
             { width: W - M, align: 'right' });

    doc.end();

  } catch (error) {
    console.error('ERREUR PDF:', error);
    res.status(500).json({ message: 'Erreur export PDF', error: error.message });
  }
});


// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function newPageHeader(doc, W, M, BLACK, LIGHT, BORDER) {
  doc.rect(0, 0, W, 4).fill(BLACK);
  doc.fontSize(9).font('Helvetica').fillColor(LIGHT)
     .text('EL-MAZRAA — Fiche Produit (suite)', M, 16, { characterSpacing: 1 });
  doc.rect(M, 40, W - M * 2, 0.7).fill(BORDER);
}

function statusInfo(status) {
  const m = {
    'en_validation': { label: 'EN VALIDATION', bg: '#fdf6e3', color: '#7a5c00' },
    'créé_en_qad':   { label: 'CRÉÉ EN QAD',   bg: '#f0f7f0', color: '#1a4d2e' },
    'rejete':        { label: 'REJETÉ',         bg: '#fdf0f0', color: '#7a0000' },
    'brouillon':     { label: 'BROUILLON',      bg: '#f4f4f4', color: '#444444' },
  };
  return m[status] || { label: String(status || 'N/A').toUpperCase(), bg: '#f4f4f4', color: '#444444' };
}

function workflowSteps(article) {
  const n = article.nature;
  return [
    { key: 'marketing',    label: 'Marketing' },
    { key: 'production',   label: 'Production' },
    { key: 'qualite',      label: 'Qualité' },
    { key: 'finance',      label: 'Finance' },
    { key: n === 'UCPC' ? 'essanaouber' : n === 'GMS' ? 'gms' : n === 'Export' ? 'export' : 'commercial',
      label: n === 'UCPC' ? 'Essanaouber' : n === 'GMS' ? 'GMS' : n === 'Export' ? 'Export' : 'Commercial' },
    { key: 'controle',     label: 'Contrôle' },
    { key: 'informatique', label: 'Informatique' },
  ];
}

function stepInfo(key, validations) {
  const v = (validations || []).find(v => v && v.type === key);
  if (!v) return { approved: false, label: 'En attente', icon: '○' };
  const m = {
    approved:  { approved: true,  label: 'Approuvée',  icon: '✓' },
    rejected:  { approved: false, label: 'Rejetée',    icon: '✗' },
    pending:   { approved: false, label: 'En cours',   icon: '◷' },
    waiting:   { approved: false, label: 'En attente', icon: '○' },
    cancelled: { approved: false, label: 'Annulée',    icon: '—' },
  };
  return m[v.status] || m.waiting;
}

module.exports = router;