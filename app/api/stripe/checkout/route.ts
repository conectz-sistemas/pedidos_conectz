import { NextResponse } from "next/server";
export async function POST() {
  // MVP piloto: sem Stripe agora.
  return NextResponse.json({ error: "Cobrança desativada no MVP (Stripe indisponível)." }, { status: 404 });
}

