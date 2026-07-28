import { NextResponse, type NextRequest } from "next/server";
import { getWorkspaceContext } from "@/lib/auth";
import { analyzeWebsiteWithGemini } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { urlOrText } = body;
    const workspaceIdParam = request.nextUrl.searchParams.get("workspaceId") ?? body.workspaceId;

    const ctx = await getWorkspaceContext(workspaceIdParam);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!urlOrText || typeof urlOrText !== "string" || !urlOrText.trim()) {
      return NextResponse.json(
        { error: "A valid website URL or product description is required" },
        { status: 400 }
      );
    }

    const result = await analyzeWebsiteWithGemini(urlOrText);
    const cleanedText = result.text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze website";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
