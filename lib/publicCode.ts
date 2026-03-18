export function makePublicCode() {
  // Curto, legível no WhatsApp, evita ambiguidade (0/O, 1/I)
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function normalizeLetters(input: string) {
  // remove acentos e caracteres não-letras
  const ascii = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return ascii.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

function onlyDigits(input: string) {
  return input.replace(/\D/g, "");
}

export function makePublicCodeFromCustomer(customerName: string, customerWhatsApp: string) {
  const letters = normalizeLetters(customerName);
  const digits = onlyDigits(customerWhatsApp);

  const initials = (letters.slice(0, 2) || "XX").padEnd(2, "X");
  const last4 = (digits.slice(-4) || "0000").padStart(4, "0");
  return `${initials}${last4}`;
}

