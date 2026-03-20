import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Em produção, o seed só roda se SEED_DEMO=1 (evita sobrescrever dados reais).
  if (process.env.NODE_ENV === "production" && process.env.SEED_DEMO !== "1") {
    console.log("Seed ignorado em produção (defina SEED_DEMO=1 para permitir).");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  // Cria o dono do SaaS (SUPERADMIN) para o primeiro acesso.
  // O dono é criado apenas direto no banco (por segurança).
  await prisma.user.upsert({
    where: { email: "dono@pedidosconectz.com" },
    update: { role: "SUPERADMIN", merchantId: null },
    create: {
      email: "dono@pedidosconectz.com",
      passwordHash,
      role: "SUPERADMIN",
      merchantId: null,
    },
  });

  console.log("Seed concluído. Dono: dono@pedidosconectz.com / admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
