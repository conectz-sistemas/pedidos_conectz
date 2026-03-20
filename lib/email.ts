import { promises as dns } from "dns";
import validator from "validator";

/** Domínios inválidos/fake que não devem ser aceitos em produção */
const BLOCKED_DOMAINS = new Set([
  "test.com",
  "test.org",
  "test.net",
  "example.com",
  "example.org",
  "example.net",
  "example.edu",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "10minutemail.com",
  "fakeinbox.com",
  "trashmail.com",
  "yopmail.com",
  "maildrop.cc",
  "temp-mail.org",
  "getnada.com",
  "mailnesia.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamail.org",
  "spam4.me",
  "dispostable.com",
  "mailinator.net",
  "mailinator.org",
  "mailinator.us",
  "mailinator2.com",
  "sogetthis.com",
  "mintemail.com",
  "emailondeck.com",
  "mohmal.com",
  "mytemp.email",
  "tmpeml.com",
  "tempail.com",
  "emailfake.com",
  "fakemail.net",
  "fakeinbox.info",
  "disposable.com",
  "mail-temp.com",
  "tempr.email",
  "tempinbox.co.uk",
  "inboxkitten.com",
  "getairmail.com",
  "mailsac.com",
  "mailcatch.com",
  "tempinbox.xyz",
  "mytempmail.com",
  "tempmail.de",
  "temp-mail.io",
  "emailtemp.org",
  "temp-mail.ru",
  "minuteinbox.com",
  "inboxbear.com",
  "mail-temporaire.fr",
  "temp-mail.org",
  "anonymousemail.me",
  "jetable.org",
  "mailnull.com",
  "spamgourmet.com",
  "mailinator.info",
  "mailinator.biz",
  "mailinator.co",
  "mailinator.de",
  "mailinator.es",
  "mailinator.fr",
  "mailinator.it",
  "mailinator.jp",
  "mailinator.ru",
  "mailinator.uk",
  "mailinator.xyz",
  "teste.com",
  "teste.com.br",
  "testando.com",
  "fake.com",
  "invalid.com",
  "noexist.com",
  "naoexiste.com",
  "asdf.com",
  "qwerty.com",
  "abc.com",
  "xyz.com",
  "localhost",
  "local",
]);

/**
 * Valida se o email é válido e aceitável para uso em produção.
 * - Formato RFC 5322 (via validator)
 * - Domínio não está na lista de bloqueados
 * - TLD tem pelo menos 2 caracteres
 */
export function isValidEmail(email: string): { valid: boolean; reason?: string } {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { valid: false, reason: "Email é obrigatório." };

  if (!validator.isEmail(trimmed, { allow_utf8_local_part: false })) {
    return { valid: false, reason: "Formato de email inválido." };
  }

  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) return { valid: false, reason: "Formato de email inválido." };

  const domain = trimmed.slice(atIndex + 1);
  if (!domain) return { valid: false, reason: "Domínio do email inválido." };

  const domainLower = domain.toLowerCase();
  if (BLOCKED_DOMAINS.has(domainLower)) {
    return { valid: false, reason: "Este domínio de email não é permitido." };
  }

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return { valid: false, reason: "Domínio do email inválido." };
  }

  if (domain.length > 253) {
    return { valid: false, reason: "Email inválido." };
  }

  return { valid: true };
}

/**
 * Verifica se o domínio do email possui registros MX (pode receber emails).
 * Rejeita domínios inexistentes ou que não estão configurados para receber email.
 */
export async function hasValidMxRecords(email: string): Promise<{ valid: boolean; reason?: string }> {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return { valid: false, reason: "Email inválido." };
  const domain = email.slice(atIndex + 1).toLowerCase();
  if (!domain) return { valid: false, reason: "Domínio inválido." };

  try {
    const mx = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      ),
    ]);
    if (!mx || mx.length === 0) {
      return { valid: false, reason: "Este domínio de email não existe ou não está configurado para receber mensagens." };
    }
    return { valid: true };
  } catch (e: any) {
    if (e?.code === "ENOTFOUND" || e?.code === "ENODATA") {
      return { valid: false, reason: "Este domínio de email não existe ou não está configurado para receber mensagens." };
    }
    if (e?.message === "Timeout") {
      return { valid: false, reason: "Não foi possível verificar o domínio. Tente novamente." };
    }
    console.error("[email] MX check error:", e?.message ?? e);
    return { valid: false, reason: "Não foi possível validar o email. Tente novamente." };
  }
}
