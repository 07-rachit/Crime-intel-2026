import { FolderArchive } from "lucide-react";

export default function EmptyState({
  icon = null,
  title = "No data found",
  message = "",
  actionLabel = "",
  onAction = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex items-center justify-center text-muted">
        {icon || <FolderArchive className="w-12 h-12 opacity-50" />}
      </div>
      <p className="text-ink font-display text-lg mb-1">{title}</p>
      {message && (
        <p className="text-muted text-xs font-mono max-w-md leading-relaxed mb-4">{message}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-amber hover:bg-amber/90 text-base font-mono font-bold text-xs px-5 py-2.5 rounded shadow transition active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
