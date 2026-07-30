import { useState } from "react";
import api from "../api/client.js";

export default function BookingModal({ space, onClose, onBooked }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/bookings", { space: space._id, date, startTime, endTime });
      onBooked();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="font-serif text-xl mb-1">Book {space.name}</h2>
        <p className="text-sm text-ink/60 mb-4">
          {space.building} &middot; {space.floor}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
            />
          </label>

          <div className="flex gap-3">
            <label className="text-sm font-medium flex-1">
              Start time
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium flex-1">
              End time
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1 w-full border border-forest-100 rounded px-3 py-2"
              />
            </label>
          </div>

          {error && <p className="text-clay-600 text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-forest-100 rounded py-2 text-sm font-medium hover:bg-parchment transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-forest-500 hover:bg-forest-600 text-white rounded py-2 text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? "Booking..." : "Confirm booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
