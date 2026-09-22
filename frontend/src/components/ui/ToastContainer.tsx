import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToastStore } from "@/stores/toastStore";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const successToasts = toasts.filter((toast) => toast.variant === "success");
  const errorToasts = toasts.filter((toast) => toast.variant === "error");

  return (
    <>
      {errorToasts.length > 0 && (
        <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 flex-col gap-2">
          {errorToasts.map((toast) => (
            <div
              key={toast.id}
              className="flex max-w-md items-center gap-2 rounded-lg border border-status-cancelled bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lg"
            >
              <AlertTriangle size={16} className="shrink-0 text-status-cancelled" />
              {toast.message}
            </div>
          ))}
        </div>
      )}
      {successToasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {successToasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-ink shadow-lg"
            >
              <CheckCircle2 size={16} className="text-primary" />
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
