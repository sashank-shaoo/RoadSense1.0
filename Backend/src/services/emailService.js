/**
 * Brevo Email Service using native fetch HTTP API
 */
class BrevoEmailService {
  constructor() {
    this.apiUrl = "https://api.brevo.com/v3/smtp/email";
  }

  getConfig(config) {
    return {
      apiKey: config.BREVO_API_KEY,
      fromEmail: config.FROM_EMAIL,
      fromName: config.EMAIL_FROM_NAME || "RodeSense",
    };
  }

  /**
   * Send email using Brevo HTTP API
   */
  async sendEmail({ to, subject, html, text = "" }, config) {
    const { apiKey, fromEmail, fromName } = this.getConfig(config);

    if (!apiKey) {
      console.error("BREVO_API_KEY is not configured in .env");
      return false;
    }

    const payload = {
      sender: {
        name: fromName,
        email: fromEmail,
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text,
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          `❌ Brevo API Error (HTTP ${response.status}):`,
          errorData,
        );
        return false;
      }

      console.log(`✅ Verification email sent successfully to ${to} via Brevo`);
      return true;
    } catch (error) {
      console.error(`❌ Brevo API Connection Error:`, error.message);
      return false;
    }
  }

  /**
   * Send OTP verification email
   */
  async sendOtpEmail(email, otp, name = "User", config) {
    const html = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; padding: 32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border: 2px solid #c62828; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="background-color: #111111; border-bottom: 5px solid #c62828; padding: 28px 32px; text-align: center;">
                  <div style="color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 1px;">RODESENSE</div>
                  <div style="color: #e5e5e5; font-size: 12px; letter-spacing: 2px; margin-top: 8px;">ACCOUNT SECURITY</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 36px 40px 28px; color: #222222;">
                  <h1 style="color: #111111; font-size: 25px; line-height: 1.3; margin: 0 0 18px;">Verify your email address</h1>
                  <p style="font-size: 16px; line-height: 1.6; margin: 0 0 14px;">Hello <strong>${name}</strong>,</p>
                  <p style="color: #4a4a4a; font-size: 15px; line-height: 1.7; margin: 0;">Thank you for creating your RodeSense account. Enter the verification code below to complete your registration.</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                    <tr>
                      <td align="center" style="background-color: #fff5f5; border: 1px solid #c62828; border-radius: 6px; padding: 20px 12px;">
                        <div style="color: #777777; font-size: 11px; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">VERIFICATION CODE</div>
                        <div style="color: #b71c1c; font-size: 34px; font-weight: bold; letter-spacing: 8px; line-height: 1;">${otp}</div>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #555555; font-size: 13px; line-height: 1.6; margin: 0 0 10px;"><strong style="color: #111111;">This code expires in 10 minutes.</strong></p>
                  <p style="color: #777777; font-size: 13px; line-height: 1.6; margin: 0;">If you did not create a RodeSense account, you can safely ignore this email.</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #111111; border-top: 1px solid #2d2d2d; padding: 18px 32px; text-align: center;">
                  <p style="color: #aaaaaa; font-size: 12px; margin: 0;">RodeSense Platform</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;

    const text = `Hello ${name},\n\nYour RodeSense verification code is: ${otp}\nThis code will expire in 10 minutes.\n\n© RodeSense Platform`;

    return this.sendEmail(
      {
        to: email,
        subject: "Verify Your Email - RodeSense",
        html,
        text,
      },
      config,
    );
  }
}

const emailService = new BrevoEmailService();
export const sendOtpEmail = (email, otp, name, config) =>
  emailService.sendOtpEmail(email, otp, name, config);
export default emailService;
