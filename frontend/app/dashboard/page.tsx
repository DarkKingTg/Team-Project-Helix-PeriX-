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
  Truck,
  ThermometerSnowflake,
  Users,
  Activity,
  Sun,
  CloudRain,
  Sprout,
  Scale,
  MapPin,
  Store,
  Zap,
  CheckCircle2,
  Clock,
  BarChart3,
  Building2,
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

/* ========================================================================
   FARMER-SPECIFIC DATA
   ======================================================================== */

const farmerYieldData = [
  { month: "Jan", yield: 1200, revenue: 42000 },
  { month: "Feb", yield: 980, revenue: 36200 },
  { month: "Mar", yield: 1650, revenue: 57800 },
  { month: "Apr", yield: 1420, revenue: 49700 },
  { month: "May", yield: 1880, revenue: 65800 },
  { month: "Jun", yield: 1560, revenue: 54600 },
  { month: "Jul", yield: 2100, revenue: 73500 },
];

const farmerPriceForecast = [
  { day: "Mon", actual: 32, predicted: 33 },
  { day: "Tue", actual: 34, predicted: 35 },
  { day: "Wed", actual: 33, predicted: 36 },
  { day: "Thu", actual: null, predicted: 38 },
  { day: "Fri", actual: null, predicted: 37 },
  { day: "Sat", actual: null, predicted: 40 },
  { day: "Sun", actual: null, predicted: 42 },
];

const farmerActivity = [
  { id: 1, action: "Harvest window optimal", detail: "Tomato crop: Pick within 48 hours for peak Rs 42/kg", time: "Just now", type: "harvest" },
  { id: 2, action: "Pickup confirmed", detail: "Mandi agent Suresh Kumar collecting 500kg tomorrow 6 AM", time: "1 hr ago", type: "pickup" },
  { id: 3, action: "Payment credited", detail: "Rs 18,400 for 400kg Onion lot #T-2847", time: "3 hrs ago", type: "payment" },
  { id: 4, action: "Weather advisory", detail: "Heavy rain expected Thursday -- advance harvest recommended", time: "5 hrs ago", type: "weather" },
];

const farmerAiTips = [
  { title: "Optimal Selling Window", description: "Tomato prices projected +24% over 7 days. Hold current stock for Rs 42/kg peak.", confidence: 91 },
  { title: "Pest Risk Alert", description: "Whitefly activity detected in Coimbatore region. Apply neem-based treatment on Chilli crop.", confidence: 78 },
  { title: "Festival Demand Surge", description: "Onion demand +40% next week (Pongal prep). List surplus now on marketplace for premium.", confidence: 88 },
];

/* ========================================================================
   MANDI AGENT-SPECIFIC DATA
   ======================================================================== */

const mandiFlowData = [
  { day: "Mon", inbound: 4200, outbound: 3800 },
  { day: "Tue", inbound: 3600, outbound: 3900 },
  { day: "Wed", inbound: 5100, outbound: 4200 },
  { day: "Thu", inbound: 4800, outbound: 4600 },
  { day: "Fri", inbound: 5500, outbound: 5100 },
  { day: "Sat", inbound: 6200, outbound: 5800 },
  { day: "Sun", inbound: 3200, outbound: 3000 },
];

const mandiPriceSpread = [
  { commodity: "Tomato", today: 34, yesterday: 31, change: 9.7 },
  { commodity: "Potato", today: 26, yesterday: 27, change: -3.7 },
  { commodity: "Onion", today: 38, yesterday: 35, change: 8.6 },
  { commodity: "Banana", today: 22, yesterday: 22, change: 0 },
  { commodity: "Wheat", today: 28, yesterday: 27, change: 3.7 },
  { commodity: "Rice", today: 42, yesterday: 41, change: 2.4 },
  { commodity: "Green Chilli", today: 58, yesterday: 52, change: 11.5 },
  { commodity: "Garlic", today: 120, yesterday: 118, change: 1.7 },
];

const mandiActivity = [
  { id: 1, action: "Farmer lot arrived", detail: "Rajesh Farms -- 1,200 kg Tomato Grade A, Weighbridge #3", time: "5 min ago", type: "arrival" },
  { id: 2, action: "Wholesaler dispatch", detail: "Chennai Reefer Hub collected 2,400 kg Onion (Invoice #M-4821)", time: "45 min ago", type: "dispatch" },
  { id: 3, action: "Commission settled", detail: "Rs 8,400 commission on Rs 1,40,000 daily turnover", time: "2 hrs ago", type: "commission" },
  { id: 4, action: "Oversupply glut warning", detail: "Potato stock exceeding 3x normal -- trigger markdown clearance", time: "4 hrs ago", type: "alert" },
];

