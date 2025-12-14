import dotenv from "dotenv";
dotenv.config({path: "../.env"});
import nodemailer from "nodemailer";

async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Price Tracker" <${process.env.EMAIL_USER}>`,
      to: "your-other-email@gmail.com",
      subject: "Test Email",
      text: "This is a test email from Price Tracker.",
    });
    console.log("✅ Test email sent!");
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
}

testEmail();
