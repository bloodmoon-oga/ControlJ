import { useState, useEffect, useRef, ChangeEvent } from "react";
import Compartilhar from "./Compartilhar";

interface Item {
  id: string;
  name: string;
  description?: string;
  status: string;
  location: string;
}
interface Update {
  update: boolean | undefined;
  cstate: number;
  selectAll: number;
}

export default function MeusItems({ update, cstate, selectAll }: Update) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const [openC, setOpenC] = useState<boolean>(false);

  // Ordenização
  const [orderS, setOrderS] = useState(true); // Apenas os estados definidos na tabela
  const [orderU, setOrderU] = useState(true); // Ordem alfabética Unidade Implantou
  const [cpItems, setCpItems] = useState<Item[]>([]); // Ordem de itens na tabela

  const states = ["Geral", "Ativo", "Pendente", "Inativo"]; // Estados defenidos para ordenização
  const [iter, setIter] = useState(0); // Para percorrer todos os states definidos

  // Compartilhamento de Itens
  const [selectItems, setSelectItems] = useState<any[]>([]);
  const [activeSelect, setActiveSelect] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = (
    e: React.MouseEvent<Element> | React.TouchEvent<Element>,
  ) => {
    e.preventDefault();

    const currentID = e.currentTarget.id;

    timerRef.current = setTimeout(() => {
      console.log("Ativando seleção de Items");
      setActiveSelect(true);
      setSelectItems((prevItems) => [...prevItems, currentID]);
    }, 600); // 600 milissegundos
  };

  useEffect(() => {
    if (cstate == 0) {
      return;
    }
    if (!activeSelect) {
      setActiveSelect(!activeSelect);
    } else {
      if (activeSelect && selectItems.length === 0) {
        setActiveSelect(!activeSelect);
      } else {
        setOpenC(true);
      }
    }
  }, [cstate]);

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [update]);

  useEffect(() => {
    handleSelectAll();
  }, [selectAll]);

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
      setLoading(true);
      const res = await fetch("/api/items");

      if (res.status === 401) {
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

  function handleSelectAll() {
    if (selectItems.length === items.length) {
      setSelectItems([]);
    } else {
      const allIds = items.map((item) => item.id);
      setSelectItems(allIds);
      setActiveSelect(true);
    }
  }

  // Remove ou Adiciona o items no array selectItems
  function handleChangeCheckbox(
    e: ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLTableRowElement>,
    itemID: string,
  ) {
    if (!activeSelect) {
      return;
    }
    if (selectItems.includes(itemID)) {
      setSelectItems((prevItems) => [
        ...prevItems.filter((item) => item !== itemID),
      ]);
    } else {
      setSelectItems((prevItems) => [...prevItems, itemID]);
    }
  }

  function CloseCompartilhamento() {
    setOpenC(false);
  }

  const handleShareSubmit = async (targetUserId: string) => {
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: Number(targetUserId),
          itemIds: selectItems, // Array com os IDs dos itens selecionados na tabela
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao transferir itens");
        return;
      }

      alert(data.message);
      // Limpa a seleção e recarrega os itens da tabela
      setSelectItems([]);
      fetchItems();
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <>
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <Compartilhar
          isOpen={openC}
          onClose={CloseCompartilhamento}
          onConfirm={(id) => {
            handleShareSubmit(id);
          }}
        ></Compartilhar>
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
                {/* Adicionado o th correspondente para manter o alinhamento quando o checkbox estiver ativo */}
                {activeSelect && <th className="px-4 py-3 w-10"></th>}
                <th>ID</th>
                <th className="px-6 py-3">
                  <button onClick={handleSortClick}>Nome</button>
                </th>
                <th className="px-6 py-3">
                  <button onClick={handleSortUI}>Unidade Implantou</button>
                </th>
                <th className="px-6 py-3">
                  <button onClick={SwitchStatus}>Status</button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {/* Usamos Object.values() porque agora 'items' é um objeto/dicionário */}
              {items.map((item) => (
                <tr
                  onMouseDown={handleStart}
                  onMouseUp={handleEnd}
                  onMouseLeave={handleEnd}
                  onTouchStart={handleStart}
                  onTouchEnd={handleEnd}
                  onClick={(e) => {
                    handleChangeCheckbox(e, item.id);
                  }}
                  key={item.id}
                  id={String(item.id)} // Garante que o ID no DOM seja uma string
                  className={`transition-colors ${activeSelect ? "cursor-pointer" : ""} ${selectItems.includes(item.id) ? "bg-blue-200 hover:bg-blue-100" : "hover:bg-gray-50 "}`}
                >
                  {activeSelect && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          handleChangeCheckbox(e, item.id);
                        }}
                        checked={selectItems.includes(item.id)}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {/* stopPropagation evita que o clique no link acione o long press/seleção indesejada */}
                    <a
                      href={`./item/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.name}
                    </a>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <span>{item.location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
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
