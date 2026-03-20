import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    if (!session?.user?.email || role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { id } = await params;
    const json = await req.json().catch(() => null);
    const action = String(json?.action ?? "");

    if (!["approve", "block", "unblock"].includes(action)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!merchant) return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });

    if (action === "approve") {
      await prisma.merchant.update({
        where: { id },
        data: { isActive: true, isBlocked: false },
      });
    } else if (action === "block") {
      await prisma.merchant.update({
        where: { id },
        data: { isBlocked: true },
      });
    } else {
      await prisma.merchant.update({
        where: { id },
        data: { isBlocked: false },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    console.error("[saas-merchant] Erro:", msg);
    return NextResponse.json({ error: msg || "Erro" }, { status: 500 });
  }
}
