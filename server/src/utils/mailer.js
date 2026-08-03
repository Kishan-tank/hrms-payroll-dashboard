import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { renderRoleUpdatedEmail, renderAccountDeactivatedEmail } from "../templates/emailTemplate.js";

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
 * Generic email sender with plain text fallback support.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"HRMSPro Enterprise" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""), // Auto plain text fallback
    });
    console.log(`[Mailer] Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mailer] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Shared notification helper to dispatch dual-recipient emails
 * (to affected user AND to ADMIN_EMAIL for audit tracking).
 */
export const notifyChange = async ({ user, action, details = {} }) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const timestamp = new Date().toLocaleString();

  try {
    if (action === "ROLE_UPDATE") {
      const { oldRole, newRole } = details;
      const userSubject = "HRMSPro: Your role was updated";
      const adminSubject = `HRMSPro Audit: Role changed for ${user.name}`;

      // User notification email
      sendEmail({
        to: user.email,
        subject: userSubject,
        html: renderRoleUpdatedEmail({ name: user.name, oldRole, newRole, isAdminNotice: false, timestamp }),
      }).catch((err) => console.error("[Mailer] User role notification error:", err));

      // Admin audit log email
      if (adminEmail && adminEmail.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        sendEmail({
          to: adminEmail,
          subject: adminSubject,
          html: renderRoleUpdatedEmail({ name: user.name, oldRole, newRole, isAdminNotice: true, timestamp }),
        }).catch((err) => console.error("[Mailer] Admin role audit notification error:", err));
      }
    } else if (action === "ACCOUNT_DEACTIVATE") {
      const userSubject = "HRMSPro: Your account access was revoked";
      const adminSubject = `HRMSPro Audit: Removed user ${user.name}`;

      // User notification email
      sendEmail({
        to: user.email,
        subject: userSubject,
        html: renderAccountDeactivatedEmail({ name: user.name, email: user.email, isAdminNotice: false, timestamp }),
      }).catch((err) => console.error("[Mailer] User deactivation notification error:", err));

      // Admin audit log email
      if (adminEmail && adminEmail.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        sendEmail({
          to: adminEmail,
          subject: adminSubject,
          html: renderAccountDeactivatedEmail({ name: user.name, email: user.email, isAdminNotice: true, timestamp }),
        }).catch((err) => console.error("[Mailer] Admin deactivation audit notification error:", err));
      }
    }
  } catch (error) {
    console.error("[Mailer] notifyChange error:", error);
  }
};
