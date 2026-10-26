"use client";

import { useState, useTransition } from "react";
import * as XLSX from "xlsx";

interface ExcelUploaderProps {
  apiEndpoint?: string;
}

interface ColumnMappings {
  name: string;
  description: string;
  itemId: string;
  location: string;
  status: string; // Opcional
}

export default function ExcelUploader({
  apiEndpoint = "/api/import",
}: ExcelUploaderProps) {
  const [fileName, setFileName] = useState<string>("");
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowsData, setRowsData] = useState<any[]>([]);

  // Mapeamento das colunas da planilha para os campos do item
  const [mappings, setMappings] = useState<ColumnMappings>({
    name: "",
    description: "",
    itemId: "",
    location: "",
    status: "",
  });

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string>("");

  // 1. Lê o arquivo Excel ou CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;

        // Lê o conteúdo de texto diretamente
        const workbook = XLSX.read(content, { type: "string" });

        setSheets(workbook.SheetNames);
        const firstSheetName = workbook.SheetNames[0];
        setSelectedSheet(firstSheetName);
        parseSheetData(workbook, firstSheetName);
      } catch (err) {
        console.error("Erro ao ler arquivo:", err);
        setStatusMessage(
          "Erro ao processar o arquivo. Verifique se é uma planilha válida.",
        );
      }
    };

    // Alterado para readAsText para tratar codificação de texto corretamente em CSVs
    reader.readAsText(file, "UTF-8");
  };

  // 2. Extrai cabeçalhos e dados
  const parseSheetData = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

    if (jsonData.length > 0) {
      const sheetHeaders = (jsonData[0] as string[]).map((h) =>
        String(h || "").trim(),
      );
      setHeaders(sheetHeaders);

      const fullJson = XLSX.utils.sheet_to_json<any>(worksheet);
      setRowsData(fullJson);

      // Auto-seleciona colunas iniciais se houver cabeçalhos disponíveis
      if (sheetHeaders.length > 0) {
        setMappings({
          name: sheetHeaders[0] || "",
          description: sheetHeaders[1] || sheetHeaders[0] || "",
          itemId: sheetHeaders[2] || sheetHeaders[0] || "",
          location: sheetHeaders[3] || sheetHeaders[0] || "",
          status: "", // Opcional começa vazio
        });
      }
    } else {
      setHeaders([]);
      setRowsData([]);
    }
  };

  // 3. Trata a troca de aba
  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);

    const fileInput = document.getElementById(
      "excel-file-input",
    ) as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        parseSheetData(workbook, sheetName);
      };
      reader.readAsArrayBuffer(fileInput.files[0]);
    }
  };

  // Atualiza um campo específico do mapeamento
  const handleMappingChange = (field: keyof ColumnMappings, value: string) => {
    setMappings((prev) => ({ ...prev, [field]: value }));
  };

  // 4. Constrói os objetos estruturados e envia para a API
  const handleSubmit = async () => {
    if (
      !mappings.name ||
      !mappings.description ||
      !mappings.itemId ||
      !mappings.location
    ) {
      setStatusMessage(
        "Por favor, mapeie todos os campos obrigatórios (Nome, Descrição, ID e Localização).",
      );
      return;
    }

    if (rowsData.length === 0) {
      setStatusMessage("Nenhum dado encontrado na planilha.");
      return;
    }

    // Mapeia cada linha da planilha para o formato de objeto esperado pelo seu sistema
    const itemsToSend = rowsData
      .map((row) => ({
        name: row[mappings.name],
        description: row[mappings.description],
        itemId: row[mappings.itemId],
        location: row[mappings.location],
        status: mappings.status ? row[mappings.status] : null,
      }))
      .filter((item) => item.name !== undefined && item.itemId !== undefined); // Validação básica para ignorar linhas vazias

    if (itemsToSend.length === 0) {
      setStatusMessage("Nenhum item válido foi gerado com o mapeamento atual.");
      return;
    }

    startTransition(async () => {
      try {
        setStatusMessage("Enviando dados para a API...");

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: itemsToSend }),
        });

        if (!response.ok) {
          throw new Error("Erro ao salvar os itens no servidor.");
        }

        const result = await response.json();
        setStatusMessage(
          `Sucesso! ${itemsToSend.length} itens importados e integrados.`,
        );
      } catch (error: any) {
        console.error(error);
        setStatusMessage(`Erro: ${error.message || "Falha na requisição"}`);
      }
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800">
        Mapeamento de Planilha para Itens
      </h2>

      {/* Input de Arquivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selecione o arquivo (.xlsx, .xls, .csv)
        </label>
        <input
          id="excel-file-input"
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>

      {/* Seletor de Abas */}
      {sheets.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aba da Planilha
          </label>
          <select
            value={selectedSheet}
            onChange={handleSheetChange}
            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
          >
            {sheets.map((sheet) => (
              <option key={sheet} value={sheet}>
                {sheet}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Área de Mapeamento de Colunas */}
      {headers.length > 0 && (
        <div className="space-y-4 pt-3 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            Selecione qual coluna corresponde a cada atributo:
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* Nome (Obrigatório) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Nome *
              </label>
              <select
                value={mappings.name}
                onChange={(e) => handleMappingChange("name", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Descrição (Obrigatório) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Descrição *
              </label>
              <select
                value={mappings.description}
                onChange={(e) =>
                  handleMappingChange("description", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* ID (Obrigatório) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ID *
              </label>
              <select
                value={mappings.itemId}
                onChange={(e) => handleMappingChange("itemId", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Localização / Onde está (Obrigatório) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Onde está (Localização) *
              </label>
              <select
                value={mappings.location}
                onChange={(e) =>
                  handleMappingChange("location", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Status (Opcional) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status (Opcional)
              </label>
              <select
                value={mappings.status}
                onChange={(e) => handleMappingChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800"
              >
                <option value="">-- Nenhum / Ignorar --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Total de linhas detectadas:{" "}
            <span className="font-semibold">{rowsData.length}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50 text-sm"
          >
            {isPending ? "Enviando..." : "Integrar Itens na API"}
          </button>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-200">
          {statusMessage}
        </div>
      )}
    </div>
  );
}
