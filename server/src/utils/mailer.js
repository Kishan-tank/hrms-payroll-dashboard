import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  renderGenericNotificationEmail,
  renderRoleUpdatedEmail,
  renderAccountDeactivatedEmail,
} from "../templates/emailTemplate.js";

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
 * Action configuration map for generic email notification generator.
 */
const ACTION_CONFIGS = {
  USER_INITIATE: {
    heading: (u, d) => `Account Created for ${u.name || d.email}`,
    badgeVariant: "info",
    actionBadge: "Account Created",
    userDesc: (u, d) => `Hello ${u.name || 'User'}, an account invitation was created for ${d.email} with role ${d.role || 'Employee'}.`,
    adminDesc: (u, d) => `Admin created pending account for ${u.name || d.email} (${d.role}).`,
  },
  USER_CONFIRMED: {
    heading: (u) => `Account Confirmed & Activated`,
    badgeVariant: "success",
    actionBadge: "Account Active",
    userDesc: (u) => `Welcome ${u.name}! Your HRMSPro account has been fully verified and activated.`,
    adminDesc: (u) => `User ${u.name} (${u.email}) completed email verification and activated account.`,
  },
  ROLE_UPDATE: {
    heading: (u, d) => `Role Updated to ${d.newRole}`,
    badgeVariant: "info",
    actionBadge: "Role Updated",
    userDesc: (u, d) => `Hello ${u.name}, your system access role was changed from ${d.oldRole || 'previous role'} to ${d.newRole}.`,
    adminDesc: (u, d) => `Role for ${u.name} (${u.email}) changed from ${d.oldRole || 'previous'} to ${d.newRole}.`,
  },
  ACCOUNT_DEACTIVATE: {
    heading: (u) => `Account Access Revoked`,
    badgeVariant: "danger",
    actionBadge: "Access Revoked",
    userDesc: (u) => `Hello ${u.name}, your account access for HRMSPro has been revoked by an administrator.`,
    adminDesc: (u) => `User account for ${u.name} (${u.email}) was deactivated.`,
  },
  PAYROLL_RUN: {
    heading: (u, d) => `Payroll Cycle Completed (${d.month || ''} ${d.year || ''})`,
    badgeVariant: "success",
    actionBadge: "Payroll Run",
    userDesc: (u, d) => `Payroll processing for ${d.month} ${d.year} has been completed. Check your payslips tab.`,
    adminDesc: (u, d) => `Payroll run completed for ${d.month} ${d.year}. Generated ${d.recordsGenerated || 0} records.`,
  },
  PAYROLL_EDIT: {
    heading: (u, d) => `Payroll Record Updated (${d.month || ''} ${d.year || ''})`,
    badgeVariant: "warning",
    actionBadge: "Payroll Modified",
    userDesc: (u, d) => `Hello ${u.name || 'Employee'}, your payroll details for ${d.month || ''} ${d.year || ''} were updated by an admin.`,
    adminDesc: (u, d) => `Payroll record for ${u.name || d.employeeName} (${d.month} ${d.year}) was modified.`,
  },
  PAYROLL_VOID: {
    heading: (u, d) => `Payroll Record Voided`,
    badgeVariant: "danger",
    actionBadge: "Payroll Voided",
    userDesc: (u, d) => `Hello ${u.name || 'Employee'}, your payroll record for ${d.month || ''} ${d.year || ''} was voided.`,
    adminDesc: (u, d) => `Payroll record ID ${d.recordId || ''} for ${u.name || 'Employee'} was voided.`,
  },
  LEAVE_REQUESTED: {
    heading: (u, d) => `New ${d.type || 'Leave'} Request Submitted`,
    badgeVariant: "info",
    actionBadge: "Leave Request",
    userDesc: (u, d) => `Hello ${u.name}, your ${d.type || 'leave'} request for ${d.dateRange || 'requested dates'} was submitted.`,
    adminDesc: (u, d) => `Employee ${u.name} submitted a new ${d.type || 'leave'} request (${d.days || 1} days, ${d.dateRange}).`,
  },
  LEAVE_STATUS_CHANGED: {
    heading: (u, d) => `Leave Request ${d.status}`,
    badgeVariant: (u, d) => (d.status === "Approved" ? "success" : "danger"),
    actionBadge: "Leave Decision",
    userDesc: (u, d) => `Hello ${u.name}, your ${d.leaveType || 'leave'} request for ${d.dateRange || 'dates'} has been ${String(d.status).toLowerCase()}.`,
    adminDesc: (u, d) => `Leave request for ${u.name} was ${String(d.status).toLowerCase()} by HR/Admin.`,
  },
  LEAVE_POLICY_MUTATION: {
    heading: (u, d) => `Leave Policy ${d.actionType || 'Updated'}: ${d.policyName}`,
    badgeVariant: "info",
    actionBadge: "Policy Update",
    userDesc: (u, d) => `Leave policy '${d.policyName}' was ${d.actionType || 'updated'}. All staff subject to policy limits.`,
    adminDesc: (u, d) => `Leave policy '${d.policyName}' (${d.leaveType}, ${d.daysAllotted} days/yr) was ${d.actionType || 'updated'}.`,
  },
  GOAL_MUTATION: {
    heading: (u, d) => `Performance Goal ${d.actionType || 'Updated'}: ${d.title}`,
    badgeVariant: "info",
    actionBadge: "Goal Update",
    userDesc: (u, d) => `Hello ${u.name || 'Employee'}, goal '${d.title}' was ${d.actionType || 'updated'}.`,
    adminDesc: (u, d) => `Performance goal '${d.title}' for ${u.name || 'Employee'} was ${d.actionType || 'updated'}.`,
  },
  TASK_MUTATION: {
    heading: (u, d) => `Task ${d.actionType || 'Updated'}: ${d.title}`,
    badgeVariant: "info",
    actionBadge: "Task Update",
    userDesc: (u, d) => `Hello ${u.name || 'Employee'}, task '${d.title}' was ${d.actionType || 'updated'}.`,
    adminDesc: (u, d) => `Task '${d.title}' for ${u.name || 'Employee'} was ${d.actionType || 'updated'}.`,
  },
  PERFORMANCE_REVIEW_CREATED: {
    heading: (u, d) => `Performance Review Submitted (${d.reviewPeriod})`,
    badgeVariant: "success",
    actionBadge: "Performance Review",
    userDesc: (u, d) => `Hello ${u.name}, your performance review for ${d.reviewPeriod} has been submitted (Score: ${d.score}/10).`,
    adminDesc: (u, d) => `Performance review for ${u.name} (${d.reviewPeriod}) submitted with score ${d.score}/10.`,
  },
  SKILL_MUTATION: {
    heading: (u, d) => `Skill Matrix: ${d.skillName} (${d.actionType || 'Updated'})`,
    badgeVariant: "info",
    actionBadge: "Skill Matrix",
    userDesc: (u, d) => `Skill '${d.skillName}' on your profile was ${d.actionType || 'updated'}.`,
    adminDesc: (u, d) => `Skill '${d.skillName}' for ${u.name || 'Employee'} was ${d.actionType || 'updated'}.`,
  },
  EVENT_MUTATION: {
    heading: (u, d) => `Company Event ${d.actionType || 'Created'}: ${d.eventTitle}`,
    badgeVariant: "info",
    actionBadge: "Company Event",
    userDesc: (u, d) => `Company event '${d.eventTitle}' (${d.eventType || 'Event'}) scheduled for ${d.eventDate}.`,
    adminDesc: (u, d) => `Company event '${d.eventTitle}' was ${d.actionType || 'created'}.`,
  },
  EMPLOYEE_PROFILE_UPDATED: {
    heading: (u, d) => `Employee Profile Updated (${u.name || 'Employee'})`,
    badgeVariant: "info",
    actionBadge: "Profile Updated",
    userDesc: (u) => `Hello ${u.name || 'Employee'}, your employment/personal profile details were updated.`,
    adminDesc: (u, d) => `Employee profile for ${u.name || d.name || 'Staff'} was updated.`,
  },
  DOCUMENT_MUTATION: {
    heading: (u, d) => `Document ${d.actionType || 'Uploaded'}: ${d.fileName}`,
    badgeVariant: "info",
    actionBadge: "Document Update",
    userDesc: (u, d) => `Hello ${u.name || 'Employee'}, document '${d.fileName}' was ${d.actionType || 'uploaded'}.`,
    adminDesc: (u, d) => `Document '${d.fileName}' for ${u.name || 'Employee'} was ${d.actionType || 'uploaded'}.`,
  },
  ONBOARDING_UPDATED: {
    heading: (u, d) => `Onboarding Progress Updated`,
    badgeVariant: "success",
    actionBadge: "Onboarding",
    userDesc: (u, d) => `Hello ${u.name}, your onboarding progress was updated (${d.completedSteps || 0}/${d.totalSteps || 0} steps completed).`,
    adminDesc: (u, d) => `Onboarding progress for ${u.name} updated to ${d.completedSteps || 0}/${d.totalSteps || 0} steps.`,
  },
  ATTENDANCE_MUTATION: {
    heading: (u, d) => `Attendance Record ${d.actionType || 'Corrected'} (${d.date || ''})`,
    badgeVariant: (u, d) => (d.actionType === "Deleted" ? "danger" : "warning"),
    actionBadge: "Attendance Correction",
    userDesc: (u, d) => `Hello ${u.name || 'Employee'}, your attendance record for ${d.date || 'date'} was ${String(d.actionType || 'modified').toLowerCase()} by an administrator.`,
    adminDesc: (u, d) => `Attendance record for ${u.name || 'Employee'} on ${d.date || 'date'} was ${String(d.actionType || 'modified').toLowerCase()} by Admin.`,
  },
  PASSWORD_CHANGED: {
    heading: (u) => `Account Password Changed`,
    badgeVariant: "success",
    actionBadge: "Security Update",
    userDesc: (u) => `Hello ${u.name || 'User'}, your HRMSPro account password was updated successfully.`,
    adminDesc: (u) => `Password changed for user ${u.name || u.email}.`,
  },
};

