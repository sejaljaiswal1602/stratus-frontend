import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";

export function signToken(investorId: string, mobile: string) {
  return jwt.sign({ sub: investorId, mobile }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { sub: string; mobile: string } | null {
  try {
    return jwt.verify(token, SECRET) as { sub: string; mobile: string };
  } catch {
    return null;
  }
}

export function getInvestor(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

export function refNo() {
  return `STR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
}