const mandiAiTips = [
  { title: "Oversupply Glut Detected", description: "Potato inbound 3.2x baseline. Divert 40% to Nilgiris Mandi (deficit zone) for +Rs 3/kg arbitrage.", confidence: 94 },
  { title: "Optimal Commission Window", description: "Green Chilli prices spiking +11.5%. Aggregate farmer lots now for peak commission extraction.", confidence: 87 },
  { title: "Cold Storage Redirect", description: "Banana shelf-life at 28°C is 36h. Route 600kg to Kovai Cold Hub immediately.", confidence: 82 },
];

/* ========================================================================
   WHOLESALER-SPECIFIC DATA
   ======================================================================== */

const wholesalerCapacityData = [
  { day: "W1", utilized: 72, capacity: 100 },
  { day: "W2", utilized: 68, capacity: 100 },
  { day: "W3", utilized: 81, capacity: 100 },
  { day: "W4", utilized: 88, capacity: 100 },
  { day: "W5", utilized: 79, capacity: 100 },
  { day: "W6", utilized: 85, capacity: 100 },
  { day: "W7", utilized: 92, capacity: 100 },
];

const wholesalerRoutePerf = [
  { route: "CBE -> CHN", sla: 94, deliveries: 48 },
  { route: "CBE -> MDU", sla: 89, deliveries: 32 },
  { route: "CBE -> SLM", sla: 97, deliveries: 28 },
  { route: "CBE -> TPR", sla: 91, deliveries: 22 },
  { route: "CBE -> TRY", sla: 86, deliveries: 18 },
];

const wholesalerActivity = [
  { id: 1, action: "Reefer dispatched", detail: "Truck TN-43-BK-1204 -- 4,200 kg Tomato to Chennai Koyambedu", time: "20 min ago", type: "dispatch" },
  { id: 2, action: "Temperature excursion", detail: "Bay #7 hit 12°C (threshold 8°C). Compressor boost activated.", time: "1 hr ago", type: "alert" },
  { id: 3, action: "Inter-hub transfer", detail: "Received 1,800 kg Potato from Nilgiris Hub (shortage rebalance)", time: "3 hrs ago", type: "transfer" },
  { id: 4, action: "B2B order confirmed", detail: "FreshMart Retail placed Rs 2,40,000 order for weekly supply", time: "5 hrs ago", type: "order" },
];

const wholesalerAiTips = [
  { title: "Temperature Excursion Prevention", description: "Bay #7 ambient climbing. Pre-cool to 4°C now to avoid 12°C breach in 2 hours.", confidence: 96 },
  { title: "Route Optimization", description: "Combining CBE->MDU and CBE->SLM runs saves Rs 4,200/trip in diesel and toll.", confidence: 89 },
  { title: "Demand-Pull Restock", description: "Chennai Koyambedu Onion demand +35% this week. Pre-position 3,000 kg buffer.", confidence: 91 },
];

/* ========================================================================
   ADMIN-SPECIFIC DATA
   ======================================================================== */

const adminNodeGrowth = [
  { month: "Jan", farmers: 120, mandi: 18, wholesalers: 8 },
  { month: "Feb", farmers: 185, mandi: 24, wholesalers: 11 },
  { month: "Mar", farmers: 260, mandi: 32, wholesalers: 15 },
  { month: "Apr", farmers: 340, mandi: 38, wholesalers: 19 },
  { month: "May", farmers: 450, mandi: 45, wholesalers: 24 },
  { month: "Jun", farmers: 580, mandi: 52, wholesalers: 30 },
  { month: "Jul", farmers: 720, mandi: 61, wholesalers: 36 },
];

const adminTxnVolume = [
  { month: "Jan", farmer: 12, mandi: 28, wholesaler: 45 },
  { month: "Feb", farmer: 15, mandi: 32, wholesaler: 52 },
  { month: "Mar", farmer: 18, mandi: 38, wholesaler: 58 },
  { month: "Apr", farmer: 22, mandi: 42, wholesaler: 64 },
  { month: "May", farmer: 28, mandi: 48, wholesaler: 72 },
  { month: "Jun", farmer: 32, mandi: 55, wholesaler: 80 },
  { month: "Jul", farmer: 38, mandi: 62, wholesaler: 92 },
];

