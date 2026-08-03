/**
 * Shared HTML email wrapper for HRMSPro notifications and OTP authentication.
 */
const renderEmailWrapper = ({ title, bodyHtml }) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #020817;
          color: #e2e8f0;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          padding: 28px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p {
          margin: 4px 0 0 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .content {
          padding: 32px 28px;
          background-color: #0f172a;
        }
        .otp-box {
          background: #020817;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          margin: 24px 0;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #60a5fa;
          margin: 0;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .badge-info { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
        .badge-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px 28px;
          text-align: center;
          background: #090e1a;
          color: #64748b;
          font-size: 12px;
        }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HRMS<span style="color: #60a5fa;">Pro</span></h1>
          <p>Enterprise HR & Payroll Automation</p>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} HRMSPro Suite. All rights reserved.</p>
          <p>Automated system email • Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/** Account Verification OTP Email Template (15 min expiry) */
export const renderAccountVerificationEmail = (otpCode, expiresMinutes = 15) => {
  const bodyHtml = `
    <div style="text-align: center;">
      <span class="badge badge-info">Account Email Verification</span>
      <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Verify Your HRMSPro Account</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Welcome to <strong>HRMSPro</strong>! Please use the 6-digit verification code below to verify your email address before logging in.
      </p>
      
      <div class="otp-box">
        <p class="otp-code">${otpCode}</p>
        <p style="color: #64748b; font-size: 11px; margin-top: 8px;">Valid for ${expiresMinutes} minutes</p>
      </div>

      <p style="color: #64748b; font-size: 12px;">
        If you did not request this account, please ignore this email or contact support.
      </p>
    </div>
  `;
  return renderEmailWrapper({ title: "HRMSPro: Verify your account", bodyHtml });
};

/** OTP Verification Email Template */
export const renderOtpEmail = (otpCode, expiresMinutes = 5) => {
  const bodyHtml = `
    <div style="text-align: center;">
      <span class="badge badge-info">2FA Authentication Required</span>
      <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Your Login Verification Code</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Please enter the 6-digit verification code below to complete your login to <strong>HRMSPro</strong>.
      </p>
      
      <div class="otp-box">
        <p class="otp-code">${otpCode}</p>
        <p style="color: #64748b; font-size: 11px; margin-top: 8px;">Valid for ${expiresMinutes} minutes</p>
      </div>

      <p style="color: #64748b; font-size: 12px;">
        If you did not initiate this login request, please change your password immediately or notify your system administrator.
      </p>
    </div>
  `;
  return renderEmailWrapper({ title: "HRMSPro Login Verification Code", bodyHtml });
};

/** Password Reset OTP Email Template (10 min expiry) */
export const renderPasswordResetOtpEmail = (otpCode, expiresMinutes = 10) => {
  const bodyHtml = `
    <div style="text-align: center;">
      <span class="badge badge-warning">Password Reset Request</span>
      <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Reset Your Password</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        We received a request to reset the password for your <strong>HRMSPro</strong> account. Use the code below to proceed.
      </p>
      
      <div class="otp-box">
        <p class="otp-code">${otpCode}</p>
        <p style="color: #64748b; font-size: 11px; margin-top: 8px;">Valid for ${expiresMinutes} minutes · Single use</p>
      </div>

      <p style="color: #64748b; font-size: 12px;">
        If you did <strong>not</strong> request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </p>
    </div>
  `;
  return renderEmailWrapper({ title: "HRMSPro: Reset your password", bodyHtml });
};

/** Password Successfully Changed Confirmation Email */
export const renderPasswordChangedEmail = (name) => {
  const bodyHtml = `
    <div>
      <span class="badge badge-success">Password Changed</span>
      <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Your password was changed</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Hi <strong>${name || 'there'}</strong>, your <strong>HRMSPro</strong> account password was successfully reset on ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.
      </p>
      <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
        <p style="color: #34d399; font-size: 14px; font-weight: 700; margin: 0;">✓ Password updated successfully</p>
      </div>
      <p style="color: #64748b; font-size: 12px;">
        If you did not make this change, please contact your HR administrator immediately or use the Forgot Password flow to regain access.
      </p>
    </div>
  `;
  return renderEmailWrapper({ title: "HRMSPro: Your password was changed", bodyHtml });
};



/** Welcome / Account Created Email Template */
export const renderAccountCreatedEmail = ({ name, email, tempPassword }) => {
  const passwordSection = tempPassword
    ? `
      <div class="otp-box" style="text-align: left;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0;">Temporary Login Password:</p>
        <p style="font-family: monospace; font-size: 20px; font-weight: bold; color: #34d399; margin: 0; word-break: break-all;">${tempPassword}</p>
      </div>
      <p style="color: #fbbf24; font-size: 12px;">⚠️ Please verify your account and change your password after logging in.</p>
    `
    : `
      <p style="color: #94a3b8; font-size: 14px;">Please contact your administrator or use the forgot password flow to set your account password.</p>
    `;

  const bodyHtml = `
    <div>
      <span class="badge badge-success">Account Created</span>
      <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Welcome to HRMSPro, ${name}!</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        An administrator has created an account for you on the <strong>HRMSPro Enterprise Portal</strong>.
      </p>

      <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Email:</strong> ${email}</p>
      </div>

      ${passwordSection}

      <div style="margin-top: 28px; text-align: center;">
        <a href="http://localhost:5173/login" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-size: 14px;">Sign In to HRMSPro →</a>
      </div>
    </div>
  `;
  return renderEmailWrapper({ title: "Welcome to HRMSPro", bodyHtml });
};

