import sgMail from "@sendgrid/mail";
import jwt from "jsonwebtoken";
import "dotenv/config";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const fromEmail = process.env.FROM_EMAIL!;

export const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = {
    to,
    from: fromEmail,
    subject,
    html,
  };
  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("SendGrid response error:", error.response.body);
    }
    return false;
  }
};
