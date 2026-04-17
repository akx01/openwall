import { useUIStore } from "../../store/uiStore";

const icons = { info: "ℹ️", success: "✅", error: "❌", warning: "⚠️" };

export default function ToastContainer() {
  const { toasts } = useUIStore();
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 animate-fade-in"
        >
          <span>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}