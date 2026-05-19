import nodemailer from 'nodemailer';
import { getVerificationTemplate, getPasswordResetTemplate } from '../../utils/mail.template.js';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const email = process.env.NODEMAILER_EMAIL;
    const password = process.env.NODEMAILER_PASSWORD;

    if (email && password) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: email,
          pass: password,
        },
      });
    }
  }

  /**
   * Send verification OTP email
   */
  public sendVerificationOtp = async (to: string, otp: string, fullName: string): Promise<void> => {
    if (!this.transporter) {
      console.log('\n======================================================');
      console.log(`[LOCAL DEV MAIL FALLBACK]`);
      console.log(`To: ${to}`);
      console.log(`Subject: [Seoul Blanc] Xác thực tài khoản của bạn`);
      console.log(`OTP Code: ${otp}`);
      console.log('======================================================\n');
      return;
    }

    const htmlContent = getVerificationTemplate(otp, fullName);

    try {
      await this.transporter.sendMail({
        from: `"Seoul Blanc" <${process.env.NODEMAILER_EMAIL}>`,
        to,
        subject: '[Seoul Blanc] Xác thực tài khoản của bạn',
        html: htmlContent,
      });
      console.log(`Verification email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Failed to send verification email to ${to}:`, error);
    }
  };

  /**
   * Send password reset OTP email
   */
  public sendPasswordResetOtp = async (
    to: string,
    otp: string,
    fullName: string
  ): Promise<void> => {
    if (!this.transporter) {
      console.log('\n======================================================');
      console.log(`[LOCAL DEV MAIL FALLBACK]`);
      console.log(`To: ${to}`);
      console.log(`Subject: [Seoul Blanc] Yêu cầu đặt lại mật khẩu`);
      console.log(`OTP Code: ${otp}`);
      console.log('======================================================\n');
      return;
    }

    const htmlContent = getPasswordResetTemplate(otp, fullName);

    try {
      await this.transporter.sendMail({
        from: `"Seoul Blanc" <${process.env.NODEMAILER_EMAIL}>`,
        to,
        subject: '[Seoul Blanc] Yêu cầu đặt lại mật khẩu',
        html: htmlContent,
      });
      console.log(`Password reset email sent successfully to ${to}`);
    } catch (error) {
      console.error(`Failed to send password reset email to ${to}:`, error);
    }
  };
}
