import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { AuthSplitLayout } from "@/layouts/auth-split-layout";
import {
  formatCpf,
  isValidCpf,
  isValidEmail,
  isValidPassword,
} from "@/utils/validators";

import { AuthFormShell } from "./auth-form-shell";

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useSession();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formattedCpf = useMemo(() => formatCpf(cpf), [cpf]);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !formattedCpf.trim() || !email.trim() || !password.trim()) {
      setError("Informe os campos obrigatórios corretamente.");
      return;
    }

    if (!isValidCpf(formattedCpf)) {
      setError("O formato do CPF é inválido.");
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
      await register({
        name: name.trim(),
        cpf: formattedCpf,
        email: email.trim(),
        password,
      });
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout>
      <AuthFormShell
        title="CRIE SUA CONTA"
        contentClassName="flex min-h-[644px] flex-col gap-6"
        description={
          <>
            Cadastre-se para encontrar parceiros de treino e começar a se exercitar ao ar livre. Vamos juntos! 💪
          </>
        }
        form={
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? <Alert variant="error" description={error} /> : null}
            <div className="flex h-[376px] w-full max-w-[320px] flex-col gap-4">
            <Input
              label="Nome completo"
              required
              placeholder="Ex.: João Silva"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={submitting}
            />
            <Input
              label="CPF"
              required
              placeholder="Ex.: 123.456.789-01"
              value={formattedCpf}
              onChange={(event) => setCpf(event.target.value)}
              disabled={submitting}
            />
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
            </div>
            <Button type="submit" className="h-12 w-full rounded-[4px] px-3" disabled={submitting}>
              {submitting ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        }
        footer={
          <>
            Já tem uma conta?{" "}
            <Link to="/login" className="font-semibold text-[var(--color-title)]">
              Faça login
            </Link>
          </>
        }
      />
    </AuthSplitLayout>
  );
}

export { RegisterPage };
