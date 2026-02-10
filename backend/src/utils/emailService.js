
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'AmazAI <onboarding@resend.dev>', // Resend provides this for testing
      to: email,
      subject: 'Verify Your Account - AmazAI',
      html: `
        <div style="font-family: sans-serif; background: #0d1117; color: #c9d1d9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #58a6ff;">Welcome to AmazAI!</h2>
          <p>Click the button below to verify your email and start your reviews.</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 24px; background: #238636; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">
             Verify Email Address
          </a>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log("Email sent successfully via API!");
    }
  } catch (err) {
    console.error("Failed to send email:", err.message);
  }
};