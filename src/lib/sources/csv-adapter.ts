import type { DiscoveredLead, SourceAdapter } from "./types";

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of row) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSV(csvText: string): DiscoveredLead[] {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, "_")
  );

  return lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });

    return {
      businessName: row.business_name || row.company || row.name || "",
      category: row.category || "Restaurant",
      subcategory: row.subcategory,
      city: row.city || "",
      state: row.state || "",
      website: row.website || row.url,
      contactName: row.contact_name || row.contact,
      contactTitle: row.contact_title || row.title,
      contactEmail: row.contact_email || row.email,
      contactPhone: row.contact_phone || row.phone,
      locationCount: row.location_count ? parseInt(row.location_count) : undefined,
      hospitalitySegment: row.hospitality_segment || row.segment,
      sourceProvider: "csv-import",
      confidence: 0.9,
    };
  });
}

export const csvAdapter: SourceAdapter = {
  name: "csv-import",
  async search(csvText: string): Promise<DiscoveredLead[]> {
    return parseCSV(csvText);
  },
};
