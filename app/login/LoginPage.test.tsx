import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

// 1. Mockando o roteador do Next.js
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpa o mock do fetch antes de cada teste
    vi.unstubAllGlobals();
  });

  it("deve permitir que o usuário digite as credenciais e faça o login com sucesso", async () => {
    // 2. Mockando uma resposta de SUCESSO da API de login
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: "fake-jwt-token" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LoginPage />);

    // Pegando os campos de input e o botão pelo label / texto
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // 3. Simulando o usuário digitando o e-mail e a senha
    await userEvent.type(emailInput, "admin@controlj.com");
    await userEvent.type(passwordInput, "senha123");

    // Verificando se os valores foram preenchidos corretamente
    expect(emailInput).toHaveValue("admin@controlj.com");
    expect(passwordInput).toHaveValue("senha123");

    // 4. Simulando o clique no botão de entrar
    await userEvent.click(submitButton);

    // 5. Validando se o fetch foi chamado com a rota e o corpo corretos
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@controlj.com",
        password: "senha123",
      }),
    });

    // 6. Esperando o redirecionamento para o dashboard acontecer após o sucesso
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("deve exibir mensagem de erro na tela caso a autenticação falhe", async () => {
    // 7. Mockando uma resposta de ERRO da API de login
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "E-mail ou senha inválidos" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    // Preenchendo dados incorretos
    await userEvent.type(emailInput, "errado@email.com");
    await userEvent.type(passwordInput, "senhaerrada");
    await userEvent.click(submitButton);

    // 8. O erro retornado pela API deve aparecer na tela dentro do bloco de erro
    expect(
      await screen.findByText(/e-mail ou senha inválidos/i),
    ).toBeInTheDocument();

    // Garante que NÃO redirecionou
    expect(mockPush).not.toHaveBeenCalled();
  });
});
