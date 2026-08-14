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
} from "lucide-react";

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

const SAMPLE_ORDERS: OrderTransfer[] = [
  {
    id: "ord-1",
    orderNumber: "ESC-2026-8810",
    senderNode: "Mandi Aggregator #TN-CB-01 (Coimbatore)",
    receiverNode: "Apex Agro Wholesalers (Tiruppur Hub)",
    commodity: "Tomato (Grade A)",
    quantityKg: 2000,
    totalAmount: 64000,
    escrowStatus: "in_transit",
    routeDistanceKm: 46.2,
    expectedDelivery: "Today, 4:30 PM",
    createdAt: "14 Aug 2026, 09:15 AM",
  },
  {
    id: "ord-2",
    orderNumber: "ESC-2026-8811",
    senderNode: "Protected Surplus Node #4819 (Salem)",
    receiverNode: "Royal Grand Commercial Kitchen (Erode)",
    commodity: "Green Chilli (Spicy Grade)",
    quantityKg: 150,
    totalAmount: 11250,
    escrowStatus: "funds_locked",
    routeDistanceKm: 62.0,
    expectedDelivery: "Tomorrow, 11:00 AM",
    createdAt: "14 Aug 2026, 10:45 AM",
  },
  {
    id: "ord-3",
    orderNumber: "ESC-2026-8798",
    senderNode: "Apex Agro Wholesalers (Tiruppur)",
    receiverNode: "FreshMart Organic Retail (Chennai Metro)",
    commodity: "Potato (Grade A Bulk)",
    quantityKg: 4500,
    totalAmount: 112500,
    escrowStatus: "completed",
    routeDistanceKm: 380.0,
    expectedDelivery: "Delivered 13 Aug",
    createdAt: "12 Aug 2026, 02:00 PM",
  },
  {
    id: "ord-4",
    orderNumber: "ESC-2026-8785",
    senderNode: "Farmer Collective (Pollachi)",
    receiverNode: "Mandi Aggregator #TN-CB-01",
    commodity: "Banana (Poovan)",
    quantityKg: 1200,
    totalAmount: 45600,
    escrowStatus: "completed",
    routeDistanceKm: 38.5,
    expectedDelivery: "Delivered 12 Aug",
    createdAt: "11 Aug 2026, 08:30 AM",
  },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderTransfer[]>(SAMPLE_ORDERS);
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
        return { label: "Escrow Locked", bg: "rgba(255,152,0,0.15)", text: "#E65100" };
      case "in_transit":
        return { label: "In Transit", bg: "rgba(33,150,243,0.15)", text: "#1565C0" };
      case "delivered":
        return { label: "Quality Verified", bg: "rgba(156,39,176,0.15)", text: "#7B1FA2" };
      case "completed":
        return { label: "Settled and Released", bg: "rgba(76,175,80,0.15)", text: "#2E7D32" };
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
              Escrow Orders and Rebalancing Dispatches
            </h2>
            <span className="badge badge-success">Smart Escrow Protected</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Real-time tracking of inter-node produce transfers, reefer fleet dispatches, and automated payment release.
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

      {/* Orders List Grid */}
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
    </div>
  );
}
