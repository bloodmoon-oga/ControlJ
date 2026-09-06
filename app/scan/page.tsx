'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import Link from 'next/link';

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-reader';
  const router = useRouter();

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Erro ao parar o leitor:', err);
      } finally {
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    setStatusMessage(null);
    setScanResult(null);

    // Limpa instância anterior caso exista
    await stopScanner();

    try {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          setScanResult(decodedText);
          await stopScanner();
          await updateItemStatus(decodedText);
        },
        () => {
          // Erro contínuo de leitura por frame (ignorado)
        }
      );
    } catch (err: any) {
      console.error('Erro ao iniciar a câmera:', err);
      setStatusMessage({
        type: 'error',
        text: 'Não foi possível acessar a câmera. Verifique as permissões do navegador ou se ela já está em uso.',
      });
      setIsScanning(false);
    }
  };

  const updateItemStatus = async (itemId: string) => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/items/${itemId.trim()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Ativo' }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar o item');
      }

      setStatusMessage({
        type: 'success',
        text: `Item "${data.name || itemId}" ativado com sucesso!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao atualizar o item.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await stopScanner();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

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
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-blue-600 text-white shadow-sm transition-colors"
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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-xl mx-auto space-y-6">
          <header>
            <h2 className="text-2xl font-bold text-gray-800">Escanear QR Code</h2>
            <p className="text-sm text-gray-500">
              Aproxime o QR Code com o ID do item da câmera para alterar o status para "Ativo".
            </p>
          </header>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
            {/* CONTAINER DA CÂMERA (Mantido estritamente isolado para o html5-qrcode) */}
            <div className="w-full min-h-[300px] bg-slate-100 rounded-lg overflow-hidden border border-gray-300 relative">
              <div id={qrCodeRegionId} className="w-full h-full" />
              
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-gray-400 pointer-events-none">
                  Clique no botão abaixo para ativar a câmera
                </div>
              )}
            </div>

            {/* BOTÕES DE CONTROLE */}
            <div className="mt-6 w-full flex justify-center">
              {!isScanning ? (
                <button
                  onClick={startScanner}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Abrir Câmera
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Fechar Câmera
                </button>
              )}
            </div>

            {/* STATUS DA REQUISIÇÃO */}
            {loading && (
              <p className="mt-4 text-sm font-semibold text-blue-600 animate-pulse">
                Atualizando item no banco de dados...
              </p>
            )}

            {scanResult && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 w-full break-all">
                <span className="font-semibold text-gray-800">ID LIDO:</span> {scanResult}
              </div>
            )}

            {statusMessage && (
              <div
                className={`mt-4 w-full p-4 rounded-lg text-sm font-medium ${
                  statusMessage.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}