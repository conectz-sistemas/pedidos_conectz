# Login do Superadmin (Dono da Plataforma)

## Fluxo completo

### 1. Garantir que o usuário existe no banco

O dono pode ser criado de duas formas:

**A) Via seed (desenvolvimento):**
```bash
npx prisma db seed
```
Cria `dono@pedidosconectz.com` com senha `admin123`.

**B) Direto no banco (produção):**
Inserir manualmente na tabela `User` com:
- `email`: seu email
- `passwordHash`: **hash bcrypt da senha** (não texto puro)
- `role`: `SUPERADMIN`
- `merchantId`: `null`

### 2. Corrigir a senha (se o login falhar)

Se você criou o usuário direto no banco e colocou a senha em texto puro, o login não funciona. Corrija com:

```bash
cd pedidos_conectz
EMAIL=conectz.adm@gmail.com SENHA=sua_senha_aqui npx tsx scripts/fix-dono-password.ts
```

**Exemplo:**
```bash
EMAIL=conectz.adm@gmail.com SENHA='edISA$8525conectZ' npx tsx scripts/fix-dono-password.ts
```

> Use aspas na senha se ela tiver caracteres especiais (`$`, `!`, etc.).

### 3. Subir o projeto

```bash
npm run dev
```

### 4. Fazer login

1. Acesse: **http://localhost:3000/admin/login**
2. Digite o **email** do superadmin
3. Digite a **senha**
4. Clique em **Entrar**

### 5. Acessar o painel do dono

Após o login, você será redirecionado para `/admin`. Clique em **"Dono do SaaS"** para ir para `/saas` e gerenciar os estabelecimentos.

---

## Comandos resumidos (copiar e colar)

```bash
# 1. Ir para o projeto
cd pedidos_conectz

# 2. Corrigir senha do superadmin (se necessário)
EMAIL=conectz.adm@gmail.com SENHA='sua_senha' npx tsx scripts/fix-dono-password.ts

# 3. Subir o servidor
npm run dev

# 4. Abrir no navegador
# http://localhost:3000/admin/login
```

---

## Verificar se o usuário existe

```bash
npx prisma studio
```

Abra a tabela **User**, procure pelo email. Verifique:
- `role` = `SUPERADMIN`
- `merchantId` = `null`
- `passwordHash` = string longa começando com `$2` (hash bcrypt)

Se `passwordHash` parecer a senha em texto (ex.: `edISA$8525conectZ`), rode o script de correção.
