import { useEffect, useState } from "react";
import api from "../api/api";
import useAuth from "../auth/useAuth";

export default function AdminPanel() {
  const { user } = useAuth();

  const [sweets, setSweets] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (user?.isAdmin) {
      api.get("/sweets").then((res) => setSweets(res.data));
    }
  }, [user]);

  if (!user) return <h2>Checking access...</h2>;
  if (!user.isAdmin) return <h2>Access Denied</h2>;

  /* ---------- ADD SWEET ---------- */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSweet = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/sweets", {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity),
      });

      setSweets((prev) => [...prev, res.data]);
      setForm({ name: "", category: "", price: "", quantity: "" });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          "Failed to add sweet"
      );
    }
  };

  /* ---------- INLINE EDIT ---------- */

  const startEdit = (sweet) => {
    setEditingId(sweet.id);
    setEditForm({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: sweet.quantity,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/sweets/${id}`, {
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price),
        quantity: Number(editForm.quantity),
      });

      setSweets((prev) =>
        prev.map((s) => (s.id === id ? res.data : s))
      );
      setEditingId(null);
    } catch {
      alert("Update failed");
    }
  };

  /* ---------- DELETE ---------- */

  const confirmDelete = async (id) => {
    try {
      await api.delete(`/sweets/${id}`);
      setSweets((prev) => prev.filter((s) => s.id !== id));
      setDeleteId(null);
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="container">
      <h1>🛠 Admin Panel</h1>
      <p>
        <strong>Admin:</strong> {user.username}
      </p>

      {/* ADD SWEET FORM */}
      <div className="card">
        <h3>Add New Sweet</h3>
        <form onSubmit={addSweet} className="admin-form">
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
          <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
          <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
          <button>Add Sweet</button>
        </form>
      </div>

      {/* SWEETS TABLE */}
      <h3 style={{ marginTop: 30 }}>Existing Sweets</h3>

      {sweets.length === 0 ? (
        <p>No sweets available</p>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sweets.map((sweet) => (
                <tr key={sweet.id}>
                  {editingId === sweet.id ? (
                    <>
                      <td><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                      <td><input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} /></td>
                      <td><input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} /></td>
                      <td><input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} /></td>
                      <td>
                        <button onClick={() => saveEdit(sweet.id)}>Save</button>
                        <button onClick={cancelEdit} className="secondary">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{sweet.name}</td>
                      <td>{sweet.category}</td>
                      <td>{sweet.price}</td>
                      <td>{sweet.quantity}</td>
                      <td>
                        <button onClick={() => startEdit(sweet)}>Edit</button>

                        {deleteId === sweet.id ? (
                          <>
                            <button className="danger" onClick={() => confirmDelete(sweet.id)}>Yes</button>
                            <button className="secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                          </>
                        ) : (
                          <button className="danger" onClick={() => setDeleteId(sweet.id)}>Delete</button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
