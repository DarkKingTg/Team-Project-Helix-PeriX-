"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  IndianRupee,
  MapPin,
  ArrowRight,
  Sparkles,
  Package,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import {
  saveDocument,
  updateDocument,
  subscribeCollection,
} from "@/lib/firestore-helpers";

interface OrderTransfer {
  id: string;
  orderNumber: string;
  senderNode: string;
  receiverNode: string;
  commodity: string;
  quantityKg: number;
  totalAmount: number;
  escrowStatus: "funds_locked" | "in_transit" | "delivered" | "completed" | "cancelled";
  routeDistanceKm: number;
  expectedDelivery: string;
  createdAt: string;
  userId?: string;
  note?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [orders, setOrders] = useState<OrderTransfer[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const storageKey = `perix_orders_${user?.uid || "global"}`;

  // 1. Initial Local Cache Load + Crop Derivations
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const allOrders: OrderTransfer[] = [];
        const seenIds = new Set<string>();
        const seenOrderNumbers = new Set<string>();

        const addOrderIfUnique = (o: OrderTransfer) => {
          if (!o) return;
          const id = o.id;
          const num = o.orderNumber;
          if (id && seenIds.has(id)) return;
          if (num && seenOrderNumbers.has(num)) return;
          if (id) seenIds.add(id);
          if (num) seenOrderNumbers.add(num);
          allOrders.push(o);
        };

        // 1. Read user-specific orders
        const cachedUser = localStorage.getItem(storageKey);
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (Array.isArray(parsed)) {
            parsed.forEach((o) => addOrderIfUnique(o));
          }
        }

