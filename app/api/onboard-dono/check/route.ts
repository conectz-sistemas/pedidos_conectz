import { NextResponse } from "next/server";

/** Rota desabilitada por segurança. */
export async function GET() {
  return NextResponse.json({ canCreate: false }, { status: 403 });
}
