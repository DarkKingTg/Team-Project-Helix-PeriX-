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
  Plus,
  Sprout,
  Trash2,
  Edit2,
  X,
  Save,
  Loader2,
  Calendar,
  MapPin,
  Scale,
  Leaf,
  Warehouse,
  Sun,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AIAdvisorWidget } from "@/components/ai-advisor-widget";
import { useI18n } from "@/lib/i18n-context";

interface Crop {
  id: string;
  name: string;
  quantity: number;
  qualityGrade: string;
  harvestDate: string;
  state: string;
  district: string;
  landArea: number;
  storageType: string;
  status: string;
  createdAt?: unknown;
}

const cropOptions = [
  "Tomato", "Potato", "Onion", "Wheat", "Rice", "Sugarcane",
  "Cotton", "Banana", "Mango", "Apple", "Chilli", "Turmeric",
  "Ginger", "Garlic", "Corn", "Soybean", "Groundnut", "Mustard",
];

const qualityGrades = ["A - Premium", "B - Standard", "C - Economy"];

const storageTypes = [
  { value: "open_field", label: "Open Field", icon: Sun },
  { value: "cold_storage", label: "Cold Storage", icon: Leaf },
  { value: "warehouse", label: "Ventilated Warehouse", icon: Warehouse },
];

