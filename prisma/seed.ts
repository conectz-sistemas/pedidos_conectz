import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function cents(v: number) {
  return Math.round(v * 100);
}

async function main() {
  // Em produção, evite carregar dados demo automaticamente.
  // Para rodar seed propositalmente em qualquer ambiente:
  //   SEED_DEMO=1 npx prisma db seed
  if (process.env.NODE_ENV === "production" && process.env.SEED_DEMO !== "1") {
    console.log("Seed ignorado em produção (defina SEED_DEMO=1 para permitir).");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  const merchant = await prisma.merchant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      slug: "demo",
      name: "Lanchonete Demo Pedidos ConectZ",
      isOpen: true,
      phone: "55 00 00000-0000",
      cancellationFeeCents: cents(2.5), // exemplo: taxa de cancelamento após confirmado
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: { merchantId: merchant.id, role: "MERCHANT_ADMIN" },
    create: {
      email: "admin@demo.com",
      passwordHash,
      role: "MERCHANT_ADMIN",
      merchantId: merchant.id,
    },
  });

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

  const proteinas = await prisma.ingredientGroup.upsert({
    where: { merchantId_name: { merchantId: merchant.id, name: "Proteínas" } },
    update: {},
    create: { merchantId: merchant.id, name: "Proteínas", sortOrder: 1 },
  });

  const saladas = await prisma.ingredientGroup.upsert({
    where: { merchantId_name: { merchantId: merchant.id, name: "Saladas" } },
    update: {},
    create: { merchantId: merchant.id, name: "Saladas", sortOrder: 2 },
  });

  const molhos = await prisma.ingredientGroup.upsert({
    where: { merchantId_name: { merchantId: merchant.id, name: "Molhos" } },
    update: {},
    create: { merchantId: merchant.id, name: "Molhos", sortOrder: 3 },
  });

  const adicionais = await prisma.ingredientGroup.upsert({
    where: { merchantId_name: { merchantId: merchant.id, name: "Adicionais" } },
    update: {},
    create: { merchantId: merchant.id, name: "Adicionais", sortOrder: 4 },
  });

  const [
    bacon,
    calabresa,
    frango,
    salsicha,
    hamburguer,
    presunto,
    cheddar,
    ovo,
    alface,
    tomate,
    cebola,
    queijo,
    pao,
    ketchup,
    maionese,
    mostarda,
    batataPalha,
  ] =
    await Promise.all([
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Bacon" } },
        update: { groupId: proteinas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Bacon",
          groupId: proteinas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: {
          merchantId_name: { merchantId: merchant.id, name: "Calabresa" },
        },
        update: { groupId: proteinas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Calabresa",
          groupId: proteinas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Frango" } },
        update: { groupId: proteinas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Frango",
          groupId: proteinas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Salsicha" } },
        update: { groupId: proteinas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Salsicha",
          groupId: proteinas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Hambúrguer" } },
        update: { groupId: proteinas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Hambúrguer",
          groupId: proteinas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Presunto" } },
        update: { groupId: proteinas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Presunto",
          groupId: proteinas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Cheddar" } },
        update: { groupId: adicionais.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Cheddar",
          groupId: adicionais.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Ovo" } },
        update: { groupId: adicionais.id, priceCents: cents(2.0) },
        create: {
          merchantId: merchant.id,
          name: "Ovo",
          groupId: adicionais.id,
          priceCents: cents(2.0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Alface" } },
        update: { groupId: saladas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Alface",
          groupId: saladas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Tomate" } },
        update: { groupId: saladas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Tomate",
          groupId: saladas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Cebola" } },
        update: { groupId: saladas.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Cebola",
          groupId: saladas.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Queijo" } },
        update: { groupId: adicionais.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Queijo",
          groupId: adicionais.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Pão" } },
        update: { priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Pão",
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Ketchup" } },
        update: { groupId: molhos.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Ketchup",
          groupId: molhos.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Maionese" } },
        update: { groupId: molhos.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Maionese",
          groupId: molhos.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Mostarda" } },
        update: { groupId: molhos.id, priceCents: cents(0) },
        create: {
          merchantId: merchant.id,
          name: "Mostarda",
          groupId: molhos.id,
          priceCents: cents(0),
        },
      }),
      prisma.ingredient.upsert({
        where: { merchantId_name: { merchantId: merchant.id, name: "Batata palha" } },
        update: { groupId: adicionais.id, priceCents: cents(1.5) },
        create: {
          merchantId: merchant.id,
          name: "Batata palha",
          groupId: adicionais.id,
          priceCents: cents(1.5),
        },
      }),
    ]);

  async function upsertProductByName(input: {
    name: string;
    description: string;
    basePrice: number;
  }) {
    const existing = await prisma.product.findFirst({
      where: { merchantId: merchant.id, name: input.name },
      select: { id: true },
    });
    return prisma.product.upsert({
      where: { id: existing?.id ?? "___create___" },
      update: {
        description: input.description,
        basePriceCents: cents(input.basePrice),
        isActive: true,
      },
      create: {
        merchantId: merchant.id,
        name: input.name,
        description: input.description,
        basePriceCents: cents(input.basePrice),
        isActive: true,
      },
    });
  }

  const [xBacon, xCalabresa, hotDog, xSalada] = await Promise.all([
    upsertProductByName({
      name: "X-Bacon",
      description: "Clássico com bacon. Você pode trocar por equivalente sem custo.",
      basePrice: 18.9,
    }),
    upsertProductByName({
      name: "X-Calabresa",
      description: "Calabresa com queijo e salada. Trocas controladas pelo comerciante.",
      basePrice: 19.9,
    }),
    upsertProductByName({
      name: "Hot-Dog",
      description: "Hot-dog tradicional com trocas justas (ex.: salsicha).",
      basePrice: 12.9,
    }),
    upsertProductByName({
      name: "X-Salada",
      description: "Hambúrguer com salada. Algumas trocas são permitidas (ex.: queijo).",
      basePrice: 17.9,
    }),
  ]);

  // limpa e recria a composição dos produtos (seed idempotente simples)
  await Promise.all([
    prisma.productIngredient.deleteMany({ where: { productId: { in: [xBacon.id, xCalabresa.id, hotDog.id, xSalada.id] } } }),
    prisma.productExtra.deleteMany({ where: { productId: { in: [xBacon.id, xCalabresa.id, hotDog.id, xSalada.id] } } }),
  ]);

  // X-Bacon
  const xBaconDefaults = await prisma.productIngredient.createManyAndReturn({
    data: [
      { productId: xBacon.id, ingredientId: pao.id, sortOrder: 1, isLocked: true, isRemovable: false } as any,
      { productId: xBacon.id, ingredientId: queijo.id, sortOrder: 2, isLocked: false, isRemovable: true } as any,
      { productId: xBacon.id, ingredientId: bacon.id, groupId: proteinas.id, sortOrder: 3, isLocked: false, isRemovable: true } as any,
      { productId: xBacon.id, ingredientId: alface.id, groupId: saladas.id, sortOrder: 4, isLocked: false, isRemovable: true } as any,
      { productId: xBacon.id, ingredientId: tomate.id, groupId: saladas.id, sortOrder: 5, isLocked: false, isRemovable: true } as any,
      { productId: xBacon.id, ingredientId: maionese.id, groupId: molhos.id, sortOrder: 6, isLocked: true, isRemovable: false } as any,
    ],
  });
  const xBaconBacon = xBaconDefaults.find((d) => d.ingredientId === bacon.id);
  if (!xBaconBacon) throw new Error("Seed inválido: bacon não encontrado");
  await prisma.productIngredientEquivalence.createMany({
    data: [
      { productIngredientId: xBaconBacon.id, baseIngredientId: bacon.id, equivalentIngredientId: calabresa.id },
      { productIngredientId: xBaconBacon.id, baseIngredientId: bacon.id, equivalentIngredientId: frango.id },
    ],
    skipDuplicates: true,
  });
  await prisma.productExtra.createMany({
    data: [
      { productId: xBacon.id, ingredientId: ovo.id, extraPriceCents: cents(2.0), isActive: true, sortOrder: 1 },
      { productId: xBacon.id, ingredientId: cheddar.id, extraPriceCents: cents(3.5), isActive: true, sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  // X-Calabresa (troca permitida para queijo -> cheddar, e salada pode trocar entre si)
  const xCalabresaDefaults = await prisma.productIngredient.createManyAndReturn({
    data: [
      { productId: xCalabresa.id, ingredientId: pao.id, sortOrder: 1, isLocked: true, isRemovable: false } as any,
      { productId: xCalabresa.id, ingredientId: calabresa.id, groupId: proteinas.id, sortOrder: 2, isLocked: true, isRemovable: false } as any,
      { productId: xCalabresa.id, ingredientId: queijo.id, sortOrder: 3, isLocked: false, isRemovable: true } as any,
      { productId: xCalabresa.id, ingredientId: alface.id, groupId: saladas.id, sortOrder: 4, isLocked: false, isRemovable: true } as any,
      { productId: xCalabresa.id, ingredientId: tomate.id, groupId: saladas.id, sortOrder: 5, isLocked: false, isRemovable: true } as any,
      { productId: xCalabresa.id, ingredientId: ketchup.id, groupId: molhos.id, sortOrder: 6, isLocked: true, isRemovable: false } as any,
    ],
  });
  const xCalabresaQueijo = xCalabresaDefaults.find((d) => d.ingredientId === queijo.id);
  const xCalabresaAlface = xCalabresaDefaults.find((d) => d.ingredientId === alface.id);
  const xCalabresaTomate = xCalabresaDefaults.find((d) => d.ingredientId === tomate.id);
  if (!xCalabresaQueijo || !xCalabresaAlface || !xCalabresaTomate) throw new Error("Seed inválido: faltou ingrediente");
  await prisma.productIngredientEquivalence.createMany({
    data: [
      { productIngredientId: xCalabresaQueijo.id, baseIngredientId: queijo.id, equivalentIngredientId: cheddar.id },
      { productIngredientId: xCalabresaAlface.id, baseIngredientId: alface.id, equivalentIngredientId: tomate.id },
      { productIngredientId: xCalabresaAlface.id, baseIngredientId: alface.id, equivalentIngredientId: cebola.id },
      { productIngredientId: xCalabresaTomate.id, baseIngredientId: tomate.id, equivalentIngredientId: alface.id },
      { productIngredientId: xCalabresaTomate.id, baseIngredientId: tomate.id, equivalentIngredientId: cebola.id },
    ],
    skipDuplicates: true,
  });
  await prisma.productExtra.createMany({
    data: [
      { productId: xCalabresa.id, ingredientId: ovo.id, extraPriceCents: cents(2.0), isActive: true, sortOrder: 1 },
      { productId: xCalabresa.id, ingredientId: bacon.id, extraPriceCents: cents(5.0), isActive: true, sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  // Hot-Dog (salsicha não pode virar calabresa; só troca justa)
  const hotDogDefaults = await prisma.productIngredient.createManyAndReturn({
    data: [
      { productId: hotDog.id, ingredientId: pao.id, sortOrder: 1, isLocked: true, isRemovable: false } as any,
      { productId: hotDog.id, ingredientId: salsicha.id, groupId: proteinas.id, sortOrder: 2, isLocked: false, isRemovable: true } as any,
      { productId: hotDog.id, ingredientId: batataPalha.id, groupId: adicionais.id, sortOrder: 3, isLocked: false, isRemovable: true } as any,
      { productId: hotDog.id, ingredientId: ketchup.id, groupId: molhos.id, sortOrder: 4, isLocked: false, isRemovable: true } as any,
      { productId: hotDog.id, ingredientId: mostarda.id, groupId: molhos.id, sortOrder: 5, isLocked: false, isRemovable: true } as any,
    ],
  });
  const hotDogSalsicha = hotDogDefaults.find((d) => d.ingredientId === salsicha.id);
  if (!hotDogSalsicha) throw new Error("Seed inválido: salsicha não encontrada");
  await prisma.productIngredientEquivalence.createMany({
    data: [
      { productIngredientId: hotDogSalsicha.id, baseIngredientId: salsicha.id, equivalentIngredientId: frango.id },
      { productIngredientId: hotDogSalsicha.id, baseIngredientId: salsicha.id, equivalentIngredientId: presunto.id },
    ],
    skipDuplicates: true,
  });
  await prisma.productExtra.createMany({
    data: [
      { productId: hotDog.id, ingredientId: cheddar.id, extraPriceCents: cents(3.0), isActive: true, sortOrder: 1 },
      { productId: hotDog.id, ingredientId: ovo.id, extraPriceCents: cents(2.0), isActive: true, sortOrder: 2 },
    ],
    skipDuplicates: true,
  });

  // X-Salada (queijo pode trocar por cheddar; hambúrguer é padrão)
  const xSaladaDefaults = await prisma.productIngredient.createManyAndReturn({
    data: [
      { productId: xSalada.id, ingredientId: pao.id, sortOrder: 1, isLocked: true, isRemovable: false } as any,
      { productId: xSalada.id, ingredientId: hamburguer.id, groupId: proteinas.id, sortOrder: 2, isLocked: true, isRemovable: false } as any,
      { productId: xSalada.id, ingredientId: queijo.id, sortOrder: 3, isLocked: false, isRemovable: true } as any,
      { productId: xSalada.id, ingredientId: alface.id, groupId: saladas.id, sortOrder: 4, isLocked: false, isRemovable: true } as any,
      { productId: xSalada.id, ingredientId: tomate.id, groupId: saladas.id, sortOrder: 5, isLocked: false, isRemovable: true } as any,
      { productId: xSalada.id, ingredientId: maionese.id, groupId: molhos.id, sortOrder: 6, isLocked: false, isRemovable: true } as any,
    ],
  });
  const xSaladaQueijo = xSaladaDefaults.find((d) => d.ingredientId === queijo.id);
  if (!xSaladaQueijo) throw new Error("Seed inválido: queijo não encontrado");
  await prisma.productIngredientEquivalence.createMany({
    data: [{ productIngredientId: xSaladaQueijo.id, baseIngredientId: queijo.id, equivalentIngredientId: cheddar.id }],
    skipDuplicates: true,
  });
  await prisma.productExtra.createMany({
    data: [
      { productId: xSalada.id, ingredientId: bacon.id, extraPriceCents: cents(5.0), isActive: true, sortOrder: 1 },
      { productId: xSalada.id, ingredientId: ovo.id, extraPriceCents: cents(2.0), isActive: true, sortOrder: 2 },
    ],
    skipDuplicates: true,
  });
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

