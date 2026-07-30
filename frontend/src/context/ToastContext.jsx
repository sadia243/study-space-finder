import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  // type: "success" | "error"
  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++idCounter;
      setToasts((current) => [...current, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-xs">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2 rounded-lg shadow-lg px-4 py-3 text-sm text-white animate-[fadein_0.15s_ease-out] ${
              t.type === "error" ? "bg-clay-600" : "bg-forest-600"
            }`}
          >
            {t.type === "error" ? (
              <XCircle size={18} className="shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            )}
            <p className="flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 opacity-80 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
