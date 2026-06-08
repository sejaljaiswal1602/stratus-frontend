import { NextRequest, NextResponse } from "next/server";
import { getOrCreateApplication } from "@/lib/db";
import { getInvestor } from "@/lib/auth";
import Redis from "ioredis";

function getClient() {
  return new Redis(process.env.REDIS_URL!, { tls: { rejectUnauthorized: false }, maxRetriesPerRequest: 3 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ docKey: string }> }) {
  const investor = getInvestor(req);
  if (!investor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { docKey } = await params;
  try {
    const app = await getOrCreateApplication(investor.sub);
    const r = getClient();
    await r.hdel(`docs:${app.id}`, docKey);
    await r.quit();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
