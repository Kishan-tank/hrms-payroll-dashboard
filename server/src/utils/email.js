import nodemailer from 'nodemailer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

const transporter = SMTP_HOST && SMTP_USER && SMTP_PASS ? nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
}) : null;

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const subject = 'Reset your HRMSPro password';
  const html = `
    <p>Hi ${name || 'there'},</p>
    <p>You requested to reset your password for HRMSPro. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
    <p>Thanks,<br/>HRMSPro Team</p>
  `;

  if (!transporter) {
    console.log('Password reset email simulation:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Link: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `HRMSPro <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
