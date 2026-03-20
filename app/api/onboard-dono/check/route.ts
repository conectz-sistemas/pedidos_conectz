import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const existing = await prisma.user.findFirst({
    where: { role: "SUPERADMIN" },
    select: { id: true },
  });
  return NextResponse.json({ canCreate: !existing });
}
