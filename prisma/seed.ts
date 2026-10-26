import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@email.com" },
    update: {},
    create: {
      email: "admin@email.com",
      password: hashedPassword,
      name: "Usuário Padrão",
      tag: "000000",
      items: {
        create: [
          {
            name: "Item de Teste 1",
            description: "Primeiro item criado automaticamente para testes",
            id: "0",
            status: "ativo",
          },
        ],
      },
    },
  });

  console.log("✅ Usuário padrão criado com sucesso: admin@email.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
2;
