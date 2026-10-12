import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-seguro';

// Auxiliar para ler o token direto dos COOKIES da requisição
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

// GET: Busca os itens do usuário
export async function GET() {
  const userId = Number(await getUserIdFromCookie());

  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(items);
}

// POST: Cria um novo item
export async function POST(request: Request) {
  const userId = Number(await getUserIdFromCookie());

  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { name, description, status } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      name,
      description,
      status: status || 'Ativo',
      userId,
    },
  });

  return NextResponse.json(item, { status: 201 });
}