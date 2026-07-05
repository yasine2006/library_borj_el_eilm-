import pool from '../config/db.js';
import PDFDocument from 'pdfkit';

export const generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order with details
    const orderResult = await pool.query(`
      SELECT o.*, 
        u.first_name, u.last_name, u.email, u.phone,
        u.address, u.city, u.user_type
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0)
      return res.status(404).json({ error: 'Commande introuvable' });

    const order = orderResult.rows[0];

    // Check permission: client kan9ra fqt commands dyalou
    if (req.user.role_id === 3 && order.user_id !== req.user.id)
      return res.status(403).json({ error: 'Accès refusé' });

    const itemsResult = await pool.query(`
      SELECT oi.*, p.name as product_name, p.brand, p.barcode
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    const items = itemsResult.rows;
    const subtotal = parseFloat(order.total_amount);
    const tva = subtotal * 0.20;
    const total = subtotal + tva;

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${order.order_number}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Handle stream errors
    doc.on('error', (err) => {
      console.error('PDF error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Erreur génération PDF' });
    });
    
    doc.pipe(res);

    // ── HEADER ──
    doc.rect(0, 0, 595, 120).fill('#92400e');
    doc.fillColor('#ffffff')
      .fontSize(28).font('Helvetica-Bold')
      .text('FACTURE', 50, 35);
    doc.fontSize(11).font('Helvetica')
      .text('Borj El Eilm — Librairie Marocaine', 50, 70)
      .text('Khenifra, Maroc | contact@borjeilm.ma', 50, 87);

    doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
      .text(order.order_number, 400, 45, { align: 'right' });
    doc.fontSize(10).font('Helvetica')
      .text(new Date(order.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      }), 400, 65, { align: 'right' });

    // ── CLIENT INFO ──
    doc.fillColor('#1f2937').fontSize(11).font('Helvetica-Bold')
      .text('FACTURÉ À:', 50, 145);
    doc.font('Helvetica').fontSize(10).fillColor('#374151')
      .text(`${order.first_name} ${order.last_name}`, 50, 162)
      .text(order.email, 50, 177)
      .text(order.phone || '', 50, 192)
      .text(order.shipping_address || '', 50, 207);

    // Status badge
    const statusColors = {
      delivered: '#059669', pending: '#d97706', cancelled: '#dc2626'
    };
    const statusLabels = {
      delivered: 'Livrée', pending: 'En attente', 
      preparation: 'En préparation', shipped: 'Expédiée', cancelled: 'Annulée'
    };
    doc.rect(400, 145, 145, 28).fill(statusColors[order.status] || '#6b7280');
    doc.fillColor('#fff').fontSize(10).font('Helvetica-Bold')
      .text(statusLabels[order.status] || order.status, 400, 153, { width: 145, align: 'center' });

    // ── TABLE HEADER ──
    const tableTop = 255;
    doc.rect(50, tableTop, 495, 25).fill('#92400e');
    doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
    doc.text('PRODUIT', 60, tableTop + 8);
    doc.text('MARQUE', 250, tableTop + 8);
    doc.text('QTÉ', 340, tableTop + 8, { width: 50, align: 'center' });
    doc.text('P.U. (MAD)', 390, tableTop + 8, { width: 70, align: 'right' });
    doc.text('TOTAL (MAD)', 460, tableTop + 8, { width: 80, align: 'right' });

    // ── TABLE ROWS ──
    let y = tableTop + 30;
    items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, y - 5, 495, 22).fill('#fef3c7');
      doc.fillColor('#1f2937').fontSize(9).font('Helvetica');
      doc.text(item.product_name || '', 60, y, { width: 185 });
      doc.text(item.brand || '—', 250, y, { width: 85 });
      doc.text(String(item.quantity), 340, y, { width: 50, align: 'center' });
      doc.text(parseFloat(item.unit_price).toFixed(2), 390, y, { width: 70, align: 'right' });
      doc.text(parseFloat(item.total_price).toFixed(2), 460, y, { width: 80, align: 'right' });
      y += 22;
    });

    // ── TOTALS ──
    y += 15;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#e5e7eb').stroke();
    y += 12;

    const totalsX = 380;
    doc.fillColor('#374151').fontSize(10).font('Helvetica');
    doc.text('Sous-total HT:', totalsX, y);
    doc.text(`${subtotal.toFixed(2)} MAD`, totalsX, y, { width: 160, align: 'right' });
    y += 18;
    doc.text('TVA (20%):', totalsX, y);
    doc.text(`${tva.toFixed(2)} MAD`, totalsX, y, { width: 160, align: 'right' });
    y += 18;

    doc.rect(totalsX - 5, y - 5, 175, 28).fill('#92400e');
    doc.fillColor('#fff').fontSize(12).font('Helvetica-Bold');
    doc.text('TOTAL TTC:', totalsX, y + 3);
    doc.text(`${total.toFixed(2)} MAD`, totalsX, y + 3, { width: 160, align: 'right' });

    // ── FOOTER ──
    doc.fillColor('#9ca3af').fontSize(8).font('Helvetica')
      .text('Merci pour votre confiance — Borj El Eilm, Khenifra Maroc', 50, 760, { align: 'center' })
      .text('Ce document est généré automatiquement et ne nécessite pas de signature.', 50, 773, { align: 'center' });

    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};