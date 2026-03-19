"use client";

export function BillingButton({ merchantSlug: _merchantSlug }: { merchantSlug: string }) {
  return (
    <button
      type="button"
      className="btn btn-primary btn-glow w-full md:w-auto"
      disabled
      title="Cobrança desativada nesta fase de validação"
    >
      Cobrança desativada (MVP piloto)
    </button>
  );
}

