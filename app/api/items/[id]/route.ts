import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// PATCH /api/items/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const newStatus = body.status || 'Ativo';

  try {
    // Verifica se o item pertence ao usuário logado
    const existingItem = await prisma.item.findFirst({
      where: { id, userId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item não encontrado ou não pertence ao usuário' },
        { status: 404 }
      );
    }

    // Atualiza o status no banco de dados
    const updatedItem = await prisma.item.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar o item' },
      { status: 500 }
    );
  }
}