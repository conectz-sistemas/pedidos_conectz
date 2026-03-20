function sanitizeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

/** Erro que não deve ser retentado (ex: 404, 403). */
class NoRetryError extends Error {}

function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 408;
}

function parseStorageError(status: number, text: string): string {
  try {
    const json = JSON.parse(text);
    if (json?.code === "DatabaseTimeout" || json?.error === "DatabaseTimeout") {
      return "O servidor de imagens está demorando. Tente novamente em alguns segundos.";
    }
  } catch {
    // ignore
  }
  return `Falha ao enviar imagem para o Storage (${status}). ${text}`.trim();
}

export async function uploadPublicImageToSupabase(input: {
  bucket: string;
  path: string;
  file: File;
}) {
  const env = supabaseEnv();
  if (!env) {
    throw new Error(
      "Storage de imagens não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel (Settings → Environment Variables). Veja o README para detalhes."
    );
  }

  const safeName = sanitizeFileName(input.file.name || "image");
  const ext = safeName.includes(".") ? safeName.split(".").pop() : "";
  const finalPath = `${input.path}${ext ? `.${ext}` : ""}`;

  const uploadUrl = `${env.url}/storage/v1/object/${encodeURIComponent(input.bucket)}/${finalPath}`;
  const arrayBuffer = await input.file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const contentType = input.file.type || "application/octet-stream";

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.serviceKey}`,
          apikey: env.serviceKey,
          "content-type": contentType,
          "x-upsert": "true",
        },
        body,
      });

      if (res.ok) {
        const publicUrl = `${env.url}/storage/v1/object/public/${input.bucket}/${finalPath}`;
        return { publicUrl, path: finalPath };
      }

      const text = await res.text().catch(() => "");
      const msg = parseStorageError(res.status, text);
      lastError = new Error(msg);

      if (isRetryableStatus(res.status) && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        continue;
      }
      throw new NoRetryError(msg);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (e instanceof NoRetryError || attempt === MAX_RETRIES) {
        throw lastError;
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
    }
  }

  throw lastError ?? new Error("Falha ao enviar imagem");
}

