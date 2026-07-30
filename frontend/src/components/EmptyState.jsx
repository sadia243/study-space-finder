// A consistent, friendlier empty state than a plain line of text -
// used anywhere a list can come back with zero results.
export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6">
      {Icon && (
        <div className="bg-forest-50 text-forest-500 rounded-full p-3 mb-4">
          <Icon size={28} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-serif text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink/60 max-w-sm mb-4">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
