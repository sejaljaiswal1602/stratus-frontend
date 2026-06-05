import { NextResponse } from "next/server";
import Redis from "ioredis";

export async function GET() {
  try {
    const r = new Redis(process.env.REDIS_URL!, {
      tls: { rejectUnauthorized: false },
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
    });
    const pong = await r.ping();
    await r.disconnect();
    return NextResponse.json({ ok: true, redis: pong });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
