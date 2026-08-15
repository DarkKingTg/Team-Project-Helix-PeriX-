"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import {
  Leaf,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sprout,
  Store,
  Truck,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  Zap,
  AlertCircle,
} from "lucide-react";

type AuthMode = "login" | "register" | "select-role";

const roleConfig = [
  {
    role: "farmer" as UserRole,
    icon: Sprout,
    label: "Farmer",
    description: "Grow & supply produce, access price intelligence & forecast demand",
    color: "#4CAF50",
    badge: "Producer",
    bgGradient: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
  },
  {
    role: "mandi" as UserRole,
    icon: Store,
    label: "Mandi (Commission Agent)",
    description: "Connect farmers with wholesalers, manage stock & routes",
    color: "#FF9800",
    badge: "Aggregator",
    bgGradient: "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
  },
  {
    role: "wholesaler" as UserRole,
    icon: Truck,
    label: "Wholesaler",
    description: "Distribute bulk inventory to retail networks with cold chain tracking",
    color: "#2196F3",
    badge: "Distributor",
    bgGradient: "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
  },
  {
    role: "admin" as UserRole,
    icon: ShieldCheck,
    label: "Admin / Superuser",
    description: "Complete network visibility, cross-dashboard inspection & analytics",
    color: "#F44336",
    badge: "System Overseer",
    bgGradient: "linear-gradient(135deg, #FFEBEE, #FFCDD2)",
  },
];

function formatAuthError(err: unknown): string {
  if (!err) return "An unexpected error occurred. Please try again.";
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
    return "Incorrect email or password. Please verify your credentials or click a 1-Click Demo Profile above.";
  }
  if (msg.includes("auth/email-already-in-use")) {
    return "An account with this email is already registered. Please switch to the Sign In tab.";
  }
  if (msg.includes("auth/weak-password")) {
    return "Password is too short. Please choose a password with at least 6 characters.";
  }
  if (msg.includes("auth/invalid-email")) {
    return "Please enter a valid email address (e.g. user@perix.in).";
  }
  if (msg.includes("auth/api-key-not-valid") || msg.includes("auth/invalid-api-key")) {
    return "Firebase Authentication is activating. You can also use the 1-Click Demo Login to explore immediately.";
  }
  if (msg.includes("auth/network-request-failed") || msg.includes("Failed to fetch")) {
    return "Network connection timed out. Please check your internet or use the 1-Click Demo buttons.";
  }
  if (msg.includes("auth/unauthorized-domain")) {
    return "This domain/IP is not added to Firebase Authorized Domains. Please add 'localhost' in Firebase Console > Authentication > Settings > Authorized domains.";
  }
  if (msg.includes("auth/popup-closed-by-user")) {
    return "Google sign-in popup was closed before completing.";
  }
  return msg.replace(/^Firebase:\s*Error\s*\((.*?)\)\.?/i, "$1").replace(/-/g, " ");
}

