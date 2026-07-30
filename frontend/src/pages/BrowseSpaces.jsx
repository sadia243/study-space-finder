import { useEffect, useState, useCallback } from "react";
import api from "../api/client.js";
import SpaceCard from "../components/SpaceCard.jsx";
import BookingModal from "../components/BookingModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function BrowseSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [sort, setSort] = useState("");
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [confirmation, setConfirmation] = useState("");

  const { user } = useAuth();
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, type, minCapacity, sort]);

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
    setConfirmation("Space booked. Check My Bookings for details.");
    setTimeout(() => setConfirmation(""), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl mb-1">Find a study space</h1>
      <p className="text-ink/60 mb-6">Search, filter, and book a space across all library buildings.</p>

      {confirmation && (
        <div className="bg-forest-50 text-forest-600 text-sm px-4 py-2 rounded mb-4">
          {confirmation}
        </div>
      )}

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
        <p className="text-ink/60">Loading spaces...</p>
      ) : spaces.length === 0 ? (
        <p className="text-ink/60">No spaces match your search. Try different filters.</p>
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
