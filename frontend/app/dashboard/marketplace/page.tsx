"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
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
  userId?: string;
}

export default function MarketplacePage() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [activeTab, setActiveTab] = useState<"browse" | "my-listings">("browse");
  const [showListModal, setShowListModal] = useState(false);
  const [escrowSuccess, setEscrowSuccess] = useState<string | null>(null);

  const storageKey = "perix_marketplace_listings";

  // Initial Load from LocalStorage Cache
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListings(parsed);
          }
        }
      } catch (err) {
        console.warn("Marketplace cache read error:", err);
      }
    }
  }, []);

  // Real-time Firestore Sync
  useEffect(() => {
    try {
      const q = query(collection(db, "surplus_listings"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const dbListings = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as SurplusListing[];
            setListings(dbListings);
            localStorage.setItem(storageKey, JSON.stringify(dbListings));
          }
        },
        (err) => {
          console.warn("Firestore marketplace subscription notice:", err.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore setup notice:", e);
    }
  }, []);

  // New Listing Form
  const [form, setForm] = useState({
    commodity: "Tomato",
    quantityKg: 200,
    originalPrice: 40,
    discountedPrice: 24,
    hoursRemaining: 24,
    locationArea: "Coimbatore City North",
    quality: "Grade A - Table Grade",
  });

  const handleCreateListing = async (e: React.FormEvent) => {
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
      userId: user?.uid,
    };

    const updated = [newEntry, ...listings];
    setListings(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn("Marketplace cache write error:", err);
      }
    }

    try {
      await addDoc(collection(db, "surplus_listings"), {
        ...newEntry,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Firestore marketplace listing save notice:", err);
    }

    setShowListModal(false);
  };

  const handleInitiateEscrow = async (id: string, commodity: string) => {
    const updated = listings.map((item) =>
      item.id === id ? { ...item, status: "in_escrow" as const } : item
    );
    setListings(updated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.warn("Marketplace cache write error:", err);
      }
    }

    try {
      await updateDoc(doc(db, "surplus_listings", id), {
        status: "in_escrow",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Firestore escrow update notice:", err);
    }

    setEscrowSuccess(`Escrow smart contract initiated for ${commodity}. Rebalancing route and transfer order generated.`);
    setTimeout(() => setEscrowSuccess(null), 5000);
  };

  const filteredListings = listings.filter((item) =>
    activeTab === "browse" ? item.status === "available" : item.status === "in_escrow"
  );

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
              Offload over-ordered stock or buy discounted wholesale produce without exposing commercial identity to competitors.
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
          <Store size={16} /> Available Surplus Listings
        </button>
        <button
          onClick={() => setActiveTab("my-listings")}
          className={`btn ${activeTab === "my-listings" ? "btn-primary" : "btn-secondary"}`}
        >
          <Truck size={16} /> In-Escrow Rebalancing
        </button>
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Store size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>
            {activeTab === "browse" ? "No Active Surplus Listings" : "No Active In-Escrow Transfers"}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 20px" }}>
            {activeTab === "browse"
              ? "All surplus stock across the mesh has been cleared. Click below to list any excess produce for nearby buyers."
              : "When a surplus batch is secured via smart escrow, transit and routing contracts will appear here."}
          </p>
          {activeTab === "browse" && (
            <button className="btn btn-primary" onClick={() => setShowListModal(true)}>
              <Plus size={16} /> List Anonymous Surplus
            </button>
          )}
        </div>
      )}

      {/* Listings Grid */}
      {filteredListings.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
          className="stagger-children"
        >
          {filteredListings.map((item) => {
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
                          Rs {item.originalPrice}/kg
                        </span>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--primary)" }}>
                          Rs {item.discountedPrice}
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)" }}>/kg</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            background: "rgba(244,67,54,0.12)",
                            color: "#D32F2F",
                            fontSize: "13px",
                            fontWeight: "700",
                            display: "inline-block",
                            marginBottom: "4px",
                          }}
                        >
                          -{item.discountPct}% OFF
                        </span>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                          Save Rs {savingsTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lot Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ background: "var(--surface)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Batch Volume</span>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {item.quantityKg.toLocaleString()} kg
                      </div>
                    </div>
                    <div style={{ background: "var(--surface)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase" }}>Fresh Window</span>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: item.hoursRemaining < 36 ? "var(--error)" : "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={14} /> {item.hoursRemaining}h remaining
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buy / Escrow Action Button */}
                {item.status === "available" ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => handleInitiateEscrow(item.id, item.commodity)}
                  >
                    <Lock size={16} /> Secure with Smart Escrow
                  </button>
                ) : (
                  <div
                    style={{
                      background: "rgba(33,150,243,0.1)",
                      border: "1px solid rgba(33,150,243,0.3)",
                      borderRadius: "10px",
                      padding: "10px",
                      textAlign: "center",
                      color: "#1565C0",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Escrow Locked • Route Generating
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List Anonymous Surplus Modal */}
      {showListModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div className="card animate-scale-in" style={{ width: "100%", maxWidth: "480px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={20} color="var(--primary)" />
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>List Anonymous Surplus Lot</h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowListModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateListing}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label className="label">Commodity & Grade</label>
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
                    <label className="label">Surplus Volume (kg)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.quantityKg}
                      onChange={(e) => setForm({ ...form, quantityKg: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Time Remaining (Hours)</label>
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
                    <label className="label">Original Rate (Rs/kg)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Discounted Rate (Rs/kg)</label>
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
                  <label className="label">Pickup Corridor Area</label>
                  <input
                    type="text"
                    className="input"
                    value={form.locationArea}
                    onChange={(e) => setForm({ ...form, locationArea: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowListModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Anonymous Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
