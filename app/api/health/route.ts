import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const url = process.env.POSTGRES_URL ?? "not set";
  const masked = url.replace(/:([^:@]+)@/, ":***@");

  // Try 1: rejectUnauthorized false
  try {
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
    const r = await pool.query("SELECT 1 as n");
    await pool.end();
    return NextResponse.json({ ok: true, method: "ssl-noverify", url: masked });
  } catch (e1: any) {
    // Try 2: no SSL
    try {
      const pool2 = new Pool({ connectionString: url, ssl: false, connectionTimeoutMillis: 5000 });
      const r2 = await pool2.query("SELECT 1 as n");
      await pool2.end();
      return NextResponse.json({ ok: true, method: "no-ssl", url: masked });
    } catch (e2: any) {
      return NextResponse.json({ ok: false, err1: e1.message, err2: e2.message, url: masked }, { status: 500 });
    }
  }
}
