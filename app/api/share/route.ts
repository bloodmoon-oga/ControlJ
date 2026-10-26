import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromCookie } from "@/lib/cookies";

export async function POST(request: Request) {
  try {
    // 1. Pega o ID do usuário logado através do cookie
    const currentUserId = Number(await getUserIdFromCookie());

    if (!currentUserId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Recebe os dados do corpo da requisição (ID do usuário destino e os IDs dos itens)
    const body = await request.json();
    const { targetUserId, itemIds } = body;

    // 3. Validações básicas
    if (
      !targetUserId ||
      !itemIds ||
      !Array.isArray(itemIds) ||
      itemIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Dados inválidos. Informe o ID do usuário destino e os itens selecionados.",
        },
        { status: 400 },
      );
    }

    const parsedTargetUserId = Number(targetUserId);

    // Impede transferir para si mesmo
    if (parsedTargetUserId === currentUserId) {
      return NextResponse.json(
        { error: "Você não pode transferir itens para si mesmo." },
        { status: 400 },
      );
    }

    // 4. Verifica se o usuário de destino realmente existe no banco
    const targetUser = await prisma.user.findUnique({
      where: { id: parsedTargetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "O usuário de destino não foi encontrado." },
        { status: 404 },
      );
    }

    // 5. Atualiza a propriedade userId dos itens no banco
    // Usamos `userId: currentUserId` no `where` por segurança: só altera se o item for seu
    const updateResult = await prisma.item.updateMany({
      where: {
        id: { in: itemIds },
        userId: currentUserId,
      },
      data: {
        userId: parsedTargetUserId,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: "Nenhum item válido foi encontrado para transferência." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `${updateResult.count} item(ns) transferido(s) com sucesso!`,
    });
  } catch (err) {
    console.error("Erro ao transferir itens:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
