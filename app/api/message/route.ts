import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Message from API route",
  });
}