const adminActivity = [
  { id: 1, action: "New farmer registered", detail: "Suresh Kumar, Coimbatore, TN -- Tomato + Onion grower", time: "10 min ago", type: "registration" },
  { id: 2, action: "Flagged transaction", detail: "Invoice #W-9201 amount Rs 4,80,000 exceeds daily limit -- manual review", time: "1 hr ago", type: "flag" },
  { id: 3, action: "Mandi license verified", detail: "APMC License #TN-CBE-2024-0847 validated for Kovai Agro Hub", time: "3 hrs ago", type: "verification" },
  { id: 4, action: "System health event", detail: "ML service latency spike 450ms -> recovered to 120ms", time: "6 hrs ago", type: "health" },
];

const adminAiTips = [
  { title: "Network Growth Bottleneck", description: "Salem district has 0 registered mandis but 85 farmers. Onboard 2 APMC agents to unlock corridor.", confidence: 93 },
  { title: "Compliance Alert", description: "3 wholesaler invoices missing GST fields. Flag for review before month-end filing.", confidence: 88 },
  { title: "Expansion Opportunity", description: "Tirunelveli region shows 4x search traffic. Launch targeted farmer onboarding campaign.", confidence: 81 },
];

/* ========================================================================
   TOOLTIP STYLE (SHARED)
   ======================================================================== */

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  boxShadow: "var(--shadow-lg)",
};

/* ========================================================================
   COMPONENT
   ======================================================================== */

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const role = profile?.role || "farmer";

  return (
    <div className="page-container">
      {role === "farmer" && <FarmerDashboard displayName={profile?.displayName} t={t} />}
      {role === "mandi" && <MandiDashboard displayName={profile?.displayName} t={t} />}
      {role === "wholesaler" && <WholesalerDashboard displayName={profile?.displayName} t={t} />}
      {role === "admin" && <AdminDashboard displayName={profile?.displayName} t={t} />}
    </div>
  );
}

/* ========================================================================
   FARMER DASHBOARD
   ======================================================================== */