        // 2. Read global and farmer orders
        ["perix_orders_global", "perix_orders_farmer"].forEach((key) => {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              parsed.forEach((o) => addOrderIfUnique(o));
            }
          }
        });

        // 3. Derive orders from logged farmer crops if any exist
        ["perix_crops_" + (user?.uid || "farmer"), "perix_crops_farmer", "perix_crops_global"].forEach((cropKey) => {
          const cachedCrops = localStorage.getItem(cropKey);
          if (cachedCrops) {
            const parsedCrops = JSON.parse(cachedCrops);
            if (Array.isArray(parsedCrops)) {
              parsedCrops.forEach((c) => {
                const givenKg = Number(c.goodsGivenToWarehouseKg ?? c.quantity ?? 0);
                if (givenKg > 0) {
                  const cropIdClean = String(c.id || "").replace(/^crop-/, "");
                  const orderNum = c.orderNumber || `PO-${cropIdClean.replace(/[^0-9]/g, "") || Math.floor(100000 + Math.random() * 900000)}`;
                  const orderId = `ord-${cropIdClean || c.id || Date.now()}`;

                  if (
                    seenIds.has(orderId) ||
                    seenIds.has(c.id) ||
                    seenIds.has(`ord-${c.id}`) ||
                    seenOrderNumbers.has(orderNum) ||
                    (c.orderNumber && seenOrderNumbers.has(c.orderNumber))
                  ) {
                    return;
                  }

                  const isRejected = c.status?.includes("Rejected");
                  const derivedOrder: OrderTransfer = {
                    id: orderId,
                    orderNumber: orderNum,
                    senderNode: `Farmer Gate - ${c.district || "Farm"} (${user?.displayName || "Farmer"})`,
                    receiverNode: c.warehouseName || "Kovai Agro Hub & Cold Storage",
                    commodity: c.name,
                    quantityKg: givenKg,
                    totalAmount: Math.round(givenKg * Number(c.procurementPricePerKg || 34.0)),
                    escrowStatus: isRejected ? "cancelled" : "funds_locked",
                    routeDistanceKm: 28,
                    expectedDelivery: c.handoverDate || c.harvestDate || new Date().toISOString().split("T")[0],
                    createdAt: (c.harvestDate || new Date().toISOString().split("T")[0]),
                    note: isRejected ? `Consignment Rejected: ${c.status}` : undefined,
                    userId: user?.uid,
                  };
                  addOrderIfUnique(derivedOrder);
                  // Sync derived order to Firestore
                  saveDocument("orders", orderId, derivedOrder).catch(() => {});
                }
              });
            }
          }
        });

        if (allOrders.length > 0) {
          setOrders(allOrders);
        }
      } catch (err) {
        console.warn("Orders cache read error:", err);
      }
    }
  }, [storageKey, user]);

  // 2. Real-time Firestore sync
  useEffect(() => {
    const unsubscribe = subscribeCollection<OrderTransfer>("orders", (dbOrders) => {
      if (dbOrders && dbOrders.length > 0) {
        setOrders((prev) => {
          const map = new Map<string, OrderTransfer>();
          // Put local/previous orders first
          prev.forEach((o) => {
            if (o.id) map.set(o.id, o);
            if (o.orderNumber) map.set(o.orderNumber, o);
          });
          // Merge with Firestore orders (Firestore takes precedence)
          dbOrders.forEach((o) => {
            const key = o.id || o.orderNumber;
            if (key) map.set(key, { ...(map.get(key) || {}), ...o });
          });
          const merged = Array.from(new Set(Array.from(map.values())));
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(storageKey, JSON.stringify(merged));
              localStorage.setItem("perix_orders_global", JSON.stringify(merged));
            } catch {}
          }
          return merged;
        });
      }
    });

    return () => unsubscribe();
  }, [storageKey]);

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.escrowStatus === filter);

  const getStatusBadge = (status: OrderTransfer["escrowStatus"]) => {
    switch (status) {
      case "funds_locked":
        return { label: t("orders.escrowLocked", "Funds in Escrow"), bg: "rgba(255,152,0,0.18)", text: "#E65100" };
      case "in_transit":
        return { label: t("orders.inTransit", "In Reefer Transit"), bg: "rgba(33,150,243,0.18)", text: "#1565C0" };
      case "delivered":
        return { label: t("orders.delivered", "Delivered (Pending QC)"), bg: "rgba(156,39,176,0.18)", text: "#7B1FA2" };
      case "completed":
        return { label: t("orders.completed", "Escrow Released"), bg: "rgba(76,175,80,0.18)", text: "#2E7D32" };
      case "cancelled":
        return { label: t("common.rejected", "Consignment Rejected"), bg: "rgba(244,67,54,0.18)", text: "#D32F2F" };
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: OrderTransfer["escrowStatus"]) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, escrowStatus: newStatus } : o));
    setOrders(updated);

    // Save to Firestore
    try {
      await updateDocument("orders", id, { escrowStatus: newStatus });
    } catch (err) {
      console.warn("Firestore order update notice:", err);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        localStorage.setItem("perix_orders_global", JSON.stringify(updated));
        localStorage.setItem("perix_orders_farmer", JSON.stringify(updated));
      } catch (err) {
        console.warn("Orders cache write error:", err);
      }
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              {t("orders.title", "Escrow Orders and Rebalancing Dispatches")}
            </h2>
            <span className="badge badge-success">{t("farmer.escrowLock", "Smart Escrow Protected")}</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("orders.subtitle", "Real-time tracking of inter-node produce transfers, reefer fleet dispatches, and automated payment release.")}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
        {[
          { key: "all", label: t("common.all", "All") },
          { key: "funds_locked", label: t("orders.escrowLocked", "Funds Locked") },
          { key: "in_transit", label: t("orders.inTransit", "In Transit") },
          { key: "delivered", label: t("orders.delivered", "Delivered") },
          { key: "completed", label: t("orders.completed", "Completed") },
          { key: "cancelled", label: t("common.rejected", "Rejected") },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`btn ${filter === tab.key ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "12px", padding: "6px 14px" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ShoppingCart size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>
            {t("orders.emptyTitle", "No Active Orders Found")}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto" }}>
            {t("orders.emptyDesc", "Produce purchase orders and surplus marketplace contracts will appear here with live escrow tracking.")}
          </p>
        </div>
      )}

      {/* Orders List Grid */}
      {filteredOrders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }} className="stagger-children">
          {filteredOrders.map((ord, idx) => {
            const badge = getStatusBadge(ord.escrowStatus);
            return (
              <div key={`${ord.id || ord.orderNumber}-${idx}`} className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {ord.orderNumber}
                      </span>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: badge.bg,
                          color: badge.text,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "2px" }}>
                      {t("orders.createdAt", "Initiated")}: {ord.createdAt}
                    </p>
                    {ord.note && (
                      <p style={{ fontSize: "12px", color: "var(--error)", marginTop: "4px", fontWeight: "600" }}>
                        ⚠️ {ord.note}
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>
                      ₹{ord.totalAmount.toLocaleString()}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {ord.quantityKg.toLocaleString()} {t("common.kg", "kg")} @ ₹{(ord.totalAmount / ord.quantityKg).toFixed(1)}/kg
                    </p>
                  </div>
                </div>

                {/* Transit Nodes */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: "12px",
                    background: "var(--surface-hover)",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>{t("orders.senderNode", "Origin Dispatch")}</p>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{ord.senderNode}</p>
                  </div>
                  <div style={{ color: "var(--primary)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Truck size={18} />
                    <span style={{ fontSize: "10px", fontWeight: "600" }}>{ord.routeDistanceKm} km</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>{t("orders.receiverNode", "Destination Receiving")}</p>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{ord.receiverNode}</p>
                  </div>
                </div>

                {/* Order Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {t("orders.expectedDelivery", "Expected Delivery")}: <strong>{ord.expectedDelivery}</strong>
                  </span>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {ord.escrowStatus === "funds_locked" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(ord.id, "in_transit")}
                      >
                        {t("orders.inTransit", "Dispatch Reefer Fleet")}
                      </button>
                    )}
                    {ord.escrowStatus === "in_transit" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(ord.id, "delivered")}
                      >
                        {t("orders.delivered", "Confirm Gateway Delivery")}
                      </button>
                    )}
                    {ord.escrowStatus === "delivered" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(ord.id, "completed")}
                      >
                        {t("orders.completed", "Release Escrow Funds")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
