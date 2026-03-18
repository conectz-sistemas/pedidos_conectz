import { prisma } from "@/lib/prisma";

export async function getMerchantBySlugOrThrow(slug: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      isOpen: true,
      phone: true,
      cancellationFeeCents: true,
      subscriptionStatus: true,
    },
  });
  if (!merchant) throw new Error("Lanchonete não encontrada.");
  return merchant;
}

