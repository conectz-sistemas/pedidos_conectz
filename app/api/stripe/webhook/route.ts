import { NextResponse } from "next/server";

export async function POST() {
  // MVP piloto: sem Stripe agora.
  return NextResponse.json({ error: "Webhook desativado no MVP (Stripe indisponível)." }, { status: 404 });
}

