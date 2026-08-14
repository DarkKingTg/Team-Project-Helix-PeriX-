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
  Phone,
  Building2,
  MessageSquare,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { WarehouseContactModal, WarehouseContactInfo } from "@/components/warehouse-contact-modal";

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
  const { t } = useI18n();
  const role = profile?.role || "mandi";
  const isWholesaler = role === "wholesaler";
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contactWarehouse, setContactWarehouse] = useState<WarehouseContactInfo | null>(null);

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
        console.warn("Inventory storage read error:", err);
      }
    }
  }, [storageKey]);

  // 2. Fetch from Backend REST API + Live Firestore listener
  useEffect(() => {
    let isMounted = true;

    async function fetchBackendInventory() {
      try {
        let backendItems: InventoryItem[] | null = null;
        if (isWholesaler) {
          backendItems = await apiClient.inventory.getWholesalerInventory();
        } else {
          backendItems = await apiClient.inventory.getMandiInventory();
        }
        if (isMounted && backendItems && Array.isArray(backendItems) && backendItems.length > 0) {
          setItems(backendItems);
        }
      } catch (err) {
        console.warn("Backend fetch fallback to cache/firestore:", err);
      }
    }

    fetchBackendInventory();

    if (user?.uid) {
      try {
        const q = query(collection(db, collectionName), where("nodeId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as InventoryItem[];
            if (isMounted) setItems(fetched);
          }
        });
        return () => unsubscribe();
      } catch (err) {
        console.warn("Firestore inventory listener error:", err);
      }
    }
  }, [user, collectionName, isWholesaler]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newItemData = {
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
      nodeId: user?.uid || "demo-node-001",
    };

    // 1. Optimistic Local State Update
    let updatedList: InventoryItem[] = [];
    if (editingId) {
      updatedList = items.map((i) => (i.id === editingId ? { ...i, ...newItemData, id: i.id } as InventoryItem : i));
    } else {
      const createdItem: InventoryItem = { id: `inv-${Date.now()}`, ...newItemData };
      updatedList = [createdItem, ...items];
    }
    setItems(updatedList);

    // 2. Save directly to LocalStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage save error:", err);
      }
    }

    // 3. Persist to Backend REST API
    try {
      if (isWholesaler) {
        await apiClient.inventory.createWholesalerInventory(newItemData);
      } else {
        await apiClient.inventory.createMandiInventory(newItemData);
      }
    } catch (err) {
      console.warn("Backend save error:", err);
    }

    // 4. Persist to Cloud Firestore
    if (user?.uid) {
      try {
        if (editingId) {
          await updateDoc(doc(db, collectionName, editingId), {
            ...newItemData,
            updatedAt: serverTimestamp(),
          });
        } else {
          await addDoc(collection(db, collectionName), {
            ...newItemData,
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.warn("Firestore sync fallback notice:", err);
      }
    }

    setLoading(false);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setForm({
      commodity: item.commodity || "Tomato",
      quantity: item.quantity || 100,
      qualityGrade: item.qualityGrade || "A - Premium",
      buyPrice: item.buyPrice || 25,
      sellPrice: item.sellPrice || 32,
      storageType: item.storageType || "cold_storage",
      coldChain: item.coldChain !== undefined ? item.coldChain : true,
      expiryDays: item.expiryDays || 7,
      sourceFarmer: item.sourceFarmer || "Farmer Collective",
      destinationNode: item.destinationNode || "Regional Hub",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inventory record?")) return;

    // Optimistic Delete
    const updatedList = items.filter((i) => i.id !== id);
    setItems(updatedList);

    // Update LocalStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage delete error:", err);
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
            {isWholesaler ? t("inventory.wholesalerTitle", "Wholesale Hub and Reefer Logistics") : t("inventory.mandiTitle", "Mandi Aggregation and Shelf-Life Tracker")}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {isWholesaler
              ? t("inventory.wholesalerSubtitle", "Cold-chain telemetry, multi-drop load dispatching, and margin optimization.")
              : t("inventory.mandiSubtitle", "Batch intake logger, Arrhenius respiration decay curves, and APMC commission spreads.")}
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
          {showForm ? t("common.cancel", "Close Form") : isWholesaler ? t("inventory.logReeferBtn", "Log Reefer Consignment") : t("inventory.logMandiBtn", "Log Mandi Batch")}
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

      {/* Peer Warehouse Rebalancing Hubs (Only for Mandi and Wholesaler / Warehouse Personnel) */}
      {(role === "wholesaler" || role === "mandi" || role === "admin") && (
        <div className="card" style={{ padding: "24px", marginTop: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(33,150,243,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1976D2" }}>
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                  Peer Warehouse Rebalancing Directory (Shortage & Surplus Matching)
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  If your facility has a stock shortage or excess produce, directly contact connected regional warehouse managers to coordinate inter-hub transfers.
                </p>
              </div>
            </div>
            <span className="badge badge-success">Inter-Facility P2P Active</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              {
                warehouseName: "Kovai Agro Hub & Cold Storage",
                managerName: "Suresh Kumar",
                phone: "+91 98421 77320",
                email: "suresh.kovai@perix-logistics.in",
                address: "Plot 42, APMC Industrial Cluster, Coimbatore, TN",
                role: "wholesaler" as const,
                surplusCommodity: "Tomato",
                surplusQuantityKg: 4200,
                availableCapacityTonnes: 120,
                hasColdStorage: true,
                status: "Surplus Available",
              },
              {
                warehouseName: "Nilgiris Fresh Harvest Consolidation Center",
                managerName: "Anand Rajan",
                phone: "+91 94432 11890",
                email: "anand.nilgiris@perix-logistics.in",
                address: "Mettupalayam Agro Cold Terminal, Tamil Nadu",
                role: "mandi" as const,
                surplusCommodity: "Potato",
                surplusQuantityKg: 8500,
                availableCapacityTonnes: 240,
                hasColdStorage: true,
                status: "Surplus Available",
              },
              {
                warehouseName: "Tiruppur Wholesale Buffer Terminal",
                managerName: "Vignesh Murugan",
                phone: "+91 98940 55214",
                email: "vignesh.tiruppur@perix-logistics.in",
                address: "Ring Road Logistics Park, Tiruppur, TN",
                role: "wholesaler" as const,
                surplusCommodity: "Onion",
                surplusQuantityKg: 6200,
                availableCapacityTonnes: 85,
                hasColdStorage: false,
                status: "Surplus Available",
              },
            ].map((wh, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                      {wh.warehouseName}
                    </h4>
                    <span className="badge badge-info" style={{ fontSize: "10px" }}>{wh.status}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                    Manager: <strong style={{ color: "var(--text-primary)" }}>{wh.managerName}</strong>
                  </div>

                  <div style={{ background: "var(--surface-hover)", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>Surplus Produce:</span>
                      <strong style={{ color: "var(--primary)" }}>{wh.surplusQuantityKg.toLocaleString()} kg {wh.surplusCommodity}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>Buffer Space:</span>
                      <strong style={{ color: "#1565C0" }}>{wh.availableCapacityTonnes} Tonnes</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  style={{ width: "100%", justifyContent: "center", gap: "6px" }}
                  onClick={() => setContactWarehouse(wh)}
                >
                  <Phone size={14} /> Contact Facility Manager
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouse Direct Contact Modal */}
      <WarehouseContactModal
        isOpen={!!contactWarehouse}
        onClose={() => setContactWarehouse(null)}
        warehouse={contactWarehouse}
      />
    </div>
  );
}
