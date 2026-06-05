import { NextRequest, NextResponse } from "next/server";
import { getOrCreateApplication, updateApplication } from "@/lib/db";
import { getInvestor } from "@/lib/auth";
import { z } from "zod";

const schemas: Record<number, z.ZodTypeAny> = {
  0: z.object({ investorType: z.string(), fullName: z.string().min(2), pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/), dob: z.string() }),
  1: z.object({ email: z.string().email(), addr1: z.string().min(2), addr2: z.string().optional(), city: z.string(), pincode: z.string().regex(/^\d{6}$/), occupation: z.string(), income: z.string() }),
  3: z.object({ acctName: z.string().optional(), acctNo: z.string().regex(/^\d{9,18}$/), acctNo2: z.string(), ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/), acctType: z.string(), fatca: z.boolean(), pep: z.boolean() })
    .refine(d => d.acctNo === d.acctNo2, { message: "Account numbers don't match", path: ["acctNo2"] }),
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ step: string }> }) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { step: stepStr } = await params;
  const step = parseInt(stepStr, 10);
  const schema = schemas[step];
  if (!schema) return NextResponse.json({ error: "Invalid step" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", errors: parsed.error.flatten().fieldErrors }, { status: 422 });

  try {
    const app = await getOrCreateApplication(investor.sub);
    const d = parsed.data as any;
    let patch: Record<string, any> = { stepIndex: step };

    if (step === 0) patch = { ...patch, investorType: d.investorType, fullName: d.fullName, pan: d.pan.toUpperCase(), dob: d.dob };
    if (step === 1) patch = { ...patch, email: d.email, addr1: d.addr1, addr2: d.addr2 ?? null, city: d.city, pincode: d.pincode, occupation: d.occupation, income: d.income };
    if (step === 3) patch = { ...patch, acctName: d.acctName ?? null, acctNoLast4: d.acctNo.slice(-4), ifsc: d.ifsc.toUpperCase(), acctType: d.acctType, fatca: d.fatca, pep: d.pep };

    await updateApplication(app.id, patch);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("step save error", e);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
