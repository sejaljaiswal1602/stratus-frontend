import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getOrCreateApplication, upsertDocument } from "@/lib/db";
import { getInvestor } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try { formData = await req.formData(); }
  catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  const docKey = formData.get("docKey") as string | null;

  if (!file || !docKey) return NextResponse.json({ error: "Missing file or docKey" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Only PDF, JPG, or PNG allowed" }, { status: 422 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File exceeds 10 MB" }, { status: 422 });

  try {
    const app = await getOrCreateApplication(investor.sub);
    const ext = file.type === "application/pdf" ? ".pdf" : file.type === "image/png" ? ".png" : ".jpg";
    const pathname = `kyc/${investor.sub}/${app.id}/${docKey}${ext}`;

    const blob = await put(pathname, file, {
      access: "public",        // public access — blobs are guessable only if you know the path
      addRandomSuffix: true,   // adds random suffix so URLs aren't predictable
      contentType: file.type,
    });

    await upsertDocument(app.id, docKey, file.name, blob.url);
    return NextResponse.json({ ok: true, docKey, url: blob.url, fileName: file.name });
  } catch (e: any) {
    console.error("blob upload error:", e?.message ?? e);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
