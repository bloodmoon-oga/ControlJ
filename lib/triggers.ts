import { PrismaClient } from '@prisma/client'
import { STATUS }       from "@/lib/status";

const prisma = new PrismaClient()

/**
 * Atualiza o status de todos os itens de um determinado usuário para "Não encontrado".
 * @param userId ID do usuário dono dos itens
 * @returns Retorna um objeto com a contagem de registros atualizados ({ count: number })
 */

export async function markAllUserItemsAsNotFound(userId: number) {
  try {
    const result = await prisma.item.updateMany({
      where: {
        userId: userId,
      },
      data: {
        status: STATUS.NOT_FOUND,
      },
    })

    console.log(`Itens atualizados: ${result.count}`)
    return result
  } catch (error) {
    console.error(`Erro ao atualizar itens do usuário ID ${userId}:`, error)
    throw error
  }
}


