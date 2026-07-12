const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

export const sendResetPasswordEmail = async (to, resetLink) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey || apiKey.length < 20) {
    throw new Error('BREVO_API_KEY non configurée');
  }

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: 'yassinehafidi321@gmail.com', name: 'Librairie Marocaine' },
      to: [{ email: to }],
      subject: '🔑 Réinitialisation de mot de passe',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #d97706; margin: 0;">📚 Librairie Marocaine</h1>
          </div>
          <h2 style="color: #1f2937;">Réinitialisation de mot de passe</h2>
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
            Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Librairie Marocaine — Khenifra, Maroc
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API (${res.status}): ${err}`);
  }

  console.log('✅ Email envoyé via Brevo API');
};
