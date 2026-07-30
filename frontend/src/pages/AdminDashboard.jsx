import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api/client.js";
import { typeLabel } from "../utils/labels.js";
import { useToast } from "../context/ToastContext.jsx";

const emptyForm = {
  name: "",
  building: "",
  floor: "",
  type: "individual_desk",
  capacity: 1,
  amenities: "",
  description: "",
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("analytics");
  const [spaces, setSpaces] = useState([]);
  const [stats, setStats] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchSpaces = async () => {
    const { data } = await api.get("/spaces");
    setSpaces(data);
  };

  const fetchStats = async () => {
    const { data } = await api.get("/bookings/admin/stats");
    setStats(data);
  };

  const fetchAllBookings = async () => {
    setBookingsLoading(true);
    try {
      const { data } = await api.get("/bookings/admin/all");
      setAllBookings(data);
    } catch (err) {
      showToast("Couldn't load bookings.", "error");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === "bookings" && allBookings.length === 0) {
      fetchAllBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      ...form,
      capacity: Number(form.capacity),
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/spaces/${editingId}`, payload);
        showToast("Space updated.");
      } else {
        await api.post("/spaces", payload);
        showToast("Space added.");
      }
      resetForm();
      fetchSpaces();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this space");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (space) => {
    setEditingId(space._id);
    setForm({
      name: space.name,
      building: space.building,
      floor: space.floor,
      type: space.type,
      capacity: space.capacity,
      amenities: (space.amenities || []).join(", "),
      description: space.description || "",
    });
    setTab("manage");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this space? This cannot be undone.")) return;
    try {
      await api.delete(`/spaces/${id}`);
      showToast("Space deleted.");
      fetchSpaces();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't delete this space.", "error");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("Cancel this booking on the student's behalf?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      showToast("Booking cancelled.");
      fetchAllBookings();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't cancel this booking.", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl mb-1">Admin dashboard</h1>
      <p className="text-ink/60 mb-6">Manage spaces and see how the library is being used.</p>

      <div className="flex gap-2 mb-6 border-b border-forest-100 overflow-x-auto">
        {[
          { key: "analytics", label: "Analytics" },
          { key: "manage", label: "Manage spaces" },
          { key: "bookings", label: "All bookings" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t.key ? "border-forest-500 text-forest-600" : "border-transparent text-ink/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "analytics" && stats && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Confirmed bookings" value={stats.totalBookings} />
            <StatCard label="Active spaces" value={stats.totalSpaces} />
            <StatCard label="Students who've booked" value={stats.totalUsers} />
          </div>

          <div className="bg-white border border-forest-100 rounded-lg p-5">
            <h3 className="font-serif text-lg mb-4">Most booked spaces</h3>
            {stats.bySpace.length === 0 ? (
              <p className="text-sm text-ink/60">No bookings yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.bySpace}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAF1EE" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2C6350" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab === "manage" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-forest-100 rounded-lg p-5 flex flex-col gap-3 h-fit"
          >
            <h3 className="font-serif text-lg">{editingId ? "Edit space" : "Add a space"}</h3>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border border-forest-100 rounded px-3 py-2 text-sm"
            />
            <div className="flex gap-3">
              <input
                placeholder="Building"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                required
                className="border border-forest-100 rounded px-3 py-2 text-sm flex-1"
              />
              <input
                placeholder="Floor"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                required
                className="border border-forest-100 rounded px-3 py-2 text-sm flex-1"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border border-forest-100 rounded px-3 py-2 text-sm flex-1"
              >
                <option value="individual_desk">Individual desk</option>
                <option value="group_room">Group room</option>
                <option value="quiet_zone">Quiet zone</option>
                <option value="computer_pod">Computer pod</option>
              </select>
              <input
                type="number"
                min="1"
                placeholder="Capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                required
                className="border border-forest-100 rounded px-3 py-2 text-sm w-28"
              />
            </div>
            <input
              placeholder="Amenities (comma separated)"
              value={form.amenities}
              onChange={(e) => setForm({ ...form, amenities: e.target.value })}
              className="border border-forest-100 rounded px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-forest-100 rounded px-3 py-2 text-sm"
              rows={2}
            />

            {error && <p className="text-clay-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-forest-500 hover:bg-forest-600 text-white rounded py-2 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Save changes" : "Add space"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-forest-100 rounded py-2 px-4 text-sm font-medium hover:bg-parchment transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-3">
            {spaces.map((space) => (
              <div
                key={space._id}
                className="bg-white border border-forest-100 rounded-lg p-4 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="font-medium">{space.name}</p>
                  <p className="text-sm text-ink/60">
                    {space.building} &middot; {typeLabel(space.type)} &middot; seats {space.capacity}
                  </p>
                </div>
                <div className="flex gap-3 text-sm font-medium shrink-0">
                  <button onClick={() => handleEdit(space)} className="text-forest-500 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(space._id)} className="text-clay-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="bg-white border border-forest-100 rounded-lg overflow-hidden">
          {bookingsLoading ? (
            <div className="p-6 flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-parchment rounded animate-pulse" />
              ))}
            </div>
          ) : allBookings.length === 0 ? (
            <p className="p-6 text-sm text-ink/60">No bookings have been made yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-parchment text-left text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Space</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((b) => (
                    <tr key={b._id} className="border-t border-forest-100">
                      <td className="px-4 py-3">
                        <p className="font-medium">{b.user?.name}</p>
                        <p className="text-ink/50 text-xs">{b.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {b.space?.name}
                        <p className="text-ink/50 text-xs">{b.space?.building}</p>
                      </td>
                      <td className="px-4 py-3">{b.date}</td>
                      <td className="px-4 py-3">
                        {b.startTime}–{b.endTime}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            b.status === "confirmed"
                              ? "bg-forest-50 text-forest-600"
                              : "bg-parchment text-ink/50"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {b.status === "confirmed" && (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            className="text-clay-600 hover:underline font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-forest-100 rounded-lg p-5">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="font-serif text-3xl text-forest-600 mt-1">{value}</p>
    </div>
  );
}
