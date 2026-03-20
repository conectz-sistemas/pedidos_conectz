export const paymentMethodLabel: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  CASH: "Dinheiro",
};

export const paymentTimingLabel: Record<string, string> = {
  ON_ORDER: "Na compra",
  ON_PICKUP_OR_DELIVERY: "Na retirada/entrega",
};

export function formatPaymentMethod(value: string): string {
  return paymentMethodLabel[value] ?? value;
}

export function formatPaymentTiming(value: string): string {
  return paymentTimingLabel[value] ?? value;
}
