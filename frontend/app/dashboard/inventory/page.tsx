"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Loader2,
  Truck,
  IndianRupee,
  Scale,
  ThermometerSnowflake,
  Layers,
  Sparkles,
} from "lucide-react";

interface InventoryItem {
  id: string;
  commodity: string;
  quantity: number;
  qualityGrade: string;
  buyPrice?: number;
  sellPrice?: number;
  storageType?: string;
  coldChain?: boolean;
  expiryDays?: number;
  sourceFarmer?: string;
  destinationNode?: string;
  updatedAt?: unknown;
}

const SAMPLE_COMMODITIES = [
  "Tomato", "Potato", "Onion", "Wheat", "Rice", "Sugarcane",
  "Cotton", "Banana", "Mango", "Chilli", "Turmeric", "Ginger",
];

export default function InventoryPage() {
  const { user, profile } = useAuth();
  const role = profile?.role || "mandi";
  const isWholesaler = role === "wholesaler";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    commodity: "Tomato",
    quantity: 1000,
    qualityGrade: "A - Premium",
    buyPrice: 28,
    sellPrice: 34,
    storageType: "cold_storage",
    coldChain: true,
    expiryDays: 8,
    sourceFarmer: "Farmer Collective - Coimbatore",
    destinationNode: "FreshMart Retail Chennai",
  });

  // Local collection name based on role
  const collectionName = isWholesaler ? "wholesaler_inventory" : "mandi_inventory";

  useEffect(() => {
    // Initial mock items for immediate demonstration if empty
    const defaultItems: InventoryItem[] = isWholesaler
      ? [
          {
            id: "wh-1",
            commodity: "Potato",
            quantity: 3500,
            qualityGrade: "A - Grade",
            buyPrice: 20,
            sellPrice: 25,
            coldChain: true,
            expiryDays: 20,
            destinationNode: "Chennai Metro Hypermarket",
          },
          {
            id: "wh-2",
            commodity: "Tomato",
            quantity: 1800,
            qualityGrade: "B - Grade",
            buyPrice: 30,
            sellPrice: 36,
            coldChain: true,
            expiryDays: 4,
            destinationNode: "Kongu Retailers Network",
          },
          {
            id: "wh-3",
            commodity: "Onion",
            quantity: 4200,
            qualityGrade: "A - Grade",
            buyPrice: 26,
            sellPrice: 31,
            coldChain: false,
            expiryDays: 30,
            destinationNode: "Madurai Wholesale Hub",
          },
        ]
      : [
          {
            id: "mandi-1",
            commodity: "Tomato",
            quantity: 2400,
            qualityGrade: "A - Premium",
            buyPrice: 28,
            sellPrice: 33,
            sourceFarmer: "Coimbatore Farmer Group",
            expiryDays: 5,
          },
          {
            id: "mandi-2",
            commodity: "Chilli",
            quantity: 650,
            qualityGrade: "A - Premium",
            buyPrice: 110,
            sellPrice: 125,
            sourceFarmer: "Salem Spices Cluster",
            expiryDays: 14,
          },
          {
            id: "mandi-3",
            commodity: "Banana",
            quantity: 1200,
            qualityGrade: "B - Standard",
            buyPrice: 38,
            sellPrice: 44,
            sourceFarmer: "Erode Banana FPO",
            expiryDays: 6,
          },
        ];

    setItems(defaultItems);

    if (user?.uid) {
      try {
        const q = query(collection(db, collectionName), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const dbItems = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as InventoryItem[];
            setItems(dbItems);
          }
        });
        return () => unsubscribe();
      } catch (e) {
        console.warn("Firestore onSnapshot error:", e);
      }
    }
  }, [user, collectionName, isWholesaler]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newItem: InventoryItem = {
      id: editingId || `item-${Date.now()}`,
      commodity: form.commodity,
      quantity: Number(form.quantity),
      qualityGrade: form.qualityGrade,
      buyPrice: Number(form.buyPrice),
      sellPrice: Number(form.sellPrice),
      coldChain: form.coldChain,
      expiryDays: Number(form.expiryDays),
      sourceFarmer: form.sourceFarmer,
      destinationNode: form.destinationNode,
    };

    if (editingId) {
      setItems((prev) => prev.map((i) => (i.id === editingId ? newItem : i)));
    } else {
      setItems((prev) => [newItem, ...prev]);
    }

    if (user?.uid) {
      try {
        if (editingId) {
          await updateDoc(doc(db, collectionName, editingId), { ...newItem, updatedAt: serverTimestamp() });
        } else {
          await addDoc(collection(db, collectionName), { ...newItem, userId: user.uid, updatedAt: serverTimestamp() });
        }
      } catch (err) {
        console.warn("Firestore sync fallback to local state:", err);
      }
    }

    setLoading(false);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this stock entry?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (user?.uid) {
      try {
        deleteDoc(doc(db, collectionName, id));
      } catch (e) {
        console.warn("Delete error:", e);
      }
    }
  };

  const totalQuantity = items.reduce((acc, i) => acc + (i.quantity || 0), 0);
  const totalValue = items.reduce((acc, i) => acc + (i.quantity || 0) * (i.sellPrice || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
            {isWholesaler ? "Wholesale Hub Inventory" : "Mandi Aggregator Inventory"}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time batch tracking, shelf-life monitoring & automated margin calculation
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Add Inventory Batch"}
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(46,125,50,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scale size={20} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Total Live Stock</p>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>{totalQuantity.toLocaleString()} kg</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,152,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IndianRupee size={20} color="#FF9800" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Estimated Asset Value</p>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>₹{totalValue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(33,150,243,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ThermometerSnowflake size={20} color="#2196F3" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Cold-Chain Integrity</p>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#2196F3" }}>99.2% Active</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Inventory Form */}
      {showForm && (
        <div className="card animate-scale-in" style={{ padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: "var(--text-primary)" }}>
            {editingId ? "Update Inventory Batch" : "Add New Stock Intake"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Commodity
                </label>
                <select
                  className="input"
                  value={form.commodity}
                  onChange={(e) => setForm({ ...form, commodity: e.target.value })}
                  required
                >
                  {SAMPLE_COMMODITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Intake Quantity (kg)
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  required
                  min={1}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Quality Grade
                </label>
                <select
                  className="input"
                  value={form.qualityGrade}
                  onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                >
                  <option value="A - Premium">A - Premium Grade (Zero defect)</option>
                  <option value="B - Standard">B - Standard Commercial Grade</option>
                  <option value="C - Processing">C - Processing / Immediate Consume</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Procurement / Buy Price (₹/kg)
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.buyPrice}
                  onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Selling Target (₹/kg)
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.sellPrice}
                  onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Estimated Shelf Life (Days)
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.expiryDays}
                  onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })}
                  required
                  min={1}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  {isWholesaler ? "Connected Retail Outlets" : "Origin Farmer / Cluster"}
                </label>
                <input
                  type="text"
                  className="input"
                  value={isWholesaler ? form.destinationNode : form.sourceFarmer}
                  onChange={(e) =>
                    isWholesaler
                      ? setForm({ ...form, destinationNode: e.target.value })
                      : setForm({ ...form, sourceFarmer: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingId ? "Update Batch" : "Save Stock Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card" style={{ padding: "20px", overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Commodity</th>
              <th>Quantity (kg)</th>
              <th>Quality</th>
              <th>Buy / Sell Rate</th>
              <th>Margin</th>
              <th>Shelf Life</th>
              <th>{isWholesaler ? "Retail Destination" : "Origin Source"}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const buy = item.buyPrice || 0;
              const sell = item.sellPrice || 0;
              const margin = sell > 0 ? (((sell - buy) / buy) * 100).toFixed(1) : "0";
              const isNearExpiry = (item.expiryDays || 10) <= 4;

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(46,125,50,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={16} color="var(--primary)" />
                      </div>
                      <div>
                        <span style={{ fontWeight: "600" }}>{item.commodity}</span>
                        {item.coldChain && (
                          <span style={{ display: "block", fontSize: "11px", color: "#2196F3" }}>❄️ Cold Chain</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: "600" }}>{item.quantity.toLocaleString()} kg</td>
                  <td>
                    <span className="badge badge-success">{item.qualityGrade}</span>
                  </td>
                  <td>
                    <span>₹{buy} / ₹{sell}</span>
                  </td>
                  <td>
                    <span style={{ color: Number(margin) > 0 ? "var(--primary)" : "var(--error)", fontWeight: "600" }}>
                      +{margin}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${isNearExpiry ? "badge-warning" : "badge-info"}`}>
                      {item.expiryDays} days {isNearExpiry ? "⚠️" : ""}
                    </span>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {isWholesaler ? item.destinationNode : item.sourceFarmer}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Edit"
                        onClick={() => {
                          setForm({
                            commodity: item.commodity,
                            quantity: item.quantity,
                            qualityGrade: item.qualityGrade,
                            buyPrice: item.buyPrice || 25,
                            sellPrice: item.sellPrice || 30,
                            storageType: item.storageType || "cold_storage",
                            coldChain: !!item.coldChain,
                            expiryDays: item.expiryDays || 7,
                            sourceFarmer: item.sourceFarmer || "",
                            destinationNode: item.destinationNode || "",
                          });
                          setEditingId(item.id);
                          setShowForm(true);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon"
                        style={{ color: "var(--error)" }}
                        title="Delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
