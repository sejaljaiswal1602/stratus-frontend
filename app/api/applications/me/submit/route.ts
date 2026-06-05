import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getInvestor } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const r = await sql`SELECT * FROM applications WHERE investor_id=${investor.sub} AND status='DRAFT' ORDER BY created_at DESC LIMIT 1`;
  const app = r.rows[0];
  if (!app) return NextResponse.json({ error: "No draft application" }, { status: 404 });

  const docs = await sql`SELECT doc_key FROM documents WHERE application_id=${app.id}`;
  const uploaded = docs.rows.map((d: any) => d.doc_key);
  const missing = ["pan","address","bank","photo"].filter(k => !uploaded.includes(k));
  if (missing.length) return NextResponse.json({ error: "Missing documents", missing }, { status: 422 });

  if (!app.full_name || !app.pan || !app.email || !app.acct_no_enc || !app.fatca) {
    return NextResponse.json({ error: "Complete all steps before submitting" }, { status: 422 });
  }

  await sql`UPDATE applications SET status='SUBMITTED', submitted_at=NOW(), step_index=4 WHERE id=${app.id}`;
  return NextResponse.json({ referenceNo: app.reference_no, status: "SUBMITTED" });
}
