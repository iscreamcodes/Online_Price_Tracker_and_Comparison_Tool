import nodemailer from "nodemailer";

export async function sendAlertEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Price Tracker Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📨 Price alert sent to:", to);
  } catch (error) {
    console.error("❌ Alert email error:", error.message);
  }
}
