import { typeLabel } from "../utils/labels.js";

export default function SpaceCard({ space, onBook }) {
  return (
    <div className="bg-white border border-forest-100 rounded-lg p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg text-ink">{space.name}</h3>
          <p className="text-sm text-ink/60">
            {space.building} &middot; {space.floor}
          </p>
        </div>
        <span className="text-xs bg-forest-50 text-forest-600 px-2 py-1 rounded-full font-medium whitespace-nowrap">
          {typeLabel(space.type)}
        </span>
      </div>

      {space.description && <p className="text-sm text-ink/70">{space.description}</p>}

      <div className="flex flex-wrap gap-2 text-xs text-ink/60">
        <span>Seats {space.capacity}</span>
        {space.amenities?.map((a) => (
          <span key={a} className="bg-parchment px-2 py-0.5 rounded">
            {a}
          </span>
        ))}
      </div>

      <button
        onClick={() => onBook(space)}
        className="mt-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium py-2 rounded transition-colors"
      >
        Book this space
      </button>
    </div>
  );
}
