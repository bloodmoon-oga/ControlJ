import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./page";
import { vi } from "vitest";
// 1. Mockando o roteador do Next.js
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("RegisterPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpa o mock do fetch antes de cada teste
    vi.unstubAllGlobals();
  });
  it("Permite que ao se registrar o usuário seja direcionado para a página de registro", async () => {
    // 2. Mockando uma resposta de SUCESSO da API de login
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "fake-jwt-token" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<RegisterPage />);

    // Pegando os campos de input e o botão pelo label / texto
    const emailInput = screen.getByLabelText(/e-mail/i);
    const nomeInput = screen.getByLabelText(/nome/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /Cadastrar/i });

    // 3. Simulando o usuário digitando o e-mail e a senha
    await userEvent.type(emailInput, "admin@controlj.com");
    await userEvent.type(passwordInput, "senha123");
    await userEvent.type(nomeInput, "Amongus");

    // Verificando se os valores foram preenchidos corretamente
    expect(emailInput).toHaveValue("admin@controlj.com");
    expect(passwordInput).toHaveValue("senha123");
    expect(nomeInput).toHaveValue("Amongus");
    // 4. Simulando o clique no botão de entrar
    await userEvent.click(submitButton);

    // 5. Validando se o fetch foi chamado com a rota e o corpo corretos
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Amongus",
        email: "admin@controlj.com",
        password: "senha123",
      }),
    });

    // 6. Esperando o redirecionamento para o dashboard acontecer após o sucesso
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?registered=true");
    });
  });
});
