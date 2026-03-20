import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token?.trim()) {
      return NextResponse.redirect(
        new URL("/verify-email?error=token_invalido", req.url).origin
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=token_expirado", req.url).origin
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    return NextResponse.redirect(new URL("/verify-email?success=1", req.url).origin);
  } catch (e: any) {
    console.error("[verify-email] Erro:", e?.message ?? e);
    return NextResponse.redirect(
      new URL("/verify-email?error=erro", req.url).origin
    );
  }
}
