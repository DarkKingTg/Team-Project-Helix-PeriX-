"use client";

import { useState } from "react";
import {
  TrendingUp,
  Leaf,
  IndianRupee,
  Scale,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  Award,
  Globe2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const DUAL_KPI_TRENDS = [
  { month: "Jan", wastePreventedKg: 420, revenueRecovered: 38000, co2SavedKg: 840 },
  { month: "Feb", wastePreventedKg: 680, revenueRecovered: 59000, co2SavedKg: 1360 },
  { month: "Mar", wastePreventedKg: 950, revenueRecovered: 84000, co2SavedKg: 1900 },
  { month: "Apr", wastePreventedKg: 1320, revenueRecovered: 118000, co2SavedKg: 2640 },
  { month: "May", wastePreventedKg: 1780, revenueRecovered: 162000, co2SavedKg: 3560 },
  { month: "Jun", wastePreventedKg: 2150, revenueRecovered: 198000, co2SavedKg: 4300 },
  { month: "Jul", wastePreventedKg: 2680, revenueRecovered: 245000, co2SavedKg: 5360 },
];

const NODE_CONTRIBUTIONS = [
  { node: "Farmers", rebalancedKg: 980, revenue: 88000 },
  { node: "Mandi Agents", rebalancedKg: 1450, revenue: 132000 },
  { node: "Wholesalers", rebalancedKg: 2100, revenue: 190000 },
  { node: "Retailers", rebalancedKg: 1650, revenue: 148000 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7m");

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              Dual-KPI Waste & Profitability Analytics
            </h2>
            <span className="badge badge-success">UN SDG 12.3 Aligned</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Correlating physical food waste reduction tonnage directly with recovered commercial revenue
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["1m", "3m", "7m", "YTD"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`btn btn-sm ${timeRange === r ? "btn-primary" : "btn-secondary"}`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Dual-KPI Cards */}
      <div className="grid-kpi stagger-children" style={{ marginBottom: "24px" }}>
        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p className="kpi-label">Cumulative Waste Diverted</p>
              <p className="kpi-value" style={{ color: "var(--primary)" }}>9,980 kg</p>
              <div className="kpi-trend up">
                <TrendingUp size={14} /> <span>+38.5% improvement vs baseline</span>
              </div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(46,125,50,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={22} color="var(--primary)" />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p className="kpi-label">Recovered Revenue Value</p>
              <p className="kpi-value">₹9,04,000</p>
              <div className="kpi-trend up">
                <TrendingUp size={14} /> <span>₹2.45L recovered this month</span>
              </div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,152,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IndianRupee size={22} color="#FF9800" />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p className="kpi-label">CO₂ Emissions Abated</p>
              <p className="kpi-value" style={{ color: "#2196F3" }}>19.96 Tonnes</p>
              <div className="kpi-trend up">
                <Globe2 size={14} /> <span>Direct landfill methane avoidance</span>
              </div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(33,150,243,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={22} color="#2196F3" />
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p className="kpi-label">AI Forecast Accuracy (MAPE)</p>
              <p className="kpi-value">91.4%</p>
              <div className="kpi-trend up">
                <Sparkles size={14} /> <span>Prophet + XGBoost Ensemble</span>
              </div>
            </div>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(156,39,176,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={22} color="#9C27B0" />
            </div>
          </div>
        </div>
      </div>

      {/* Dual Area Chart: Waste Prevented vs Revenue Recovered */}
      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)" }}>
              Dual-KPI Correlation: Spoilage Prevention vs Financial Value Recovered
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              Tracking how algorithm-assisted dynamic markdowns and cross-node transfers prevent loss
            </p>
          </div>
          <span className="badge badge-success">Live Synchronization</span>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={DUAL_KPI_TRENDS}>
            <defs>
              <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
            <YAxis yAxisId="left" stroke="var(--text-tertiary)" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
            />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="wastePreventedKg" stroke="#2E7D32" fill="url(#wasteGrad)" strokeWidth={3} name="Food Saved (kg)" />
            <Area yAxisId="right" type="monotone" dataKey="revenueRecovered" stroke="#FF9800" fill="url(#revGrad)" strokeWidth={3} name="Revenue Recovered (₹)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Network Tier Rebalancing Breakdown */}
      <div className="grid-charts">
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>
            Rebalanced Volume by Supply Chain Node
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={NODE_CONTRIBUTIONS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="node" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="rebalancedKg" fill="#4CAF50" radius={[6, 6, 0, 0]} name="Rebalanced (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>
            Recovered Capital by Supply Chain Tier
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={NODE_CONTRIBUTIONS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="node" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="revenue" fill="#FF9800" radius={[6, 6, 0, 0]} name="Value (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
