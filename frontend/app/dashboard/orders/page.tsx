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

interface OrderTransfer {
  id: string;
  orderNumber: string;
  senderNode: string;
  receiverNode: string;
  commodity: string;
  quantityKg: number;
  totalAmount: number;
  escrowStatus: "funds_locked" | "in_transit" | "delivered" | "completed";
  routeDistanceKm: number;
  expectedDelivery: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [orders, setOrders] = useState<OrderTransfer[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const storageKey = `perix_orders_${user?.uid || "global"}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
          }
        }
      } catch (err) {
        console.warn("Orders cache read error:", err);
      }
    }
  }, [storageKey]);

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.escrowStatus === filter);

  const getStatusBadge = (status: OrderTransfer["escrowStatus"]) => {
    switch (status) {
      case "funds_locked":
        return { label: "Funds in Escrow", bg: "rgba(255,152,0,0.18)", text: "#E65100" };
      case "in_transit":
        return { label: "In Reefer Transit", bg: "rgba(33,150,243,0.18)", text: "#1565C0" };
      case "delivered":
        return { label: "Delivered (Pending QC)", bg: "rgba(156,39,176,0.18)", text: "#7B1FA2" };
      case "completed":
        return { label: "Escrow Released", bg: "rgba(76,175,80,0.18)", text: "#2E7D32" };
    }
  };

  const handleUpdateStatus = (id: string, newStatus: OrderTransfer["escrowStatus"]) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, escrowStatus: newStatus } : o));
    setOrders(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
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
            <span className="badge badge-success">Smart Escrow Protected</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("orders.subtitle", "Real-time tracking of inter-node produce transfers, reefer fleet dispatches, and automated payment release.")}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
        {["all", "funds_locked", "in_transit", "delivered", "completed"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`btn ${filter === st ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "12px", padding: "6px 14px", textTransform: "capitalize" }}
          >
            {st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <ShoppingCart size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>No Active Orders Found</h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto" }}>
            Produce purchase orders and surplus marketplace contracts will appear here with live escrow tracking.
          </p>
        </div>
      )}

      {/* Orders List Grid */}
      {filteredOrders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }} className="stagger-children">
          {filteredOrders.map((ord) => {
            const badge = getStatusBadge(ord.escrowStatus);
            return (
              <div key={ord.id} className="card" style={{ padding: "20px" }}>
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
                      Initiated: {ord.createdAt}
                    </p>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--primary)" }}>
                      Rs {ord.totalAmount.toLocaleString()}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {ord.quantityKg.toLocaleString()} kg @ Rs {(ord.totalAmount / ord.quantityKg).toFixed(1)}/kg
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
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Origin Dispatch</p>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{ord.senderNode}</p>
                  </div>
                  <div style={{ color: "var(--primary)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Truck size={18} />
                    <span style={{ fontSize: "10px", fontWeight: "600" }}>{ord.routeDistanceKm} km</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Destination Receiving</p>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{ord.receiverNode}</p>
                  </div>
                </div>

                {/* Order Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Expected Delivery: <strong>{ord.expectedDelivery}</strong>
                  </span>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {ord.escrowStatus === "funds_locked" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(ord.id, "in_transit")}
                      >
                        Dispatch Reefer Fleet
                      </button>
                    )}
                    {ord.escrowStatus === "in_transit" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdateStatus(ord.id, "delivered")}
                      >
                        Confirm Gateway Delivery
                      </button>
                    )}
                    {ord.escrowStatus === "delivered" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUpdateStatus(ord.id, "completed")}
                      >
                        Release Escrow Funds
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
