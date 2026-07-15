import { NextResponse } from "next/server";
import { db } from "@/db";
import { otpVerifications } from "@/db/schema";
import nodemailer from "nodemailer";
import { isAdminEmail } from "@/utils/admin-helper";

// Helper to generate a random 6-digit numeric OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Beautiful Gold/Dark Teal HTML email template for Tiora OTP
function getOTPEmailTemplate(email: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tiora Verification Code</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #FAF8F0;
          color: #111111;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 580px;
          margin: 40px auto;
          background-color: #FFFFFF;
          border: 1px solid rgba(177, 142, 53, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .header {
          background-color: #0E2C2C;
          padding: 30px 20px;
          text-align: center;
          border-bottom: 3px solid #C5A059;
        }
        .header h1 {
          font-family: "Playfair Display", Georgia, serif;
          color: #C5A059;
          font-size: 26px;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          font-weight: 400;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
          text-align: center;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #0E2C2C;
          margin-top: 0;
          margin-bottom: 10px;
        }
        .message {
          font-size: 15px;
          color: #555555;
          margin-bottom: 30px;
        }
        .otp-box {
          display: inline-block;
          background-color: #FAF8F0;
          border: 2px dashed #C5A059;
          border-radius: 8px;
          padding: 15px 40px;
          font-size: 36px;
          font-weight: 700;
          color: #0E2C2C;
          letter-spacing: 0.15em;
          margin-bottom: 30px;
          text-align: center;
        }
        .expiry-notice {
          font-size: 13px;
          color: #888888;
          margin-bottom: 0;
        }
        .footer {
          background-color: #FAF8F0;
          padding: 30px 20px;
          text-align: center;
          font-size: 12px;
          color: #888888;
          border-top: 1px solid rgba(177, 142, 53, 0.1);
        }
        .footer a {
          color: #C5A059;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Tiora</h1>
        </div>
        <div class="content">
          <div class="greeting">Verify Your Account</div>
          <div class="message">
            Thank you for registering with Tiora. Use the verification code below to log in to your account:
          </div>
          <div class="otp-box">${otp}</div>
          <div class="expiry-notice">
            This verification code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Tiora Designer Studio. All rights reserved.<br>
          For support or inquiries, email us at <a href="mailto:Tioradesignerstudio@gmail.com">Tioradesignerstudio@gmail.com</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Block admin email from registering/logging in on the user side
    if (isAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "This email address is registered for administrator access only." },
        { status: 400 }
      );
    }
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store in sqlite database
    await db.insert(otpVerifications).values({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      console.log(`[SMTP] Sending OTP email to ${normalizedEmail} using Gmail SMTP...`);
      // Configure Gmail SMTP transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Send the email
      await transporter.sendMail({
        from: `"Tiora" <${smtpUser}>`,
        to: normalizedEmail,
        subject: `${otp} is your Tiora verification code`,
        html: getOTPEmailTemplate(normalizedEmail, otp),
      });

      console.log(`[SMTP] Email successfully sent to ${normalizedEmail}`);
    } else {
      console.log(`[DEV MODE] SMTP variables missing in env. Printing OTP to console:`);
      console.log(`----------------------------------------------`);
      console.log(`OTP verification code for ${normalizedEmail} is: ${otp}`);
      console.log(`----------------------------------------------`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send OTP code" },
      { status: 500 }
    );
  }
}
