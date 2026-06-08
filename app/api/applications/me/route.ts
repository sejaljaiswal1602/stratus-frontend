import { NextRequest, NextResponse } from "next/server";
import { getOrCreateApplication, getDocuments } from "@/lib/db";
import { getInvestor } from "@/lib/auth";

function format(app: any, docs: any[]) {
  return {
    id: app.id, referenceNo: app.referenceNo, status: app.status, stepIndex: app.stepIndex,
    identity: { investorType: app.investorType, fullName: app.fullName, pan: app.pan, dob: app.dob },
    kyc: { email: app.email, addr1: app.addr1, addr2: app.addr2, city: app.city, pincode: app.pincode, occupation: app.occupation, income: app.income },
    bank: { acctName: app.acctName, acctMasked: app.acctNoLast4 ? `••••${app.acctNoLast4}` : null, ifsc: app.ifsc, acctType: app.acctType, fatca: app.fatca, pep: app.pep },
    documents: docs.map(d => ({ docKey: d.docKey, fileName: d.fileName, status: d.status })),
    nomineeName: app.nomineeName, nomineeDob: app.nomineeDob,
    nomineeRelationship: app.nomineeRelationship, nomineeIdType: app.nomineeIdType,
  };
}

export async function GET(req: NextRequest) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const app = await getOrCreateApplication(investor.sub);
    const docs = await getDocuments(app.id);
    return NextResponse.json(format(app, docs));
  } catch (e: any) {
    console.error("get app error", e);
    return NextResponse.json({ error: "Failed to load application" }, { status: 500 });
  }
}
