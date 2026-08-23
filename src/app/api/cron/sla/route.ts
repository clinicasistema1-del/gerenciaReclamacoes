import { NextRequest, NextResponse } from "next/server";
import { processarEscalonamentos } from "@/lib/reclamacao";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processarEscalonamentos();
  return NextResponse.json({ ok: true, ...result });
}