function getDashboardRouteForRole(role?: UserRole | string | null): string {
  switch (role) {
    case "farmer":
      return "/dashboard/crops";
    case "mandi":
      return "/dashboard/inventory";
    case "wholesaler":
      return "/dashboard/inventory";
    case "admin":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loginAsDemo, user, profile, updateUserRole } = useAuth();

  const handleQuickDemo = (role: UserRole) => {
    loginAsDemo(role);
    router.push(getDashboardRouteForRole(role));
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
      router.push(getDashboardRouteForRole(profile?.role || "farmer"));
    } catch (err: unknown) {
      console.warn("Google sign-in popup error, auto-routing via demo profile:", err);
      loginAsDemo("farmer");
      router.push("/dashboard/crops");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await signInWithEmail(email, password);
      const targetRole = email.includes("farmer") ? "farmer" : email.includes("mandi") ? "mandi" : email.includes("wholesaler") ? "wholesaler" : email.includes("admin") ? "admin" : profile?.role || "farmer";
      router.push(getDashboardRouteForRole(targetRole as UserRole));
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setMode("select-role");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await signUpWithEmail(email, password, name, selectedRole);
      router.push(getDashboardRouteForRole(selectedRole));
    } catch (err: unknown) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    if (user && !profile) {
      try {
        setLoading(true);
        await updateUserRole(role);
        router.push(getDashboardRouteForRole(role));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to set role");
      } finally {
        setLoading(false);
      }
    } else if (mode === "register") {
      setMode("register");
    }
  };

  useEffect(() => {
    if (user && profile) {
      router.push(getDashboardRouteForRole(profile.role));
    }
  }, [user, profile, router]);

  if (user && !profile) {
    return <RoleSelectionView onSelect={handleRoleSelect} loading={loading} />;
  }

  if (user && profile) {
    return null;
  }

  if (mode === "select-role") {
    return (
      <RoleSelectionView
        onSelect={(role) => {
          setSelectedRole(role);
          setMode("register");
        }}
        loading={false}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--background)",
        transition: "background 0.3s ease",
      }}
    >
      {/* Left Panel - Branding */}
      <div
        style={{
          flex: "1.1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden lg:flex"
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-10%",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-5%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "520px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={32} color="white" />
            </div>
            <h1
              style={{
                fontSize: "44px",
                fontWeight: "800",
                color: "white",
                letterSpacing: "-1.5px",
              }}
            >
              PeriX
            </h1>
          </div>
          <p
            style={{
              fontSize: "20px",
              color: "rgba(255,255,255,0.92)",
              lineHeight: "1.5",
              marginBottom: "32px",
              fontWeight: "400",
            }}
          >
            Intelligent, Farm-to-Fork Food Logistics & AI Surplus Rebalancing Ecosystem
          </p>

          {/* Supply Chain Mesh Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "36px" }}>
            {["Farmer", "Mandi Agent", "Wholesaler", "Admin", "Prophet & XGBoost AI"].map((item) => (
              <span
                key={item}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "500",
                  backdropFilter: "blur(6px)",
                }}
              >
                {item}
              </span>
            ))}
          </div>

          {/* Key Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              background: "rgba(0,0,0,0.15)",
              padding: "20px",
              borderRadius: "16px",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {[
              { value: "40%", label: "Waste Reduction" },
              { value: "Agmarknet", label: "Govt. Mandi Data" },
              { value: "< 200ms", label: "Pricing Latency" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form + 1-Click Demo Section */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "36px 24px",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }} className="animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <Leaf size={32} color="var(--primary)" />
              <span style={{ fontSize: "26px", fontWeight: "700", color: "var(--text-primary)" }}>
                PeriX
              </span>
            </div>
          </div>

          {/* Quick Demo Login Hero Card */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(46,125,50,0.08), rgba(76,175,80,0.04))",
              border: "1px solid rgba(46,125,50,0.25)",
              borderRadius: "16px",
              padding: "18px 20px",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Zap size={18} color="var(--primary)" />
              <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                Instant Demo Access (1-Click Entry)
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
              Explore any of the 4 personalized supply-chain dashboards + Admin superuser:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleQuickDemo("farmer")}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start", gap: "6px", fontSize: "12px", padding: "8px 10px" }}
              >
                <Sprout size={15} color="#4CAF50" /> Farmer Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("mandi")}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start", gap: "6px", fontSize: "12px", padding: "8px 10px" }}
              >
                <Store size={15} color="#FF9800" /> Mandi Agent
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("wholesaler")}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "flex-start", gap: "6px", fontSize: "12px", padding: "8px 10px" }}
              >
                <Truck size={15} color="#2196F3" /> Wholesaler
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="btn btn-ghost btn-sm"
              style={{ width: "100%", marginTop: "8px", fontSize: "12px", color: "var(--text-secondary)" }}
            >
              <ShieldCheck size={14} color="#F44336" /> Or Enter as System Admin Overseer
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: "1", height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              or sign in with account
            </span>
            <div style={{ flex: "1", height: "1px", background: "var(--border)" }} />
          </div>

          {error && (
            <div
              className="animate-fade-in"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "12px 14px",
                background: "rgba(244, 67, 54, 0.08)",
                border: "1px solid rgba(244, 67, 54, 0.25)",
                borderRadius: "10px",
                color: "#D32F2F",
                fontSize: "13px",
                lineHeight: "1.4",
                marginBottom: "20px",
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>{error}</div>
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-secondary btn-lg"
            style={{
              width: "100%",
              marginBottom: "16px",
              gap: "12px",
              fontSize: "14px",
              padding: "12px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google Account
          </button>

          {/* Email form */}
          <form onSubmit={mode === "login" ? handleEmailLogin : handleEmailRegister}>
            {mode === "register" && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                  <input
                    type="text"
                    className="input"
                    style={{ paddingLeft: "40px" }}
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {mode === "register" && selectedRole && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--primary-50)",
                  borderRadius: "var(--radius)",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "var(--primary-dark)",
                }}
              >
                <span>Role: <strong>{roleConfig.find((r) => r.role === selectedRole)?.label}</strong></span>
                <button
                  type="button"
                  onClick={() => setMode("select-role")}
                  style={{
                    marginLeft: "auto",
                    color: "var(--primary)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    fontSize: "12px",
                    textDecoration: "underline",
                  }}
                >
                  Change
                </button>
              </div>
            )}

            {mode === "login" && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Demo Accounts (Click to Autofill)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {[
                    { label: " Farmer", email: "farmer@perix.in", pass: "farmer123" },
                    { label: " Mandi", email: "mandi@perix.in", pass: "mandi123" },
                    { label: " Wholesaler", email: "wholesaler@perix.in", pass: "wholesaler123" },
                    { label: " Admin", email: "admin@perix.in", pass: "admin123" },
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword(acc.pass);
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        fontWeight: "600",
                        borderRadius: "8px",
                        background: email === acc.email ? "var(--primary-50)" : "var(--surface-hover)",
                        border: email === acc.email ? "1px solid var(--primary)" : "1px solid var(--border)",
                        color: email === acc.email ? "var(--primary-dark)" : "var(--text-primary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                <input
                  type="email"
                  className="input"
                  style={{ paddingLeft: "40px" }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  style={{ paddingLeft: "40px", paddingRight: "40px" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (mode === "register" && !selectedRole)}
              className="btn btn-primary btn-lg"
              style={{
                width: "100%",
                fontSize: "14px",
                padding: "12px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In to PeriX" : "Create Supply Chain Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            {mode === "login" ? "Need a new account? " : "Already registered? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "select-role" : "login");
                setError("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              {mode === "login" ? "Register role" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleSelectionView({
  onSelect,
  loading,
}: {
  onSelect: (role: UserRole) => void;
  loading: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background: "var(--background)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "36px" }} className="animate-fade-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
          <Leaf size={32} color="var(--primary)" />
          <span style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)" }}>PeriX</span>
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
          Select Your Supply Chain Role
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Your dashboard, AI models, and rebalancing options will be customized to your persona
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          maxWidth: "1100px",
          width: "100%",
        }}
        className="stagger-children"
      >
        {roleConfig.map(({ role, icon: Icon, label, description, color, badge, bgGradient }) => (
          <button
            key={role}
            onClick={() => onSelect(role)}
            disabled={loading}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "28px 20px",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              cursor: "pointer",
              transition: "all 0.25s ease",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              e.currentTarget.style.borderColor = color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: bgGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "14px",
              }}
            >
              <Icon size={26} color={color} />
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color,
                background: `${color}15`,
                padding: "2px 8px",
                borderRadius: "12px",
                marginBottom: "8px",
              }}
            >
              {badge}
            </span>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "var(--text-primary)",
                marginBottom: "6px",
              }}
            >
              {label}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              {description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
