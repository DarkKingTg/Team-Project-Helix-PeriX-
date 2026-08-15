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
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  Ban,
} from "lucide-react";
import { AIAdvisorWidget } from "@/components/ai-advisor-widget";
import { useI18n } from "@/lib/i18n-context";
import {
  AVAILABLE_WAREHOUSES,
  getWarehouseById,
} from "@/lib/warehouse-data";

export interface Crop {
  id: string;
  name: string;
  quantity: number; // Total harvest yield in kg
  goodsGivenToWarehouseKg: number; // kg of goods given to warehouse
  warehouseId?: string;
  warehouseName?: string;
  warehouseLocation?: string;
  qualityGrade: string;
  harvestDate: string;
  handoverDate?: string;
  state: string;
  district: string;
  landArea: number;
  storageType: string;
  status: string;
  procurementPricePerKg?: number;
  orderNumber?: string;
  createdAt?: unknown;
}

const cropOptions = [
  "Tomato", "Potato", "Onion", "Wheat", "Rice", "Sugarcane",
  "Cotton", "Banana", "Mango", "Apple", "Green Chilli", "Turmeric",
  "Ginger", "Garlic", "Corn", "Soybean", "Groundnut", "Mustard",
];

const qualityGrades = ["A - Premium", "B - Standard", "C - Economy"];

const storageTypes = [
  { value: "cold_storage", label: "Reefer Cold Storage (2°C - 4°C)", icon: Leaf },
  { value: "warehouse", label: "Ventilated Warehouse (18°C - 24°C)", icon: Warehouse },
  { value: "open_field", label: "Open Field / Ambient Holding", icon: Sun },
];

