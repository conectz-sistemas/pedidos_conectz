# Deploy — Pedidos ConectZ

## Stack

- **Vercel** — hospedagem Next.js
- **Neon** — PostgreSQL serverless
- **Supabase** — Storage para imagens de produtos

---

## Variáveis no Vercel

Em **Settings** → **Environment Variables**, configure:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Connection string do Neon (Pooled) |
| `NEXTAUTH_URL` | Sim | `https://pedidos-conectz.vercel.app` |
| `NEXTAUTH_SECRET` | Sim | String secreta forte |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim* | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim* | Service Role Key do Supabase |

\* Necessário para upload de imagens de produtos.

---

## Supabase Storage (imagens)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Seu projeto → **Storage** → **New bucket**
3. Nome: `product-images`
4. Marque como **Public**
5. Crie o bucket

---

## Neon

1. Crie o projeto em [neon.tech](https://neon.tech)
2. Copie a connection string **Pooled**
3. Use como `DATABASE_URL` no Vercel
4. Rode migrações: `DATABASE_URL="..." npx prisma migrate deploy`
