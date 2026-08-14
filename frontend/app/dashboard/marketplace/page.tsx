"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Store,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Lock,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  IndianRupee,
} from "lucide-react";

interface SurplusListing {
  id: string;
  anonymizedSeller: string;
  locationArea: string;
  distanceKm: number;
  commodity: string;
  quantityKg: number;
  originalPrice: number;
  discountedPrice: number;
  discountPct: number;
  hoursRemaining: number;
  quality: string;
  status: "available" | "in_escrow" | "completed";
}

const INITIAL_SURPLUS: SurplusListing[] = [
  {
    id: "surplus-101",
    anonymizedSeller: "Retail Node #TN-CB-04",
    locationArea: "RS Puram, Coimbatore",
    distanceKm: 4.2,
    commodity: "Tomato (Ripe Grade-A)",
    quantityKg: 350,
    originalPrice: 40,
    discountedPrice: 22,
    discountPct: 45,
    hoursRemaining: 36,
    quality: "Grade A (Prime for Chef / Sauce Prep)",
    status: "available",
  },
  {
    id: "surplus-102",
    anonymizedSeller: "Wholesale Depot #TN-TR-09",
    locationArea: "Avinashi Road, Tiruppur",
    distanceKm: 18.5,
    commodity: "Banana (Cavendish)",
    quantityKg: 600,
    originalPrice: 45,
    discountedPrice: 26,
    discountPct: 42,
    hoursRemaining: 48,
    quality: "Grade A - Sweet Ripe",
    status: "available",
  },
  {
    id: "surplus-103",
    anonymizedSeller: "Hypermarket Outlet #TN-SL-02",
    locationArea: "Salem Bypass Corridor",
    distanceKm: 42.0,
    commodity: "Green Chilli (Spicy)",
    quantityKg: 180,
    originalPrice: 120,
    discountedPrice: 75,
    discountPct: 37,
    hoursRemaining: 72,
    quality: "Grade A - Fresh Harvest",
    status: "available",
  },
  {
    id: "surplus-104",
    anonymizedSeller: "Aggregator Hub #TN-ER-14",
    locationArea: "Perundurai Junction, Erode",
    distanceKm: 28.3,
    commodity: "Potato (Medium)",
    quantityKg: 1200,
    originalPrice: 28,
    discountedPrice: 18,
    discountPct: 35,
    hoursRemaining: 120,
    quality: "Grade B+ Standard Bulk",
    status: "available",
  },
];

