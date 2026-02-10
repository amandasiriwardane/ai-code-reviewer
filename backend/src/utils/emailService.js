import nodemailer from 'nodemailer'; // Use import instead of require

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App-specific password from .env
  },
});

// Use 'export const' so authController can find the named export
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${token}`;

  await transporter.sendMail({
    from: '"AmazAI Support" <no-reply@amazai.com>',
    to: email,
    subject: "Verify Your Account - AmazAI Code Reviewer",
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Welcome to AmazAI!</h2>
        <p>Please click the button below to verify your email and secure your code reviews.</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none;">
           Verify Email Address
        </a>
      </div>
    `,
  });
};