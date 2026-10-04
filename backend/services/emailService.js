const nodemailer = require('nodemailer');

// ✅ Configuration Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

// ✅ Envoyer email de réinitialisation
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    console.log('🔍 Tentative envoi email à:', email);
    console.log('🔗 Lien de réinitialisation:', resetLink);
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Mazraa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Mazraa</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Plateforme de gestion documentaire</p>
          </div>

          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Réinitialisation de mot de passe</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Mazraa.
            </p>

            <p style="color: #666; line-height: 1.6;">
              Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="
                display: inline-block;
                background: #0066cc;
                color: white;
                padding: 12px 30px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
              ">Réinitialiser mon mot de passe</a>
            </div>

            <p style="color: #999; font-size: 12px; margin: 20px 0;">
              Ou copiez ce lien dans votre navigateur :
            </p>
            <p style="
              background: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              word-break: break-all;
              color: #666;
              font-size: 12px;
            ">
              ${resetLink}
            </p>

            <div style="
              background: #fffbf0;
              border-left: 4px solid #ff9800;
              padding: 12px;
              border-radius: 4px;
              margin: 20px 0;
            ">
              <p style="color: #666; margin: 0; font-size: 14px;">
                <strong>Important :</strong> Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
              </p>
            </div>

            <p style="color: #999; font-size: 12px; line-height: 1.6;">
              Si vous rencontrez des problèmes, contactez notre support à support@mazraa.com
            </p>
          </div>

          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; color: #999; font-size: 12px;">
            <p style="margin: 0;">
              Mazraa - Plateforme de gestion documentaire<br>
              © ${new Date().getFullYear()} Tous droits réservés
            </p>
          </div>
        </div>
      `
    };

    console.log('📧 Configuration email:', {
      from: process.env.GMAIL_USER,
      to: email,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email envoyé avec succès!');
    console.log('📨 Message ID:', info.messageId);
    console.log('📬 Réponse serveur:', info.response);
    
    return { success: true, message: 'Email de réinitialisation envoyé' };
  } catch (error) {
    console.error('❌ Erreur envoi email:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    return { success: false, message: 'Erreur lors de l\'envoi de l\'email' };
  }
};

module.exports = {
  sendPasswordResetEmail
};