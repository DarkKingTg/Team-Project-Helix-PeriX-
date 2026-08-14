"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { apiClient } from "@/lib/api-client";
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
  [key: string]: unknown;
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

  const collectionName = isWholesaler ? "wholesaler_inventory" : "mandi_inventory";
  const storageKey = `perix_inventory_${user?.uid || "guest"}_${collectionName}`;

  // 1. Initial Load from LocalStorage Cache for Instant Hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        }
      } catch (err) {
        console.warn("LocalStorage read error:", err);
      }
    }
  }, [storageKey]);

  // 2. Fetch from Backend API + Firestore Real-Time Sync
  useEffect(() => {
    let isMounted = true;

    async function fetchBackendInventory() {
      if (isWholesaler) {
        const backendItems = await apiClient.inventory.getWholesalerInventory();
        if (isMounted && backendItems && Array.isArray(backendItems) && backendItems.length > 0) {
          setItems(backendItems);
          localStorage.setItem(storageKey, JSON.stringify(backendItems));
        }
      } else {
        const backendItems = await apiClient.inventory.getMandiInventory();
        if (isMounted && backendItems && Array.isArray(backendItems) && backendItems.length > 0) {
          setItems(backendItems);
          localStorage.setItem(storageKey, JSON.stringify(backendItems));
        }
      }
    }

    fetchBackendInventory();

    // Firestore Listener
    if (user?.uid) {
      try {
        const q = query(collection(db, collectionName), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const dbItems = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
              })) as InventoryItem[];
              if (isMounted) {
                setItems(dbItems);
                localStorage.setItem(storageKey, JSON.stringify(dbItems));
              }
            }
          },
          (err) => {
            console.warn("Firestore subscription notice (using local/backend store):", err.message);
          }
        );
        return () => {
          isMounted = false;
          unsubscribe();
        };
      } catch (e) {
        console.warn("Firestore setup notice:", e);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user?.uid, collectionName, isWholesaler, storageKey]);

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
      storageType: form.storageType,
      coldChain: form.coldChain,
      expiryDays: Number(form.expiryDays),
      sourceFarmer: form.sourceFarmer,
      destinationNode: form.destinationNode,
    };

    let updatedList: InventoryItem[];
    if (editingId) {
      updatedList = items.map((item) => (item.id === editingId ? newItem : item));
    } else {
      updatedList = [newItem, ...items];
    }

    // 1. Immediately update React State
    setItems(updatedList);

    // 2. Immediately save to LocalStorage (Guaranteed persistence on page refresh)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage write error:", err);
      }
    }

    // 3. Save to Backend Microservice
    try {
      if (isWholesaler) {
        await apiClient.inventory.addWholesalerInventory(newItem);
      } else {
        await apiClient.inventory.addMandiInventory(newItem);
      }
    } catch (err) {
      console.warn("Backend inventory save notice:", err);
    }

    // 4. Save to Cloud Firestore
    if (user?.uid) {
      try {
        if (editingId) {
          await updateDoc(doc(db, collectionName, editingId), {
            ...newItem,
            updatedAt: serverTimestamp(),
          });
        } else {
          await addDoc(collection(db, collectionName), {
            ...newItem,
            userId: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.warn("Firestore database save notice (local persistence active):", e);
      }
    }

    setLoading(false);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const updatedList = items.filter((item) => item.id !== id);
    setItems(updatedList);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage delete write error:", err);
      }
    }

    // Delete from Backend
    try {
      if (isWholesaler) {
        await apiClient.inventory.deleteWholesalerInventory(id);
      } else {
        await apiClient.inventory.deleteMandiInventory(id);
      }
    } catch (err) {
      console.warn("Backend delete notice:", err);
    }

    // Delete from Firestore
    if (user?.uid) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (e) {
        console.warn("Firestore delete notice:", e);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: "8px 0" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
            {isWholesaler ? "Wholesale Hub and Reefer Logistics" : "Mandi Aggregation and Shelf-Life Tracker"}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {isWholesaler
              ? "Cold-chain telemetry, multi-drop load dispatching, and margin optimization."
              : "Batch intake logger, Arrhenius respiration decay curves, and APMC commission spreads."}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close Form" : isWholesaler ? "Log Reefer Consignment" : "Log Mandi Batch"}
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div
          className="card animate-fade-in"
          style={{
            padding: "24px",
            marginBottom: "24px",
            border: "1px solid var(--primary)",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
              {editingId ? "Edit Consignment Entry" : isWholesaler ? "Register New Reefer Dispatch" : "Record Inward Mandi Batch"}
            </h3>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div>
                <label className="label">Commodity</label>
                <select
                  className="input"
                  value={form.commodity}
                  onChange={(e) => setForm({ ...form, commodity: e.target.value })}
                  required
                >
                  {SAMPLE_COMMODITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Quantity (kg)</label>
                <input
                  type="number"
                  className="input"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="label">Quality Grade</label>
                <select
                  className="input"
                  value={form.qualityGrade}
                  onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                >
                  <option value="A - Premium">A - Premium (Export / Supermarket)</option>
                  <option value="B - Standard">B - Standard (Wholesale / Mandi)</option>
                  <option value="C - Economy">C - Economy (Processing / Kitchens)</option>
                </select>
              </div>

              <div>
                <label className="label">Procurement Rate (Rs/kg)</label>
                <input
                  type="number"
                  className="input"
                  value={form.buyPrice}
                  onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="label">Target Selling Rate (Rs/kg)</label>
                <input
                  type="number"
                  className="input"
                  value={form.sellPrice}
                  onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="label">Estimated Shelf Life (Days)</label>
                <input
                  type="number"
                  className="input"
                  value={form.expiryDays}
                  onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })}
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="label">{isWholesaler ? "Destination Retail Hub" : "Source Farmer / FPO"}</label>
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

      {/* Empty State */}
      {items.length === 0 && !showForm && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Package size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>No Inventory Records Found</h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
            Your inventory mesh is ready. Click below to log your first consignment and start tracking cold-chain shelf life and margins.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> {isWholesaler ? "Log First Reefer Consignment" : "Log First Mandi Batch"}
          </button>
        </div>
      )}

      {/* Inventory Table */}
      {items.length > 0 && (
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
                            <span style={{ display: "block", fontSize: "11px", color: "#2196F3" }}>Cold Chain Active</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: "600" }}>{item.quantity.toLocaleString()} kg</td>
                    <td>
                      <span className="badge badge-success">{item.qualityGrade}</span>
                    </td>
                    <td>
                      <span>Rs {buy} / Rs {sell}</span>
                    </td>
                    <td>
                      <span style={{ color: Number(margin) > 0 ? "var(--primary)" : "var(--error)", fontWeight: "600" }}>
                        +{margin}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isNearExpiry ? "badge-warning" : "badge-info"}`}>
                        {item.expiryDays} days
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
      )}
    </div>
  );
}
