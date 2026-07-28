import crypto from "crypto";

const secret = () => process.env.TRACKING_SECRET ?? "dev-secret-change-me";

interface TrackingPayload {
  id: string;
  type: "open" | "click";
  url?: string;
  ts: number;
}

export function generateTrackingToken(
  campaignLeadId: string,
  type: "open" | "click",
  url?: string
): string {
  const payload: TrackingPayload = { id: campaignLeadId, type, ts: Date.now() };
  if (url) payload.url = url;
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function parseTrackingToken(token: string): TrackingPayload | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const encoded = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = crypto
      .createHmac("sha256", secret())
      .update(encoded)
      .digest("base64url");
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(encoded, "base64url").toString()) as TrackingPayload;
  } catch {
    return null;
  }
}

export function generateClickToken(campaignLeadId: string, destinationUrl: string): string {
  return generateTrackingToken(campaignLeadId, "click", destinationUrl);
}
