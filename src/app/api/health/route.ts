import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "NOT SET";
  const masked = url.length > 20
    ? url.slice(0, 40) + "..." + url.slice(-30)
    : url;

  let dbStatus = "untested";
  let resolvedIP = "unknown";
  try {
    const dns = require('dns').promises;
    const result = await dns.lookup('db.qxegkbcbayvkopkxompl.supabase.co', { family: 4 });
    resolvedIP = result.address;
  } catch (e: unknown) {
    resolvedIP = e instanceof Error ? e.message : "dns failed";
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (e: unknown) {
    dbStatus = e instanceof Error ? e.message : "unknown error";
  }

  return NextResponse.json({
    DATABASE_URL: masked,
    hasPgbouncer: url.includes("pgbouncer=true"),
    hasSSL: url.includes("sslmode=require"),
    port: url.includes(":6543") ? "6543 (pooler)" : url.includes(":5432") ? "5432 (direct)" : "unknown",
    DIRECT_URL_SET: !!process.env.DIRECT_URL,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    resolvedIP,
    dbStatus,
  });
}
