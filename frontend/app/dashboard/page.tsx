"use client";

import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import {
  TrendingUp,
  TrendingDown,
  Package,
  IndianRupee,
  ShoppingCart,
  Leaf,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const demandData = [
  { month: "Jan", tomato: 4200, potato: 3800, onion: 3100, wheat: 5200 },
  { month: "Feb", tomato: 3800, potato: 4100, onion: 2900, wheat: 4800 },
  { month: "Mar", tomato: 5100, potato: 3500, onion: 3400, wheat: 4500 },
  { month: "Apr", tomato: 4800, potato: 3900, onion: 3800, wheat: 4200 },
  { month: "May", tomato: 5500, potato: 4200, onion: 4100, wheat: 3800 },
  { month: "Jun", tomato: 4900, potato: 4500, onion: 3600, wheat: 3500 },
  { month: "Jul", tomato: 5800, potato: 4000, onion: 4300, wheat: 3200 },
];

const priceData = [
  { date: "Mon", price: 42, predicted: 44 },
  { date: "Tue", price: 45, predicted: 43 },
  { date: "Wed", price: 41, predicted: 42 },
  { date: "Thu", price: 48, predicted: 46 },
  { date: "Fri", price: 52, predicted: 49 },
  { date: "Sat", price: 49, predicted: 51 },
  { date: "Sun", price: 55, predicted: 53 },
];

const inventoryDistribution = [
  { name: "Tomato", value: 35, color: "#F44336" },
  { name: "Potato", value: 25, color: "#FF9800" },
  { name: "Onion", value: 20, color: "#9C27B0" },
  { name: "Wheat", value: 15, color: "#4CAF50" },
  { name: "Rice", value: 5, color: "#2196F3" },
];

const recentActivity = [
  { id: 1, action: "New order received", detail: "500kg Tomatoes from Mandi #12", time: "2 min ago", type: "order" },
  { id: 2, action: "Price alert", detail: "Potato prices up 12% in local market", time: "15 min ago", type: "alert" },
  { id: 3, action: "AI Recommendation", detail: "Sell wheat stock within 3 days for optimal price", time: "1 hr ago", type: "ai" },
  { id: 4, action: "Delivery completed", detail: "200kg Onions delivered to Wholesaler #5", time: "2 hrs ago", type: "delivery" },
  { id: 5, action: "Surplus detected", detail: "150kg excess Rice — listing on marketplace", time: "3 hrs ago", type: "surplus" },
];

const aiTips = [
  {
    title: "Optimal Selling Window",
    description: "Tomato prices are predicted to peak in 3 days. Consider holding current stock.",
    confidence: 87,
    type: "timing",
  },
  {
    title: "Surplus Rebalancing",
    description: "Nearby Mandi in Coimbatore has 200kg potato shortage. Transfer opportunity available.",
    confidence: 92,
    type: "surplus",
  },
  {
    title: "Demand Spike Alert",
    description: "Festival season approaching — onion demand expected to increase 40% next week.",
    confidence: 78,
    type: "demand",
  },
];

interface KPIData {
  label: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const roleKPIs: Record<string, KPIData[]> = {
  farmer: [
    { label: "Total Revenue", value: "Rs 2,45,800", trend: 12.5, trendLabel: "vs last month", icon: IndianRupee, color: "#4CAF50" },
    { label: "Active Crops", value: "8", trend: 2, trendLabel: "new this month", icon: Leaf, color: "#66BB6A" },
    { label: "Orders Pending", value: "3", trend: -1, trendLabel: "vs last week", icon: ShoppingCart, color: "#FF9800" },
    { label: "Waste Saved", value: "120 kg", trend: 25, trendLabel: "reduction", icon: Package, color: "#2196F3" },
  ],
  mandi: [
    { label: "Total Turnover", value: "Rs 12,80,000", trend: 8.3, trendLabel: "vs last month", icon: IndianRupee, color: "#FF9800" },
    { label: "Active Inventory", value: "2,450 kg", trend: 15, trendLabel: "increase", icon: Package, color: "#4CAF50" },
    { label: "Pending Transfers", value: "7", trend: -3, trendLabel: "vs last week", icon: ShoppingCart, color: "#2196F3" },
    { label: "Spoilage Risk", value: "3 items", trend: -40, trendLabel: "reduction", icon: AlertTriangle, color: "#F44336" },
  ],
  wholesaler: [
    { label: "Total Revenue", value: "Rs 8,92,000", trend: 6.7, trendLabel: "vs last month", icon: IndianRupee, color: "#2196F3" },
    { label: "Stock Level", value: "5,200 kg", trend: -8, trendLabel: "vs capacity", icon: Package, color: "#4CAF50" },
    { label: "Active Orders", value: "12", trend: 4, trendLabel: "new this week", icon: ShoppingCart, color: "#FF9800" },
    { label: "Cold Chain", value: "98.5%", trend: 0.5, trendLabel: "uptime", icon: Leaf, color: "#9C27B0" },
  ],
  retailer: [
    { label: "Daily Sales", value: "Rs 45,200", trend: 15.2, trendLabel: "vs yesterday", icon: IndianRupee, color: "#9C27B0" },
    { label: "Items in Stock", value: "142", trend: -5, trendLabel: "low stock alerts", icon: Package, color: "#4CAF50" },
    { label: "Dynamic Pricing", value: "8 active", trend: 3, trendLabel: "markdowns", icon: TrendingDown, color: "#FF9800" },
    { label: "Waste Reduced", value: "32%", trend: 12, trendLabel: "improvement", icon: Leaf, color: "#2196F3" },
  ],
  admin: [
    { label: "Total Users", value: "1,247", trend: 23, trendLabel: "new this month", icon: Package, color: "#F44336" },
    { label: "Network Volume", value: "Rs 45.2L", trend: 18, trendLabel: "growth", icon: IndianRupee, color: "#4CAF50" },
    { label: "Active Transfers", value: "89", trend: 12, trendLabel: "this week", icon: ShoppingCart, color: "#2196F3" },
    { label: "System Health", value: "99.8%", trend: 0.1, trendLabel: "uptime", icon: Sparkles, color: "#FF9800" },
  ],
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const role = profile?.role || "farmer";
  const kpis = roleKPIs[role] || roleKPIs.farmer;

  return (
    <div className="page-container">
      {/* Welcome section */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
          {t("common.welcome", "Welcome back")}, {profile?.displayName || "User"}
        </h2>
        <p style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
          {t("common.supplyChainOverview", "Here is what is happening in your supply chain today.")}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi stagger-children" style={{ marginBottom: "24px" }}>
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p className="kpi-label">{kpi.label}</p>
                  <p className="kpi-value" style={{ marginTop: "8px" }}>{kpi.value}</p>
                  <div className={`kpi-trend ${kpi.trend >= 0 ? "up" : "down"}`}>
                    {kpi.trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(kpi.trend)}% {kpi.trendLabel}</span>
                  </div>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${kpi.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={kpi.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid-charts" style={{ marginBottom: "24px" }}>
        {/* Demand Forecast Chart */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                {t("common.demandForecast", "Demand Forecast")}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {t("common.demandSubtitle", "AI-predicted commodity demand trends")}
              </p>
            </div>
            <span className="badge badge-success">
              <Sparkles size={12} style={{ marginRight: "4px" }} />
              AI Powered
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={demandData}>
              <defs>
                <linearGradient id="gradTomato" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F44336" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F44336" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPotato" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9800" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOnion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#9C27B0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-lg)",
                }}
              />
              <Area type="monotone" dataKey="tomato" stroke="#F44336" fill="url(#gradTomato)" strokeWidth={2} />
              <Area type="monotone" dataKey="potato" stroke="#FF9800" fill="url(#gradPotato)" strokeWidth={2} />
              <Area type="monotone" dataKey="onion" stroke="#9C27B0" fill="url(#gradOnion)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Price Trends Chart */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                {t("common.priceTrends", "Price Trends (Rs/kg)")}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {t("common.priceSubtitle", "Actual vs AI-predicted prices")}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-lg)",
                }}
              />
              <Bar dataKey="price" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Actual" />
              <Bar dataKey="predicted" fill="#81C784" radius={[4, 4, 0, 0]} name="Predicted" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Activity + AI Tips + Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: "20px" }} className="grid-charts">
        {/* Recent Activity */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
            {t("common.recentActivity", "Recent Activity")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "var(--radius)",
                  background: "var(--surface-hover)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background:
                      activity.type === "order"
                        ? "#4CAF5015"
                        : activity.type === "alert"
                        ? "#FF980015"
                        : activity.type === "ai"
                        ? "#2196F315"
                        : "#9C27B015",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {activity.type === "order" && <ShoppingCart size={16} color="#4CAF50" />}
                  {activity.type === "alert" && <AlertTriangle size={16} color="#FF9800" />}
                  {activity.type === "ai" && <Sparkles size={16} color="#2196F3" />}
                  {activity.type === "delivery" && <Package size={16} color="#9C27B0" />}
                  {activity.type === "surplus" && <ArrowUpRight size={16} color="#F44336" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                    {activity.action}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {activity.detail}
                  </p>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Sparkles size={20} color="var(--primary)" />
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
              {t("common.aiInsights", "AI Insights")}
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {aiTips.map((tip, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{tip.title}</h4>
                  <span
                    className="badge"
                    style={{
                      background: tip.confidence > 85 ? "#4CAF5015" : "#FF980015",
                      color: tip.confidence > 85 ? "#2E7D32" : "#E65100",
                    }}
                  >
                    {tip.confidence}% conf.
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
            {t("common.stockDistribution", "Stock Distribution")}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={inventoryDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {inventoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            {inventoryDistribution.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
