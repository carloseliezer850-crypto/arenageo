"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
const Context = createContext<(message: string) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const notify = useCallback((m: string) => setMessage(m), []);
  return (
    <Context.Provider value={notify}>
      {children}
      <aside
        className="cadastro-toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message && (
          <>
            <span>{message}</span>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </>
        )}
      </aside>
    </Context.Provider>
  );
}
export const useToast = () => useContext(Context);