function FarmerDashboard({ displayName, t }: { displayName?: string; t: (k: string, f: string) => string }) {
  const kpis = [
    { label: "Total Revenue This Season", value: "Rs 3,79,600", trend: 12.5, trendLabel: "vs last season", icon: IndianRupee, color: "#4CAF50" },
    { label: "Active Crops", value: "8 Varieties", trend: 2, trendLabel: "new this month", icon: Sprout, color: "#66BB6A" },
    { label: "Pending Pickups", value: "3 Lots", trend: -1, trendLabel: "vs last week", icon: Truck, color: "#FF9800" },
    { label: "Waste Prevented", value: "120 kg", trend: 25, trendLabel: "saved from landfill", icon: Leaf, color: "#2196F3" },
  ];

  return (
    <>
      <DashboardHeader
        title={t("common.welcome", "Welcome back") + `, ${displayName || "Farmer"}`}
        subtitle="Your farm performance, harvest windows, and crop revenue at a glance."
        badge="Farmer View"
        badgeColor="#4CAF50"
      />
      <KPIGrid kpis={kpis} />

      <div className="grid-charts" style={{ marginBottom: "24px" }}>
        {/* Crop Yield & Revenue Tracker */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Crop Yield & Revenue Tracker" subtitle="Monthly harvest volume (kg) vs revenue earned (Rs)" badge="My Farm" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={farmerYieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis yAxisId="left" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="left" dataKey="yield" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Yield (kg)" />
              <Bar yAxisId="right" dataKey="revenue" fill="#81C784" radius={[4, 4, 0, 0]} name="Revenue (Rs)" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best Selling Window */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Best Selling Window (Tomato)" subtitle="7-day actual vs AI-predicted price (Rs/kg)" badge="AI Forecast" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={farmerPriceForecast}>
              <defs>
                <linearGradient id="fGradPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} domain={["dataMin - 2", "dataMax + 3"]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="predicted" stroke="#4CAF50" fill="url(#fGradPred)" strokeWidth={3} name="Predicted (Rs)" />
              <Area type="monotone" dataKey="actual" stroke="#2196F3" fill="transparent" strokeWidth={2} name="Actual (Rs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <BottomGrid activity={farmerActivity} aiTips={farmerAiTips} activityIcon={activityIconFarmer} t={t} />
    </>
  );
}

/* ========================================================================
   MANDI AGENT DASHBOARD
   ======================================================================== */

function MandiDashboard({ displayName, t }: { displayName?: string; t: (k: string, f: string) => string }) {
  const kpis = [
    { label: "Daily Throughput", value: "6,200 kg", trend: 18, trendLabel: "vs weekly avg", icon: Scale, color: "#FF9800" },
    { label: "Commission Earned Today", value: "Rs 8,400", trend: 12, trendLabel: "vs yesterday", icon: IndianRupee, color: "#4CAF50" },
    { label: "APMC License Utilization", value: "78%", trend: 5, trendLabel: "capacity used", icon: Store, color: "#2196F3" },
    { label: "Spoilage Alert Items", value: "3 Lots", trend: -40, trendLabel: "reduction this week", icon: AlertTriangle, color: "#F44336" },
  ];

  return (
    <>
      <DashboardHeader
        title={t("common.welcome", "Welcome back") + `, ${displayName || "Mandi Agent"}`}
        subtitle="Your APMC aggregation throughput, commission tracking, and commodity flow intelligence."
        badge="Mandi Agent View"
        badgeColor="#FF9800"
      />
      <KPIGrid kpis={kpis} />

      <div className="grid-charts" style={{ marginBottom: "24px" }}>
        {/* Inbound vs Outbound Flow */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Inbound vs Outbound Flow (kg)" subtitle="Farmer arrivals vs wholesaler dispatches this week" badge="Throughput" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mandiFlowData}>
              <defs>
                <linearGradient id="mGradIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9800" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mGradOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="inbound" stroke="#FF9800" fill="url(#mGradIn)" strokeWidth={2.5} name="Inbound (kg)" />
              <Area type="monotone" dataKey="outbound" stroke="#4CAF50" fill="url(#mGradOut)" strokeWidth={2.5} name="Outbound (kg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Commodity Price Spread */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Today's Commodity Price Spread" subtitle="Price change vs yesterday (Rs/kg)" badge="Live Rates" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            {mandiPriceSpread.map((item) => (
              <div
                key={item.commodity}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--surface-hover)",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", width: "90px" }}>{item.commodity}</span>
                <div style={{ flex: 1, background: "var(--border)", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, (item.today / 130) * 100)}%`,
                      height: "100%",
                      borderRadius: "4px",
                      background: item.change > 0 ? "#4CAF50" : item.change < 0 ? "#F44336" : "#9E9E9E",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", width: "55px", textAlign: "right" }}>Rs {item.today}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    width: "55px",
                    textAlign: "right",
                    color: item.change > 0 ? "#2E7D32" : item.change < 0 ? "#C62828" : "var(--text-tertiary)",
                  }}
                >
                  {item.change > 0 ? "+" : ""}{item.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomGrid activity={mandiActivity} aiTips={mandiAiTips} activityIcon={activityIconMandi} t={t} />
    </>
  );
}

/* ========================================================================
   WHOLESALER DASHBOARD
   ======================================================================== */

function WholesalerDashboard({ displayName, t }: { displayName?: string; t: (k: string, f: string) => string }) {
  const kpis = [
    { label: "Monthly Revenue", value: "Rs 8,92,000", trend: 6.7, trendLabel: "vs last month", icon: IndianRupee, color: "#2196F3" },
    { label: "Reefer Fleet Utilization", value: "87%", trend: 4, trendLabel: "above target", icon: Truck, color: "#4CAF50" },
    { label: "Buffer Capacity", value: "180 Tonnes", trend: -12, trendLabel: "available (filling)", icon: Building2, color: "#FF9800" },
    { label: "Active B2B Orders", value: "12", trend: 4, trendLabel: "new this week", icon: ShoppingCart, color: "#9C27B0" },
  ];

  return (
    <>
      <DashboardHeader
        title={t("common.welcome", "Welcome back") + `, ${displayName || "Wholesaler"}`}
        subtitle="Your cold-chain utilization, distribution routes, and reefer fleet performance."
        badge="Wholesaler View"
        badgeColor="#2196F3"
      />
      <KPIGrid kpis={kpis} />

      <div className="grid-charts" style={{ marginBottom: "24px" }}>
        {/* Cold Storage Utilization */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Cold Storage Utilization (%)" subtitle="Capacity fill rate over past 7 weeks" badge="Cold Chain" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={wholesalerCapacityData}>
              <defs>
                <linearGradient id="wGradCap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="utilized" stroke="#2196F3" fill="url(#wGradCap)" strokeWidth={3} name="Utilized (%)" />
              <Area type="monotone" dataKey="capacity" stroke="#E0E0E0" fill="transparent" strokeDasharray="5 5" strokeWidth={1} name="Max Capacity" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Route Performance */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Distribution Route SLA Performance" subtitle="On-time delivery hit rate by corridor" badge="Fleet" />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "12px" }}>
            {wholesalerRoutePerf.map((route) => (
              <div key={route.route}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{route.route}</span>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>{route.deliveries} deliveries</span>
                    <span style={{ fontWeight: "700", color: route.sla >= 90 ? "#2E7D32" : "#E65100" }}>{route.sla}% SLA</span>
                  </div>
                </div>
                <div style={{ background: "var(--border)", borderRadius: "6px", height: "10px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${route.sla}%`,
                      height: "100%",
                      borderRadius: "6px",
                      background: route.sla >= 95 ? "#4CAF50" : route.sla >= 90 ? "#FF9800" : "#F44336",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomGrid activity={wholesalerActivity} aiTips={wholesalerAiTips} activityIcon={activityIconWholesaler} t={t} />
    </>
  );
}

/* ========================================================================
   ADMIN DASHBOARD
   ======================================================================== */

function AdminDashboard({ displayName, t }: { displayName?: string; t: (k: string, f: string) => string }) {
  const kpis = [
    { label: "Total Registered Nodes", value: "817", trend: 23, trendLabel: "new this month", icon: Users, color: "#F44336" },
    { label: "Network Volume (Rs)", value: "Rs 45.2 Lakhs", trend: 18, trendLabel: "monthly growth", icon: IndianRupee, color: "#4CAF50" },
    { label: "Active Transfers", value: "89", trend: 12, trendLabel: "this week", icon: ArrowUpRight, color: "#2196F3" },
    { label: "System Uptime", value: "99.8%", trend: 0.1, trendLabel: "improvement", icon: Activity, color: "#FF9800" },
  ];

  return (
    <>
      <DashboardHeader
        title={t("common.welcome", "Welcome back") + `, ${displayName || "Admin"}`}
        subtitle="Network operations center -- node registrations, transaction volumes, and system health."
        badge="Admin NOC"
        badgeColor="#F44336"
      />
      <KPIGrid kpis={kpis} />

      <div className="grid-charts" style={{ marginBottom: "24px" }}>
        {/* Node Registration Growth */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Node Registration Growth" subtitle="Cumulative farmer, mandi, and wholesaler registrations" badge="Growth" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={adminNodeGrowth}>
              <defs>
                <linearGradient id="aGradF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aGradM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9800" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="farmers" stroke="#4CAF50" fill="url(#aGradF)" strokeWidth={2.5} name="Farmers" />
              <Area type="monotone" dataKey="mandi" stroke="#FF9800" fill="url(#aGradM)" strokeWidth={2.5} name="Mandi Agents" />
              <Area type="monotone" dataKey="wholesalers" stroke="#2196F3" fill="transparent" strokeWidth={2} name="Wholesalers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Volume by Role */}
        <div className="card" style={{ padding: "24px" }}>
          <ChartHeader title="Monthly Transaction Volume (Rs Lakhs)" subtitle="Revenue split by supply chain role" badge="Revenue" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={adminTxnVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="farmer" stackId="a" fill="#4CAF50" radius={[0, 0, 0, 0]} name="Farmer" />
              <Bar dataKey="mandi" stackId="a" fill="#FF9800" radius={[0, 0, 0, 0]} name="Mandi" />
              <Bar dataKey="wholesaler" stackId="a" fill="#2196F3" radius={[4, 4, 0, 0]} name="Wholesaler" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <BottomGrid activity={adminActivity} aiTips={adminAiTips} activityIcon={activityIconAdmin} t={t} />
    </>
  );
}

/* ========================================================================
   SHARED SUB-COMPONENTS
   ======================================================================== */

function DashboardHeader({ title, subtitle, badge, badgeColor }: { title: string; subtitle: string; badge: string; badgeColor: string }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)" }}>{title}</h2>
        <span className="badge" style={{ background: `${badgeColor}15`, color: badgeColor, fontWeight: "700" }}>{badge}</span>
      </div>
      <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginTop: "4px" }}>{subtitle}</p>
    </div>
  );
}

