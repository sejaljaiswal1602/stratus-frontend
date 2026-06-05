import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";
import { getInvestor, refNo } from "@/lib/auth";

async function getOrCreate(investorId: string) {
  await initDb();
  const existing = await sql`
    SELECT * FROM applications WHERE investor_id = ${investorId}
    AND status IN ('DRAFT','SUBMITTED','UNDER_REVIEW')
    ORDER BY created_at DESC LIMIT 1
  `;
  if (existing.rows[0]) return existing.rows[0];

  const ref = refNo();
  const created = await sql`
    INSERT INTO applications (reference_no, investor_id) VALUES (${ref}, ${investorId})
    RETURNING *
  `;
  return created.rows[0];
}

function format(app: any, docs: any[]) {
  return {
    id: app.id,
    referenceNo: app.reference_no,
    status: app.status,
    stepIndex: app.step_index,
    identity: { investorType: app.investor_type, fullName: app.full_name, pan: app.pan, dob: app.dob },
    kyc: { email: app.email, addr1: app.addr1, addr2: app.addr2, city: app.city, pincode: app.pincode, occupation: app.occupation, income: app.income },
    bank: { acctName: app.acct_name, acctMasked: app.acct_no_enc ? `••••${app.acct_no_enc.slice(-4)}` : null, ifsc: app.ifsc, acctType: app.acct_type, fatca: app.fatca, pep: app.pep },
    documents: docs.map(d => ({ docKey: d.doc_key, fileName: d.file_name, status: d.status })),
  };
}

export async function GET(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await getOrCreate(investor.sub);
  const docs = await sql`SELECT * FROM documents WHERE application_id = ${app.id}`;
  return NextResponse.json(format(app, docs.rows));
}
