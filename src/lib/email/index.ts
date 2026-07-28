import nodemailer from "nodemailer";
import { renderTemplate, type TemplateVariables } from "./templates";
import { generateTrackingToken } from "./tracking";

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  secure?: boolean;
}

export interface SendEmailOptions {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  campaignLeadId?: string;
  trackClicks?: boolean;
  smtpConfig?: SmtpConfig;
}

export interface SendTemplateOptions {
  from: string;
  fromName?: string;
  to: string;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: TemplateVariables;
  campaignLeadId?: string;
  smtpConfig?: SmtpConfig;
}

export function createTransporter(customConfig?: SmtpConfig) {
  const host = customConfig?.host || process.env.SMTP_HOST;
  const port = customConfig?.port || Number(process.env.SMTP_PORT ?? 587);
  const user = customConfig?.user || process.env.SMTP_USER;
  const pass = customConfig?.pass || process.env.SMTP_PASS;
  const secure = customConfig?.secure ?? (port === 465);

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration incomplete. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env or on your Sender Account."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail(opts: SendEmailOptions) {
  let html = opts.html;

  if (opts.campaignLeadId) {
    const token = generateTrackingToken(opts.campaignLeadId, "open");
    const pixelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${token}`;
    html += `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;border:0;" />`;
  }

  const fromAddress = opts.fromName
    ? `"${opts.fromName}" <${opts.from}>`
    : opts.from;

  const transporter = createTransporter(opts.smtpConfig);

  const info = await transporter.sendMail({
    from: fromAddress,
    to: opts.to,
    subject: opts.subject,
    html,
    text: opts.text,
  });

  return info;
}

export async function sendTemplate(opts: SendTemplateOptions) {
  const subject = renderTemplate(opts.subjectTemplate, opts.variables);
  const bodyHtml = renderTemplate(opts.bodyTemplate, opts.variables);

  return sendEmail({
    from: opts.from,
    fromName: opts.fromName,
    to: opts.to,
    subject,
    html: bodyHtml,
    campaignLeadId: opts.campaignLeadId,
    smtpConfig: opts.smtpConfig,
  });
}
