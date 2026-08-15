import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<string>('SMTP_PORT')) || 465;
    const secure = port === 465;
    const user =
      this.configService.get<string>('SMTP_USER') ||
      this.configService.get<string>('GMAIL_USER');
    const pass =
      this.configService.get<string>('SMTP_PASS') ||
      this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      this.logger.log(`📧 [EmailService] SMTP Transporter configured for: ${user} (${host}:${port})`);
    } else {
      this.logger.warn(
        `⚠️ [EmailService] No SMTP credentials found (SMTP_USER / SMTP_PASS in backend/.env). Please configure your Gmail App Password or SMTP credentials in backend/.env.`,
      );
      // Fallback transport configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
      });
    }
  }

  /**
   * Send real 6-digit OTP verification code to user's email inbox
   */
  async sendOtpEmail(
    toEmail: string,
    otpCode: string,
    recipientName?: string,
    role?: string,
  ): Promise<{ sent: boolean; messageId?: string; info?: string }> {
    const fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      '"PeriX Platform" <no-reply@perix.in>';

    const roleName = role ? role.toUpperCase() : 'USER';
    const displayName = recipientName ? recipientName.trim() : 'Valued Partner';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PeriX Email Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #E2E8F0; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F766E 0%, #047857 50%, #065F46 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                🥦 PeriX Network
              </h1>
              <p style="margin: 6px 0 0 0; color: #A7F3D0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                Perishable Agro Supply Chain & Price Intelligence
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 20px; font-weight: 700;">
                Verify Your Email Address
              </h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Hello <strong>${displayName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Thank you for joining the <strong>PeriX Network</strong> as a <strong>${roleName}</strong>. Please enter the 6-digit verification code below to verify your email and activate your live dashboard:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #F0FDF4; border: 2px dashed #059669; border-radius: 12px; padding: 24px 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                      Your One-Time Verification Code
                    </div>
                    <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #064E3B; font-family: 'Courier New', Courier, monospace; margin: 4px 0;">
                      ${otpCode}
                    </div>
                    <div style="font-size: 13px; color: #065F46; margin-top: 8px;">
                      ⏱️ Valid for <strong>10 minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #64748B; font-size: 13px; line-height: 1.5;">
                🔒 <strong>Security Warning:</strong> Never share this OTP with anyone. PeriX representatives will never ask for your verification code or password.
              </p>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #94A3B8; font-size: 12px; line-height: 1.5;">
                If you did not request this verification email, please safely disregard it.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0; color: #64748B; font-size: 12px;">
                © 2026 PeriX Agro-Tech Systems. Connected with Government of India Agmarknet live data.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const textContent = `
PeriX Email Verification Code

Hello ${displayName},

Your 6-digit verification code to activate your PeriX account (${roleName}) is:

>>> ${otpCode} <<<

This code is valid for 10 minutes. Please do not share it with anyone.

© 2026 PeriX Agro-Tech Systems
`;

    try {
      if (!this.transporter) {
        this.initTransporter();
      }

      if (!this.transporter) {
        throw new Error('SMTP transporter failed to initialize');
      }

      this.logger.log(`📤 [EmailService] Dispatching OTP email to: ${toEmail}`);

      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[PeriX] Your 6-Digit Email Verification Code: ${otpCode}`,
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`✅ [EmailService] Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err: any) {
      this.logger.error(`❌ [EmailService] Failed to send email to ${toEmail}: ${err.message}`);
      return { sent: false, info: err.message };
    }
  }
}
