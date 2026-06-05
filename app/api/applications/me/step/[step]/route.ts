import { NextRequest, NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";
import { getInvestor } from "@/lib/auth";
import { z } from "zod";

const schemas: Record<number, z.ZodTypeAny> = {
  0: z.object({ investorType: z.string(), fullName: z.string().min(2), pan: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]$/), dob: z.string() }),
  1: z.object({ email: z.string().email(), addr1: z.string().min(2), addr2: z.string().optional(), city: z.string(), pincode: z.string().regex(/^\d{6}$/), occupation: z.string(), income: z.string() }),
  3: z.object({ acctName: z.string().optional(), acctNo: z.string().regex(/^\d{9,18}$/), acctNo2: z.string(), ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/), acctType: z.string(), fatca: z.boolean(), pep: z.boolean() })
    .refine(d => d.acctNo === d.acctNo2, { message: "Account numbers don't match", path: ["acctNo2"] }),
};

async function getApp(investorId: string) {
  await initDb();
  const r = await sql`SELECT * FROM applications WHERE investor_id=${investorId} AND status='DRAFT' ORDER BY created_at DESC LIMIT 1`;
  return r.rows[0] ?? null;
}

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

  const app = await getApp(investor.sub);
  if (!app) return NextResponse.json({ error: "No active application" }, { status: 404 });

  const d = parsed.data as any;

  if (step === 0) {
    await sql`UPDATE applications SET investor_type=${d.investorType}, full_name=${d.fullName}, pan=${d.pan.toUpperCase()}, dob=${d.dob}, step_index=0, updated_at=NOW() WHERE id=${app.id}`;
  } else if (step === 1) {
    await sql`UPDATE applications SET email=${d.email}, addr1=${d.addr1}, addr2=${d.addr2??null}, city=${d.city}, pincode=${d.pincode}, occupation=${d.occupation}, income=${d.income}, step_index=1, updated_at=NOW() WHERE id=${app.id}`;
  } else if (step === 3) {
    // Store last 4 digits only — full account number not stored
    const last4 = d.acctNo.slice(-4);
    await sql`UPDATE applications SET acct_name=${d.acctName??null}, acct_no_enc=${last4}, ifsc=${d.ifsc.toUpperCase()}, acct_type=${d.acctType}, fatca=${d.fatca}, pep=${d.pep}, step_index=3, updated_at=NOW() WHERE id=${app.id}`;
  }

  return NextResponse.json({ ok: true });
}
