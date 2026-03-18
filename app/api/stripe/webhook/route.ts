import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret ausente" }, { status: 500 });

  const stripe = getStripe();

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  async function setMerchantSub(merchantId: string, data: { status?: string; subId?: string | null }) {
    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        subscriptionStatus: data.status ?? undefined,
        stripeSubId: data.subId ?? undefined,
      },
    });
  }

  // Eventos principais pro MVP
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const merchantId = (session.metadata?.merchantId as string | undefined) ?? undefined;
    const subId = (session.subscription as string | null) ?? null;
    if (merchantId) await setMerchantSub(merchantId, { status: "active", subId });
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const merchantId = (sub.metadata?.merchantId as string | undefined) ?? undefined;
    if (merchantId) await setMerchantSub(merchantId, { status: sub.status, subId: sub.id });
  }

  return NextResponse.json({ received: true });
}

