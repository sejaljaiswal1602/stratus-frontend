import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getInvestor } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  docKey: z.enum(["pan","address","bank","photo"]),
  fileName: z.string(),
});

export async function POST(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 422 });

  const r = await sql`SELECT id FROM applications WHERE investor_id=${investor.sub} AND status='DRAFT' ORDER BY created_at DESC LIMIT 1`;
  const app = r.rows[0];
  if (!app) return NextResponse.json({ error: "No active application" }, { status: 404 });

  await sql`
    INSERT INTO documents (application_id, doc_key, file_name)
    VALUES (${app.id}, ${parsed.data.docKey}, ${parsed.data.fileName})
    ON CONFLICT (application_id, doc_key) DO UPDATE SET file_name=EXCLUDED.file_name, status='UPLOADED', uploaded_at=NOW()
  `;

  return NextResponse.json({ ok: true, docKey: parsed.data.docKey });
}
