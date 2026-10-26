import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserTagFromCookie, getUserIdFromCookie } from "@/lib/cookies";

export async function POST(request: Request) {
  try {
    // 1. Pega o ID do usuário logado através do cookie
    const currentUserTag = String(await getUserTagFromCookie());
    const currentUserID = Number(await getUserIdFromCookie());

    if (!currentUserTag) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Recebe os dados do corpo da requisição (ID do usuário destino e os IDs dos itens)
    const body = await request.json();
    console.log(body);
    const { targetUserTag, itemIds } = body;

    // 3. Validações básicas
    if (
      !targetUserTag ||
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

    const parsedTargetUserTag = String(targetUserTag);

    // Impede transferir para si mesmo
    if (parsedTargetUserTag === currentUserTag) {
      return NextResponse.json(
        { error: "Você não pode transferir itens para si mesmo." },
        { status: 400 },
      );
    }

    // 4. Verifica se o usuário de destino realmente existe no banco
    const targetUser = await prisma.user.findUnique({
      where: { tag: parsedTargetUserTag },
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
        userId: currentUserID,
      },
      data: {
        userId: targetUser.id,
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
