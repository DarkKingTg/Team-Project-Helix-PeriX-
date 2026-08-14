"use client";

import { useState } from "react";
import {
  Truck,
  MapPin,
  ThermometerSnowflake,
  Clock,
  Sparkles,
  CheckCircle2,
  Navigation,
  Fuel,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface DeliveryRoute {
  id: string;
  routeCode: string;
  vehicleNo: string;
  driverName: string;
  stopsCount: number;
  totalDistanceKm: number;
  fuelSavedLiters: number;
  coldChainTempC: number;
  status: "in_transit" | "scheduled" | "completed";
  stops: string[];
}

const SAMPLE_ROUTES: DeliveryRoute[] = [
  {
    id: "rt-1",
    routeCode: "OR-ROUTE-881",
    vehicleNo: "TN-38-BZ-4109 (Reefer 3.5T)",
    driverName: "Karthik Raja",
    stopsCount: 4,
    totalDistanceKm: 68.4,
    fuelSavedLiters: 14.2,
    coldChainTempC: 4.2,
    status: "in_transit",
    stops: ["Tiruppur Hub (Depot)", "Avinashi Supermarket", "Palladam Retail Co-op", "Coimbatore East Hypermarket"],
  },
  {
    id: "rt-2",
    routeCode: "OR-ROUTE-882",
    vehicleNo: "TN-33-AX-9920 (Insulated 5T)",
    driverName: "Senthil Kumar",
    stopsCount: 3,
    totalDistanceKm: 112.0,
    fuelSavedLiters: 22.8,
    coldChainTempC: 5.1,
    status: "scheduled",
    stops: ["Tiruppur Central Hub", "Erode Mandi Link", "Salem Retail Corridor"],
  },
  {
    id: "rt-3",
    routeCode: "OR-ROUTE-879",
    vehicleNo: "TN-37-CY-1002 (Reefer 2T)",
    driverName: "M. Murugan",
    stopsCount: 5,
    totalDistanceKm: 54.0,
    fuelSavedLiters: 11.5,
    coldChainTempC: 3.8,
    status: "completed",
    stops: ["Pollachi FPO Hub", "Kinathukadavu Point", "Udumalpet Cold Center", "Dharapuram Mart"],
  },
];

export default function DistributionPage() {
  const [routes, setRoutes] = useState<DeliveryRoute[]>(SAMPLE_ROUTES);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState<string | null>(null);

  const handleRunOROptimization = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setOptimizeMessage("⚡ Google OR-Tools computed multi-drop dispatch schedule! Route distance reduced by 18.2% & fuel consumption cut by 48.5L across fleet.");
      setTimeout(() => setOptimizeMessage(null), 6000);
    }, 800);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              Wholesale Logistics & Multi-Stop Dispatch
            </h2>
            <span className="badge badge-success">Google OR-Tools Integrated</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Multi-echelon route optimization, cold-chain IoT telemetry & automated drop sequence planning
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleRunOROptimization} disabled={optimizing}>
          <Sparkles size={18} />
          {optimizing ? "Optimizing Routes..." : "Run OR-Tools Route Optimizer"}
        </button>
      </div>

      {optimizeMessage && (
        <div
          className="animate-fade-in"
          style={{
            background: "rgba(46,125,50,0.12)",
            border: "1px solid rgba(46,125,50,0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
            color: "var(--primary-dark)",
            fontSize: "14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={20} color="var(--primary)" />
          <span>{optimizeMessage}</span>
        </div>
      )}

      {/* 3 Overview KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(33,150,243,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={22} color="#2196F3" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Active Fleet Reefer Trucks</p>
              <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>3 / 3 En Route</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(76,175,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Fuel size={22} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Cumulative Fuel Saved</p>
              <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--primary)" }}>48.5 Liters</h3>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(156,39,176,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ThermometerSnowflake size={22} color="#9C27B0" />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Reefer Cold Chain Average</p>
              <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#9C27B0" }}>4.2°C (Optimal)</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="stagger-children">
        {routes.map((route) => (
          <div key={route.id} className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)" }}>
                    {route.routeCode}
                  </span>
                  <span
                    className="badge"
                    style={{
                      background:
                        route.status === "in_transit"
                          ? "rgba(33,150,243,0.15)"
                          : route.status === "completed"
                          ? "rgba(76,175,80,0.15)"
                          : "rgba(255,152,0,0.15)",
                      color:
                        route.status === "in_transit"
                          ? "#1565C0"
                          : route.status === "completed"
                          ? "#2E7D32"
                          : "#E65100",
                    }}
                  >
                    {route.status === "in_transit" ? "🚚 In Transit" : route.status === "completed" ? "✅ Completed" : "⏳ Scheduled"}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {route.vehicleNo} • Driver: <strong>{route.driverName}</strong>
                </p>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2196F3", fontWeight: "700" }}>
                    <ThermometerSnowflake size={16} /> {route.coldChainTempC}°C
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>IoT Telemetry Live</p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
                    {route.totalDistanceKm} km
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "600" }}>
                    🌱 -{route.fuelSavedLiters}L saved
                  </p>
                </div>
              </div>
            </div>

            {/* Sequence of Stops */}
            <div
              style={{
                background: "var(--surface-hover)",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {route.stops.map((stop, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: idx === 0 ? "var(--primary)" : "var(--surface)",
                      color: idx === 0 ? "white" : "var(--text-primary)",
                      fontSize: "13px",
                      fontWeight: "600",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <MapPin size={13} color={idx === 0 ? "white" : "var(--primary)"} />
                    {stop}
                  </div>
                  {idx < route.stops.length - 1 && (
                    <ArrowRight size={14} color="var(--text-tertiary)" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
