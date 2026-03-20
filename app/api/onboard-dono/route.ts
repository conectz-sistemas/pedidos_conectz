import { NextResponse } from "next/server";

/** Rota desabilitada por segurança. O dono é criado apenas direto no banco. */
export async function POST() {
  return NextResponse.json({ error: "Rota desabilitada." }, { status: 403 });
}