export default function MarketplacePage() {
  const { profile } = useAuth();
  const [listings, setListings] = useState<SurplusListing[]>(INITIAL_SURPLUS);
  const [activeTab, setActiveTab] = useState<"browse" | "my-listings">("browse");
  const [showListModal, setShowListModal] = useState(false);
  const [escrowSuccess, setEscrowSuccess] = useState<string | null>(null);

  // New Listing Form
  const [form, setForm] = useState({
    commodity: "Strawberry / Ripe Fruit",
    quantityKg: 200,
    originalPrice: 150,
    discountedPrice: 90,
    hoursRemaining: 24,
    locationArea: "Coimbatore City North",
    quality: "Grade A - Table Grade",
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const discount = Math.round(
      ((form.originalPrice - form.discountedPrice) / form.originalPrice) * 100
    );
    const newEntry: SurplusListing = {
      id: `surplus-${Date.now()}`,
      anonymizedSeller: `Protected Node #${Math.floor(1000 + Math.random() * 9000)}`,
      locationArea: form.locationArea,
      distanceKm: 3.5,
      commodity: form.commodity,
      quantityKg: Number(form.quantityKg),
      originalPrice: Number(form.originalPrice),
      discountedPrice: Number(form.discountedPrice),
      discountPct: discount,
      hoursRemaining: Number(form.hoursRemaining),
      quality: form.quality,
      status: "available",
    };
    setListings([newEntry, ...listings]);
    setShowListModal(false);
  };

  const handleInitiateEscrow = (id: string, commodity: string) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "in_escrow" } : item))
    );
    setEscrowSuccess(`Escrow smart contract initiated for ${commodity}! Rebalancing route & transfer order generated.`);
    setTimeout(() => setEscrowSuccess(null), 5000);
  };

  return (
    <div className="page-container">
      {/* Privacy Guarantee Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(46,125,50,0.12), rgba(33,150,243,0.08))",
          border: "1px solid rgba(46,125,50,0.25)",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)" }}>
                Anonymized B2B Surplus Rebalancing Mesh
              </h3>
              <span className="badge badge-success">RLS Privacy Active</span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Offload over-ordered stock or buy discounted wholesale ingredients without exposing commercial identity to competitors.
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowListModal(true)}>
          <Plus size={18} /> List Anonymous Surplus
        </button>
      </div>

      {escrowSuccess && (
        <div
          className="animate-fade-in"
          style={{
            background: "rgba(76,175,80,0.15)",
            border: "1px solid rgba(76,175,80,0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
            color: "var(--primary-dark)",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <CheckCircle2 size={20} color="var(--primary)" />
          <span>{escrowSuccess}</span>
        </div>
      )}

      {/* Filter / Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("browse")}
          className={`btn ${activeTab === "browse" ? "btn-primary" : "btn-secondary"}`}
        >
          Available Nearby Surplus ({listings.filter((l) => l.status === "available").length})
        </button>
        <button
          onClick={() => setActiveTab("my-listings")}
          className={`btn ${activeTab === "my-listings" ? "btn-primary" : "btn-secondary"}`}
        >
          Active Escrow Transfers ({listings.filter((l) => l.status === "in_escrow").length})
        </button>
      </div>

      {/* Listings Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "20px",
        }}
        className="stagger-children"
      >
        {listings
          .filter((item) => (activeTab === "browse" ? item.status === "available" : item.status === "in_escrow"))
          .map((item) => {
            const savingsTotal = (item.originalPrice - item.discountedPrice) * item.quantityKg;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  border: item.status === "in_escrow" ? "2px solid #2196F3" : "1px solid var(--border)",
                }}
              >
                <div>
                  {/* Top Bar: Protected Node & Distance */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Lock size={14} color="var(--text-tertiary)" />
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>
                        {item.anonymizedSeller}
                      </span>
                    </div>
                    <span className="badge badge-info" style={{ gap: "4px" }}>
                      <MapPin size={12} /> {item.distanceKm} km away
                    </span>
                  </div>

                  {/* Commodity Title */}
                  <h4 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {item.commodity}
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                    {item.quality} • {item.locationArea}
                  </p>

                  {/* Pricing Box */}
                  <div
                    style={{
                      background: "var(--surface-hover)",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                          ₹{item.originalPrice}/kg
                        </span>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--primary)" }}>
                          ₹{item.discountedPrice}
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" }}>/kg</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className="badge badge-warning" style={{ fontSize: "13px", padding: "4px 10px" }}>
                          {item.discountPct}% OFF
                        </span>
                        <p style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                          Save ₹{savingsTotal.toLocaleString()} total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Volume & Expiry urgency */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                    <div style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                      <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Total Batch</p>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {item.quantityKg} kg
                      </p>
                    </div>
                    <div style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                      <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Optimal Window</p>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: item.hoursRemaining < 48 ? "#E65100" : "var(--text-primary)" }}>
                        ⏳ {item.hoursRemaining} hrs left
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                {item.status === "available" ? (
                  <button
                    onClick={() => handleInitiateEscrow(item.id, item.commodity)}
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Initiate Smart Escrow Transfer <ArrowRight size={16} />
                  </button>
                ) : (
                  <div
                    style={{
                      padding: "10px",
                      background: "rgba(33,150,243,0.1)",
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#1565C0",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    🔒 In Escrow Transit • Pickup Dispatched
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Modal for Creating Anonymous Listing */}
      {showListModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="card animate-scale-in" style={{ maxWidth: "520px", width: "100%", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={22} color="var(--primary)" />
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
                  Post Anonymized Surplus
                </h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowListModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateListing}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Commodity & Variety
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={form.commodity}
                    onChange={(e) => setForm({ ...form, commodity: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      Surplus Quantity (kg)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.quantityKg}
                      onChange={(e) => setForm({ ...form, quantityKg: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      Hours Before Expiry
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.hoursRemaining}
                      onChange={(e) => setForm({ ...form, hoursRemaining: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      Standard Retail Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      Surplus Discounted Price (₹/kg)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.discountedPrice}
                      onChange={(e) => setForm({ ...form, discountedPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    District / General Hub Area
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={form.locationArea}
                    onChange={(e) => setForm({ ...form, locationArea: e.target.value })}
                    required
                  />
                </div>

                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "rgba(46,125,50,0.08)",
                    border: "1px solid rgba(46,125,50,0.2)",
                    fontSize: "12px",
                    color: "var(--primary-dark)",
                  }}
                >
                  🔒 <strong>Privacy Assurance:</strong> Your store/depot identity is fully masked. Nearby verified restaurants and commercial kitchens will only see your anonymized node code and approximate distance.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowListModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Anonymous Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
