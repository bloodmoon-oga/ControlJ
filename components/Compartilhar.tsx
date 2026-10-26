"use client";

import { useState } from "react";

interface CompartilharProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (id: string) => void;
}

export default function Compartilhar({
  isOpen,
  onClose,
  onConfirm,
}: CompartilharProps) {
  const [inputID, setInputID] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!inputID.trim()) return;

    if (onConfirm) {
      onConfirm(inputID);
    } else {
      console.log("ID enviado:", inputID);
    }

    setInputID("");
    onClose();
  };

  return (
    // Fundo escuro semitransparente (Overlay) que bloqueia o fundo
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Container do Modal (caixa pequena centralizada) */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 p-6 space-y-4 animate-in fade-in zoom-in duration-150">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Compartilhar Item
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="share-id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Informe o ID para compartilhamento:
            </label>
            <input
              id="share-id"
              type="text"
              value={inputID}
              onChange={(e) => setInputID(e.target.value)}
              placeholder="Ex: 12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              autoFocus
              required
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
