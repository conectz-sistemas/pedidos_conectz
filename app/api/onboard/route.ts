import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  merchantName: z.string().min(2).max(80),
  slug: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
    }

    const data = parsed.data;
    const email = data.email.toLowerCase().trim();

    const [emailExists, slugExists] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { id: true } }),
      prisma.merchant.findUnique({ where: { slug: data.slug }, select: { id: true } }),
    ]);
    if (emailExists) return NextResponse.json({ error: "Este email já está em uso." }, { status: 409 });
    if (slugExists) return NextResponse.json({ error: "Este slug já está em uso. Escolha outro." }, { status: 409 });

    const passwordHash = await bcrypt.hash(data.password, 10);

    const merchant = await prisma.merchant.create({
      data: {
        name: data.merchantName.trim(),
        slug: data.slug.trim(),
        isOpen: true,
        subscriptionStatus: null,
        cancellationFeeCents: 0,
        isActive: false,
      },
      select: { id: true, slug: true },
    });

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "MERCHANT_ADMIN",
        merchantId: merchant.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, slug: merchant.slug });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const code = e?.code ?? e?.meta?.code;
    console.error("[onboard] Erro:", msg, code, e?.meta);
    return NextResponse.json(
      { error: msg || "Erro ao criar conta.", code },
      { status: 500 }
    );
  }
}

