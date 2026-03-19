# Pedidos ConectZ (MVP) — SaaS de pedidos digitais

MVP funcional do **Pedidos ConectZ** (multi-tenant por `slug`) para lanchonetes venderem via web, com:

- Tela do cliente: catálogo, personalização (remover / **trocar por equivalente sem custo** / extras pagos), carrinho e checkout.
- Painel da lanchonete (admin): pedidos com atualização automática + alerta sonoro, abre/fecha manual, cadastro de cardápio (ingredientes, grupos, produtos, ingredientes padrão, equivalentes e extras).
- SaaS: área do dono (`/saas`) e contratação de plano **R$49,90/mês** via Stripe (Checkout + webhook).

## Stack

- **Next.js** (App Router) — frontend + API
- **PostgreSQL** — recomendado Supabase (grátis para MVP)
- **Prisma**
- **NextAuth (Credentials)** — email/senha
- **Stripe** — assinatura (recorrência)

---

## Rodar localmente

### 1) Instalar dependências

```bash
cd iuai
npm install
```

### 2) Configurar variáveis de ambiente

Crie um arquivo `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

Preencha principalmente:

- `DATABASE_URL` (Postgres)
- `NEXTAUTH_URL` (ex: `http://localhost:3000`)
- `NEXTAUTH_SECRET` (qualquer string forte)

### 3) Migrar o banco e rodar seed

```bash
npx prisma migrate dev
npx prisma db seed
```

O seed cria a lanchonete **demo** e exemplos para a lógica de equivalentes:

- Produto: **X-Bacon**
- Ingrediente padrão: **Bacon**
- Equivalentes sem custo: **Calabresa**, **Frango**
- Extra pago: **Ovo (+R$2,00)**

Também cria usuários:

- **Admin da lanchonete**: `admin@demo.com` / senha `admin123`
- **Dono do SaaS**: `dono@pedidosconectz.com` / senha `admin123`

### 4) Subir o projeto

```bash
npm run dev
```

Acesse:

- Cliente (loja demo): `http://localhost:3000/t/demo`
- Login admin: `http://localhost:3000/admin/login`
- Dono do SaaS: `http://localhost:3000/saas`

---

## Fluxo principal (MVP)

### Cliente

1. Entra na loja: `/t/{slug}`
2. Escolhe um produto
3. Personaliza:
   - **Remover** ingrediente padrão
   - **Trocar por equivalente sem custo** (quando existir)
   - Adicionar **extras pagos**
4. Finaliza com:
   - Nome / WhatsApp
   - Retirada ou delivery
   - Forma de pagamento e se precisa de troco (dinheiro)
5. Recebe um código público (ex: `AB12CD`) e acompanha em `/t/{slug}/order/{publicCode}`

### Admin

- Visualiza pedidos e muda status em `/admin/{slug}/orders`
- Abre/fecha manualmente a loja (botão no topo)
- Cadastra cardápio e personalização em `/admin/{slug}/catalog`

---

## Assinatura (Stripe)

### Variáveis

No `.env`:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID_BRL_4990` (Price recorrente mensal do plano)
- `STRIPE_WEBHOOK_SECRET`

### Checkout

No painel: `/admin/{slug}/billing` → botão “Assinar”.

### Webhook

Endpoint:

- `POST /api/stripe/webhook`

Para testar local, use o Stripe CLI (exemplo):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Deploy (sugestão gratuita)

- **Vercel**: deploy do Next.js
- **Supabase**: Postgres (e opcionalmente Storage/Realtime para evoluções)

No Vercel, configure as env vars do `.env` e rode migrations (via GitHub Actions, CLI ou manualmente pelo Prisma).

---

## Observações importantes (cancelamento)

O MVP registra uma `cancellationFeeCents` quando o pedido é cancelado **depois de confirmado**.

Isso é **apenas registro** (não é cobrança automática) — regras/legislação e experiência do usuário variam e devem ser validadas com orientação jurídica antes de aplicar cobrança real.

