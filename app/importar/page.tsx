import ExcelUploader from "@/components/ExcelUploader";
import Link from "next/link";
import Aside from "@/components/Aside";
export default function ImportPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* MENU LATERAL */}
      <Aside></Aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 bg-gray-50 py-12 px-4 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Painel de Importação
          </h1>
          <ExcelUploader apiEndpoint="/api/import" />
        </div>
      </main>
    </div>
  );
}
1;