/**
 * Shared, generic notification engine to dispatch dual-recipient emails
 * (to affected user AND to ADMIN_EMAIL for audit tracking).
 * Fire-and-forget relative to the API response.
 */
export const notifyChange = async ({ user = {}, action, details = {}, actor }) => {
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "").toLowerCase().trim();
  const timestamp = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const targetEmail = (user.email || details.email || "").toLowerCase().trim();
  const targetName = user.name || details.name || details.employeeName || "Team Member";

  const actorName =
    typeof actor === "string"
      ? actor
      : actor?.name || actor?.email || "HR/Admin";

  const config = ACTION_CONFIGS[action] || {
    heading: (u, d) => `System Action: ${action}`,
    badgeVariant: "info",
    actionBadge: "System Notice",
    userDesc: (u, d) => `Hello ${u.name || 'User'}, an update occurred on your HRMSPro account (${action}).`,
    adminDesc: (u, d) => `System action ${action} executed for ${u.name || d.email || 'target'}.`,
  };

  const badgeVariant =
    typeof config.badgeVariant === "function"
      ? config.badgeVariant({ name: targetName, email: targetEmail }, details)
      : config.badgeVariant;

  const heading = config.heading({ name: targetName, email: targetEmail }, details);
  const userDesc = config.userDesc({ name: targetName, email: targetEmail }, details);
  const adminDesc = config.adminDesc({ name: targetName, email: targetEmail }, details);
  const actionBadge = config.actionBadge;

  // Affected user notification
  if (targetEmail) {
    sendEmail({
      to: targetEmail,
      subject: `HRMSPro: ${heading}`,
      html: renderGenericNotificationEmail({
        actionBadge,
        badgeVariant,
        heading,
        description: userDesc,
        detailsMap: details,
        isAdminNotice: false,
        actorName,
        timestamp,
      }),
    }).catch((err) => console.error(`[Mailer] User notification error (${action}):`, err));
  }

  // Admin audit log email — skip if admin IS the affected target user (prevent duplicates)
  if (adminEmail && adminEmail !== targetEmail) {
    sendEmail({
      to: adminEmail,
      subject: `HRMSPro Audit: ${heading}`,
      html: renderGenericNotificationEmail({
        actionBadge: "Admin Audit Trail",
        badgeVariant,
        heading: `Audit: ${heading}`,
        description: adminDesc,
        detailsMap: { Actor: actorName, Target: `${targetName} (${targetEmail || 'N/A'})`, ...details },
        isAdminNotice: true,
        actorName,
        timestamp,
      }),
    }).catch((err) => console.error(`[Mailer] Admin audit notification error (${action}):`, err));
  }
};

