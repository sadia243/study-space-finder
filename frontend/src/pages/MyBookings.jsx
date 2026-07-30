import { useEffect, useState } from "react";
import api from "../api/client.js";
import { typeLabel } from "../utils/labels.js";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await api.get("/bookings/mine");
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    await api.delete(`/bookings/${id}`);
    fetchBookings();
  };

  const upcoming = bookings.filter((b) => b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl mb-6">My bookings</h1>

      {loading ? (
        <p className="text-ink/60">Loading...</p>
      ) : (
        <>
          <h2 className="font-serif text-lg mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="text-ink/60 mb-8">No upcoming bookings yet — go browse spaces.</p>
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
                    className="text-clay-600 text-sm font-medium hover:underline"
                  >
                    Cancel
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
