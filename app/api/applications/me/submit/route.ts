import { NextRequest, NextResponse } from "next/server";
import { getOrCreateApplication, updateApplication, getDocuments } from "@/lib/db";
import { getInvestor } from "@/lib/auth";

const REQUIRED_DOCS = ["passport","utility_bill","bank_statement","national_id","aadhaar","photo"];

export async function POST(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const app = await getOrCreateApplication(investor.sub);
    const docs = await getDocuments(app.id);
    const uploaded = docs.map(d => d.docKey);

    const missing = REQUIRED_DOCS.filter(k => !uploaded.includes(k));
    if (missing.length) {
      return NextResponse.json({
        error: `Please upload all required documents before submitting. Missing: ${missing.join(", ")}`,
      }, { status: 422 });
    }

    // Check required fields — note: fatca/pep can be false, so check for undefined/null only
    const incomplete: string[] = [];
    if (!app.fullName) incomplete.push("full name");
    if (!app.pan)      incomplete.push("PAN");
    if (!app.email)    incomplete.push("email");
    if (!app.acctNoLast4) incomplete.push("bank account");
    if (app.fatca === undefined || app.fatca === null) incomplete.push("FATCA declaration");
    if (app.pep   === undefined || app.pep   === null) incomplete.push("PEP declaration");

    if (incomplete.length) {
      return NextResponse.json({
        error: `Please complete the following before submitting: ${incomplete.join(", ")}.`,
      }, { status: 422 });
    }

    const updated = await updateApplication(app.id, {
      status: "SUBMITTED",
      stepIndex: 4,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ referenceNo: updated.referenceNo, status: "SUBMITTED" });
  } catch (e: any) {
    console.error("submit error", e);
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
