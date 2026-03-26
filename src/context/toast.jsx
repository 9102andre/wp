import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle } from "lucide-react";

const ToastContext = createContext(null);

// Toast display component
export function ToastContainer() {
  const { toasts } = useContext(ToastContext);

  return (
    <div style={{
      position: "fixed",
      top: "1rem",
      right: "1rem",
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            transition={{ type: "spring", stiffness: 100 }}
            style={{
              marginBottom: "0.5rem",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                borderRadius: "0.5rem",
                backgroundColor: toast.type === "success" ? "hsl(142 76% 36%)" : "hsl(0 84% 60%)",
                color: "white",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                minWidth: "300px",
              }}
            >
              {toast.type === "success" ? (
                <CheckCircle width={20} height={20} />
              ) : (
                <AlertCircle width={20} height={20} />
              )}
              <span style={{ flex: 1, fontSize: "0.9rem" }}>{toast.message}</span>
              <button
                onClick={() => toast.onClose()}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <X width={16} height={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = { toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
