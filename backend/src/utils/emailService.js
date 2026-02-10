import nodemailer from 'nodemailer'; // Use import instead of require

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000, // 15 seconds
  family: 4 // Keep this to ensure we stick to IPv4
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