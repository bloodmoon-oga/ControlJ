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

// GET /api/items/[id] - Busca dados de um único item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const item = await prisma.item.findFirst({
      where: { id, userId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id] - Atualiza campos do item (status, descrição ou id)
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

  try {
    const existingItem = await prisma.item.findFirst({
      where: { id, userId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item não encontrado ou não pertence ao usuário' },
        { status: 404 }
      );
    }

    // Se estiver mudando o ID, verifica se o novo ID já não está em uso por outro item
    if (body.newId && body.newId !== id) {
      const idConflict = await prisma.item.findUnique({
        where: { id: body.newId },
      });

      if (idConflict) {
        return NextResponse.json(
          { error: 'Já existe um item com esse novo ID' },
          { status: 400 }
        );
      }
    }

    // Monta objeto com apenas os campos enviados no body
    const dataToUpdate: any = {};
    if (body.newId) dataToUpdate.id = body.newId;
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.status !== undefined) dataToUpdate.status = body.status;

    const updatedItem = await prisma.item.update({
      where: { id },
      data: dataToUpdate,
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