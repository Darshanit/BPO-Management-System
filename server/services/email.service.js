const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a plain/HTML email. Failures are logged but not thrown to the caller
 * by default for non-critical emails; auth-critical calls should await and can
 * choose to surface the error.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw err;
  }
};

const sendOTPEmail = (to, otp) =>
  sendEmail({
    to,
    subject: 'Your BPO Management System Verification Code',
    html: `<p>Your one-time verification code is:</p>
           <h2 style="letter-spacing:4px;">${otp}</h2>
           <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>`,
  });

const sendPasswordResetEmail = (to, resetUrl) =>
  sendEmail({
    to,
    subject: 'Reset Your Password',
    html: `<p>You requested a password reset. Click the link below to set a new password:</p>
           <p><a href="${resetUrl}">${resetUrl}</a></p>
           <p>This link expires in 15 minutes. If you did not request this, please ignore this email.</p>`,
  });

const sendVerificationEmail = (to, verifyUrl) =>
  sendEmail({
    to,
    subject: 'Verify Your Email Address',
    html: `<p>Welcome! Please verify your email by clicking the link below:</p>
           <p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  });

module.exports = { sendEmail, sendOTPEmail, sendPasswordResetEmail, sendVerificationEmail };
