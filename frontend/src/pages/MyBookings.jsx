import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarX } from "lucide-react";
import api from "../api/client.js";
import { typeLabel } from "../utils/labels.js";
import { useToast } from "../context/ToastContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/mine");
      setBookings(data);
    } catch (err) {
      showToast("Couldn't load your bookings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try {
      await api.delete(`/bookings/${id}`);
      showToast("Booking cancelled.");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't cancel this booking.", "error");
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl mb-6">My bookings</h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white border border-forest-100 rounded-lg p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <h2 className="font-serif text-lg mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="No upcoming bookings"
              description="Find a desk, room, or quiet zone and reserve your spot."
              actionLabel="Browse spaces"
              onAction={() => navigate("/")}
            />
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {upcoming.map((b) => (
                <div
                  key={b._id}
                  className="bg-white border border-forest-100 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{b.space?.name}</p>
                    <p className="text-sm text-ink/60">
                      {b.space?.building} &middot; {typeLabel(b.space?.type)}
                    </p>
                    <p className="text-sm text-ink/60">
                      {b.date} &middot; {b.startTime}–{b.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={cancellingId === b._id}
                    className="text-clay-600 text-sm font-medium hover:underline disabled:opacity-50"
                  >
                    {cancellingId === b._id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <>
              <h2 className="font-serif text-lg mb-3">Cancelled</h2>
              <div className="flex flex-col gap-3">
                {past.map((b) => (
                  <div
                    key={b._id}
                    className="bg-parchment border border-forest-100 rounded-lg p-4 opacity-60"
                  >
                    <p className="font-medium">{b.space?.name}</p>
                    <p className="text-sm text-ink/60">
                      {b.date} &middot; {b.startTime}–{b.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
