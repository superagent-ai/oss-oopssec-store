import { exec } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

const run = promisify(exec);

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const since = request.nextUrl.searchParams.get("since") ?? "1970-01-01";

  try {
    const { stdout } = await run(
      `node scripts/export-orders.js --format ${format} --since ${since}`
    );
    return new NextResponse(stdout, {
      headers: { "content-type": `text/${format}` },
    });
  } catch (error) {
    logger.error({ err: error, route: "/api/orders/export" }, "Order export failed");
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
