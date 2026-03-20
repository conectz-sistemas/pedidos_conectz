# Como configurar o Resend no Pedidos ConectZ

O Resend envia os emails de verificação quando um comerciante cria conta. Sem ele, a verificação de email fica desativada (útil para testes locais).

---

## 1. Criar conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Clique em **Sign up** e crie sua conta (gratuita)
3. Confirme o email se solicitado

---

## 2. Obter a API Key

1. No painel do Resend, vá em [API Keys](https://resend.com/api-keys)
2. Clique em **Create API Key**
3. Dê um nome (ex: `Pedidos ConectZ`)
4. Escolha **Sending access** (só envio de emails)
5. Clique em **Add**
6. **Copie a chave** — ela só é exibida uma vez (começa com `re_`)

---

## 3. Configurar o `.env`

Adicione no seu `.env`:

```env
RESEND_API_KEY=re_sua_chave_aqui
RESEND_FROM_EMAIL="Pedidos ConectZ <onboarding@resend.dev>"
```

### Desenvolvimento (sem domínio próprio)

Use o email de teste do Resend:

```env
RESEND_FROM_EMAIL="Pedidos ConectZ <onboarding@resend.dev>"
```

> O Resend permite enviar de `onboarding@resend.dev` para testes, sem configurar domínio.

### Produção (com domínio próprio)

1. No Resend, vá em [Domains](https://resend.com/domains)
2. Adicione seu domínio (ex: `pedidosconectz.com`)
3. Configure os registros DNS (SPF e DKIM) conforme indicado
4. Aguarde a verificação
5. Use no `.env`:

```env
RESEND_FROM_EMAIL="Pedidos ConectZ <noreply@pedidosconectz.com>"
```

---

## 4. Testar

1. Reinicie o servidor (`npm run dev`)
2. Crie uma conta em `/start` com um email real
3. Verifique se o email de confirmação chegou
4. Clique no link para confirmar o email

---

## Plano gratuito

- **100 emails/dia**
- **3.000 emails/mês**
- Suficiente para MVP e testes

---

## Modo piloto (sem domínio verificado)

O Resend só permite enviar para **seu próprio email** quando usa `onboarding@resend.dev`. Para que os pilotos criem conta com seus próprios emails:

Adicione no `.env`:

```env
RESEND_PILOT_MODE=true
```

Com isso:
- O email de verificação **não é enviado**
- Usuários são **verificados automaticamente**
- Os pilotos criam conta normalmente e você aprova em `/saas`
- A verificação MX (domínio existe) continua ativa

**Remova** `RESEND_PILOT_MODE` quando tiver domínio verificado no Resend.

---

## Sem Resend

Se `RESEND_API_KEY` não estiver definido:

- O cadastro funciona normalmente
- Usuários são marcados como verificados automaticamente
- A verificação MX (domínio existe) continua ativa
- Útil para desenvolvimento local
