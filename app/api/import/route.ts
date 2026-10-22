import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; 

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Nenhum item fornecido.' }, { status: 400 });
    }

    // TODO: Substitua pelo ID do usuário logado na sua sessão atual
    const currentUserId = 1; 

    // Prepara os dados para inserção em massa com Prisma
    const itemsToInsert = items.map((item) => ({
      name: String(item.name || '').trim(),
      description: item.description ? String(item.description) : null,
      location: item.location ? String(item.location) : null,
      status: item.status ? String(item.status) : 'Ativo',
      userId: currentUserId,
    }));

    // Insere no SQLite (Removido o skipDuplicates que causava o erro de tipagem)
    const result = await prisma.item.createMany({
      data: itemsToInsert,
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count, 
      message: `${result.count} itens importados com sucesso!` 
    });
  } catch (error: any) {
    console.error('Erro ao inserir itens no banco:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar os itens: ' + error.message }, { status: 500 });
  }
}