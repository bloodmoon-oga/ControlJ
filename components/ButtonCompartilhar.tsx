import { selectAll } from "@testing-library/user-event/dist/cjs/event/index.js";
import { useState, Dispatch, SetStateAction } from "react";

interface State {
  state: number;
  setState: Dispatch<SetStateAction<number>>;

  selectAll: number;
  setSelectAll: Dispatch<SetStateAction<number>>;
}

export default function ButtonCompartilhar({
  state,
  setState,
  selectAll,
  setSelectAll,
}: State) {
  function mudarEstadoState() {
    setState((state % 2) + 1);
  }
  function SelectAllHandler() {
    setSelectAll((selectAll % 2) + 1);
  }
  return (
    <div className="fixed right-[50px] bottom-[8px] z-50 flex">
      <div>
        <button
          onClick={mudarEstadoState}
          className="w-[60px] h-[60px] bg-blue-800 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
          aria-label="Compartilhar"
        >
          {/* Ícone SVG de Compartilhar */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>
      </div>
      <div className="w-[60px] h-[60px]">
        <button
          className="w-[35px] h-[35px] bg-blue-800 rounded-full flex items-center justify-center"
          onClick={SelectAllHandler}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 3H5a2 2 0 0 0-2 2v2" />
            <path d="M3 11v2" />
            <path d="M3 17v2a2 2 0 0 0 2 2h2" />
            <path d="M11 21h2" />
            <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
            <path d="M21 13v-2" />

            <rect x="7" y="3" width="14" height="14" rx="2" />
            <path d="m11 10 2 2 4-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
