import nodemailer, { Transporter } from 'nodemailer';
import { getVerificationTemplate, getPasswordResetTemplate } from '../../utils/mail.template.js';

export interface OrderEmailItem {
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

/**
 * Interface defining the contract for email services (Dependency Inversion Principle)
 */
export interface IEmailService {
  sendEmail(to: string, subject: string, htmlContent: string): Promise<void>;
  sendVerificationOtp(to: string, otp: string, fullName: string): Promise<void>;
  sendPasswordResetOtp(to: string, otp: string, fullName: string): Promise<void>;
  sendOrderConfirmation(
    to: string,
    orderCode: string,
    items: OrderEmailItem[],
    totalPrice: number,
    address: string
  ): Promise<void>;
  sendShippingUpdate(to: string, orderCode: string): Promise<void>;
  sendReturnUpdate(to: string, orderCode: string, isApproved: boolean): Promise<void>;
}

export class EmailService implements IEmailService {
  private static instance: EmailService | null = null;
  private transporter: Transporter | null = null;

  constructor() {
    this.transporter = this.initTransporter();
  }

  /**
   * Singleton accessor for convenient static access while preserving OOP instance architecture
   */
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Encapsulated transporter initialization
   */
  private initTransporter(): Transporter | null {
    // 1. Prefer Gmail App Password configured in NODEMAILER_EMAIL & NODEMAILER_PASSWORD
    const nodemailerEmail = process.env.NODEMAILER_EMAIL;
    const nodemailerPass = process.env.NODEMAILER_PASSWORD;

    if (nodemailerEmail && nodemailerPass) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: nodemailerEmail,
          pass: nodemailerPass,
        },
      });
    }

    // 2. Fallback to generic SMTP configuration if provided
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass && host) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    }

    return null;
  }

  /**
   * Core sendEmail implementation
   */
  public async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    const sender =
      process.env.SMTP_FROM ||
      `"Seoul Blanc" <${process.env.NODEMAILER_EMAIL || 'noreply@seoulblanc.com'}>`;

    if (!this.transporter) {
      console.log(`\n======================================================`);
      console.log(`[LOCAL DEV EMAIL FALLBACK] To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content Preview: ${htmlContent.substring(0, 200)}...`);
      console.log(`======================================================\n`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: sender,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`[EMAIL SENT TO ${to}] successfully.`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
    }
  }

  /**
   * Send verification OTP email
   */
  public async sendVerificationOtp(to: string, otp: string, fullName: string): Promise<void> {
    const htmlContent = getVerificationTemplate(otp, fullName);
    await this.sendEmail(to, '[Seoul Blanc] Xác thực tài khoản của bạn', htmlContent);
  }

  /**
   * Send password reset OTP email
   */
  public async sendPasswordResetOtp(to: string, otp: string, fullName: string): Promise<void> {
    const htmlContent = getPasswordResetTemplate(otp, fullName);
    await this.sendEmail(to, '[Seoul Blanc] Yêu cầu đặt lại mật khẩu', htmlContent);
  }

  /**
   * Send order confirmation email
   */
  public async sendOrderConfirmation(
    to: string,
    orderCode: string,
    items: OrderEmailItem[],
    totalPrice: number,
    address: string
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; font-size: 13px; color: #333;">${item.productName} (Màu: ${item.color}, Size: ${item.size})</td>
        <td style="padding: 10px 0; font-size: 13px; color: #333; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; font-size: 13px; color: #333; text-align: right;">${item.price.toLocaleString('vi-VN')}₫</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 12px; background-color: #faf8f5;">
        <h2 style="text-align: center; color: #2d241e; letter-spacing: 2px; text-transform: uppercase;">SEOUL BLANC</h2>
        <h3 style="text-align: center; color: #4a3e3d; font-weight: normal; margin-top: 0;">XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG</h3>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Cảm ơn bạn đã lựa chọn Seoul Blanc. Đơn hàng <strong>${orderCode}</strong> của bạn đã được tiếp nhận và đang chờ quản trị viên xác nhận giao hàng.
        </p>
        <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f0e6dd;">
          <h4 style="margin-top: 0; color: #2d241e; border-bottom: 1px solid #eee; padding-bottom: 8px;">Thông tin đơn hàng</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd;">
                <th style="text-align: left; padding-bottom: 8px; font-size: 12px; color: #777;">Sản phẩm</th>
                <th style="text-align: center; padding-bottom: 8px; font-size: 12px; color: #777; width: 60px;">SL</th>
                <th style="text-align: right; padding-bottom: 8px; font-size: 12px; color: #777; width: 100px;">Giá</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="margin-top: 15px; text-align: right; font-size: 14px; font-weight: bold; color: #2d241e;">
            Tổng cộng thanh toán: <span style="font-size: 16px; color: #a12c2c;">${totalPrice.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
        <div style="font-size: 12px; color: #777; line-height: 1.6;">
          <strong>Địa chỉ giao hàng:</strong> ${address}
        </div>
        <hr style="border: 0; border-top: 1px solid #e5dcd3; margin: 20px 0;" />
        <p style="font-size: 11px; color: #aaa; text-align: center; margin: 0;">
          Email này được gửi tự động. Vui lòng không phản hồi email này.
        </p>
      </div>
    `;

    await this.sendEmail(
      to,
      `[Seoul Blanc] Xác nhận đơn hàng thành công #${orderCode}`,
      htmlContent
    );
  }

  /**
   * Send shipping update email
   */
  public async sendShippingUpdate(to: string, orderCode: string): Promise<void> {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 12px; background-color: #faf8f5;">
        <h2 style="text-align: center; color: #2d241e; letter-spacing: 2px; text-transform: uppercase;">SEOUL BLANC</h2>
        <h3 style="text-align: center; color: #2c7a7b; font-weight: normal; margin-top: 0;">ĐƠN HÀNG ĐANG ĐƯỢC GIAO</h3>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Đơn hàng <strong>${orderCode}</strong> của bạn đã được đóng gói và bàn giao cho đơn vị vận chuyển. Bạn vui lòng chú ý điện thoại để nhận hàng từ shipper nhé!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/account/orders" style="background-color: #2d241e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            Theo dõi đơn hàng
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e5dcd3; margin: 20px 0;" />
        <p style="font-size: 11px; color: #aaa; text-align: center; margin: 0;">
          Email này được gửi tự động. Vui lòng không phản hồi email này.
        </p>
      </div>
    `;

    await this.sendEmail(
      to,
      `[Seoul Blanc] Đơn hàng #${orderCode} đang trên đường giao tới bạn`,
      htmlContent
    );
  }

  /**
   * Send return status update email
   */
  public async sendReturnUpdate(to: string, orderCode: string, isApproved: boolean): Promise<void> {
    const statusText = isApproved ? 'ĐÃ ĐƯỢC PHÊ DUYỆT' : 'ĐÃ BỊ TỪ CHỐI';
    const color = isApproved ? '#2f855a' : '#c53030';
    const detailText = isApproved
      ? 'Yêu cầu trả hàng hoàn tiền của bạn đã được Admin chấp nhận. Số tiền hoàn lại sẽ được xử lý trong thời gian sớm nhất.'
      : 'Yêu cầu trả hàng hoàn tiền của bạn đã bị từ chối do không đáp ứng đủ điều kiện chính sách đổi trả. Vui lòng liên hệ bộ phận hỗ trợ khách hàng để được giải đáp.';

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 12px; background-color: #faf8f5;">
        <h2 style="text-align: center; color: #2d241e; letter-spacing: 2px; text-transform: uppercase;">SEOUL BLANC</h2>
        <h3 style="text-align: center; color: ${color}; font-weight: normal; margin-top: 0;">KẾT QUẢ YÊU CẦU TRẢ HÀNG</h3>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Chào bạn, Seoul Blanc gửi thông báo về yêu cầu trả hàng/hoàn tiền của đơn hàng <strong>${orderCode}</strong>:
        </p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f0e6dd; text-align: center;">
          <span style="font-size: 16px; font-weight: bold; color: ${color}; display: block; margin-bottom: 10px;">${statusText}</span>
          <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">${detailText}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e5dcd3; margin: 20px 0;" />
        <p style="font-size: 11px; color: #aaa; text-align: center; margin: 0;">
          Email này được gửi tự động. Vui lòng không phản hồi email này.
        </p>
      </div>
    `;

    await this.sendEmail(
      to,
      `[Seoul Blanc] Cập nhật yêu cầu trả hàng đơn hàng #${orderCode}`,
      htmlContent
    );
  }

  // Static backwards-compatibility delegates
  public static async sendOrderConfirmation(
    to: string,
    orderCode: string,
    items: OrderEmailItem[],
    totalPrice: number,
    address: string
  ): Promise<void> {
    return EmailService.getInstance().sendOrderConfirmation(
      to,
      orderCode,
      items,
      totalPrice,
      address
    );
  }

  public static async sendShippingUpdate(to: string, orderCode: string): Promise<void> {
    return EmailService.getInstance().sendShippingUpdate(to, orderCode);
  }

  public static async sendReturnUpdate(
    to: string,
    orderCode: string,
    isApproved: boolean
  ): Promise<void> {
    return EmailService.getInstance().sendReturnUpdate(to, orderCode, isApproved);
  }
}

export default EmailService;
