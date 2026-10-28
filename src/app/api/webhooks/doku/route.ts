import { NextRequest, NextResponse } from "next/server";
import { POST as xenditPost } from "../xendit/route";

// Backward compatibility webhook for legacy DOKU notifications
export async function POST(req: NextRequest) {
  try {
    return await xenditPost(req);
  } catch (error) {
    console.error("[Legacy DOKU Webhook Error]:", error);
    return NextResponse.json({ success: true, message: "Migrated to Xendit" });
  }
}
