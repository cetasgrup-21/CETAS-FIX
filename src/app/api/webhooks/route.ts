import { NextRequest } from "next/server";
import { POST as xenditPost } from "./xendit/route";

// Direct root webhook handler that forwards to Xendit
export async function POST(req: NextRequest) {
  return await xenditPost(req);
}

export async function GET() {
  return new Response("CETAS Webhook Endpoint Active", { status: 200 });
}
