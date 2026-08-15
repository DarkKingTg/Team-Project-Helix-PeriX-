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
  Ban,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Lock,
  Boxes,
  Grid,
  Filter,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { WarehouseContactModal, WarehouseContactInfo } from "@/components/warehouse-contact-modal";
import { AVAILABLE_WAREHOUSES } from "@/lib/warehouse-data";

import {
  saveDocument,
  updateDocument,
  deleteDocument,
  subscribeCollection,
} from "@/lib/firestore-helpers";

export interface InventoryItem {
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
  warehouseName?: string;
  status?: string;
  isImmutableIntake?: boolean;
  rejectionReason?: string;
  rejectedAt?: string;
  dispatchedWholesaler?: string;
  dispatchedQuantity?: number;
  dispatchedAt?: string;
  orderNumber?: string;
  cropId?: string;
  userId?: string;
  updatedAt?: unknown;
  [key: string]: unknown;
}

const SAMPLE_COMMODITIES = [
  "Tomato", "Potato", "Onion", "Wheat", "Rice", "Sugarcane",
  "Cotton", "Banana", "Mango", "Green Chilli", "Turmeric", "Ginger", "Garlic",
];

const WHOLESALER_DESTINATIONS = [
  "FreshMart Mega Retail Depot - Chennai",
  "Metro Wholesale Logistics Hub - Coimbatore",
  "BigBasket Perishable Fulfillment Center - Bengaluru",
  "Reliance Retail Aggregation Terminal - Tiruppur",
  "APMC Supermarket Cold Terminal - Madanapalle",
  "Azadpur National Wholesale Market - Delhi",
];

const REJECTION_REASONS = [
  "Inaccurate / False Quantity Declared by Farmer",
  "Quality Grade Inferior to Declaration (QC Inspection Failed)",
  "Severe Moisture / Respiration Decay on Arrival",
  "Wrong Crop / Variety Mismatch against Order",
  "Packaging Contamination / Transport Damage",
  "Temperature Protocol Violation During Transit",
];

