import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const command = new URL(request.url).searchParams.get("command") ?? "uptime";
  const { stdout, stderr } = await execAsync(command);

  return Response.json({ stdout, stderr });
}
