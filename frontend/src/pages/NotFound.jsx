import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto mt-24 text-center px-6">
      <div className="bg-forest-50 text-forest-500 rounded-full p-4 inline-flex mb-4">
        <Compass size={32} strokeWidth={1.5} />
      </div>
      <h1 className="font-serif text-2xl mb-2">Page not found</h1>
      <p className="text-ink/60 mb-6">
        The page you're looking for doesn't exist, or the link may be out of date.
      </p>
      <Link
        to="/"
        className="bg-forest-500 hover:bg-forest-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
      >
        Back to browse spaces
      </Link>
    </div>
  );
}
