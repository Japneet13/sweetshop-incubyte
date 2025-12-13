import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  useEffect(() => {
    // 🔐 Not logged in
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // 🔐 Admin should never see user dashboard
    if (user.isAdmin === true) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    api
      .get("/sweets")
      .then((res) => {
        setSweets(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  if (!user || loading) {
    return <h2>Loading...</h2>;
  }

  const filteredSweets = sweets
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => (showOnlyAvailable ? s.quantity > 0 : true));

  return (
    <div className ="dashboard-page">
    <div className="container">
      <h1>🍬 Sweet Shop Dashboard</h1>
      <p>
        Welcome, <strong>{user.username}</strong>
      </p>

      {/* 🎛️ FILTER BAR */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search sweets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-text">Available only</span>
        </label>
      </div>

      {filteredSweets.length === 0 && <p>No sweets found</p>}

      {/* 🔲 SWEETS GRID */}
      <div className="sweets-grid">
        {filteredSweets.map((sweet) => (
          <div key={sweet.id} className="sweet-box">
            <h3>{sweet.name}</h3>
            <p className="category">{sweet.category}</p>
            <p className="price">₹{sweet.price}(per piece)</p>
            <p className="qty">Qty: {sweet.quantity}</p>

            <button
              disabled={sweet.quantity === 0}
              onClick={async () => {
                await api.post(`/sweets/${sweet.id}/purchase`, { qty: 1 });
                setSweets((prev) =>
                  prev.map((s) =>
                    s.id === sweet.id
                      ? { ...s, quantity: s.quantity - 1 }
                      : s
                  )
                );
              }}
            >
              {sweet.quantity === 0 ? "Out of Stock" : "Purchase"}
            </button>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
