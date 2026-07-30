// A placeholder card shown while spaces are loading, so the page never
// feels like it's frozen or broken during the fetch.
export default function SkeletonCard() {
  return (
    <div className="bg-white border border-forest-100 rounded-lg p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 bg-forest-50 rounded w-2/3 mb-2" />
          <div className="h-3 bg-forest-50 rounded w-1/2" />
        </div>
        <div className="h-5 w-20 bg-forest-50 rounded-full" />
      </div>
      <div className="h-3 bg-forest-50 rounded w-full" />
      <div className="h-3 bg-forest-50 rounded w-4/5" />
      <div className="h-9 bg-forest-50 rounded mt-2" />
    </div>
  );
}
