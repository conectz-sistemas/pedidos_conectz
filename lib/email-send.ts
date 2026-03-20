import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(
  to: string,
  token: string,
  merchantName: string
): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY não configurado - email de verificação não enviado");
    return { ok: false, error: "Serviço de email não configurado" };
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/verify-email?token=${encodeURIComponent(token)}`;

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Pedidos ConectZ <onboarding@resend.dev>",
      to: [to],
      subject: "Confirme seu email - Pedidos ConectZ",
      html: `
        <p>Olá!</p>
        <p>Você criou uma conta no Pedidos ConectZ para o estabelecimento <strong>${merchantName}</strong>.</p>
        <p>Clique no link abaixo para confirmar seu email:</p>
        <p><a href="${verifyUrl}" style="color:#fff;background:#000;padding:10px 20px;text-decoration:none;border-radius:8px;display:inline-block;">Confirmar email</a></p>
        <p>Ou copie e cole no navegador: ${verifyUrl}</p>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não criou esta conta, ignore este email.</p>
      `,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[email] Send error:", e?.message ?? e);
    return { ok: false, error: e?.message ?? "Falha ao enviar email" };
  }
}
