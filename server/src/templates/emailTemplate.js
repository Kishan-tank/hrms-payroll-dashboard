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

/** Welcome / Account Created Email Template */
export const renderAccountCreatedEmail = ({ name, email, tempPassword }) => {
  const passwordSection = tempPassword
    ? `
      <div class="otp-box" style="text-align: left;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0;">Temporary Login Password:</p>
        <p style="font-family: monospace; font-size: 20px; font-weight: bold; color: #34d399; margin: 0; word-break: break-all;">${tempPassword}</p>
      </div>
      <p style="color: #fbbf24; font-size: 12px;">⚠️ Please change your password after logging in for security.</p>
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

/** Role Update Email Template */
export const renderRoleUpdatedEmail = ({ name, newRole }) => {
  const displayRole = newRole === "hr-manager" ? "HR Manager" : newRole === "admin" ? "System Admin" : "Employee";
  const bodyHtml = `
    <div>
      <span class="badge badge-warning">Role Updated</span>
      <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Account Role Notice</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Hello <strong>${name}</strong>, your account permissions in <strong>HRMSPro</strong> have been updated by an administrator.
      </p>

      <div class="otp-box" style="text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0;">New Account Role:</p>
        <p style="font-size: 22px; font-weight: bold; color: #60a5fa; margin: 0;">${displayRole}</p>
      </div>

      <p style="color: #94a3b8; font-size: 13px;">
        Your dashboard navigation and workspace access permissions have been adjusted accordingly.
      </p>
    </div>
  `;
  return renderEmailWrapper({ title: "HRMSPro Account Role Updated", bodyHtml });
};

/** Account Deactivation Email Template */
export const renderAccountDeactivatedEmail = ({ name }) => {
  const bodyHtml = `
    <div>
      <span class="badge badge-danger">Access Revoked</span>
      <h2 style="color: #ffffff; margin-top: 12px; font-size: 20px;">Account Status Notice</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Hello <strong>${name}</strong>, your account access for <strong>HRMSPro</strong> has been revoked by an administrator.
      </p>

      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="color: #f87171; font-size: 13px; margin: 0;">
          Your account status is now set to <strong>Inactive</strong> and active sessions have been terminated.
        </p>
      </div>

      <p style="color: #64748b; font-size: 12px;">
        If you believe this is an error, please contact your organization's HR department or administrator.
      </p>
    </div>
  `;
  return renderEmailWrapper({ title: "HRMSPro Account Access Revoked", bodyHtml });
};
