'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface ItemData {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: string;
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Desembrulha os parâmetros dinâmicos usando `use()`
  const { id } = use(params);
  const router = useRouter();

  const [item, setItem] = useState<ItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados dos formulários de edição
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [newId, setNewId] = useState('');

  // Carrega os dados do Item
  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`/api/items/${id}`);
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Falha ao carregar item');
        }

        setItem(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setNewId(data.id || '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id, router]);

  // Salvar alterações no Item
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          newId: newId !== id ? newId : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar alterações');
      }

      setSuccess('Item atualizado com sucesso!');
      setItem(data);

      // Se o ID mudou, redireciona para a nova URL do item
      if (newId !== id) {
        setTimeout(() => {
          router.push(`/item/${newId}`);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* MENU LATERAL */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-wide text-blue-400">
              ControlJ System
            </h1>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>

            <Link
              href="/scan"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              Ler QR Code
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-slate-800 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8 text-black">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
                ← Voltar para a lista
              </Link>
              <h2 className="text-2xl font-bold text-gray-800">Detalhes do Item</h2>
            </div>

            {item && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === 'Ativo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {item.status}
              </span>
            )}
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center text-gray-500">
              Carregando informações do item...
            </div>
          ) : error && !item ? (
            <div className="bg-red-100 text-red-800 p-4 rounded-xl border border-red-200">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* FORMULÁRIO DE EDIÇÃO */}
              <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Dados</h3>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 text-sm rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-100 text-green-800 text-sm rounded-lg border border-green-200">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID do Item
                    </label>
                    <input
                      type="text"
                      value={newId}
                      onChange={(e) => setNewId(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Atenção: alterar o ID mudará o código QR associado a este item.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome / Título
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Adicione observações ou detalhes do item..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD DO QR CODE */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-between text-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">QR Code do Item</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Este código é utilizado na página de leitura para ativar o item.
                  </p>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-inner my-2">
                  <QRCodeSVG value={item?.id || id} size={180} />
                </div>

                <div className="w-full mt-4">
                  <span className="block font-mono text-xs text-gray-500 break-all mb-3">
                    ID: {item?.id}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors border border-slate-300"
                  >
                    Imprimir QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}