function KPIGrid({ kpis }: { kpis: Array<{ label: string; value: string; trend: number; trendLabel: string; icon: React.ComponentType<{ size?: number; color?: string }>; color: string }> }) {
  return (
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
  );
}

function ChartHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>{title}</h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{subtitle}</p>
      </div>
      <span className="badge badge-success">
        <Sparkles size={12} style={{ marginRight: "4px" }} />
        {badge}
      </span>
    </div>
  );
}

interface ActivityItem {
  id: number;
  action: string;
  detail: string;
  time: string;
  type: string;
}

type IconFn = (type: string) => { icon: React.ReactNode; bg: string };

function BottomGrid({ activity, aiTips, activityIcon, t }: {
  activity: ActivityItem[];
  aiTips: Array<{ title: string; description: string; confidence: number }>;
  activityIcon: IconFn;
  t: (k: string, f: string) => string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid-charts">
      {/* Activity Feed */}
      <div className="card" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px" }}>
          {t("common.recentActivity", "Recent Activity")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {activity.map((a) => {
            const { icon, bg } = activityIcon(a.type);
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "var(--radius)",
                  background: "var(--surface-hover)",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{a.action}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{a.detail}</p>
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{a.time}</span>
              </div>
            );
          })}
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
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   ACTIVITY ICON RESOLVERS (PER ROLE)
   ======================================================================== */

function activityIconFarmer(type: string): { icon: React.ReactNode; bg: string } {
  switch (type) {
    case "harvest": return { icon: <Sprout size={16} color="#4CAF50" />, bg: "#4CAF5015" };
    case "pickup": return { icon: <Truck size={16} color="#FF9800" />, bg: "#FF980015" };
    case "payment": return { icon: <IndianRupee size={16} color="#2196F3" />, bg: "#2196F315" };
    case "weather": return { icon: <CloudRain size={16} color="#9C27B0" />, bg: "#9C27B015" };
    default: return { icon: <Package size={16} color="#9E9E9E" />, bg: "#9E9E9E15" };
  }
}

function activityIconMandi(type: string): { icon: React.ReactNode; bg: string } {
  switch (type) {
    case "arrival": return { icon: <Truck size={16} color="#FF9800" />, bg: "#FF980015" };
    case "dispatch": return { icon: <ArrowUpRight size={16} color="#4CAF50" />, bg: "#4CAF5015" };
    case "commission": return { icon: <IndianRupee size={16} color="#2196F3" />, bg: "#2196F315" };
    case "alert": return { icon: <AlertTriangle size={16} color="#F44336" />, bg: "#F4433615" };
    default: return { icon: <Package size={16} color="#9E9E9E" />, bg: "#9E9E9E15" };
  }
}

function activityIconWholesaler(type: string): { icon: React.ReactNode; bg: string } {
  switch (type) {
    case "dispatch": return { icon: <Truck size={16} color="#2196F3" />, bg: "#2196F315" };
    case "alert": return { icon: <ThermometerSnowflake size={16} color="#F44336" />, bg: "#F4433615" };
    case "transfer": return { icon: <ArrowUpRight size={16} color="#FF9800" />, bg: "#FF980015" };
    case "order": return { icon: <ShoppingCart size={16} color="#4CAF50" />, bg: "#4CAF5015" };
    default: return { icon: <Package size={16} color="#9E9E9E" />, bg: "#9E9E9E15" };
  }
}

function activityIconAdmin(type: string): { icon: React.ReactNode; bg: string } {
  switch (type) {
    case "registration": return { icon: <Users size={16} color="#4CAF50" />, bg: "#4CAF5015" };
    case "flag": return { icon: <AlertTriangle size={16} color="#F44336" />, bg: "#F4433615" };
    case "verification": return { icon: <CheckCircle2 size={16} color="#2196F3" />, bg: "#2196F315" };
    case "health": return { icon: <Activity size={16} color="#FF9800" />, bg: "#FF980015" };
    default: return { icon: <Package size={16} color="#9E9E9E" />, bg: "#9E9E9E15" };
  }
}
