import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_FROM_USER:", process.env.SMTP_FROM_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_FROM_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: `<${process.env.SMTP_FROM_USER}>`,
    to,
    subject,
    html,
  });

  return info;
};

const sendVerificationEmail = async (to, token) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

  const html = `<p>Please click the link below to verify your email:</p>
                <a href="${verificationLink}">Verify Email</a>`;
  const info = await sendMail(to, "Email Verification", html);

  return info;
};

const sendPasswordResetEmail = async (to, token) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  const html = `<p>Please click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>`;
  const info = await sendMail(to, "Password Reset", html);
  return info;
};

export { sendMail, sendVerificationEmail, sendPasswordResetEmail };
