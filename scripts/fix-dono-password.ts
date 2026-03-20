/**
 * Script para corrigir a senha do usuário dono (SUPERADMIN).
 * Use quando o login falhar por senha incorreta (ex.: senha foi inserida em texto puro no banco).
 *
 * Uso: EMAIL=conectz.adm@gmail.com SENHA=sua_senha npx tsx scripts/fix-dono-password.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.EMAIL?.trim();
  const password = process.env.SENHA ?? process.env.PASSWORD;

  if (!email || !password) {
    console.error("Uso: EMAIL=seu@email.com SENHA=sua_senha npx tsx scripts/fix-dono-password.ts");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error("Usuário não encontrado:", email);
    process.exit(1);
  }

  if (user.role !== "SUPERADMIN") {
    console.error("Usuário não é SUPERADMIN:", user.role);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  console.log("Senha atualizada com sucesso para:", user.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
