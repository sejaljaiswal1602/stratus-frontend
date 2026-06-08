import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getOrCreateApplication, upsertDocument } from "@/lib/db";
import { getInvestor } from "@/lib/auth";

export const runtime = "nodejs";

// Increase body size limit for file uploads
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  const docKey = formData.get("docKey") as string | null;

  if (!file || !docKey) return NextResponse.json({ error: "Missing file or docKey" }, { status: 400 });

  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Only PDF, JPG, or PNG allowed" }, { status: 422 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File exceeds 10 MB" }, { status: 422 });

  try {
    const app = await getOrCreateApplication(investor.sub);

    // Upload to Vercel Blob — path: kyc/{investorId}/{appId}/{docKey}/{filename}
    const pathname = `kyc/${investor.sub}/${app.id}/${docKey}/${file.name}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Record in Redis
    await upsertDocument(app.id, docKey, file.name, blob.url);

    return NextResponse.json({ ok: true, docKey, url: blob.url, fileName: file.name });
  } catch (e: any) {
    console.error("upload error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
