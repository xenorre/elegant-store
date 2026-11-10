import "server-only";

import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

if (!process.env.EMAIL_FROM) {
  throw new Error("EMAIL_FROM is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM;

type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail({ to, subject, html, text }: Email) {
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) {
    // Runs in the background after the response, so log rather than throw.
    console.error(`Failed to send "${subject}" email`, error);
  }
}

function layout(heading: string, body: string, url: string, action: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:48px 24px;background:#faf8f5;color:#1a1a1a;font-family:Georgia,serif;">
    <div style="max-width:480px;margin:0 auto;">
      <p style="margin:0 0 40px;font-size:20px;letter-spacing:0.2em;text-transform:uppercase;">Elegant</p>
      <h1 style="margin:0 0 16px;font-size:28px;font-weight:normal;">${heading}</h1>
      <p style="margin:0 0 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;">${body}</p>
      <a href="${url}" style="display:inline-block;padding:14px 28px;background:#1a1a1a;color:#faf8f5;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">${action}</a>
      <p style="margin:40px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b6b6b;">If you didn't request this, you can ignore this email.</p>
    </div>
  </body>
</html>`;
}

export function verificationEmail(to: string, url: string): Email {
  const body = "Confirm your email address to finish creating your Elegant account.";
  return {
    to,
    subject: "Confirm your email",
    html: layout("Confirm your email", body, url, "Confirm email"),
    text: `${body}\n\n${url}\n\nIf you didn't request this, you can ignore this email.`,
  };
}

export function resetPasswordEmail(to: string, url: string): Email {
  const body = "Use the link below to choose a new password. It expires in one hour.";
  return {
    to,
    subject: "Reset your password",
    html: layout("Reset your password", body, url, "Reset password"),
    text: `${body}\n\n${url}\n\nIf you didn't request this, you can ignore this email.`,
  };
}
