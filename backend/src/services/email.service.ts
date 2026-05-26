import nodemailer from 'nodemailer';

export class EmailService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      return null;
    }

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

  static async sendEmail(to: string, subject: string, htmlContent: string) {
    const transporter = this.getTransporter();
    const sender = process.env.SMTP_FROM || '"Seoul Blanc" <noreply@seoulblanc.com>';

    if (!transporter) {
      console.log(`[MOCK EMAIL SENT TO ${to}]`);
      console.log(`Subject: ${subject}`);
      console.log(`Content Preview: ${htmlContent.substring(0, 300)}...`);
      return;
    }

    try {
      await transporter.sendMail({
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

  static async sendOrderConfirmation(to: string, orderCode: string, items: any[], totalPrice: number, address: string) {
    const itemsHtml = items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; font-size: 13px; color: #333;">${item.productName} (Màu: ${item.color}, Size: ${item.size})</td>
        <td style="padding: 10px 0; font-size: 13px; color: #333; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; font-size: 13px; color: #333; text-align: right;">${item.price.toLocaleString('vi-VN')}₫</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 12px; background-color: #faf8f5;">
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

    await this.sendEmail(to, `[Seoul Blanc] Xác nhận đơn hàng thành công #${orderCode}`, htmlContent);
  }

  static async sendShippingUpdate(to: string, orderCode: string) {
    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 12px; background-color: #faf8f5;">
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

    await this.sendEmail(to, `[Seoul Blanc] Đơn hàng #${orderCode} đang trên đường giao tới bạn`, htmlContent);
  }

  static async sendReturnUpdate(to: string, orderCode: string, isApproved: boolean) {
    const statusText = isApproved ? 'ĐÃ ĐƯỢC PHÊ DUYỆT' : 'ĐÃ BỊ TỪ CHỐI';
    const color = isApproved ? '#2f855a' : '#c53030';
    const detailText = isApproved
      ? 'Yêu cầu trả hàng hoàn tiền của bạn đã được Admin chấp nhận. Số tiền hoàn lại sẽ được xử lý trong thời gian sớm nhất.'
      : 'Yêu cầu trả hàng hoàn tiền của bạn đã bị từ chối do không đáp ứng đủ điều kiện chính sách đổi trả. Vui lòng liên hệ bộ phận hỗ trợ khách hàng để được giải đáp.';

    const htmlContent = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5dcd3; border-radius: 12px; background-color: #faf8f5;">
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

    await this.sendEmail(to, `[Seoul Blanc] Cập nhật yêu cầu trả hàng đơn hàng #${orderCode}`, htmlContent);
  }
}
