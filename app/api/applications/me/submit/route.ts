import { NextRequest, NextResponse } from "next/server";
import { getOrCreateApplication, updateApplication, getDocuments } from "@/lib/db";
import { getInvestor } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const app = await getOrCreateApplication(investor.sub);
    const docs = await getDocuments(app.id);
    const uploaded = docs.map(d => d.docKey);
    const missing = ["passport","utility_bill","bank_statement","national_id","aadhaar","photo"].filter(k => !uploaded.includes(k));
    if (missing.length) return NextResponse.json({ error: "Missing documents", missing }, { status: 422 });
    if (!app.fullName || !app.pan || !app.email || !app.acctNoLast4 || !app.fatca)
      return NextResponse.json({ error: "Complete all steps before submitting" }, { status: 422 });

    const updated = await updateApplication(app.id, { status: "SUBMITTED", stepIndex: 4, submittedAt: new Date().toISOString() });
    return NextResponse.json({ referenceNo: updated.referenceNo, status: "SUBMITTED" });
  } catch (e: any) {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
