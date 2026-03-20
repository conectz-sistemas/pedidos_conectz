# Pedidos ConectZ (MVP) — SaaS de pedidos digitais

MVP funcional do **Pedidos ConectZ** (multi-tenant por `slug`) para lanchonetes venderem via web, com:

- Tela do cliente: catálogo, personalização (remover / **trocar por equivalente sem custo** / extras pagos), carrinho e checkout.
- Painel da lanchonete (admin): pedidos com atualização automática + alerta sonoro, abre/fecha manual, cadastro de cardápio (ingredientes, grupos, produtos, ingredientes padrão, equivalentes e extras).
- SaaS: área do dono (`/saas`) e contratação de plano **R$49,90/mês** via Stripe (Checkout + webhook).

## Stack

- **Next.js** (App Router) — frontend + API
- **Neon** — PostgreSQL serverless (banco de dados)
- **Supabase** — Storage para imagens de produtos
- **Prisma**
- **NextAuth (Credentials)** — email/senha
- **Stripe** — assinatura (recorrência, opcional no MVP)

---

## Rodar localmente

### 1) Instalar dependências

```bash
cd pedidos_conectz
npm install
```

### 2) Configurar variáveis de ambiente

Crie um arquivo `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

Preencha:

- `DATABASE_URL` (Neon — connection string Pooled)
- `NEXTAUTH_URL` (ex: `http://localhost:3000`)
- `NEXTAUTH_SECRET` (qualquer string forte)
- `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (para upload de imagens)

### 3) Migrar o banco e rodar seed

```bash
npx prisma migrate dev
npx prisma db seed
```

> **Nota:** Se `prisma migrate dev` falhar com timeout (Neon), use `npx prisma db push` para aplicar o schema.

O seed cria apenas o **dono do SaaS** para o primeiro acesso (ou use `/start-dono`).

**Dono criado direto no banco:** Se o login falhar (senha em texto puro), corrija com:

```bash
EMAIL=seu@email.com SENHA='sua_senha' npx tsx scripts/fix-dono-password.ts
```

> Use aspas na senha se tiver caracteres especiais. Ver [docs/LOGIN-SUPERADMIN.md](docs/LOGIN-SUPERADMIN.md) para o fluxo completo.

**Novos comerciantes:** Cadastram-se em `/start` e ficam **pendentes** até o dono aprovar em `/saas`.

### 4) Subir o projeto (desenvolvimento)

```bash
npm run dev
```

Acesse:

- Landing: `http://localhost:3000`
- Login admin: `http://localhost:3000/admin/login`
- Dono do SaaS: `http://localhost:3000/saas`

---

## Rodar em produção

### Build

```bash
npm run build
```

### Iniciar servidor

```bash
npm run start
```

O servidor sobe na porta **3000** por padrão. Para alterar:

```bash
PORT=8080 npm run start
```

### Variáveis em produção

No `.env` de produção, ajuste:

- `NEXTAUTH_URL` → URL pública (ex: `https://pedidos-conectz.vercel.app`)

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

### Configurar personalização do produto

Para o cliente poder customizar (remover, trocar equivalentes, adicionar extras):

1. **Grupos** → crie grupos (ex: Proteínas, Saladas, Queijos)
2. **Ingredientes** → cadastre ingredientes com preço extra e grupo
3. **Produto** → crie o produto (nome, preço base, imagem)
4. **Editar personalização** → para cada produto:
   - Adicione **ingredientes padrão** (o que vem no lanche)
   - Para cada ingrediente: marque se pode **remover** e se é **travado** (padrão do lanche)
   - Marque os **equivalentes** (ingredientes que o cliente pode trocar sem custo)
   - Adicione **extras pagos** (ex: Ovo +R$2,00)

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

## Deploy

Veja [DEPLOY.md](./DEPLOY.md) para instruções completas.

- **Vercel**: deploy do Next.js
- **Neon**: PostgreSQL
- **Supabase**: Storage para imagens de produtos

Configure as variáveis no Vercel (incluindo Supabase para upload de imagens) e rode migrations.

---

## Observações importantes (cancelamento)

O MVP registra uma `cancellationFeeCents` quando o pedido é cancelado **depois de confirmado**.

Isso é **apenas registro** (não é cobrança automática) — regras/legislação e experiência do usuário variam e devem ser validadas com orientação jurídica antes de aplicar cobrança real.

