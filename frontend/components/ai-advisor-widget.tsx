"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Sparkles,
  TrendingUp,
  CloudSun,
  Calendar,
  ArrowRight,
  AlertCircle,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";

interface AIAdvisorWidgetProps {
  role?: string;
  commodity?: string;
  quantityKg?: number;
  currentPrice?: number;
}

export function AIAdvisorWidget({
  role = "farmer",
  commodity = "Tomato",
  quantityKg = 2000,
  currentPrice = 34.0,
}: AIAdvisorWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<any>({
    primary_headline: `Optimal Harvest and Dispatch Strategy for ${commodity}`,
    urgency_level: "medium",
    action_items: [
      `Harvest Timing: Stagger harvest over the next 48-72 hours to capture projected price rise (+Rs 2.80/kg).`,
      `Inter-Mandi Arbitrage: Koyambedu Wholesale (Chennai) is paying +Rs 4.50/kg extra (Rs 9,000 extra net profit).`,
      `Storage Quality: Move harvested batches to shaded and ventilated storage to prevent moisture loss.`,
      `Pre-Sale Lock: List on PeriX Anonymized B2B Surplus marketplace to lock in guaranteed price.`,
    ],
    demand_outlook: `Bullish: Demand trend is upward (+6.2% expected over next 7 days). Upcoming festival expected to boost regional demand by +35%.`,
    weather_advisory: `Weather Alert: Moderate ambient temperatures (29 deg C) with dry conditions in Coimbatore. Ideal 48-hour harvesting window.`,
    arbitrage_highlights: [
      { target_mandi: "Koyambedu Wholesale (Chennai)", price_per_kg: 38.5, price_advantage: "+Rs 4.50/kg", estimated_extra_revenue: "Rs 9,000.00" },
      { target_mandi: "Yeshwanthpur APMC (Bengaluru)", price_per_kg: 37.0, price_advantage: "+Rs 3.00/kg", estimated_extra_revenue: "Rs 6,000.00" },
    ],
  });

  useEffect(() => {
    fetchTips();
  }, [role, commodity]);

  const fetchTips = async () => {
    setLoading(true);
    const data = await apiClient.advisor.getTips({
      persona_role: role,
      commodity,
      quantity_kg: quantityKg,
      current_price_kg: currentPrice,
    });
    if (data) {
      setAdvisory(data);
    }
    setLoading(false);
  };

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "20px",
        marginBottom: "24px",
        border: "1px solid rgba(76,175,80,0.3)",
        background: "linear-gradient(135deg, rgba(76,175,80,0.04) 0%, rgba(33,150,243,0.04) 100%)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "rgba(76,175,80,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={16} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>
            PeriX AI Smart Advisor and Demand Intelligence
          </h3>
          <span className="badge badge-success" style={{ fontSize: "11px" }}>
            Real-Time Inference
          </span>
        </div>

        <button
          className="btn btn-ghost"
          onClick={fetchTips}
          disabled={loading}
          style={{ fontSize: "12px", padding: "4px 10px", height: "30px" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh Insights
        </button>
      </div>

      <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)", marginBottom: "12px" }}>
        {advisory.primary_headline}
      </h4>

      {/* Action Items */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {advisory.action_items?.map((act: string, idx: number) => (
          <div
            key={idx}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              fontSize: "12px",
              color: "var(--text-primary)",
              lineHeight: "1.4",
            }}
          >
            {act}
          </div>
        ))}
      </div>

      {/* Two Column Context Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="grid-charts">
        <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(33,150,243,0.06)", border: "1px solid rgba(33,150,243,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#1976D2", marginBottom: "4px" }}>
            <TrendingUp size={14} /> Demand Outlook and Festival Catalysts
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            {advisory.demand_outlook}
          </p>
        </div>

        <div style={{ padding: "10px 12px", borderRadius: "8px", background: "rgba(255,152,0,0.06)", border: "1px solid rgba(255,152,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#E65100", marginBottom: "4px" }}>
            <CloudSun size={14} /> Hyperlocal Weather Advisory
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
            {advisory.weather_advisory}
          </p>
        </div>
      </div>
    </div>
  );
}
