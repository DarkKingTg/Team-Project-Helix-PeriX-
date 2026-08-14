"use client";

import { useState } from "react";
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
  const [orders, setOrders] = useState<OrderTransfer[]>(SAMPLE_ORDERS);
  const [filter, setFilter] = useState<string>("all");

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.escrowStatus === filter);

  const getStatusBadge = (status: OrderTransfer["escrowStatus"]) => {
    switch (status) {
      case "funds_locked":
        return { label: "🔒 Escrow Locked", bg: "rgba(255,152,0,0.15)", text: "#E65100" };
      case "in_transit":
        return { label: "🚚 In Transit", bg: "rgba(33,150,243,0.15)", text: "#1565C0" };
      case "delivered":
        return { label: "📦 Quality Verified", bg: "rgba(156,39,176,0.15)", text: "#7B1FA2" };
      case "completed":
        return { label: "✅ Funds Released", bg: "rgba(76,175,80,0.15)", text: "#2E7D32" };
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              Supply Mesh Orders & Escrow Clearing
            </h2>
            <span className="badge badge-success">Smart Contract Escrow</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Idempotent financial clearing and track-and-trace logistics between Farmers, Mandis, Wholesalers & Retailers
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { key: "all", label: `All Transfers (${orders.length})` },
          { key: "in_transit", label: "In Transit" },
          { key: "funds_locked", label: "Escrow Locked" },
          { key: "completed", label: "Settled / Released" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`btn btn-sm ${filter === tab.key ? "btn-primary" : "btn-secondary"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="stagger-children">
        {filteredOrders.map((order) => {
          const badge = getStatusBadge(order.escrowStatus);

          return (
            <div key={order.id} className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                      {order.orderNumber}
                    </span>
                    <span className="badge" style={{ background: badge.bg, color: badge.text, fontWeight: "600" }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                    Created on {order.createdAt}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--primary)" }}>
                    ₹{order.totalAmount.toLocaleString()}
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                    {order.quantityKg} kg • Smart Escrow Safe
                  </p>
                </div>
              </div>

              {/* Transit Nodes Path */}
              <div
                style={{
                  background: "var(--surface-hover)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Origin Node
                  </span>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginTop: "2px" }}>
                    {order.senderNode}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: "600" }}>
                    {order.routeDistanceKm} km
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)" }}>
                    <div style={{ width: "24px", height: "2px", background: "var(--primary)" }} />
                    <Truck size={18} />
                    <div style={{ width: "24px", height: "2px", background: "var(--primary)" }} />
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Destination Node
                  </span>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginTop: "2px" }}>
                    {order.receiverNode}
                  </p>
                </div>
              </div>

              {/* Footer info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>
                  📦 Commodity: <strong>{order.commodity}</strong>
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  🕒 Expected ETA: <strong>{order.expectedDelivery}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
