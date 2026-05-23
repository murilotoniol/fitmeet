import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSession } from "@/hooks/use-session";

import { LoginPage } from "./login-page";
import { RegisterPage } from "./register-page";

vi.mock("@/hooks/use-session", () => ({
  useSession: vi.fn(),
}));

const mockedUseSession = vi.mocked(useSession);

function renderWithRouter(ui: ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("auth pages", () => {
  beforeEach(() => {
    mockedUseSession.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      setUser: vi.fn(),
      token: null,
      user: null,
      loading: false,
    });
  });

  it("bloqueia login com e-mail invalido", async () => {
    const user = userEvent.setup();
    const login = vi.fn();

    mockedUseSession.mockReturnValue({
      isAuthenticated: false,
      login,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
      setUser: vi.fn(),
      token: null,
      user: null,
      loading: false,
    });

    renderWithRouter(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Ex.: joao@email.com"), "email-invalido");
    await user.type(screen.getByPlaceholderText("Ex.: joao123"), "123123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect((await screen.findByRole("alert")).textContent).toContain("e-mail");
    expect(login).not.toHaveBeenCalled();
  });

  it("bloqueia cadastro com CPF invalido", async () => {
    const user = userEvent.setup();
    const register = vi.fn();

    mockedUseSession.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
      register,
      logout: vi.fn(),
      refreshUser: vi.fn(),
      setUser: vi.fn(),
      token: null,
      user: null,
      loading: false,
    });

    renderWithRouter(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("Ex.: João Silva"), "Joao Silva");
    await user.type(screen.getByPlaceholderText("Ex.: 123.456.789-01"), "11111111111");
    await user.type(screen.getByPlaceholderText("Ex.: joao@email.com"), "joao@email.com");
    await user.type(screen.getByPlaceholderText("Ex.: joao123"), "123123");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect((await screen.findByRole("alert")).textContent).toContain("CPF");
    expect(register).not.toHaveBeenCalled();
  });
});
