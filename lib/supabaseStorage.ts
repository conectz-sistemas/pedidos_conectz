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

export async function uploadPublicImageToSupabase(input: {
  bucket: string;
  path: string;
  file: File;
}) {
  const env = supabaseEnv();
  if (!env) {
    throw new Error("Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }

  const safeName = sanitizeFileName(input.file.name || "image");
  const ext = safeName.includes(".") ? safeName.split(".").pop() : "";
  const finalPath = `${input.path}${ext ? `.${ext}` : ""}`;

  const uploadUrl = `${env.url}/storage/v1/object/${encodeURIComponent(input.bucket)}/${finalPath}`;
  const arrayBuffer = await input.file.arrayBuffer();

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.serviceKey}`,
      apikey: env.serviceKey,
      "content-type": input.file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: Buffer.from(arrayBuffer),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar imagem para o Storage (${res.status}). ${text}`.trim());
  }

  const publicUrl = `${env.url}/storage/v1/object/public/${input.bucket}/${finalPath}`;
  return { publicUrl, path: finalPath };
}

