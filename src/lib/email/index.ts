import { Resend } from "resend";
import { renderTemplate, type TemplateVariables } from "./templates";
import { generateTrackingToken } from "./tracking";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder");
  return _resend;
}
export const resend = { get emails() { return getResend().emails; }, get domains() { return getResend().domains; } } as unknown as Resend;

export interface SendEmailOptions {
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  campaignLeadId?: string;
  trackClicks?: boolean;
}

export interface SendTemplateOptions {
  from: string;
  fromName?: string;
  to: string;
  subjectTemplate: string;
  bodyTemplate: string;
  variables: TemplateVariables;
  campaignLeadId?: string;
}

export async function sendEmail(opts: SendEmailOptions) {
  let html = opts.html;

  if (opts.campaignLeadId) {
    const token = generateTrackingToken(opts.campaignLeadId, "open");
    const pixelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/track/open/${token}`;
    html += `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;border:0;" />`;
  }

  const fromAddress = opts.fromName
    ? `${opts.fromName} <${opts.from}>`
    : opts.from;

  const result = await resend.emails.send({
    from: fromAddress,
    to: opts.to,
    subject: opts.subject,
    html,
    text: opts.text,
  });

  return result;
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
  });
}

export async function createResendDomain(domain: string) {
  return resend.domains.create({ name: domain });
}

export async function verifyResendDomain(resendDomainId: string) {
  return resend.domains.verify(resendDomainId);
}

export async function getResendDomain(resendDomainId: string) {
  return resend.domains.get(resendDomainId);
}
