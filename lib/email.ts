import nodemailer from 'nodemailer';

// Helper to create a transporter using Gmail OAuth2 or Ethereal (fallback)
const getTransporter = async () => {
  // 1. If we have real Gmail OAuth2 credentials, use them
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.EMAIL_USER
  ) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });
  }

  // 2. Fallback to Ethereal (Mock) for development if no real credentials
  console.warn('⚠️ No Gmail OAuth2 credentials found. Falling back to Ethereal Email.');
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER ? `Issue Tracker <${process.env.EMAIL_USER}>` : '"Issue Tracker" <no-reply@issuetracker.com>',
      to,
      subject,
      html,
    });

    console.log('📧 Email sent: %s', info.messageId);

    // If using Ethereal, log the preview URL
    if (info.messageId && !process.env.GOOGLE_CLIENT_ID) {
      console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
};

export const sendIssueAssignedEmail = async (
  staffEmail: string,
  staffName: string,
  issueTitle: string,
  issueId: string,
  issueDescription: string,
  issuePriority: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #111827; margin-top: 0;">New Issue Assignment</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello <strong>${staffName}</strong>,</p>
        <p style="color: #4b5563; font-size: 16px;">A new issue has been assigned to you.</p>
        
        <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 6px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-weight: bold; color: #1f2937;">${issueTitle}</p>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">ID: ${issueId}</p>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
             <p style="margin: 0; color: #4b5563;"><strong>Priority:</strong> ${issuePriority}</p>
             <p style="margin: 8px 0 0 0; color: #4b5563;"><strong>Description:</strong></p>
             <p style="margin: 4px 0 0 0; color: #6b7280;">${issueDescription}</p>
          </div>
        </div>

        <p style="color: #4b5563; font-size: 16px;">Please log in to the Team Dashboard to review and address this issue.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">Issue Tracking Portal System</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: staffEmail,
    subject: `[Assigned] ${issueTitle}`,
    html,
  });
};

export const sendIssueAssignedToReporterEmail = async (
  reporterEmail: string,
  reporterName: string,
  issueTitle: string,
  staffName: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #111827; margin-top: 0;">Issue Assigned</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello <strong>${reporterName}</strong>,</p>
        <p style="color: #4b5563; font-size: 16px;">Your reported issue "<strong>${issueTitle}</strong>" has been successfully assigned to a technical staff member.</p>
        
        <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #1f2937;">Assigned To: <strong>${staffName}</strong></p>
          <p style="margin: 8px 0 0 0; color: #047857; font-size: 14px;">They will review your issue shortly.</p>
        </div>

        <p style="color: #4b5563; font-size: 16px;">You will receive further updates as the issue status changes.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">Issue Tracking Portal System</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: reporterEmail,
    subject: `[Update] Your issue has been assigned`,
    html,
  });
};

export const sendStatusUpdateEmail = async (
  clientEmail: string,
  clientName: string,
  issueTitle: string,
  newStatus: string
) => {
  const statusColors: Record<string, string> = {
    'Open': '#ef4444', // Red
    'In Progress': '#f59e0b', // Amber
    'Resolved': '#10b981', // Emerald
    'Closed': '#6b7280', // Gray
  };
  const color = statusColors[newStatus] || '#3b82f6';

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #111827; margin-top: 0;">Issue Status Update</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello <strong>${clientName}</strong>,</p>
        <p style="color: #4b5563; font-size: 16px;">The status of your issue has been updated.</p>
        
        <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 6px;">
          <p style="margin: 0; font-weight: bold; color: #1f2937;">Issue: ${issueTitle}</p>
          <p style="margin: 12px 0 0 0; font-size: 16px;">
            New Status: <span style="color: ${color}; font-weight: bold;">${newStatus}</span>
          </p>
        </div>

        <p style="color: #4b5563; font-size: 16px;">You can view detailed comments and history in your dashboard.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">Issue Tracking Portal System</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `[Update] ${issueTitle} is now ${newStatus}`,
    html,
  });
};
