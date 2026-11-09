import { NextRequest } from "next/server";
import { POST as dokuPost } from "./doku/route";

// Direct root webhook handler that forwards to DOKU
export async function POST(req: NextRequest) {
  return await dokuPost(req);
}

export async function GET() {
  return new Response("CETAS DOKU Webhook Endpoint Active", { status: 200 });
}
