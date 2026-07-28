export interface TemplateVariables {
  business_name?: string;
  contact_name?: string;
  contact_first_name?: string;
  contact_title?: string;
  city?: string;
  state?: string;
  category?: string;
  personalization?: string;
  warm_signal?: string;
  sender_name?: string;
  sender_email?: string;
  unsubscribe_url?: string;
  [key: string]: string | undefined;
}

export function renderTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return variables[key] ?? `{{${key}}}`;
  });
}

export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(2, -2)))];
}

export function bodyToHtml(plainText: string): string {
  return plainText
    .split("\n\n")
    .map((para) => `<p>${para.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function buildUnsubscribeUrl(campaignLeadId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return `${base}/unsubscribe/${campaignLeadId}`;
}
