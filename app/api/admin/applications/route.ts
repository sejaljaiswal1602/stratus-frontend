import { NextRequest, NextResponse } from "next/server";
import { getAllApplications, getInvestorById, getDocuments } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Simple password protection
  const key = req.headers.get("x-admin-key");
  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apps = await getAllApplications();

    const enriched = await Promise.all(apps.map(async (app) => {
      const [investor, docs] = await Promise.all([
        getInvestorById(app.investorId),
        getDocuments(app.id),
      ]);
      return {
        ...app,
        mobile: investor?.mobile ?? "—",
        documents: docs,
      };
    }));

    return NextResponse.json({ applications: enriched });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
