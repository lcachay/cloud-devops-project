export async function GET() {
  return Response.json({
    message: process.env.NEXT_PUBLIC_API_MESSAGE || "Fallback message",
  });
}
