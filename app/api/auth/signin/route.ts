import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { upsertInvestor } from "@/lib/db";
import { signToken } from "@/lib/auth";

const schema = z.object({
  countryCode: z.string().regex(/^\+\d{1,4}$/),
  mobile: z.string().regex(/^\d{6,15}$/),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid mobile number" }, { status: 422 });

  try {
    const fullNumber = `${parsed.data.countryCode}${parsed.data.mobile}`;
    const investor = await upsertInvestor(fullNumber);
    const token = signToken(investor.id, investor.mobile);
    return NextResponse.json({ accessToken: token, refreshToken: token });
  } catch (e: any) {
    console.error("signin error", e);
    return NextResponse.json({ error: "Sign-in failed" }, { status: 500 });
  }
}
