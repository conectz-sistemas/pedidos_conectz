import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  try {
    const existing = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um dono cadastrado. Use a tela de login." },
        { status: 409 }
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const emailExists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (emailExists) {
      return NextResponse.json({ error: "Este email já está em uso." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "SUPERADMIN",
        merchantId: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[onboard-dono] Erro:", msg);
    return NextResponse.json({ error: msg || "Erro ao criar conta." }, { status: 500 });
  }
}
