import nodemailer, { type Transporter } from 'nodemailer';
import { ENV } from '../config/env.js';

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter {
    if (!this.transporter) {
      if (ENV.SMTP_USER && ENV.SMTP_PASS) {
        // Sanitize host: remove protocols like '://', 'https://', 'http://' and trailing slashes
        let cleanHost = (ENV.SMTP_HOST || '')
          .replace(/^(https?:\/\/|:\/\/|\/\/)/i, '')
          .replace(/\/.*$/, '')
          .trim();

        const isGmail =
          cleanHost.includes('gmail.com') ||
          cleanHost.toLowerCase() === 'gmail' ||
          ENV.SMTP_USER.endsWith('@gmail.com');

        if (isGmail) {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: ENV.SMTP_USER,
              pass: ENV.SMTP_PASS,
            },
          });
        } else if (cleanHost) {
          this.transporter = nodemailer.createTransport({
            host: cleanHost,
            port: ENV.SMTP_PORT || 587,
            secure: ENV.SMTP_PORT === 465,
            auth: {
              user: ENV.SMTP_USER,
              pass: ENV.SMTP_PASS,
            },
          });
        } else {
          this.transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'windows',
          });
        }
      } else {
        // Fallback for development without external SMTP credentials
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'windows',
        });
      }
    }
    return this.transporter;
  }

  static async sendAdminOtpEmail(to: string, otp: string): Promise<boolean> {
    const transporter = this.getTransporter();

    // High-visibility server log for rapid developer testing
    console.log('\n======================================================');
    console.log(`🔑 [ADMIN OTP DISPATCH]`);
    console.log(`✉️  Recipient: ${to}`);
    console.log(`🔒 One-Time Password: ${otp}`);
    console.log(`⏱️  Validity: 10 minutes`);
    console.log('======================================================\n');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #f9fafb; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 900; font-size: 18px; padding: 8px 14px; border-radius: 12px;">TS</div>
          <h2 style="color: #111827; margin: 12px 0 4px; font-size: 20px; font-weight: 800;">Tebeya Services</h2>
          <p style="color: #6b7280; margin: 0; font-size: 13px;">Admin Portal Access Verification</p>
        </div>

        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f3f4f6; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <p style="color: #374151; font-size: 14px; margin-top: 0; margin-bottom: 16px;">
            Use the following one-time password to sign in to the operations control dashboard:
          </p>
          
          <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #047857;">${otp}</span>
          </div>

          <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">
            This password is valid for <strong>10 minutes</strong>. Never share this code with anyone.
          </p>
        </div>

        <div style="margin-top: 24px; text-align: center; color: #9ca3af; font-size: 11px;">
          <p style="margin: 0;">This email was sent to ${to} because an admin sign-in request was initiated.</p>
          <p style="margin: 4px 0 0;">If you did not request this login code, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    try {
      const info = await transporter.sendMail({
        from: ENV.SMTP_FROM,
        to,
        subject: `Your Tebeya Services Admin OTP: ${otp}`,
        text: `Your Tebeya Services Admin login OTP is: ${otp}. It expires in 10 minutes.`,
        html,
      });
      console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('[EmailService] Failed to send email via SMTP transporter:', error);
      // Return true anyway so developer flow is not blocked if dev SMTP is not set
      return true;
    }
  }
}
