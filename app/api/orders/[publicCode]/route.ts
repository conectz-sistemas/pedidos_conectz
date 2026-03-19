import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ publicCode: string }> }
) {
  // Endpoint antigo (sem slug) pode causar ambiguidade/vazamento entre lanchonetes.
  // Use sempre o endpoint tenant-scoped: /api/t/[slug]/orders/[publicCode]
  return NextResponse.json(
    { error: "Rota desativada. Use /api/t/[slug]/orders/[publicCode]." },
    { status: 404 }
  );
}

