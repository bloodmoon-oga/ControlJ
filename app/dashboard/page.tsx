'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Aside from '@/components/Aside';


interface Item {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Ativo');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [order, setOrder] = useState(false);
  const [cpItems, setCpItems] = useState<Item[]>([]);
  const router = useRouter();
  const states = ['Geral', 'Ativo', 'Pendente', 'Inativo'];
  const [iter, setIter] = useState(0)
  useEffect(() => {
    fetchItems();
  }, []);

  function sortItemsByName<T extends { name: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })

        return order ? comparison : -comparison;
      }
    )
  }

  function SwitchStatus() {
    if (states[iter] === 'Geral'){
      setItems(cpItems)
    }
    else{
      setItems(cpItems.filter((x)=>(x.status === states[iter])));
      console.log(states[iter]);
    }
    setIter( (5 + iter ) % 4);
    console.log(iter)
  }


  const handleSortClick = () => {
    setItems((prevItems) => sortItemsByName(prevItems))
    setOrder(!order);
  }

  const fetchItems = async () => {
    try {
      // O navegador envia o cookie auth_token automaticamente nesta chamada
      const res = await fetch('/api/items');

      if (res.status === 401) {
        //router.push('/login');
        return;
      }

      const data = await res.json();
      setItems(data);
      setCpItems([...data]);
      console.log(data)
    } catch (err) {
      console.error('Erro ao carregar itens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, status }),
      });

      if (res.ok) {
        setName('');
        setStatus('Ativo');
        fetchItems();
      }
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
    } finally {
      setAdding(false);
    }
  };


  return (
    <div className="flex h-screen bg-gray-100">
      {/* MENU LATERAL (SIDEBAR) */}
      <Aside></Aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">1
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
              <p className="text-sm text-gray-500">Gerencie seus itens registrados e status atual.</p>
            </div>
          </header>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Novo Item</h3>
            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Nome do item"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Ativo">Ativo</option>
                <option value="Pendente">Pendente</option>
                <option value="Inativo">Inativo</option>
              </select>
              <button
                type="submit"
                disabled={adding}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {adding ? 'Salvando...' : 'Adicionar'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Lista de Itens</h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Carregando itens...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Nenhum item cadastrado ainda.
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3"><button
                      onClick={handleSortClick}
                    >Nome</button></th>
                    <th className="px-6 py-3"><button
                      onClick={SwitchStatus}>Status</button></th>
                  </tr>
                </thead>
                </table>
              </div>
              
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3"><button
                      onClick={handleSortClick}
                    >Nome</button></th>
                    <th className="px-6 py-3"><button
                      onClick={SwitchStatus}>Status</button></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <a href={`./item/${item.id}`}>
                            {item.name}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Ativo'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'Pendente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}