/** Role Update Email Template (User & Admin copies) */
export const renderRoleUpdatedEmail = ({ name, oldRole, newRole, isAdminNotice = false, timestamp = new Date().toLocaleString() }) => {
  const displayOldRole = oldRole === "hr-manager" ? "HR Manager" : oldRole === "admin" ? "System Admin" : "Employee";
  const displayNewRole = newRole === "hr-manager" ? "HR Manager" : newRole === "admin" ? "System Admin" : "Employee";

  const title = isAdminNotice ? `HRMSPro Audit: Role changed for ${name}` : "HRMSPro: Your role was updated";

  const bodyHtml = isAdminNotice
    ? `
      <div>
        <span class="badge badge-info">Admin Audit Trail</span>
        <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">User Role Change Logged</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          You changed <strong>${name}</strong>'s role from <strong>${displayOldRole}</strong> to <strong>${displayNewRole}</strong> on <code>${timestamp}</code>.
        </p>
      </div>
    `
    : `
      <div>
        <span class="badge badge-warning">Role Updated</span>
        <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Account Role Notice</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          Hello <strong>${name}</strong>, your account role has been changed from <strong>${displayOldRole}</strong> to <strong>${displayNewRole}</strong>.
        </p>
        <div class="otp-box" style="text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0;">New Account Role:</p>
          <p style="font-size: 22px; font-weight: bold; color: #60a5fa; margin: 0;">${displayNewRole}</p>
        </div>
      </div>
    `;

  return renderEmailWrapper({ title, bodyHtml });
};

/** Leave Status Notification Email Template (Employee & Admin audit copies) */
export const renderLeaveStatusEmail = ({
  name,
  status,
  leaveType,
  dateRange,
  days,
  reason,
  isAdminNotice = false,
  actorName = "HR/Admin",
  timestamp = new Date().toLocaleString(),
}) => {
  const isApproved = status === "Approved";
  const statusLabel = isApproved ? "Approved" : "Rejected";
  const badgeClass = isApproved ? "badge-success" : "badge-danger";
  const statusColor = isApproved ? "#34d399" : "#f87171";

  const reasonSection = reason
    ? `<div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em;">Reason / Notes</p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">${reason}</p>
      </div>`
    : "";

  const title = isAdminNotice
    ? `HRMSPro Audit: Leave ${statusLabel} for ${name}`
    : `HRMSPro: Your Leave Request Has Been ${statusLabel}`;

  const bodyHtml = isAdminNotice
    ? `
      <div>
        <span class="badge badge-info">Admin Audit Trail</span>
        <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Leave Decision Logged</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          <strong>${actorName}</strong> <strong style="color: ${statusColor};">${statusLabel.toLowerCase()}</strong> <strong>${name}</strong>'s <strong>${leaveType}</strong> request on <code>${timestamp}</code>.
        </p>
        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Leave Type:</strong> ${leaveType}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Date(s):</strong> ${dateRange}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Decision:</strong> <span style="color: ${statusColor}; font-weight: 700;">${statusLabel}</span></p>
        </div>
        ${reasonSection}
      </div>
    `
    : `
      <div>
        <span class="badge ${badgeClass}">Leave ${statusLabel}</span>
        <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Your Leave Request Update</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          Hello <strong>${name}</strong>, your <strong>${leaveType}</strong> request has been <strong style="color: ${statusColor};">${statusLabel.toLowerCase()}</strong>.
        </p>
        <div class="otp-box" style="text-align: left;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.06em;">Request Details</p>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Leave Type:</strong> ${leaveType}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Date(s):</strong> ${dateRange}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Duration:</strong> ${days} day${days !== 1 ? "s" : ""}</p>
          <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 700; color: ${statusColor};">Status: ${statusLabel}</p>
        </div>
        ${reasonSection}
        <p style="color: #64748b; font-size: 12px; margin-top: 16px;">
          ${isApproved
            ? "Your leave has been approved. Please ensure your team is informed about your absence."
            : "If you have questions about this decision, please contact your HR department."}
        </p>
      </div>
    `;

  return renderEmailWrapper({ title, bodyHtml });
};

/** Account Deactivation Email Template (User & Admin copies) */
export const renderAccountDeactivatedEmail = ({ name, email, isAdminNotice = false, timestamp = new Date().toLocaleString() }) => {
  const title = isAdminNotice ? `HRMSPro Audit: Removed user ${name}` : "HRMSPro: Your account access was revoked";

  const bodyHtml = isAdminNotice
    ? `
      <div>
        <span class="badge badge-danger">Admin Audit Trail</span>
        <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">User Account Removal Logged</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          You removed user <strong>${name}</strong> (<code>${email}</code>) on <code>${timestamp}</code>.
        </p>
      </div>
    `
    : `
      <div>
        <span class="badge badge-danger">Access Revoked</span>
        <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Account Access Revoked</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          Hello <strong>${name}</strong>, your account access for <strong>HRMSPro</strong> has been revoked by an administrator.
        </p>
      </div>
    `;

  return renderEmailWrapper({ title, bodyHtml });
};