export default function CropsPage() {
  const { user, profile, switchRole } = useAuth();
  const { t } = useI18n();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const defaultWarehouse = AVAILABLE_WAREHOUSES[0];
  const [form, setForm] = useState({
    name: "Tomato",
    quantity: 1000,
    goodsGivenToWarehouseKg: 1000,
    warehouseId: defaultWarehouse.id,
    qualityGrade: "A - Premium",
    harvestDate: new Date().toISOString().split("T")[0],
    handoverDate: new Date().toISOString().split("T")[0],
    state: "Tamil Nadu",
    district: "Coimbatore",
    landArea: 2.0,
    storageType: "cold_storage",
    status: "Order Placed & In Storage",
    procurementPricePerKg: 34.0,
  });

  const storageKey = `perix_crops_${user?.uid || "farmer"}`;

  // 1. Initial Load from LocalStorage for instant hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
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

    // For demo users only, fetch default demo crops
    if (profile?.isDemo) {
      async function fetchBackendCrops() {
        const backendCrops = await apiClient.crops.getMyCrops();
        if (isMounted && backendCrops && Array.isArray(backendCrops) && backendCrops.length > 0) {
          const normalized: Crop[] = backendCrops.map((c: any) => ({
            ...c,
            goodsGivenToWarehouseKg: c.goodsGivenToWarehouseKg !== undefined ? Number(c.goodsGivenToWarehouseKg) : Number(c.quantity || 0),
            quantity: Number(c.quantity || 0),
          }));
          setCrops(normalized);
          localStorage.setItem(storageKey, JSON.stringify(normalized));
        }
      }
      fetchBackendCrops();
    }

    // Firestore Real-Time Listener for the Authenticated Farmer
    if (user?.uid) {
      try {
        const q = query(collection(db, "crops"), where("farmerId", "==", user.uid));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (isMounted) {
              if (!snapshot.empty) {
                const cropsData = snapshot.docs.map((d) => ({
                  id: d.id,
                  ...d.data(),
                  goodsGivenToWarehouseKg: d.data().goodsGivenToWarehouseKg !== undefined ? Number(d.data().goodsGivenToWarehouseKg) : Number(d.data().quantity || 0),
                  quantity: Number(d.data().quantity || 0),
                })) as Crop[];
                setCrops(cropsData);
                localStorage.setItem(storageKey, JSON.stringify(cropsData));
              } else if (!profile?.isDemo) {
                // Newly registered account with 0 crops -> zero mock data
                setCrops([]);
                localStorage.setItem(storageKey, JSON.stringify([]));
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

    const chosenWh = getWarehouseById(form.warehouseId) || defaultWarehouse;
    const totalHarvest = Number(form.quantity);
    const givenKg = Math.min(totalHarvest, Math.max(0, Number(form.goodsGivenToWarehouseKg)));
    const generatedOrderNumber = `PO-${Math.floor(100000 + Math.random() * 900000)}`;

    const cropData: Omit<Crop, "id"> = {
      name: form.name,
      quantity: totalHarvest,
      goodsGivenToWarehouseKg: givenKg,
      warehouseId: chosenWh.id,
      warehouseName: chosenWh.warehouseName,
      warehouseLocation: chosenWh.address,
      qualityGrade: form.qualityGrade,
      harvestDate: form.harvestDate,
      handoverDate: form.handoverDate,
      state: form.state || chosenWh.state,
      district: form.district || chosenWh.district,
      landArea: Number(form.landArea),
      storageType: form.storageType,
      status: givenKg > 0 ? "Received & In Storage" : "Standing Crop",
      procurementPricePerKg: Number(form.procurementPricePerKg || 34.0),
      orderNumber: generatedOrderNumber,
    };

    // 1. Optimistic Local Update for Crops
    let updatedList: Crop[] = [];
    if (editingId) {
      updatedList = crops.map((c) =>
        c.id === editingId ? ({ ...c, ...cropData, id: c.id } as Crop) : c
      );
    } else {
      const newCrop: Crop = { id: `crop-${Date.now()}`, ...cropData };
      updatedList = [newCrop, ...crops];
    }
    setCrops(updatedList);

    // 2. Save to LocalStorage immediately
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));

        // 3. CREATE ORDER IN "MY ORDERS"
        if (givenKg > 0) {
          const newOrder = {
            id: `ord-${Date.now()}`,
            orderNumber: generatedOrderNumber,
            senderNode: `Farmer Gate - ${cropData.district} (${user?.displayName || "Farmer"})`,
            receiverNode: chosenWh.warehouseName,
            commodity: cropData.name,
            quantityKg: givenKg,
            totalAmount: Math.round(givenKg * Number(cropData.procurementPricePerKg || 34.0)),
            escrowStatus: "funds_locked" as const,
            routeDistanceKm: 24,
            expectedDelivery: cropData.handoverDate || cropData.harvestDate,
            createdAt: new Date().toISOString().split("T")[0],
          };

          // Save to user orders cache and global orders cache
          const userOrdersKey = `perix_orders_${user?.uid || "global"}`;
          const existingUserOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
          localStorage.setItem(userOrdersKey, JSON.stringify([newOrder, ...existingUserOrders]));

          const globalOrders = JSON.parse(localStorage.getItem("perix_orders_global") || "[]");
          localStorage.setItem("perix_orders_global", JSON.stringify([newOrder, ...globalOrders]));

          // Also save under role-based keys
          const farmerOrders = JSON.parse(localStorage.getItem("perix_orders_farmer") || "[]");
          localStorage.setItem("perix_orders_farmer", JSON.stringify([newOrder, ...farmerOrders]));

          // 4. RECORD IN RESPECTIVE WAREHOUSE AS RECEIVED FROM FARMER
          const warehouseInwardItem = {
            id: `inv-wh-${Date.now()}`,
            commodity: form.name,
            quantity: givenKg,
            qualityGrade: form.qualityGrade,
            buyPrice: Number(form.procurementPricePerKg || 34.0),
            sellPrice: Math.round(Number(form.procurementPricePerKg || 34.0) * 1.15),
            storageType: form.storageType,
            coldChain: form.storageType === "cold_storage",
            expiryDays: form.storageType === "cold_storage" ? 14 : 7,
            sourceFarmer: `Farmer: ${user?.displayName || "Registered Farmer"} (${form.district})`,
            destinationNode: chosenWh.warehouseName,
            warehouseName: chosenWh.warehouseName,
            nodeId: chosenWh.id,
            status: "Received & In Storage",
            orderNumber: generatedOrderNumber,
            date: form.handoverDate,
          };
          const existingWhFeed = JSON.parse(localStorage.getItem("perix_wh_inward_feed") || "[]");
          localStorage.setItem("perix_wh_inward_feed", JSON.stringify([warehouseInwardItem, ...existingWhFeed]));
        }
      } catch (err) {
        console.warn("LocalStorage sync error:", err);
      }
    }

    // 5. Call Backend API
    try {
      await apiClient.crops.createCrop({
        ...cropData,
        id: editingId || `crop-${Date.now()}`,
        farmerId: user?.uid || "demo-farmer",
      });

      if (givenKg > 0) {
        await apiClient.inventory.addWholesalerInventory({
          commodity: form.name,
          quantity: givenKg,
          qualityGrade: form.qualityGrade,
          buyPrice: Number(form.procurementPricePerKg || 34.0),
          sellPrice: Math.round(Number(form.procurementPricePerKg || 34.0) * 1.15),
          storageType: form.storageType,
          coldChain: form.storageType === "cold_storage",
          sourceFarmer: `Farmer: ${user?.displayName || "Farmer"} (${form.district})`,
          destinationNode: chosenWh.warehouseName,
        });
      }
    } catch (err) {
      console.warn("Backend crop create error:", err);
    }

    // 6. Sync with Firestore if active
    if (user?.uid) {
      try {
        if (editingId) {
          await updateDoc(doc(db, "crops", editingId), {
            ...cropData,
            updatedAt: serverTimestamp(),
          });
        } else {
          await addDoc(collection(db, "crops"), {
            ...cropData,
            farmerId: user.uid,
            createdAt: serverTimestamp(),
          });
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
    if (!confirm("Are you sure you want to delete this crop & order record?")) return;
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
      goodsGivenToWarehouseKg: crop.goodsGivenToWarehouseKg ?? crop.quantity,
      warehouseId: crop.warehouseId || defaultWarehouse.id,
      qualityGrade: crop.qualityGrade,
      harvestDate: crop.harvestDate,
      handoverDate: crop.handoverDate || crop.harvestDate,
      state: crop.state,
      district: crop.district,
      landArea: crop.landArea,
      storageType: crop.storageType,
      status: crop.status,
      procurementPricePerKg: crop.procurementPricePerKg || 34.0,
    });
    setEditingId(crop.id);
    setShowForm(true);
  };

  // Pure live calculations from real crops state
  const totalHarvestQuantity = crops.reduce((acc, c) => acc + (Number(c.quantity) || 0), 0);
  const totalGoodsInWarehouse = crops.reduce((acc, c) => acc + (Number(c.goodsGivenToWarehouseKg) || 0), 0);
  const totalArea = crops.reduce((acc, c) => acc + (Number(c.landArea) || 0), 0);
  const activeOrdersCount = crops.filter((c) => (Number(c.goodsGivenToWarehouseKg) || 0) > 0).length;

  if (profile && profile.role !== "farmer" && profile.role !== "admin") {
    return (
      <div className="page-container animate-fade-in" style={{ padding: "40px 16px", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <div className="card" style={{ padding: "48px 32px", border: "1px dashed rgba(76,175,80,0.4)", background: "var(--surface)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(76,175,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Sprout size={32} color="#4CAF50" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
            {t("farmer.title", "Farmer Crop Registry & Harvest Log")}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
            {t("roles.roleRestrictedDesc", "This dashboard is exclusively dedicated to the active role.")} ({t("roles.farmer", "Farmer")}).
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              style={{ background: "#4CAF50", borderColor: "#4CAF50", color: "#fff", fontWeight: "700", gap: "8px", padding: "10px 24px" }}
              onClick={() => switchRole("farmer")}
            >
              <Sprout size={18} /> {t("roles.switchPersona", "Switch Role")} → {t("roles.farmer", "Farmer")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              {t("farmer.title", "Farmer Crop Registry & Harvest Log")}
            </h2>
            <span className="badge badge-success">{t("farmer.farmGate", "Direct Farm Gate")}</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("farmer.subtitle", "Log expected crop yields, choose cold storage warehouses, and place automated intake orders with live escrow protection.")}
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
          {showForm ? t("common.cancel", "Cancel") : t("farmer.addCrop", "Register Crop & Place Warehouse Order")}
        </button>
      </div>

      {/* AI Smart Advisor Widget - Driven by real live crop data */}
      {crops.length > 0 && (
        <AIAdvisorWidget
          role="farmer"
          commodity={crops[0]?.name || "Tomato"}
          quantityKg={totalHarvestQuantity}
        />
      )}

      {/* Summary Live KPIs - 100% computed from real live state */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("farmer.totalHarvest", "Total Harvest Volume (kg)")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--primary)" }}>
            {totalHarvestQuantity.toLocaleString()} {t("common.kg", "kg")}
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{t("farmer.myCrops", "Farmer Crop Registry")}</span>
        </div>

        <div className="card" style={{ padding: "18px 20px", border: "1px solid rgba(33,150,243,0.3)" }}>
          <p style={{ fontSize: "12px", color: "#1565C0", fontWeight: "600" }}>{t("farmer.goodsToWarehouse", "Goods Handed to Warehouse (kg)")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#1976D2" }}>
            {totalGoodsInWarehouse.toLocaleString()} {t("common.kg", "kg")}
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {totalHarvestQuantity > 0
              ? `${((totalGoodsInWarehouse / totalHarvestQuantity) * 100).toFixed(1)}% ${t("farmer.receivedInStorage", "deposited into storage")}`
              : `0 ${t("common.kg", "kg")}`}
          </span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("farmer.activeArea", "Active Farm Land Area")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
            {totalArea.toFixed(1)} Acres
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{t("farmer.landArea", "Land Area")}</span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("farmer.activeOrders", "Active Warehouse Orders")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#2E7D32" }}>
            {activeOrdersCount} {t("nav.orders", "Orders")}
          </h3>
          <span style={{ fontSize: "11px", color: "#2E7D32" }}>{t("farmer.escrowLock", "Escrow Protection Active")}</span>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
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
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                {editingId ? t("farmer.addCrop", "Edit Crop & Warehouse Order") : t("farmer.addCrop", "Register Crop & Place Warehouse Order")}
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                {t("farmer.subtitle", "Select an available warehouse from the network to place your order and deposit produce into storage.")}
              </p>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {/* Crop Name */}
              <div>
                <label className="label">{t("farmer.cropName", "Crop Name")}</label>
                <select
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                >
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Total Harvest Quantity */}
              <div>
                <label className="label">{t("farmer.quantity", "Expected Quantity (kg)")}</label>
                <input
                  type="number"
                  className="input"
                  value={form.quantity}
                  onChange={(e) => {
                    const total = Number(e.target.value);
                    setForm({
                      ...form,
                      quantity: total,
                      goodsGivenToWarehouseKg: Math.min(total, form.goodsGivenToWarehouseKg),
                    });
                  }}
                  required
                  min="1"
                />
              </div>

              {/* Goods Given to Warehouse in KG */}
              <div>
                <label className="label" style={{ color: "var(--primary)", fontWeight: "700" }}>
                  {t("farmer.goodsToWarehouse", "Goods Handed to Warehouse (kg)")}
                </label>
                <input
                  type="number"
                  className="input"
                  value={form.goodsGivenToWarehouseKg}
                  onChange={(e) => setForm({ ...form, goodsGivenToWarehouseKg: Number(e.target.value) })}
                  required
                  min="0"
                  max={form.quantity}
                  style={{ border: "2px solid var(--primary)", fontWeight: "700" }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                  {t("farmer.standingCrop", "Standing Crop")}: {Math.max(0, form.quantity - form.goodsGivenToWarehouseKg).toLocaleString()} {t("common.kg", "kg")}
                </span>
              </div>

              {/* Destination Warehouse Selector */}
              <div style={{ gridColumn: "span 2" }}>
                <label className="label" style={{ fontWeight: "700" }}>
                  {t("farmer.selectWarehouse", "Select Destination Warehouse")}
                </label>
                <select
                  className="input"
                  value={form.warehouseId}
                  onChange={(e) => {
                    const wh = getWarehouseById(e.target.value);
                    setForm({
                      ...form,
                      warehouseId: e.target.value,
                      storageType: wh?.hasColdStorage ? "cold_storage" : "warehouse",
                    });
                  }}
                  required
                >
                  {AVAILABLE_WAREHOUSES.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.warehouseName} ({wh.district}, {wh.state}) — {wh.hasColdStorage ? `${t("farmer.coldStorage", "Cold Storage")} (${wh.temperatureRange})` : t("farmer.warehouse", "Ventilated Warehouse")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="label">{t("farmer.quality", "Quality Grade")}</label>
                <select
                  className="input"
                  value={form.qualityGrade}
                  onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                >
                  {qualityGrades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="label">{t("farmer.harvestDate", "Expected Harvest Date")}</label>
                <input
                  type="date"
                  className="input"
                  value={form.harvestDate}
                  onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                  required
                />
              </div>

              {/* Warehouse Handover Date */}
              <div>
                <label className="label">{t("common.date", "Delivery Date")}</label>
                <input
                  type="date"
                  className="input"
                  value={form.handoverDate}
                  onChange={(e) => setForm({ ...form, handoverDate: e.target.value })}
                  required
                />
              </div>

              {/* Farm Land Area */}
              <div>
                <label className="label">{t("farmer.landArea", "Land Area (Acres)")}</label>
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={form.landArea}
                  onChange={(e) => setForm({ ...form, landArea: Number(e.target.value) })}
                  required
                />
              </div>

              {/* Storage Type */}
              <div>
                <label className="label">{t("farmer.storage", "Post-Harvest Storage Facility")}</label>
                <select
                  className="input"
                  value={form.storageType}
                  onChange={(e) => setForm({ ...form, storageType: e.target.value })}
                >
                  {storageTypes.map((st) => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>

              {/* Procurement Rate */}
              <div>
                <label className="label">{t("farmer.farmGate", "Price Realization")} (₹/kg)</label>
                <input
                  type="number"
                  className="input"
                  value={form.procurementPricePerKg}
                  onChange={(e) => setForm({ ...form, procurementPricePerKg: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                {t("common.cancel", "Cancel")}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingId ? t("common.save", "Update Crop & Order") : t("farmer.addCrop", "Register Crop & Place Warehouse Order")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pure Empty State */}
      {crops.length === 0 && !showForm && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(46,125,50,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Sprout size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>
            {t("farmer.emptyTitle", "No Crops Registered Yet")}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 20px" }}>
            {t("farmer.emptyDesc", "Your crop mesh is ready. Click below to register your standing crop batches and place warehouse deposit orders.")}
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> {t("farmer.addCrop", "Register Crop & Place Warehouse Order")}
          </button>
        </div>
      )}

      {/* Main Table: Crops and Warehouse Orders */}
      {crops.length > 0 && (
        <div className="card" style={{ padding: "20px", marginBottom: "28px", overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              {t("farmer.consignments", "Storage Consignments")}
            </h3>
            <span className="badge badge-success">{crops.length} {t("common.confirmed", "Active")}</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>{t("farmer.cropName", "Crop / Produce")}</th>
                <th>{t("farmer.quantity", "Harvest Yield (kg)")}</th>
                <th>{t("farmer.goodsToWarehouse", "Goods Handed to Warehouse (kg)")}</th>
                <th>{t("farmer.selectWarehouse", "Selected Warehouse")}</th>
                <th>{t("orders.orderId", "Order Number")}</th>
                <th>{t("farmer.quality", "Quality Grade")}</th>
                <th>{t("farmer.storage", "Storage Type")}</th>
                <th>{t("common.date", "Delivery Date")}</th>
                <th>{t("farmer.status", "Status")}</th>
                <th>{t("farmer.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => {
                const totalHarvest = Number(crop.quantity) || 0;
                const givenKg = Number(crop.goodsGivenToWarehouseKg) ?? totalHarvest;
                const whPct = totalHarvest > 0 ? Math.min(100, Math.round((givenKg / totalHarvest) * 100)) : 0;
                const whFacility = crop.warehouseId ? getWarehouseById(crop.warehouseId) : undefined;
                const whDisplayName = crop.warehouseName || whFacility?.warehouseName || "Kovai Agro Hub & Cold Storage";

                return (
                  <tr key={crop.id}>
                    {/* Produce */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "rgba(46,125,50,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary)",
                          }}
                        >
                          <Sprout size={18} />
                        </div>
                        <div>
                          <strong style={{ color: "var(--text-primary)" }}>{crop.name}</strong>
                          <span style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)" }}>
                            {crop.landArea} Acres ({crop.district})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Harvest Yield */}
                    <td style={{ fontWeight: "600" }}>
                      {totalHarvest.toLocaleString()} {t("common.kg", "kg")}
                    </td>

                    {/* Goods Given to Warehouse in KG */}
                    <td>
                      <div>
                        <strong style={{ color: "#1976D2", fontSize: "14px" }}>
                          {givenKg.toLocaleString()} {t("common.kg", "kg")}
                        </strong>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                          <div style={{ flex: 1, height: "6px", background: "var(--surface-hover)", borderRadius: "3px", overflow: "hidden", minWidth: "50px" }}>
                            <div
                              style={{
                                width: `${whPct}%`,
                                height: "100%",
                                background: whPct >= 80 ? "var(--primary)" : "#2196F3",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600" }}>
                            {whPct}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Destination Warehouse */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Warehouse size={14} color="#1565C0" />
                        <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {whDisplayName}
                        </strong>
                      </div>
                    </td>

                    {/* Order Number */}
                    <td>
                      <span className="badge badge-info" style={{ fontWeight: "600" }}>
                        <ShoppingCart size={11} style={{ marginRight: "4px" }} />
                        {crop.orderNumber || "PO-PLACED"}
                      </span>
                    </td>

                    {/* Quality */}
                    <td>
                      <span className="badge badge-success">{crop.qualityGrade}</span>
                    </td>

                    {/* Storage */}
                    <td>
                      <span className={`badge ${crop.storageType === "cold_storage" ? "badge-info" : "badge-secondary"}`}>
                        {crop.storageType === "cold_storage" ? t("farmer.coldStorage", "Cold Storage") : t("farmer.warehouse", "Ventilated")}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {crop.handoverDate || crop.harvestDate}
                    </td>

                    {/* Status */}
                    <td>
                      {crop.status?.includes("Rejected") ? (
                        <div>
                          <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Ban size={11} /> {t("common.rejected", "Rejected by Warehouse")}
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "var(--error)", marginTop: "2px", maxWidth: "170px", fontWeight: "500" }}>
                            {crop.status.replace("Rejected by Warehouse", "").replace(/[()]/g, "").trim() || "QC / Info Discrepancy"}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} style={{ marginRight: "4px" }} />
                          {crop.status || t("farmer.receivedInStorage", "Received & In Storage")}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title={t("common.edit", "Edit")}
                          onClick={() => handleEdit(crop)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ color: "var(--error)" }}
                          title={t("common.delete", "Delete")}
                          onClick={() => handleDelete(crop.id)}
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
