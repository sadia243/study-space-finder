import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../api/client.js";
import { typeLabel } from "../utils/labels.js";

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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const fetchSpaces = async () => {
    const { data } = await api.get("/spaces");
    setSpaces(data);
  };

  const fetchStats = async () => {
    const { data } = await api.get("/bookings/admin/stats");
    setStats(data);
  };

  useEffect(() => {
    fetchSpaces();
    fetchStats();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
      } else {
        await api.post("/spaces", payload);
      }
      resetForm();
      fetchSpaces();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this space");
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
    await api.delete(`/spaces/${id}`);
    fetchSpaces();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-serif text-3xl mb-1">Admin dashboard</h1>
      <p className="text-ink/60 mb-6">Manage spaces and see how the library is being used.</p>

      <div className="flex gap-2 mb-6 border-b border-forest-100">
        {["analytics", "manage"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-forest-500 text-forest-600" : "border-transparent text-ink/50"
            }`}
          >
            {t === "analytics" ? "Analytics" : "Manage spaces"}
          </button>
        ))}
      </div>

      {tab === "analytics" && stats && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-4">
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
                className="flex-1 bg-forest-500 hover:bg-forest-600 text-white rounded py-2 text-sm font-medium transition-colors"
              >
                {editingId ? "Save changes" : "Add space"}
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
                className="bg-white border border-forest-100 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{space.name}</p>
                  <p className="text-sm text-ink/60">
                    {space.building} &middot; {typeLabel(space.type)} &middot; seats {space.capacity}
                  </p>
                </div>
                <div className="flex gap-3 text-sm font-medium">
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
