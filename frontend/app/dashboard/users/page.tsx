"use client";

import { useState } from "react";
import {
  ShieldCheck,
  User,
  Sprout,
  Store,
  Truck,
  ShoppingCart,
  Search,
  CheckCircle2,
  Lock,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useAuth, UserRole } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  activeItemsCount: number;
  totalVolumeTonnes: number;
  joinedDate: string;
  status: "verified" | "pending";
}

const SAMPLE_USERS: UserRecord[] = [
  {
    id: "usr-1",
    name: "Ramesh Patel (FPO Lead)",
    email: "ramesh.farmer@perix.in",
    role: "farmer",
    location: "Pollachi, Coimbatore, Tamil Nadu",
    activeItemsCount: 4,
    totalVolumeTonnes: 14.5,
    joinedDate: "02-Aug-2026",
    status: "verified",
  },
  {
    id: "usr-2",
    name: "Kovai APMC Mandi Aggregator",
    email: "coimbatore.mandi@perix.in",
    role: "mandi",
    location: "Mettupalayam Road, Coimbatore",
    activeItemsCount: 12,
    totalVolumeTonnes: 84.0,
    joinedDate: "15-Jul-2026",
    status: "verified",
  },
  {
    id: "usr-3",
    name: "Apex Agro Wholesalers Hub",
    email: "southagro.wholesaler@perix.in",
    role: "wholesaler",
    location: "Avinashi Road, Tiruppur",
    activeItemsCount: 18,
    totalVolumeTonnes: 140.0,
    joinedDate: "20-Jun-2026",
    status: "verified",
  },
  {
    id: "usr-4",
    name: "FreshMart Organic Retail",
    email: "freshmart.retail@perix.in",
    role: "retailer",
    location: "Anna Nagar, Chennai Metro",
    activeItemsCount: 8,
    totalVolumeTonnes: 4.8,
    joinedDate: "01-Aug-2026",
    status: "verified",
  },
  {
    id: "usr-5",
    name: "Salem Green Agro Cold Chain",
    email: "salem.cold@perix.in",
    role: "wholesaler",
    location: "Omalur Highway, Salem",
    activeItemsCount: 9,
    totalVolumeTonnes: 65.0,
    joinedDate: "10-Aug-2026",
    status: "verified",
  },
];

export default function UsersManagementPage() {
  const { switchRole } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>(SAMPLE_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return <ShoppingCart size={16} color="#9C27B0" />;
      case "admin":
        return <ShieldCheck size={16} color="#F44336" />;
    }
  };

  const handleInspectAsRole = (role: UserRole) => {
    switchRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
              Network Participant & Node Oversight
            </h2>
            <span className="badge badge-success">Admin Superuser</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Monitor node registrations, active commodity tonnage & cross-tier access permissions
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: "36px" }}
            placeholder="Search participant nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "All Participants" },
          { key: "farmer", label: "Farmers" },
          { key: "mandi", label: "Mandi Agents" },
          { key: "wholesaler", label: "Wholesalers" },
          { key: "retailer", label: "Retailers" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterRole(tab.key)}
            className={`btn btn-sm ${filterRole === tab.key ? "btn-primary" : "btn-secondary"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: "20px", overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Node / Participant</th>
              <th>Tier Role</th>
              <th>Geographic Hub</th>
              <th>Active Inventory</th>
              <th>Total Throughput</th>
              <th>Status</th>
              <th>Admin Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div>
                    <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{user.name}</span>
                    <span style={{ display: "block", fontSize: "12px", color: "var(--text-tertiary)" }}>{user.email}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {getRoleIcon(user.role)}
                    <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{user.role}</span>
                  </div>
                </td>
                <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={13} color="var(--primary)" />
                    {user.location}
                  </div>
                </td>
                <td style={{ fontWeight: "600" }}>{user.activeItemsCount} batches</td>
                <td style={{ fontWeight: "700", color: "var(--primary)" }}>{user.totalVolumeTonnes} T</td>
                <td>
                  <span className="badge badge-success" style={{ gap: "4px" }}>
                    <CheckCircle2 size={12} /> Verified Node
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleInspectAsRole(user.role)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: "4px", fontSize: "11px" }}
                  >
                    Inspect Dashboard <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