export default function InventoryPage() {
  const { user, profile, switchRole } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCatalogueCommodity, setSelectedCatalogueCommodity] = useState<string>("all");
  const [contactWarehouse, setContactWarehouse] = useState<WarehouseContactInfo | null>(null);

  // Modals for Rejection & Wholesaler Dispatch
  const [rejectItem, setRejectItem] = useState<InventoryItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>(REJECTION_REASONS[0]);
  const [rejectCustomNotes, setRejectCustomNotes] = useState<string>("");

  const [dispatchItem, setDispatchItem] = useState<InventoryItem | null>(null);
  const [dispatchForm, setDispatchForm] = useState({
    wholesalerName: WHOLESALER_DESTINATIONS[0],
    quantity: 1000,
    sellPrice: 38,
    transportMode: "Reefer Cold Van (2°C - 4°C)",
    notes: "Priority dispatch for supermarket retail mesh",
  });

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
    destinationNode: "Kovai Agro Hub & Cold Storage",
  });

  const storageKey = `perix_inventory_${user?.uid || "guest"}_mandi_inventory`;

  // 1. Initial Load of Warehouse Inventory
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(storageKey);
        const inwardFeed = localStorage.getItem("perix_wh_inward_feed");
        let initialItems: InventoryItem[] = [];
        const existingIds = new Set<string>();

        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            parsed.forEach((i) => {
              if (i && i.id && !existingIds.has(i.id)) {
                existingIds.add(i.id);
                initialItems.push(i);
              }
            });
          }
        }

        if (inwardFeed) {
          const parsedInward = JSON.parse(inwardFeed);
          if (Array.isArray(parsedInward)) {
            parsedInward.forEach((i) => {
              if (i && i.id && !existingIds.has(i.id)) {
                existingIds.add(i.id);
                initialItems.unshift({
                  ...i,
                  isImmutableIntake: true,
                });
              }
            });
          }
        }

        // Also check any logged farmer crops
        ["perix_crops_" + (user?.uid || "farmer"), "perix_crops_farmer", "perix_crops_global"].forEach((cropKey) => {
          const cachedCrops = localStorage.getItem(cropKey);
          if (cachedCrops) {
            const parsedCrops = JSON.parse(cachedCrops);
            if (Array.isArray(parsedCrops)) {
              parsedCrops.forEach((c) => {
                const givenKg = Number(c.goodsGivenToWarehouseKg ?? c.quantity ?? 0);
                if (givenKg > 0) {
                  const inwardId = `inv-crop-${c.id}`;
                  if (!existingIds.has(inwardId)) {
                    existingIds.add(inwardId);
                    const cropInventoryItem: InventoryItem = {
                      id: inwardId,
                      commodity: c.name,
                      quantity: givenKg,
                      qualityGrade: c.qualityGrade || "A - Premium",
                      buyPrice: Number(c.procurementPricePerKg || 34.0),
                      sellPrice: Math.round(Number(c.procurementPricePerKg || 34.0) * 1.15),
                      storageType: c.storageType || "cold_storage",
                      coldChain: c.storageType === "cold_storage",
                      expiryDays: c.storageType === "cold_storage" ? 14 : 7,
                      sourceFarmer: `Farmer: ${user?.displayName || "Registered Farmer"} (${c.district || "Farm Gate"})`,
                      destinationNode: c.warehouseName || "Kovai Agro Hub & Cold Storage",
                      warehouseName: c.warehouseName || "Kovai Agro Hub & Cold Storage",
                      status: c.status?.includes("Rejected") ? c.status : "Received & In Storage",
                      isImmutableIntake: true,
                      orderNumber: c.orderNumber,
                      cropId: c.id,
                      userId: user?.uid,
                      createdAt: c.harvestDate || new Date().toISOString(),
                    };
                    initialItems.unshift(cropInventoryItem);
                    // Sync to Firestore
                    saveDocument("inventory", inwardId, cropInventoryItem).catch(() => {});
                  }
                }
              });
            }
          }
        });

        if (initialItems.length > 0) {
          setItems(initialItems);
        }
      } catch (err) {
        console.warn("Inventory storage read error:", err);
      }
    }
  }, [storageKey, user]);

  // 2. Real-time Firestore sync for Inventory
  useEffect(() => {
    const unsubscribe = subscribeCollection<InventoryItem>("inventory", (dbItems) => {
      if (dbItems && dbItems.length > 0) {
        setItems((prev) => {
          const map = new Map<string, InventoryItem>();
          prev.forEach((i) => {
            if (i.id) map.set(i.id, i);
          });
          dbItems.forEach((i) => {
            if (i.id) map.set(i.id, { ...(map.get(i.id) || {}), ...i });
          });
          const merged = Array.from(map.values());
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(storageKey, JSON.stringify(merged));
            } catch {}
          }
          return merged;
        });
      }
    });

    return () => unsubscribe();
  }, [storageKey]);

  // 3. Fetch from Backend REST API
  useEffect(() => {
    let isMounted = true;
    async function fetchBackendInventory() {
      try {
        const backendItems = await apiClient.inventory.getMandiInventory();
        if (isMounted && backendItems && Array.isArray(backendItems) && backendItems.length > 0) {
          setItems((prev) => {
            const existingIds = new Set(prev.map((i) => i.id));
            const fresh = backendItems.filter((i: any) => !existingIds.has(i.id));
            return [...prev, ...fresh];
          });
        }
      } catch (err) {
        console.warn("Backend fetch fallback:", err);
      }
    }
    fetchBackendInventory();
  }, []);

  // Handle Standard Inventory Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const itemId = editingId || `inv-${Date.now()}`;
    const newItemData: InventoryItem = {
      id: itemId,
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
      userId: user?.uid,
      status: "Received & In Storage",
      isImmutableIntake: false,
    };

    let updatedList: InventoryItem[] = [];
    if (editingId) {
      updatedList = items.map((i) => (i.id === editingId ? { ...i, ...newItemData, id: i.id } as InventoryItem : i));
    } else {
      updatedList = [newItemData, ...items];
    }
    setItems(updatedList);

    // Save to Firestore
    try {
      await saveDocument("inventory", itemId, newItemData);
    } catch (err) {
      console.warn("Firestore inventory save notice:", err);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage save error:", err);
      }
    }

    try {
      await apiClient.inventory.createMandiInventory(newItemData);
    } catch (err) {
      console.warn("Backend save error:", err);
    }

    setLoading(false);
    setShowForm(false);
    setEditingId(null);
  };

  // Handle Reject Consignment (Wrong Info / Inspection Discrepancy)
  const handleConfirmRejection = async () => {
    if (!rejectItem) return;

    const finalReason = rejectCustomNotes ? `${rejectReason} - ${rejectCustomNotes}` : rejectReason;
    const rejectionTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

    const updatedList = items.map((i) => {
      if (i.id === rejectItem.id) {
        return {
          ...i,
          status: `Rejected (${finalReason})`,
          rejectionReason: finalReason,
          rejectedAt: rejectionTimestamp,
        };
      }
      return i;
    });

    setItems(updatedList);

    // Update in Firestore inventory collection
    try {
      await updateDocument("inventory", rejectItem.id, {
        status: `Rejected (${finalReason})`,
        rejectionReason: finalReason,
        rejectedAt: rejectionTimestamp,
      });

      // Also update related order in Firestore
      if (rejectItem.orderNumber) {
        const orderId = `ord-${String(rejectItem.orderNumber).replace(/[^a-zA-Z0-9_-]/g, "")}`;
        await updateDocument("orders", orderId, {
          escrowStatus: "cancelled",
          note: `Consignment Rejected: ${finalReason}`,
        });
      }

      // Also update related crop in Firestore
      if (rejectItem.cropId) {
        await updateDocument("crops", rejectItem.cropId, {
          status: `Rejected by Warehouse (${finalReason})`,
        });
      }
    } catch (err) {
      console.warn("Firestore rejection update notice:", err);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));

        // Update inward feed cache
        const inwardFeed = JSON.parse(localStorage.getItem("perix_wh_inward_feed") || "[]");
        const updatedFeed = inwardFeed.map((i: any) =>
          i.id === rejectItem.id || i.orderNumber === rejectItem.orderNumber
            ? { ...i, status: `Rejected (${finalReason})`, rejectionReason: finalReason }
            : i
        );
        localStorage.setItem("perix_wh_inward_feed", JSON.stringify(updatedFeed));

        // Update Farmer Crops record
        ["perix_crops_" + (user?.uid || "farmer"), "perix_crops_farmer", "perix_crops_global"].forEach((cropKey) => {
          const cachedCrops = localStorage.getItem(cropKey);
          if (cachedCrops) {
            const parsedCrops = JSON.parse(cachedCrops);
            if (Array.isArray(parsedCrops)) {
              const updatedCrops = parsedCrops.map((c: any) => {
                if (c.id === rejectItem.cropId || c.orderNumber === rejectItem.orderNumber || c.name === rejectItem.commodity) {
                  return { ...c, status: `Rejected by Warehouse (${finalReason})` };
                }
                return c;
              });
              localStorage.setItem(cropKey, JSON.stringify(updatedCrops));
            }
          }
        });

        // Update Orders Page record
        ["perix_orders_" + (user?.uid || "global"), "perix_orders_global", "perix_orders_farmer"].forEach((orderKey) => {
          const cachedOrders = localStorage.getItem(orderKey);
          if (cachedOrders) {
            const parsedOrders = JSON.parse(cachedOrders);
            if (Array.isArray(parsedOrders)) {
              const updatedOrders = parsedOrders.map((o: any) => {
                if (o.orderNumber === rejectItem.orderNumber || o.commodity === rejectItem.commodity) {
                  return { ...o, escrowStatus: "cancelled", note: `Consignment Rejected: ${finalReason}` };
                }
                return o;
              });
              localStorage.setItem(orderKey, JSON.stringify(updatedOrders));
            }
          }
        });
      } catch (err) {
        console.warn("Rejection sync notice:", err);
      }
    }

    setRejectItem(null);
    setRejectCustomNotes("");
  };

  // Handle Outbound Dispatch to Wholesaler (Customizable Quantity & Price, Automatically saved to Wholesaler Dashboard)
  const handleConfirmWholesalerDispatch = async () => {
    if (!dispatchItem) return;

    const dispatchTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const dispatchOrderNumber = `DISPATCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const quantityToDispatch = Math.min(dispatchItem.quantity, Number(dispatchForm.quantity));
    const agreedSellPrice = Number(dispatchForm.sellPrice);

    const updatedList = items.map((i) => {
      if (i.id === dispatchItem.id) {
        return {
          ...i,
          status: `Dispatched to: ${dispatchForm.wholesalerName}`,
          dispatchedWholesaler: dispatchForm.wholesalerName,
          dispatchedQuantity: quantityToDispatch,
          sellPrice: agreedSellPrice,
          dispatchedAt: dispatchTimestamp,
        };
      }
      return i;
    });

    setItems(updatedList);

    // 1. SAVE DISPATCHED GOOD DETAILS DIRECTLY INTO WHOLESALER FIRESTORE & LOCALSTORAGE
    const wholesalerReceivedItem = {
      id: `whs-rcv-${Date.now()}`,
      commodity: dispatchItem.commodity,
      quantity: quantityToDispatch,
      qualityGrade: dispatchItem.qualityGrade || "A - Premium",
      buyPrice: agreedSellPrice,
      sellPrice: Math.round(agreedSellPrice * 1.22),
      storageType: dispatchItem.storageType || "cold_storage",
      coldChain: !!dispatchItem.coldChain,
      expiryDays: dispatchItem.expiryDays || 8,
      originWarehouse: dispatchItem.destinationNode || (dispatchItem.warehouseName as string) || "Kovai Agro Hub & Cold Storage",
      destinationNode: dispatchForm.wholesalerName,
      orderNumber: dispatchOrderNumber,
      status: "Received & In Cold Storage",
      receivedDate: new Date().toISOString().split("T")[0],
      userId: user?.uid,
    };

    // 2. Create Outbound Dispatch Order
    const newOutboundOrder = {
      id: `ord-wh-${Date.now()}`,
      orderNumber: dispatchOrderNumber,
      senderNode: dispatchItem.destinationNode || (dispatchItem.warehouseName as string) || "Warehouse Terminal",
      receiverNode: dispatchForm.wholesalerName,
      commodity: dispatchItem.commodity,
      quantityKg: quantityToDispatch,
      totalAmount: Math.round(quantityToDispatch * agreedSellPrice),
      escrowStatus: "in_transit" as const,
      routeDistanceKm: 36,
      expectedDelivery: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      userId: user?.uid,
    };

    // Write all 3 to Firestore
    try {
      await updateDocument("inventory", dispatchItem.id, {
        status: `Dispatched to: ${dispatchForm.wholesalerName}`,
        dispatchedWholesaler: dispatchForm.wholesalerName,
        dispatchedQuantity: quantityToDispatch,
        sellPrice: agreedSellPrice,
        dispatchedAt: dispatchTimestamp,
      });
      await saveDocument("wholesaler_inventory", wholesalerReceivedItem.id, wholesalerReceivedItem);
      await saveDocument("orders", newOutboundOrder.id, newOutboundOrder);
    } catch (err) {
      console.warn("Firestore dispatch notice:", err);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));

        const existingWhsFeed = JSON.parse(localStorage.getItem("perix_wholesaler_received_feed") || "[]");
        localStorage.setItem("perix_wholesaler_received_feed", JSON.stringify([wholesalerReceivedItem, ...existingWhsFeed]));

        ["perix_orders_" + (user?.uid || "global"), "perix_orders_global"].forEach((k) => {
          const existing = JSON.parse(localStorage.getItem(k) || "[]");
          localStorage.setItem(k, JSON.stringify([newOutboundOrder, ...existing]));
        });
      } catch (err) {
        console.warn("Wholesaler dispatch sync notice:", err);
      }
    }

    setDispatchItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this record from view?")) return;

    const updatedList = items.filter((i) => i.id !== id);
    setItems(updatedList);

    // Delete from Firestore
    try {
      await deleteDocument("inventory", id);
    } catch (err) {
      console.warn("Firestore delete notice:", err);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("LocalStorage delete error:", err);
      }
    }
  };

  // Build Visual Goods Inventory Catalogue Grouped by Commodity
  const catalogueMap = items.reduce((acc: Record<string, {
    commodity: string;
    totalStoredKg: number;
    availableKg: number;
    dispatchedKg: number;
    rejectedKg: number;
    batchCount: number;
    coldChain: boolean;
    avgBuyPrice: number;
    storageType: string;
  }>, item) => {
    const comm = item.commodity || "Tomato";
    if (!acc[comm]) {
      acc[comm] = {
        commodity: comm,
        totalStoredKg: 0,
        availableKg: 0,
        dispatchedKg: 0,
        rejectedKg: 0,
        batchCount: 0,
        coldChain: !!item.coldChain,
        avgBuyPrice: item.buyPrice || 34,
        storageType: item.storageType || "cold_storage",
      };
    }
    const q = Number(item.quantity) || 0;
    acc[comm].totalStoredKg += q;
    acc[comm].batchCount += 1;

    if (item.status?.includes("Rejected")) {
      acc[comm].rejectedKg += q;
    } else if (item.status?.includes("Dispatched to")) {
      acc[comm].dispatchedKg += (item.dispatchedQuantity || q);
    } else {
      acc[comm].availableKg += q;
    }
    return acc;
  }, {});

  const catalogueList = Object.values(catalogueMap);

  const filteredItems = selectedCatalogueCommodity === "all"
    ? items
    : items.filter((i) => i.commodity === selectedCatalogueCommodity);

  const totalWarehouseKg = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalAvailableForWholesale = items.reduce((sum, i) => {
    if (!i.status?.includes("Rejected") && !i.status?.includes("Dispatched to")) {
      return sum + (Number(i.quantity) || 0);
    }
    return sum;
  }, 0);
  const totalDispatchedKg = items.reduce((sum, i) => sum + (Number(i.dispatchedQuantity) || 0), 0);
  const totalRejectedBatches = items.filter((i) => i.status?.includes("Rejected")).length;

  if (profile && profile.role !== "mandi" && profile.role !== "admin") {
    return (
      <div className="page-container animate-fade-in" style={{ padding: "40px 16px", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <div className="card" style={{ padding: "48px 32px", border: "1px dashed rgba(255,152,0,0.4)", background: "var(--surface)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,152,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Building2 size={32} color="#FF9800" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
            {t("inventory.warehouseTitle", "Warehouse Inventory & Wholesaler Dispatch Console")}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
            {t("roles.roleRestrictedDesc", "This dashboard is exclusively dedicated to the active role.")} ({t("roles.mandi", "Mandi / Warehouse")}).
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              style={{ background: "#FF9800", borderColor: "#FF9800", color: "#fff", fontWeight: "700", gap: "8px", padding: "10px 24px" }}
              onClick={() => switchRole("mandi")}
            >
              <Building2 size={18} /> {t("roles.switchPersona", "Switch Role")} → {t("roles.mandi", "Mandi / Warehouse")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: "8px 0" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              {t("inventory.warehouseTitle", "Warehouse Inventory & Wholesaler Dispatch Console")}
            </h1>
            <span className="badge badge-success">{t("common.confirmed", "Warehouse Operational")}</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("inventory.warehouseSubtitle", "Inward farmer batch verification, goods catalogue, cold-chain storage management, and customized wholesaler dispatching.")}
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
          {showForm ? t("common.close", "Close Form") : t("inventory.logBatch", "Log Direct Warehouse Batch")}
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("inventory.totalStored", "Total Stored in Warehouse")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#1976D2" }}>
            {totalWarehouseKg.toLocaleString()} {t("common.kg", "kg")}
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{t("inventory.goodsCatalogue", "Goods Catalogue")}</span>
        </div>

        <div className="card" style={{ padding: "18px 20px", border: "1px solid rgba(46,125,50,0.3)" }}>
          <p style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600" }}>{t("inventory.availableWholesale", "Available for Wholesalers")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--primary)" }}>
            {totalAvailableForWholesale.toLocaleString()} {t("common.kg", "kg")}
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{t("common.available", "Ready for dispatch")}</span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("inventory.dispatchedWholesale", "Dispatched to Wholesalers")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#2E7D32" }}>
            {totalDispatchedKg.toLocaleString()} {t("common.kg", "kg")}
          </h3>
          <span style={{ fontSize: "11px", color: "#2E7D32" }}>{t("nav.wholesaler", "Wholesaler Hub")}</span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("inventory.rejectedBatches", "Rejected Consignments")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: totalRejectedBatches > 0 ? "var(--error)" : "var(--text-primary)" }}>
            {totalRejectedBatches} {t("common.rejected", "Batches")}
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{t("farmer.rejectionNotice", "QC Discrepancy")}</span>
        </div>
      </div>

      {/* SEPARATE GOODS INVENTORY CATALOGUE */}
      <div className="card" style={{ padding: "20px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Boxes size={20} color="var(--primary)" />
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              {t("inventory.goodsCatalogue", "Visual Goods Inventory Catalogue")}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("common.filter", "Filter")}:</span>
            <button
              onClick={() => setSelectedCatalogueCommodity("all")}
              className={`btn btn-sm ${selectedCatalogueCommodity === "all" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "11px", padding: "4px 10px" }}
            >
              {t("common.all", "All Produce")} ({items.length})
            </button>
          </div>
        </div>

        {catalogueList.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
            {t("inventory.emptyDesc", "No inward consignments registered. Inward batches from farmers will appear here automatically.")}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {catalogueList.map((cat) => {
              const isSelected = selectedCatalogueCommodity === cat.commodity;
              return (
                <div
                  key={cat.commodity}
                  onClick={() => setSelectedCatalogueCommodity(isSelected ? "all" : cat.commodity)}
                  style={{
                    background: isSelected ? "rgba(46,125,50,0.08)" : "var(--surface-hover)",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(46,125,50,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Package size={16} color="var(--primary)" />
                      </div>
                      <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>{cat.commodity}</strong>
                    </div>
                    <span className={`badge ${cat.coldChain ? "badge-info" : "badge-secondary"}`} style={{ fontSize: "10px" }}>
                      {cat.coldChain ? t("inventory.coldChainActive", "Cold Chain") : t("farmer.warehouse", "Ventilated")}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px", fontSize: "12px" }}>
                    <div>
                      <span style={{ color: "var(--text-tertiary)" }}>{t("inventory.totalStored", "Total Stored")}:</span>
                      <strong style={{ display: "block", color: "var(--text-primary)" }}>{cat.totalStoredKg.toLocaleString()} {t("common.kg", "kg")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-tertiary)" }}>{t("common.available", "Available")}:</span>
                      <strong style={{ display: "block", color: "var(--primary)" }}>{cat.availableKg.toLocaleString()} {t("common.kg", "kg")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-tertiary)" }}>{t("inventory.dispatchedWholesale", "Dispatched")}:</span>
                      <strong style={{ display: "block", color: "#1976D2" }}>{cat.dispatchedKg.toLocaleString()} {t("common.kg", "kg")}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-tertiary)" }}>{t("common.status", "Batches")}:</span>
                      <strong style={{ display: "block", color: "var(--text-secondary)" }}>{cat.batchCount}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              {editingId ? t("inventory.warehouseTitle", "Edit Warehouse Batch") : t("inventory.logBatch", "Register Direct Warehouse Batch")}
            </h3>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div>
                <label className="label">{t("inventory.commodity", "Commodity")}</label>
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
                <label className="label">{t("inventory.quantity", "Quantity (kg)")}</label>
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
                <label className="label">{t("inventory.quality", "Quality Grade")}</label>
                <select
                  className="input"
                  value={form.qualityGrade}
                  onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
                >
                  <option value="A - Premium">A - Premium</option>
                  <option value="B - Standard">B - Standard</option>
                  <option value="C - Economy">C - Economy</option>
                </select>
              </div>

              <div>
                <label className="label">{t("inventory.procurementRate", "Procurement Rate (₹/kg)")}</label>
                <input
                  type="number"
                  className="input"
                  value={form.buyPrice}
                  onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="label">{t("wholesaler.targetRetailRate", "Target Selling Rate (₹/kg)")}</label>
                <input
                  type="number"
                  className="input"
                  value={form.sellPrice}
                  onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="label">{t("inventory.shelfLife", "Estimated Shelf Life (Days)")}</label>
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
                <label className="label">{t("inventory.sourceFarmer", "Origin Source / Farmer")}</label>
                <input
                  type="text"
                  className="input"
                  value={form.sourceFarmer}
                  onChange={(e) => setForm({ ...form, sourceFarmer: e.target.value })}
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
                {editingId ? t("common.save", "Update Batch") : t("common.save", "Save Stock Entry")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Intake & Wholesaler Dispatch Table */}
      {items.length === 0 && !showForm ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Package size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>{t("inventory.emptyTitle", "No Intake Records Found")}</h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
            {t("inventory.emptyDesc", "No inward consignments registered. Inward batches from farmers will appear here automatically.")}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: "20px", overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                {t("inventory.warehouseTitle", "Inward Intake & Wholesaler Dispatch Log")}
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {t("inventory.immutableLock", "Received farmer goods are immutable. Warehouse operators can alter dispatch quantities and prices to wholesalers.")}
              </span>
            </div>
            <span className="badge badge-success">{filteredItems.length} {t("common.confirmed", "Active")}</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>{t("inventory.commodity", "Commodity")}</th>
                <th>{t("inventory.intakeQuantity", "Intake Quantity")}</th>
                <th>{t("inventory.quality", "Quality")}</th>
                <th>{t("inventory.procurementRate", "Procurement Rate")}</th>
                <th>{t("inventory.shelfLife", "Shelf Life")}</th>
                <th>{t("inventory.sourceFarmer", "Purchased From (Farmer Origin)")}</th>
                <th>{t("inventory.status", "Status / Dispatch")}</th>
                <th>{t("inventory.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const buy = item.buyPrice || 0;
                const isNearExpiry = (item.expiryDays || 10) <= 4;
                const isRejected = item.status?.includes("Rejected");
                const isDispatched = item.status?.includes("Dispatched to");
                const isFarmerIntake = item.isImmutableIntake || item.status?.includes("Purchased from Farmer") || item.status?.includes("Received");

                return (
                  <tr key={item.id} style={{ background: isRejected ? "rgba(244,67,54,0.04)" : "transparent" }}>
                    {/* Commodity */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: isRejected ? "rgba(244,67,54,0.12)" : "rgba(46,125,50,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Package size={16} color={isRejected ? "var(--error)" : "var(--primary)"} />
                        </div>
                        <div>
                          <span style={{ fontWeight: "600" }}>{item.commodity}</span>
                          {item.coldChain && (
                            <span style={{ display: "block", fontSize: "11px", color: "#2196F3" }}>{t("inventory.coldChainActive", "Cold Chain Active")}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td style={{ fontWeight: "700", color: isRejected ? "var(--error)" : "var(--text-primary)" }}>
                      {item.quantity.toLocaleString()} {t("common.kg", "kg")}
                    </td>

                    {/* Quality */}
                    <td>
                      <span className={`badge ${isRejected ? "badge-danger" : "badge-success"}`}>
                        {item.qualityGrade}
                      </span>
                    </td>

                    {/* Rates */}
                    <td>
                      <span style={{ fontWeight: "600" }}>₹{buy} / kg</span>
                    </td>

                    {/* Shelf Life */}
                    <td>
                      <span className={`badge ${isNearExpiry ? "badge-warning" : "badge-info"}`}>
                        {item.expiryDays} {t("common.days", "days")}
                      </span>
                    </td>

                    {/* Purchased From (Farmer Origin) */}
                    <td style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "600" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {isFarmerIntake && (
                          <span title={t("inventory.immutableLock", "Official Intake Record - Immutable")} style={{ display: "inline-flex" }}>
                            <Lock size={12} color="#1565C0" />
                          </span>
                        )}
                        {item.sourceFarmer || t("roles.farmer", "Farmer Collective")}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      {isRejected ? (
                        <div>
                          <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Ban size={11} /> {t("common.rejected", "Rejected")}
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "var(--error)", marginTop: "2px", maxWidth: "160px" }}>
                            {item.rejectionReason || "QC Inspection Discrepancy"}
                          </span>
                        </div>
                      ) : isDispatched ? (
                        <div>
                          <span className="badge badge-info" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Truck size={11} /> {t("inventory.dispatchedWholesale", "Dispatched to Wholesaler")}
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "#1565C0", marginTop: "2px", maxWidth: "180px", fontWeight: "600" }}>
                            {item.dispatchedQuantity || item.quantity} kg @ ₹{item.sellPrice}/kg to {item.dispatchedWholesaler || "Wholesale Hub"}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle2 size={11} style={{ marginRight: "4px" }} />
                          {t("farmer.receivedInStorage", "Received & In Storage")}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {/* Send to Wholesaler (Customizable amount and price) */}
                        {!isRejected && !isDispatched && (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ fontSize: "11px", padding: "4px 8px", gap: "4px" }}
                            title={t("inventory.sendToWholesaler", "Send to Wholesaler")}
                            onClick={() => {
                              setDispatchItem(item);
                              setDispatchForm({
                                wholesalerName: WHOLESALER_DESTINATIONS[0],
                                quantity: item.quantity,
                                sellPrice: item.sellPrice || Math.round((item.buyPrice || 34) * 1.15),
                                transportMode: item.coldChain ? "Reefer Cold Van (2°C - 4°C)" : "Ventilated Truck",
                                notes: "Dispatched from warehouse inventory",
                              });
                            }}
                          >
                            <Send size={12} /> {t("inventory.sendToWholesaler", "Send to Wholesaler")}
                          </button>
                        )}

                        {/* Reject Consignment Button */}
                        {!isRejected && !isDispatched && (
                          <button
                            className="btn btn-sm btn-ghost"
                            style={{ color: "var(--error)", border: "1px solid rgba(244,67,54,0.3)", padding: "4px 8px", fontSize: "11px", gap: "4px" }}
                            title={t("inventory.rejectConsignment", "Reject Consignment")}
                            onClick={() => {
                              setRejectItem(item);
                              setRejectReason(REJECTION_REASONS[0]);
                              setRejectCustomNotes("");
                            }}
                          >
                            <Ban size={12} /> {t("common.reject", "Reject")}
                          </button>
                        )}

                        {/* Delete Action for cleanups */}
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ color: "var(--error)" }}
                          title={t("common.delete", "Delete Record")}
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

      {/* Reject Consignment Modal */}
      {rejectItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setRejectItem(null)}
        >
          <div
            className="card animate-scale-in"
            style={{
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              border: "2px solid var(--error)",
              background: "var(--surface)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={22} color="var(--error)" />
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--error)", margin: 0 }}>
                  {t("inventory.rejectionModalTitle", "Reject Inward Consignment")}
                </h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setRejectItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "rgba(244,67,54,0.06)", padding: "12px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
              <p style={{ margin: 0, color: "var(--text-primary)" }}>
                <strong>{t("wholesaler.commodity", "Commodity")}:</strong> {rejectItem.quantity} kg of {rejectItem.commodity} ({rejectItem.qualityGrade})
              </p>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)" }}>
                <strong>{t("inventory.sourceFarmer", "Origin Source")}:</strong> {rejectItem.sourceFarmer || "Farmer"}
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="label" style={{ fontWeight: "700" }}>
                {t("inventory.rejectionReasonLabel", "Reason for Rejection")}
              </label>
              <select
                className="input"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ borderColor: "var(--error)" }}
              >
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label className="label">{t("inventory.inspectionNotes", "Inspection Notes & Discrepancy Audit")}</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Specify the exact mismatch..."
                value={rejectCustomNotes}
                onChange={(e) => setRejectCustomNotes(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRejectItem(null)}>
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ background: "var(--error)", color: "#fff" }}
                onClick={handleConfirmRejection}
              >
                <Ban size={16} /> {t("inventory.confirmRejection", "Confirm Rejection & Refund Escrow")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customizable Dispatch to Wholesaler Modal */}
      {dispatchItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setDispatchItem(null)}
        >
          <div
            className="card animate-scale-in"
            style={{
              maxWidth: "540px",
              width: "100%",
              padding: "24px",
              border: "2px solid var(--primary)",
              background: "var(--surface)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={22} color="var(--primary)" />
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  {t("inventory.dispatchModalTitle", "Custom Dispatch to Wholesaler")}
                </h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setDispatchItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "rgba(46,125,50,0.06)", padding: "12px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
              <p style={{ margin: 0, color: "var(--text-primary)" }}>
                <strong>{t("inventory.goodsCatalogue", "Batch")}:</strong> {dispatchItem.quantity} kg of {dispatchItem.commodity} ({dispatchItem.qualityGrade})
              </p>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)" }}>
                <strong>{t("inventory.procurementRate", "Procurement Rate")}:</strong> ₹{dispatchItem.buyPrice || 34}/kg
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label className="label" style={{ fontWeight: "700" }}>{t("inventory.destinationWholesaler", "Destination Wholesaler")}</label>
                <select
                  className="input"
                  value={dispatchForm.wholesalerName}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, wholesalerName: e.target.value })}
                >
                  {WHOLESALER_DESTINATIONS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" style={{ fontWeight: "700" }}>{t("inventory.amountToSend", "Amount of Goods to Send (kg)")}</label>
                <input
                  type="number"
                  className="input"
                  value={dispatchForm.quantity}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, quantity: Number(e.target.value) })}
                  max={dispatchItem.quantity}
                  min={1}
                  required
                  style={{ border: "2px solid var(--primary)", fontWeight: "700" }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                  {t("common.available", "Max Available")}: {dispatchItem.quantity.toLocaleString()} {t("common.kg", "kg")}
                </span>
              </div>

              <div>
                <label className="label" style={{ fontWeight: "700" }}>{t("inventory.agreedWholesaleRate", "Agreed Wholesale Selling Rate (₹/kg)")}</label>
                <input
                  type="number"
                  className="input"
                  value={dispatchForm.sellPrice}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, sellPrice: Number(e.target.value) })}
                  required
                  style={{ border: "2px solid var(--primary)", fontWeight: "700" }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                  {t("orders.totalValuation", "Total Valuation")}: ₹{(dispatchForm.quantity * dispatchForm.sellPrice).toLocaleString()}
                </span>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label className="label">{t("inventory.transportMode", "Transport & Cold Chain Fleet")}</label>
                <input
                  type="text"
                  className="input"
                  value={dispatchForm.transportMode}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, transportMode: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDispatchItem(null)}>
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmWholesalerDispatch}
              >
                <Send size={16} /> {t("inventory.confirmDispatch", "Confirm Dispatch & Transfer to Wholesaler")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
