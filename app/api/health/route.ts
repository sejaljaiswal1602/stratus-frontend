import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    const pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    });
    const r = await pool.query("SELECT version()");
    await pool.end();
    return NextResponse.json({ ok: true, pg: r.rows[0].version.split(" ").slice(0,2).join(" ") });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
