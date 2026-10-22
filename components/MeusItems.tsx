import { useState, useEffect, Dispatch, SetStateAction } from "react";

interface Item {
  id: string;
  name: string;
  description?: string;
  status: string;
  location: string;
}
interface Update {
  update: boolean | undefined;
}
export default function MeusItems({ update }: Update) {
  const [items, setItems] = useState<Item[]>([]);
  const [orderS, setOrderS] = useState(true);
  const [orderU, setOrderU] = useState(true);
  const [cpItems, setCpItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const states = ["Geral", "Ativo", "Pendente", "Inativo"];
  const [iter, setIter] = useState(0);
  useEffect(() => {
    fetchItems();
  }, [update]);

  function SwitchStatus() {
    if (states[iter] === "Geral") {
      setItems(cpItems);
    } else {
      setItems(cpItems.filter((x) => x.status === states[iter]));
      console.log(states[iter]);
    }
    setIter((5 + iter) % 4);
    console.log(iter);
  }

  function sortItemsByName<T extends { name: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, "pt-BR", {
        sensitivity: "base",
      });

      return orderS ? comparison : -comparison;
    });
  }

  function sortItemsByUI<T extends { location: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      if (!a.location || !b.location) {
        return 1;
      }
      const comparison = a.location.localeCompare(b.location, "pt-BR", {
        sensitivity: "base",
      });

      return orderU ? comparison : -comparison;
    });
  }

  const fetchItems = async () => {
    try {
      // O navegador envia o cookie auth_token automaticamente nesta chamada
      setLoading(true);
      const res = await fetch("/api/items");

      if (res.status === 401) {
        //router.push('/login');
        return;
      }

      const data = await res.json();
      setItems(data);
      setCpItems([...data]);
    } catch (err) {
      console.error("Erro ao carregar itens:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleSortUI = () => {
    setItems((prevItems) => sortItemsByUI(prevItems));
    setOrderU(!orderU);
  };
  const handleSortClick = () => {
    setItems((prevItems) => sortItemsByName(prevItems));
    setOrderS(!orderS);
  };
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Lista de Itens</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando itens...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum item cadastrado ainda.
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3">
                    <button onClick={handleSortClick}>Nome</button>
                  </th>
                  <th className="px-6 py-3">
                    <button onClick={SwitchStatus}>Status</button>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3">
                  <button onClick={handleSortClick}>Nome</button>
                </th>
                <th className="px-6 py-3">
                  <button onClick={handleSortUI}>Unidade Implatou</button>
                </th>
                <th className="px-6 py-3">
                  <button onClick={SwitchStatus}>Status</button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <a href={`./item/${item.id}`}>{item.name}</a>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <span>{item.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "Ativo"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Pendente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
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
    </>
  );
}
