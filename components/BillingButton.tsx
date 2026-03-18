"use client";

export function BillingButton({ merchantSlug }: { merchantSlug: string }) {
  async function go() {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ merchantSlug }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.url) window.location.href = json.url;
    else alert(json?.error ?? "Não foi possível abrir o checkout.");
  }

  return (
    <button
      type="button"
      className="rounded-xl bg-white text-black px-4 py-2 text-sm font-medium"
      onClick={go}
    >
      Assinar iUai — R$ 49,90/mês
    </button>
  );
}

