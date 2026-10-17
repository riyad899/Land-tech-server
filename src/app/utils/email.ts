import nodemailer from "nodemailer";
import { envVars } from "../config/env";

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: envVars.EMAIL.SMTP_HOST,
      port: envVars.EMAIL.SMTP_PORT,
      secure: envVars.EMAIL.SMTP_PORT === 465,
      auth: {
        user: envVars.EMAIL.SMTP_USER,
        pass: envVars.EMAIL.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"ভূমিপ্রহরী (BhumiProhori)" <${envVars.EMAIL.SMTP_FROM || envVars.EMAIL.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't crash main flow if email fails
    return null;
  }
};
