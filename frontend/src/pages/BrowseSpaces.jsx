import { useEffect, useState, useCallback } from "react";
import { SearchX } from "lucide-react";
import api from "../api/client.js";
import SpaceCard from "../components/SpaceCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import BookingModal from "../components/BookingModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useNavigate } from "react-router-dom";

export default function BrowseSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [sort, setSort] = useState("");
  const [selectedSpace, setSelectedSpace] = useState(null);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (type) params.type = type;
      if (minCapacity) params.minCapacity = minCapacity;
      if (sort) params.sort = sort;

      const { data } = await api.get("/spaces", { params });
      setSpaces(data);
    } catch (err) {
      showToast("Couldn't load spaces. Check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, type, minCapacity, sort, showToast]);

  useEffect(() => {
    const timeout = setTimeout(fetchSpaces, 300); // debounce search input
    return () => clearTimeout(timeout);
  }, [fetchSpaces]);

  const handleBookClick = (space) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedSpace(space);
  };

  const handleBooked = () => {
    setSelectedSpace(null);
    showToast("Space booked. Check My Bookings for details.");
    fetchSpaces(); // refresh availability badges
  };

  const clearFilters = () => {
    setSearch("");
    setType("");
    setMinCapacity("");
    setSort("");
  };

  const hasActiveFilters = search || type || minCapacity || sort;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl mb-1">Find a study space</h1>
      <p className="text-ink/60 mb-6">Search, filter, and book a space across all library buildings.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or building..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-forest-100 rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border border-forest-100 rounded px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="individual_desk">Individual desk</option>
          <option value="group_room">Group room</option>
          <option value="quiet_zone">Quiet zone</option>
          <option value="computer_pod">Computer pod</option>
        </select>
        <input
          type="number"
          min="1"
          placeholder="Min capacity"
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          className="border border-forest-100 rounded px-3 py-2 text-sm w-32"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-forest-100 rounded px-3 py-2 text-sm"
        >
          <option value="">Sort: name (A-Z)</option>
          <option value="capacity_desc">Sort: capacity (high to low)</option>
          <option value="capacity_asc">Sort: capacity (low to high)</option>
          <option value="newest">Sort: newest first</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No spaces match your search"
          description="Try a different keyword, or clear your filters to see everything available."
          actionLabel={hasActiveFilters ? "Clear filters" : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((space) => (
            <SpaceCard key={space._id} space={space} onBook={handleBookClick} />
          ))}
        </div>
      )}

      {selectedSpace && (
        <BookingModal
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
}
