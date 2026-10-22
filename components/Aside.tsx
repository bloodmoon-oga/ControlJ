"use client";
import { useState, useEffect } from "react";

import { useRouter } from 'next/navigation';

export default function Aside() {
    const router = useRouter()
    const [routesActive, setroutesActive] = useState({
        '/dashboard': 0,
        '/scan': 0,
        '/importar': 0
    })
    const handleLogout = async () => {
        // Chama a API de logout para limpar o cookie httpOnly no servidor
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    useEffect(()=>{
        const currentPath = window.location.pathname;
        setroutesActive({
            '/dashboard': currentPath === '/dashboard' ? 1 : 0,
            '/scan': currentPath === '/scan' ? 1 : 0,
            '/importar': currentPath === '/importar' ? 1 : 0,
        });
        console.log(routesActive);
    }, [])

    return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold tracking-wide text-blue-400">
              ControlJ System
            </h1>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <a
              href="/dashboard"
              className={`${routesActive["/dashboard"] ? ("bg-blue-600") : ("")} flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg  text-white shadow-sm transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </a>
            <a
              href="/scan"
              className={`${routesActive["/scan"] ? ("bg-blue-600") : ("")} flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg  text-white shadow-sm transition-colors`}            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              Ler QR Code
            </a>
            <a
              href="/importar"
                className={`${routesActive["/importar"] ? ("bg-blue-600") : ("")} flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg  text-white shadow-sm transition-colors`}            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Importar planilha
            </a>
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
    )
}