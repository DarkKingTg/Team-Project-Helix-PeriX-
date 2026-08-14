"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import {
  Leaf,
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Globe,
  Menu,
  X,
  Loader2,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AICopilotModal } from "@/components/ai-copilot-modal";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  href: string;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  farmer: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Crops", icon: Package, href: "/dashboard/crops" },
    { label: "Market Prices", icon: BarChart3, href: "/dashboard/market" },
    { label: "AI Pipeline", icon: Cpu, href: "/dashboard/pipeline" },
    { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  mandi: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Inventory", icon: Package, href: "/dashboard/inventory" },
    { label: "Marketplace", icon: Store, href: "/dashboard/marketplace" },
    { label: "AI Pipeline", icon: Cpu, href: "/dashboard/pipeline" },
    { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  wholesaler: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Inventory", icon: Package, href: "/dashboard/inventory" },
    { label: "Distribution", icon: Store, href: "/dashboard/distribution" },
    { label: "AI Pipeline", icon: Cpu, href: "/dashboard/pipeline" },
    { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  retailer: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Inventory", icon: Package, href: "/dashboard/inventory" },
    { label: "Marketplace", icon: Store, href: "/dashboard/marketplace" },
    { label: "Dynamic Pricing", icon: BarChart3, href: "/dashboard/pricing" },
    { label: "AI Pipeline", icon: Cpu, href: "/dashboard/pipeline" },
    { label: "Orders", icon: ShoppingCart, href: "/dashboard/orders" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Users", icon: Package, href: "/dashboard/users" },
    { label: "All Inventory", icon: Store, href: "/dashboard/inventory" },
    { label: "AI Pipeline", icon: Cpu, href: "/dashboard/pipeline" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
};

const roleColors: Record<UserRole, string> = {
  farmer: "#4CAF50",
  mandi: "#FF9800",
  wholesaler: "#2196F3",
  retailer: "#9C27B0",
  admin: "#F44336",
};

const roleLabels: Record<UserRole, string> = {
  farmer: "Farmer",
  mandi: "Mandi Agent",
  wholesaler: "Wholesaler",
  retailer: "Retailer",
  admin: "Admin",
};

const DASHBOARD_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const handleSelectLanguage = (code: string) => {
    setCurrentLang(code);
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
    setLangDropdownOpen(false);
    router.refresh();
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
        }}
      >
        <Loader2 size={32} color="var(--primary)" className="animate-spin" />
      </div>
    );
  }

  const role = profile?.role || "farmer";
  const navItems = roleNavItems[role];
  const color = roleColors[role];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: mobileOpen ? 0 : undefined,
          zIndex: 50,
          overflow: "hidden",
        }}
        className={`hidden md:flex ${mobileOpen ? "!flex" : ""}`}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "20px 16px" : "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid var(--border)",
            minHeight: "var(--navbar-height)",
          }}
        >
          <Leaf size={28} color="var(--primary)" />
          {!collapsed && (
            <span
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
              }}
            >
              PeriX
            </span>
          )}
        </div>

        {/* Role badge */}
        <div style={{ padding: collapsed ? "12px 8px" : "12px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "8px",
              padding: collapsed ? "8px" : "8px 12px",
              borderRadius: "var(--radius)",
              background: `${color}15`,
              border: `1px solid ${color}30`,
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            {!collapsed && (
              <span style={{ fontSize: "12px", fontWeight: "600", color }}>{roleLabels[role]}</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "8px", overflow: "auto" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setMobileOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: "12px",
                  padding: collapsed ? "12px" : "10px 16px",
                  borderRadius: "var(--radius)",
                  background: isActive ? `${color}15` : "transparent",
                  color: isActive ? color : "var(--text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "400",
                  transition: "all 0.2s ease",
                  marginBottom: "2px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--surface-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div
          style={{
            padding: "8px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn-ghost"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: "12px",
                padding: collapsed ? "12px" : "10px 16px",
                borderRadius: "var(--radius)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontSize: "14px",
                width: "100%",
              }}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "12px",
              padding: collapsed ? "12px" : "10px 16px",
              borderRadius: "var(--radius)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "14px",
              width: "100%",
            }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "12px",
              padding: collapsed ? "12px" : "10px 16px",
              borderRadius: "var(--radius)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--error)",
              fontSize: "14px",
              width: "100%",
            }}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          transition: "margin 0.3s ease",
          minHeight: "100vh",
        }}
        className="ml-0 md:ml-auto"
      >
        {/* Top navbar */}
        <header
          style={{
            height: "var(--navbar-height)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-primary)",
              padding: "8px",
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "var(--text-primary)",
              }}
            >
              {navItems.find((i) => i.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Language selector */}
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-ghost"
                style={{
                  borderRadius: "var(--radius)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: langDropdownOpen ? "var(--surface-hover)" : "transparent",
                }}
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                title="Change Language (9 Indian Languages Supported)"
              >
                <Globe size={18} />
                <span style={{ fontSize: "12px", fontWeight: "600" }} className="hidden sm:inline">
                  {DASHBOARD_LANGUAGES.find((l) => l.code === currentLang)?.native || "English"}
                </span>
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 60 }}
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                      zIndex: 70,
                      width: "210px",
                      padding: "6px",
                      maxHeight: "360px",
                      overflowY: "auto",
                    }}
                    className="animate-fade-in"
                  >
                    <div
                      style={{
                        padding: "6px 10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Regional Languages
                    </div>
                    {DASHBOARD_LANGUAGES.map((l) => {
                      const isSelected = currentLang === l.code;
                      return (
                        <button
                          key={l.code}
                          onClick={() => handleSelectLanguage(l.code)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "none",
                            background: isSelected ? "var(--primary-50)" : "transparent",
                            color: isSelected ? "var(--primary-dark)" : "var(--text-primary)",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "13px",
                            fontWeight: isSelected ? "700" : "500",
                            marginBottom: "2px",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "var(--surface-hover)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <div>
                            <div>{l.native}</div>
                            <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{l.name}</div>
                          </div>
                          {isSelected && <CheckCircle2 size={14} color="var(--primary)" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* User avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                background: "var(--surface-hover)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: `${color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  color,
                }}
              >
                {profile?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
                className="hidden sm:inline"
              >
                {profile?.displayName || "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="animate-fade-in">{children}</div>

        {/* Global AI Copilot Floating Assistant */}
        <AICopilotModal role={role} />
      </main>
    </div>
  );
}
