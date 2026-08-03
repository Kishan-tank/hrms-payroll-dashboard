import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("Warning: EMAIL_USER or EMAIL_PASS environment variables are missing.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Generic email sender.
 * Wraps transport errors safely and logs server-side.
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"HRMSPro Enterprise" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Mailer] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mailer] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};
