import { NextRequest, NextResponse } from "next/server";
import { getOrCreateApplication, upsertDocument } from "@/lib/db";
import { getInvestor } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  docKey: z.string(),
  fileName: z.string(),
  status: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 422 });

  try {
    const app = await getOrCreateApplication(investor.sub);
    await upsertDocument(app.id, parsed.data.docKey, parsed.data.fileName, undefined, parsed.data.status);
    return NextResponse.json({ ok: true, docKey: parsed.data.docKey });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to record document" }, { status: 500 });
  }
}
