import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function generateShortTag(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }
    // Loop para garantir que a tag gerada seja 100% única no banco
    let tag = "";
    let isUnique = false;

    while (!isUnique) {
      tag = generateShortTag(); // Exemplo: "a8X2m9"
      const existingUser = await prisma.user.findUnique({ where: { tag } });
      if (!existingUser) {
        isUnique = true; // Se não existe, a tag está livre!
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está em uso" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tag: tag,
      },
    });

    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso", userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno ao realizar cadastro" },
      { status: 500 },
    );
  }
}
