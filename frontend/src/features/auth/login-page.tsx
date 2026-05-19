import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { AuthSplitLayout } from "@/layouts/auth-split-layout";
import { isValidEmail, isValidPassword } from "@/utils/validators";

import { AuthFormShell } from "./auth-form-shell";

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Informe os campos obrigatórios corretamente.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("O formato do e-mail é inválido.");
      return;
    }

    if (!isValidPassword(password)) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      await login({ email, password });
      navigate("/home", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <AuthFormShell
        title="BEM-VINDO DE VOLTA!"
        contentClassName="flex min-h-[424px] flex-col gap-8"
        description={
          <>
            Encontre parceiros para treinar ao ar livre. Conecte-se e comece agora! 💪
          </>
        }
        form={
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error ? (
              <Alert variant="error" description={error} />
            ) : null}
            <Input
              label="E-mail"
              required
              placeholder="Ex.: joao@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
            />
            <Input
              label="Senha"
              required
              type="password"
              placeholder="Ex.: joao123"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
            />
            <Button type="submit" className="h-12 w-full rounded-[4px] px-3" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        }
        footer={
          <>
            Ainda não tem uma conta?{" "}
            <Link to="/cadastro" className="font-semibold text-[var(--color-title)]">
              Cadastre-se
            </Link>
          </>
        }
      />
    </AuthSplitLayout>
  );
}

export { LoginPage };
