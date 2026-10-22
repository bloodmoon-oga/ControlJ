'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import Link from 'next/link';
import Aside from '@/components/Aside';

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



  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* MENU LATERAL */}
      <Aside></Aside>

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