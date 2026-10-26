import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromCookie } from "@/lib/cookies";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tag: string }> },
) {
  try {
    const { tag } = await params;
    const userId = await getUserIdFromCookie();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!tag) {
      return NextResponse.json(
        { error: "A tag do usuário é obrigatória." },
        { status: 400 },
      );
    }

    // Busca o usuário pelo campo tag e seleciona apenas o nome
    const user = await prisma.user.findUnique({
      where: { tag: tag },
      select: { name: true, email: true }, // Retorna o nome (e email se quiser)
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário por tag:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
