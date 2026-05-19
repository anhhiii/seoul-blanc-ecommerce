/**
 * Korean Minimalist style email HTML templates
 */

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seoul Blanc</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #faf9f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #2b2b2b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #faf9f6;
      padding: 40px 0;
    }
    .container {
      max-width: 500px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e0d8;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(43, 43, 43, 0.02);
    }
    .header {
      padding: 30px 40px 20px 40px;
      text-align: center;
      border-bottom: 1px solid #faf9f6;
    }
    .logo {
      font-size: 20px;
      font-weight: 300;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #1a1a1a;
      text-decoration: none;
      font-family: "Didot", "Bodoni MT", "Cinzel", serif;
    }
    .content {
      padding: 40px 40px 30px 40px;
      line-height: 1.6;
      font-size: 14px;
      font-weight: 300;
      color: #4a4a4a;
    }
    .greeting {
      font-size: 16px;
      font-weight: 400;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    .otp-container {
      margin: 30px 0;
      padding: 20px;
      background-color: #f7f5f0;
      border-radius: 4px;
      text-align: center;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 300;
      letter-spacing: 8px;
      color: #1a1a1a;
      margin: 0;
      padding-left: 8px; /* offset letter-spacing */
    }
    .footer {
      padding: 20px 40px 40px 40px;
      text-align: center;
      font-size: 11px;
      color: #8c8c8c;
      font-weight: 300;
      border-top: 1px solid #faf9f6;
      letter-spacing: 0.5px;
    }
    .footer-links {
      margin-bottom: 15px;
    }
    .footer-links a {
      color: #8c8c8c;
      text-decoration: none;
      margin: 0 10px;
    }
    .highlight {
      font-weight: 400;
      color: #1a1a1a;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="#" class="logo">SEOUL BLANC</a>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <div class="footer-links">
          <a href="#">Shop</a>
          <a href="#">Support</a>
          <a href="#">Privacy</a>
        </div>
        <p>&copy; ${new Date().getFullYear()} Seoul Blanc. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getVerificationTemplate = (otp: string, fullName: string) => {
  const content = `
    <h2 class="greeting">안녕하세요 (Hello), ${fullName}</h2>
    <p>Cảm ơn bạn đã đăng ký tài khoản tại <span class="highlight">Seoul Blanc</span> - Thương hiệu thời trang tối giản Hàn Quốc.</p>
    <p>Dưới đây là mã OTP xác thực tài khoản của bạn. Mã này có hiệu lực trong vòng <span class="highlight">5 phút</span>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
    
    <div class="otp-container">
      <h1 class="otp-code">${otp}</h1>
    </div>
    
    <p>Nếu bạn không thực hiện đăng ký tài khoản trên hệ thống của chúng tôi, bạn có thể an tâm bỏ qua email này.</p>
    <p>Trân trọng,<br>Đội ngũ Seoul Blanc</p>
  `;
  return baseTemplate(content);
};

export const getPasswordResetTemplate = (otp: string, fullName: string) => {
  const content = `
    <h2 class="greeting">안녕하세요 (Hello), ${fullName}</h2>
    <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản <span class="highlight">Seoul Blanc</span> của bạn.</p>
    <p>Dưới đây là mã OTP để đặt lại mật khẩu. Mã này có hiệu lực trong vòng <span class="highlight">5 phút</span>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
    
    <div class="otp-container">
      <h1 class="otp-code">${otp}</h1>
    </div>
    
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ bộ phận hỗ trợ ngay lập tức để bảo vệ tài khoản.</p>
    <p>Trân trọng,<br>Đội ngũ Seoul Blanc</p>
  `;
  return baseTemplate(content);
};
