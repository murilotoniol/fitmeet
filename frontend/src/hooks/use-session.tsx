import { useContext } from "react";

import { SessionContext } from "./session-context";

function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }

  return context;
}

export { useSession };
