"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  Sprout,
  Store,
  Truck,
  Zap,
  ShoppingCart,
  Search,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  ExternalLink,
  Users,
} from "lucide-react";
import { useAuth, UserRole } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n-context";

interface UserRecord {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  location: string;
  isDemo?: boolean;
  createdAt?: any;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const { user, profile, switchRole } = useAuth();
  const { t } = useI18n();
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    try {
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (isMounted) {
            if (!snapshot.empty) {
              const uData: UserRecord[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  uid: doc.id,
                  displayName: data.displayName || data.name || "Participant Node",
                  email: data.email || "node@perix.in",
                  role: (data.role || "farmer") as UserRole,
                  location: data.district ? `${data.district}, ${data.state}` : (data.location?.district ? `${data.location.district}, ${data.location.state}` : "Tamil Nadu, India"),
                  isDemo: data.isDemo || false,
                  createdAt: data.createdAt,
                };
              });
              setUsersList(uData);
            } else {
              // Fallback to active current user
              if (profile) {
                setUsersList([
                  {
                    uid: user?.uid || "current-node",
                    displayName: profile.displayName || "System Administrator",
                    email: profile.email || "admin@perix.in",
                    role: (profile.role || "admin") as UserRole,
                    location: `${profile.district || "Chennai"}, ${profile.state || "Tamil Nadu"}`,
                    isDemo: profile.isDemo || false,
                  },
                ]);
              }
            }
            setLoading(false);
          }
        },
        () => {
          if (isMounted) setLoading(false);
        }
      );
      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch {
      if (isMounted) setLoading(false);
    }
  }, [profile, user]);

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "farmer":
        return <Sprout size={16} color="#4CAF50" />;
      case "mandi":
        return <Store size={16} color="#FF9800" />;
      case "wholesaler":
        return <Truck size={16} color="#2196F3" />;
      case "retailer":
        return <Zap size={16} color="#9C27B0" />;
      case "admin":
        return <ShieldCheck size={16} color="#F44336" />;
      default:
        return <Users size={16} color="#9E9E9E" />;
    }
  };

  const handleInspectAsRole = (role: UserRole) => {
    switchRole(role);
    if (role === "farmer") router.push("/dashboard/crops");
    else if (role === "mandi") router.push("/dashboard/inventory");
    else if (role === "wholesaler") router.push("/dashboard/wholesaler");
    else if (role === "retailer") router.push("/dashboard/pricing");
    else router.push("/dashboard");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              {t("users.title", "Network Participant and Node Oversight")}
            </h2>
            <span className="badge badge-success">Admin Superuser</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("users.subtitle", "Monitor real node registrations, active commodity tonnage, and cross-tier access permissions.")}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: "42px" }}
            placeholder="Search by participant name, email, or regional node..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
          {["all", "farmer", "mandi", "wholesaler", "retailer", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`btn btn-sm ${filterRole === r ? "btn-primary" : "btn-secondary"}`}
              style={{ textTransform: "capitalize" }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Users size={28} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>No Participants Found</h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto" }}>
            As new farmers, mandis, and wholesalers register accounts, they will appear in this oversight registry.
          </p>
        </div>
      )}

      {/* Users Table */}
      {filteredUsers.length > 0 && (
        <div className="card" style={{ padding: "20px", overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Role Tier</th>
                <th>Regional Node</th>
                <th>Registration</th>
                <th>Verification</th>
                <th>Role View</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div>
                      <span style={{ fontWeight: "600", color: "var(--text-primary)", display: "block" }}>{u.displayName}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {getRoleIcon(u.role)}
                      <span style={{ textTransform: "capitalize", fontWeight: "600", fontSize: "13px" }}>{u.role}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={13} color="var(--text-tertiary)" />
                      {u.location}
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{u.createdAt ? "Registered" : "Active Node"}</td>
                  <td>
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Verified Node
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleInspectAsRole(u.role)}
                      title={`Switch to ${u.role} workspace view`}
                    >
                      <ExternalLink size={14} /> Switch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
