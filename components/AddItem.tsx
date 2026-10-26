interface Item {
  id: string;
  name: string;
  description?: string;
  status: string;
}

interface Update {
  setUpdate: Dispatch<SetStateAction<boolean | undefined>>;
  update: boolean | undefined;
}
import { useState, Dispatch, SetStateAction } from "react";
export default function AddItem({ setUpdate, update }: Update) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [adding, setAdding] = useState(false);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });

      if (res.ok) {
        setName("");
        setStatus("Ativo");
      }
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    } finally {
      setAdding(false);
    }
    setUpdate(!update);
  };

  return (
    <>
      <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Adicionar Novo Item
        </h3>
        <form
          onSubmit={handleAddItem}
          className="flex flex-col sm:flex-row gap-4"
        >
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
            {adding ? "Salvando..." : "Adicionar"}
          </button>
        </form>
      </div>
    </>
  );
}
