const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'yassinehafidi321@gmail.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Library Marocain';

// ============================================
// Envoi genrique via Brevo API
// ============================================
const sendEmail = async ({ to, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey.length < 20) {
    throw new Error('BREVO_API_KEY non configurée');
  }

  const res = await fetch(BREVO_API, {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API (${res.status}): ${err}`);
  }
  console.log(`✅ Email envoyé via Brevo → ${to} : ${subject}`);
};

// Layout HTML partagé
const layout = (title, bodyHtml) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #d97706; margin: 0;">📚 Library Marocain</h1>
    </div>
    <h2 style="color: #1f2937;">${title}</h2>
    ${bodyHtml}
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Library Marocain — Khenifra, Maroc | contact@librarymarocain.ma
    </p>
  </div>
`;

const money = (n) => `${(parseFloat(n) || 0).toFixed(2)} MAD`;

// ============================================
// Reset password
// ============================================
export const sendResetPasswordEmail = async (to, resetLink) => {
  await sendEmail({
    to,
    subject: '🔑 Réinitialisation de mot de passe',
    htmlContent: layout('Réinitialisation de mot de passe', `
      <p style="color: #6b7280; line-height: 1.6;">
        Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}"
           style="background-color: #d97706; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
          🔑 Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 14px;">
        Ce lien expire dans <strong>15 minutes</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </p>
    `),
  });
};

// ============================================
// Confirmation de commande (client)
// ============================================
export const sendOrderConfirmationEmail = async (to, order) => {
  const rows = (order.items || []).map((i) => `
    <tr>
      <td style="padding: 8px 4px; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${i.name || 'Produit'}</td>
      <td style="padding: 8px 4px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280;">${i.quantity}</td>
      <td style="padding: 8px 4px; border-bottom: 1px solid #f5e7e7; text-align: right; color: #6b7280;">${money(i.price)}</td>
      <td style="padding: 8px 4px; border-bottom: 1px solid #f5e7e7; text-align: right; color: #1f2937; font-weight: bold;">${money(i.lineTotal)}</td>
    </tr>
  `).join('');

  await sendEmail({
    to,
    subject: `✅ Confirmation de votre commande ${order.order_number || ''}`.trim(),
    htmlContent: layout('Merci pour votre commande !', `
      <p style="color: #6b7280; line-height: 1.6;">
        Votre commande <strong style="color:#1f2937;">${order.order_number || ''}</strong> a bien été enregistrée.
        Notre équipe vous contactera pour la confirmation.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <thead>
          <tr>
            <th style="text-align: left; color:#92400e; border-bottom: 2px solid #fde68a; padding-bottom: 6px;">Produit</th>
            <th style="text-align: center; color:#92400e; border-bottom: 2px solid #fde68a; padding-bottom: 6px;">Qté</th>
            <th style="text-align: right; color:#92400e; border-bottom: 2px solid #fde68a; padding-bottom: 6px;">P.U.</th>
            <th style="text-align: right; color:#92400e; border-bottom: 2px solid #fde68a; padding-bottom: 6px;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align: right; font-size: 18px; font-weight: bold; color: #1f2937; margin: 16px 0;">
        Total : ${money(order.total_amount)}
      </p>
      ${order.shipping_address ? `<p style="color:#6b7280;">📍 Livraison : ${order.shipping_address}</p>` : ''}
    `),
  });
};

// ============================================
// Changement de statut commande (client)
// ============================================
const STATUS_LABELS = {
  pending: '⏳ En attente de confirmation',
  validated: '✅ Validée',
  preparation: '📦 En préparation',
  shipped: '🚚 Expédiée',
  delivered: '🎉 Livrée',
  cancelled: '❌ Annulée',
};

export const sendOrderStatusEmail = async (to, order, status) => {
  const label = STATUS_LABELS[status] || status;
  await sendEmail({
    to,
    subject: `Commande ${order.order_number || ''} — ${label}`.trim(),
    htmlContent: layout('Mise à jour de votre commande', `
      <p style="color: #6b7280; line-height: 1.6;">
        Le statut de votre commande <strong style="color:#1f2937;">${order.order_number || ''}</strong> a été mis à jour :
      </p>
      <p style="font-size: 20px; font-weight: bold; color: #92400e; text-align: center; margin: 24px 0;">
        ${label}
      </p>
      <p style="text-align: right; color:#1f2937; font-weight: bold;">Total : ${money(order.total_amount)}</p>
      <p style="color: #9ca3af; font-size: 13px;">Vous pouvez suivre vos commandes depuis votre espace « Mes commandes ».</p>
    `),
  });
};
