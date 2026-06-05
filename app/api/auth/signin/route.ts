import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql, initDb } from "@/lib/db";
import { signToken, refNo } from "@/lib/auth";

const schema = z.object({
  countryCode: z.string().regex(/^\+\d{1,4}$/),
  mobile: z.string().regex(/^\d{6,15}$/),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid mobile number" }, { status: 422 });

  try {
    await initDb();
    const fullNumber = `${parsed.data.countryCode}${parsed.data.mobile}`;

    // Upsert investor
    const result = await sql`
      INSERT INTO investors (mobile) VALUES (${fullNumber})
      ON CONFLICT (mobile) DO UPDATE SET mobile = EXCLUDED.mobile
      RETURNING id, mobile
    `;
    const investor = result.rows[0];
    const token = signToken(investor.id, investor.mobile);
    return NextResponse.json({ accessToken: token, refreshToken: token });
  } catch (e: any) {
    return NextResponse.json({ error: "Sign-in failed" }, { status: 500 });
  }
}
