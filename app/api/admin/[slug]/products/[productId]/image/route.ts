import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadPublicImageToSupabase } from "@/lib/supabaseStorage";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as string | undefined;
    const sessionMerchantId = (session?.user as any)?.merchantId as string | null | undefined;
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { slug, productId } = await params;

    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!merchant) return NextResponse.json({ error: "Lanchonete não encontrada" }, { status: 404 });
    if (role !== "SUPERADMIN" && sessionMerchantId !== merchant.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, merchantId: merchant.id },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    const form = await req.formData().catch(() => null);
    if (!form) return NextResponse.json({ error: "Form inválido" }, { status: 400 });

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      return NextResponse.json({ error: "A imagem deve ser PNG ou JPEG" }, { status: 400 });
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "Imagem muito grande (máx 5MB)" }, { status: 400 });
    }

    const ts = Date.now();
    const { publicUrl } = await uploadPublicImageToSupabase({
      bucket: "product-images",
      path: `${slug}/${productId}/${ts}`,
      file,
    });

    await prisma.product.update({
      where: { id: productId },
      data: { imageUrl: publicUrl },
    });

    return NextResponse.json({ ok: true, imageUrl: publicUrl });
  } catch (e: any) {
    // expõe o motivo real pro admin (bucket inexistente, env faltando, etc.)
    return NextResponse.json({ error: e?.message ?? "Falha ao enviar imagem" }, { status: 500 });
  }
}

