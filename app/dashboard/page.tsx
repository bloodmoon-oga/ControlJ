"use client";

import { useState } from "react";

import Aside from "@/components/Aside";
import MeusItems from "@/components/MeusItems";
import AddItem from "@/components/AddItem";
import ButtonCompartilhar from "@/components/ButtonCompartilhar";

export default function DashboardPage() {
  const [update, setUpdate] = useState<boolean>();
  const [cstate, setCstate] = useState<number>(0);
  const [selectAll, setSelectAll] = useState<number>(0);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* MENU LATERAL (SIDEBAR) */}
      <Aside></Aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          1
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
              <p className="text-sm text-gray-500">
                Gerencie seus itens registrados e status atual.
              </p>
            </div>
          </header>
          <AddItem setUpdate={setUpdate} update={update}></AddItem>
          <MeusItems
            selectAll={selectAll}
            update={update}
            cstate={cstate}
          ></MeusItems>
          <ButtonCompartilhar
            selectAll={selectAll}
            setSelectAll={setSelectAll}
            state={cstate}
            setState={setCstate}
          ></ButtonCompartilhar>
        </div>
      </main>
    </div>
  );
}
