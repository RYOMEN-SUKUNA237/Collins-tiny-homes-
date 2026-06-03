import nodemailer from 'nodemailer';

// Configuration
const SMTP_USER = process.env.SMTP_USER || 'collinstinyhomes@gmail.com';
// Clean up spaces in app password if any
const SMTP_PASS = (process.env.SMTP_PASS || 'xiof ufgi inwo pagt').replace(/\s+/g, '');
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * General helper to send an email to the admin
 */
export async function sendAdminEmailNotification(subject: string, htmlContent: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Collins Tiny Homes" <${SMTP_USER}>`,
      to: SMTP_USER, // notify the admin
      subject: `[Notification] ${subject}`,
      html: htmlContent,
    });
    console.log('Admin notification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return false;
  }
}

/**
 * Notify admin of a new client inquiry
 */
export async function notifyInquiryCreated(inquiry: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  inquiry_type: string;
  finance_plan?: string | null;
  finance_down_payment?: number | null;
  finance_monthly_total?: number | null;
  finance_term_months?: number | null;
}) {
  const subject = `New Inquiry from ${inquiry.name} (${inquiry.inquiry_type})`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fafaf9;">
      <h2 style="color: #4b634c; font-family: serif; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">New Client Inquiry</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568; width: 140px;">Name:</td>
          <td style="padding: 8px 0; color: #1a202c;">${inquiry.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Email:</td>
          <td style="padding: 8px 0; color: #1a202c;"><a href="mailto:${inquiry.email}" style="color: #4b634c; text-decoration: none;">${inquiry.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Phone:</td>
          <td style="padding: 8px 0; color: #1a202c;">${inquiry.phone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Inquiry Type:</td>
          <td style="padding: 8px 0; color: #1a202c; text-transform: uppercase; font-weight: 600;">${inquiry.inquiry_type}</td>
        </tr>
      </table>

      ${inquiry.finance_plan ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px; border: 1px solid #cbd5e1;">
        <h4 style="margin: 0 0 10px 0; color: #334155;">Financial Configuration</h4>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="font-weight: bold; color: #64748b;">Plan Selected:</td>
            <td style="color: #334155; text-transform: uppercase;">${inquiry.finance_plan}</td>
          </tr>
          ${inquiry.finance_down_payment !== undefined && inquiry.finance_down_payment !== null ? `
          <tr>
            <td style="font-weight: bold; color: #64748b;">Down Payment:</td>
            <td style="color: #334155; font-family: monospace;">$${inquiry.finance_down_payment.toLocaleString()}</td>
          </tr>` : ''}
          ${inquiry.finance_monthly_total !== undefined && inquiry.finance_monthly_total !== null ? `
          <tr>
            <td style="font-weight: bold; color: #64748b;">Monthly Payment:</td>
            <td style="color: #334155; font-family: monospace;">$${inquiry.finance_monthly_total.toLocaleString()}</td>
          </tr>` : ''}
          ${inquiry.finance_term_months !== undefined && inquiry.finance_term_months !== null ? `
          <tr>
            <td style="font-weight: bold; color: #64748b;">Term Length:</td>
            <td style="color: #334155;">${inquiry.finance_term_months} Months</td>
          </tr>` : ''}
        </table>
      </div>` : ''}

      <div style="margin-top: 20px;">
        <h3 style="color: #4a5568; font-size: 16px; margin-bottom: 8px;">Message:</h3>
        <div style="padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; color: #2d3748; line-height: 1.5; white-space: pre-wrap;">${inquiry.message}</div>
      </div>
      
      <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #718096; text-align: center;">
        This notification was generated automatically by Collins Tiny Homes.
      </div>
    </div>
  `;
  return sendAdminEmailNotification(subject, html);
}

/**
 * Notify admin of a payment (success/failed)
 */
export async function notifyPaymentProcessed(payment: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  amount: number;
  payment_type: string;
  status: string;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_country?: string | null;
  shipping_zip?: string | null;
}) {
  const isSuccess = payment.status === 'success';
  const statusLabel = isSuccess ? 'SUCCESS' : 'DECLINED';
  const statusColor = isSuccess ? '#16a34a' : '#dc2626';
  
  const subject = `Payment ${statusLabel}: $${payment.amount.toLocaleString()} from ${payment.customer_name}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fafaf9;">
      <h2 style="color: #4b634c; font-family: serif; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Payment Transaction Registered</h2>
      
      <div style="margin: 20px 0; padding: 15px; border-radius: 8px; background-color: ${isSuccess ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}; text-align: center;">
        <span style="font-size: 13px; font-weight: bold; color: ${isSuccess ? '#166534' : '#991b1b'}; text-transform: uppercase; tracking-wider;">Transaction Status</span>
        <div style="font-size: 32px; font-weight: 800; color: ${statusColor}; margin-top: 5px;">${statusLabel}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568; width: 140px;">Customer Name:</td>
          <td style="padding: 8px 0; color: #1a202c;">${payment.customer_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Email:</td>
          <td style="padding: 8px 0; color: #1a202c;"><a href="mailto:${payment.customer_email}" style="color: #4b634c; text-decoration: none;">${payment.customer_email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Phone:</td>
          <td style="padding: 8px 0; color: #1a202c;">${payment.customer_phone || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Amount:</td>
          <td style="padding: 8px 0; color: #1a202c; font-weight: 600; font-family: monospace; font-size: 16px;">$${payment.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Payment Type:</td>
          <td style="padding: 8px 0; color: #1a202c; text-transform: uppercase;">${payment.payment_type.replace(/_/g, ' ')}</td>
        </tr>
      </table>

      ${payment.shipping_address ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 10px 0; color: #475569;">Delivery Information</h4>
        <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5;">
          ${payment.shipping_address}<br/>
          ${payment.shipping_city || ''}, ${payment.shipping_state || ''} ${payment.shipping_zip || ''}<br/>
          ${payment.shipping_country || ''}
        </p>
      </div>` : ''}

      <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #718096; text-align: center;">
        This notification was generated automatically by Collins Tiny Homes.
      </div>
    </div>
  `;
  return sendAdminEmailNotification(subject, html);
}

/**
 * Notify admin of a new support message or conversation
 */
export async function notifySupportMessageCreated(conversation: {
  visitor_name: string;
  visitor_email?: string | null;
  subject: string;
}, message: {
  sender_type: string;
  sender_name: string;
  body: string;
}) {
  // Only notify on visitor messages
  if (message.sender_type !== 'visitor') return;

  const subject = `New Support Message from ${conversation.visitor_name}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fafaf9;">
      <h2 style="color: #4b634c; font-family: serif; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">Support Chat Alert</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568; width: 140px;">Visitor Name:</td>
          <td style="padding: 8px 0; color: #1a202c;">${conversation.visitor_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Email:</td>
          <td style="padding: 8px 0; color: #1a202c;">
            ${conversation.visitor_email ? `<a href="mailto:${conversation.visitor_email}" style="color: #4b634c; text-decoration: none;">${conversation.visitor_email}</a>` : 'Not provided'}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4a5568;">Subject:</td>
          <td style="padding: 8px 0; color: #1a202c;">${conversation.subject}</td>
        </tr>
      </table>

      <div style="margin-top: 20px;">
        <h3 style="color: #4a5568; font-size: 16px; margin-bottom: 8px;">Message Content:</h3>
        <div style="padding: 15px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; color: #2d3748; line-height: 1.5; white-space: pre-wrap;">${message.body}</div>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/support" style="display: inline-block; background-color: #4b634c; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Open Support Admin Panel</a>
      </div>

      <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #718096; text-align: center;">
        This notification was generated automatically by Collins Tiny Homes.
      </div>
    </div>
  `;
  return sendAdminEmailNotification(subject, html);
}