export default function CropsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "Tomato",
    quantity: 1000,
    qualityGrade: "A - Premium",
    harvestDate: "2026-08-20",
    state: "Tamil Nadu",
    district: "Coimbatore",
    landArea: 2,
    storageType: "cold_storage",
  });

  const storageKey = `perix_crops_${user?.uid || "farmer"}`;

  // 1. Initial Load from LocalStorage for instant hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCrops(parsed);
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

    async function fetchBackendCrops() {
      const backendCrops = await apiClient.crops.getMyCrops();
      if (isMounted && backendCrops && Array.isArray(backendCrops) && backendCrops.length > 0) {
        setCrops(backendCrops);
        localStorage.setItem(storageKey, JSON.stringify(backendCrops));
      }
    }

    fetchBackendCrops();

    // Firestore Listener
    if (user?.uid) {
      try {
        const q = query(collection(db, "crops"), where("farmerId", "==", user.uid));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const cropsData = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
              })) as Crop[];
              if (isMounted) {
                setCrops(cropsData);
                localStorage.setItem(storageKey, JSON.stringify(cropsData));
              }
            }
          },
          (err) => {
            console.warn("Firestore subscription notice:", err.message);
          }
        );
        return () => {
          isMounted = false;
          unsubscribe();
        };
      } catch (e) {
        console.warn("Firestore listener fallback to local state:", e);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user?.uid, storageKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cropData = {
      name: form.name,
      quantity: Number(form.quantity),
      qualityGrade: form.qualityGrade,
      harvestDate: form.harvestDate,
      state: form.state,
      district: form.district,
      landArea: Number(form.landArea),
      storageType: form.storageType,
      status: "Standing Crop",
    };

    // 1. Optimistic Local Update
    let updatedList: Crop[] = [];
    if (editingId) {
      updatedList = crops.map((c) => (c.id === editingId ? { ...c, ...cropData, id: c.id } as Crop : c));
    } else {
      const newCrop: Crop = { id: `crop-${Date.now()}`, ...cropData };
      updatedList = [newCrop, ...crops];
    }
    setCrops(updatedList);

    // 2. Save to LocalStorage immediately
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage write error:", err);
      }
    }

    // 3. Call Backend API
    try {
      await apiClient.crops.createCrop({ ...cropData, id: editingId || `crop-${Date.now()}`, farmerId: user?.uid || "demo-farmer" });
    } catch (err) {
      console.warn("Backend crop create error:", err);
    }

    // 4. Sync with Firestore if active
    if (user?.uid) {
      try {
        if (editingId) {
          await updateDoc(doc(db, "crops", editingId), { ...cropData, updatedAt: serverTimestamp() });
        } else {
          await addDoc(collection(db, "crops"), { ...cropData, farmerId: user.uid, createdAt: serverTimestamp() });
        }
      } catch (err) {
        console.warn("Firestore sync fallback:", err);
      }
    }

    setLoading(false);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this crop entry?")) return;
    const updatedList = crops.filter((c) => c.id !== id);
    setCrops(updatedList);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage delete error:", err);
      }
    }

    if (user?.uid) {
      try {
        await deleteDoc(doc(db, "crops", id));
      } catch (err) {
        console.warn("Delete fallback:", err);
      }
    }
  };

  const handleEdit = (crop: Crop) => {
    setForm({
      name: crop.name,
      quantity: crop.quantity,
      qualityGrade: crop.qualityGrade,
      harvestDate: crop.harvestDate,
      state: crop.state,
      district: crop.district,
      landArea: crop.landArea,
      storageType: crop.storageType,
    });
    setEditingId(crop.id);
    setShowForm(true);
  };

  const totalQuantity = crops.reduce((acc, c) => acc + (c.quantity || 0), 0);
  const totalArea = crops.reduce((acc, c) => acc + (c.landArea || 0), 0);

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              {t("farmer.title", "Farmer Crop Registry and Harvest Log")}
            </h2>
            <span className="badge badge-success">Direct Farm Gate</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("farmer.subtitle", "Log expected crop yields, location coordinates and trigger automated Mandi price matching")}
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
          {showForm ? t("common.cancel", "Cancel") : t("farmer.addCrop", "Register New Crop")}
        </button>
      </div>

      {/* AI Smart Advisor Widget */}
      <AIAdvisorWidget role="farmer" commodity={crops[0]?.name || "Tomato"} quantityKg={totalQuantity || 2000} />

      {/* Summary KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("farmer.totalHarvest", "Total Harvest Volume")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--primary)" }}>{totalQuantity.toLocaleString()} kg</h3>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("farmer.activeArea", "Active Farm Area")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>{totalArea.toFixed(1)} Acres</h3>
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("farmer.yieldConfidence", "AI Yield Confidence")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#2196F3" }}>94.2% Optimal</h3>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card animate-scale-in" style={{ padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "20px", color: "var(--text-primary)" }}>
            {editingId ? "Edit Crop Details" : "Register New Harvest Batch"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <Sprout size={14} style={{ display: "inline", marginRight: "6px" }} />
                  Crop Name
                </label>
                <select
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                >
                  {cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <Scale size={14} style={{ display: "inline", marginRight: "6px" }} />
                  Expected Quantity (kg)
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
                  {qualityGrades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <Calendar size={14} style={{ display: "inline", marginRight: "6px" }} />
                  Harvest Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={form.harvestDate}
                  onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  <MapPin size={14} style={{ display: "inline", marginRight: "6px" }} />
                  District
                </label>
                <input
                  type="text"
                  className="input"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Land Area (Acres)
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.landArea}
                  onChange={(e) => setForm({ ...form, landArea: Number(e.target.value) })}
                  step="0.1"
                  min={0.1}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Post-Harvest Storage Facility
                </label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {storageTypes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, storageType: value })}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        padding: "8px 6px",
                        borderRadius: "var(--radius)",
                        border: `2px solid ${form.storageType === value ? "var(--primary)" : "var(--border)"}`,
                        background: form.storageType === value ? "var(--primary-50)" : "transparent",
                        cursor: "pointer",
                        fontSize: "11px",
                        color: form.storageType === value ? "var(--primary)" : "var(--text-secondary)",
                        fontWeight: form.storageType === value ? "600" : "400",
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingId ? "Update Crop" : "Save to Mesh"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {crops.length === 0 && !showForm && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Sprout size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>No Crops Registered Yet</h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
            Your crop mesh is ready. Click the button below to register your standing crop batches and track harvest windows and mandi rates.
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Register First Crop
          </button>
        </div>
      )}

      {/* Crops Grid */}
      {crops.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }} className="stagger-children">
          {crops.map((crop) => (
            <div key={crop.id} className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "#4CAF5015",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sprout size={22} color="#4CAF50" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                      {crop.name}
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {crop.district}, {crop.state} • {crop.landArea} acres
                    </p>
                  </div>
                </div>
                <span className="badge badge-success">
                  {crop.status}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Quantity
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {crop.quantity.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Quality Grade
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {crop.qualityGrade}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Harvest Date
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {crop.harvestDate}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                    Storage
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {crop.storageType.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-light)" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(crop)}>
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--error)" }}
                  onClick={() => handleDelete(crop.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
