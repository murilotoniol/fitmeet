import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "./button";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro inesperado na interface:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
          <div className="w-full max-w-[420px] space-y-5 text-center">
            <h1 className="text-title text-[var(--color-title)]">ALGO SAIU DO CONTROLE</h1>
            <p className="text-body text-[var(--color-text)]">
              Recarregue a pagina para continuar usando o Fitmeet.
            </p>
            <Button className="mx-auto h-12 rounded-[4px] px-6 text-white" onClick={this.handleReload}>
              Recarregar
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
