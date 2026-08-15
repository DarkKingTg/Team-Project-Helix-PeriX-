"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { useI18n, Locale } from "@/lib/i18n-context";
import {
  Settings,
  Globe,
  User,
  ShieldCheck,
  Moon,
  Sun,
  Sprout,
  Store,
  Truck,
  ShoppingCart,
  CheckCircle2,
  Save,
  MapPin,
  Building,
  Phone,
  Mail,
  Building2,
  Package,
  ThermometerSnowflake,
  Zap,
} from "lucide-react";

const LANGUAGES: { code: Locale; name: string; native: string }[] = [
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

const ROLES: { role: UserRole; icon: typeof Sprout; color: string }[] = [
  { role: "farmer", icon: Sprout, color: "#4CAF50" },
  { role: "mandi", icon: Store, color: "#FF9800" },
  { role: "wholesaler", icon: Truck, color: "#2196F3" },
  { role: "retailer", icon: Zap, color: "#9C27B0" },
  { role: "admin", icon: ShieldCheck, color: "#F44336" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, switchRole, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isWarehousePersonnel = profile?.role === "wholesaler" || profile?.role === "mandi";

  const handleLanguageChange = (code: Locale) => {
    setLocale(code);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const [profileForm, setProfileForm] = useState({
    displayName: profile?.displayName || user?.displayName || "",
    contactPerson: profile?.contactPerson || profile?.displayName || user?.displayName || "",
    phone: profile?.phone || "",
    warehouseName: profile?.warehouseName || (isWarehousePersonnel ? (profile?.role === "wholesaler" ? "Central Wholesale Depot" : "APMC Aggregation Hub") : ""),
    facilityAddress: profile?.facilityAddress || "",
    storageCapacityTonnes: profile?.storageCapacityTonnes || (isWarehousePersonnel ? 100 : 0),
    availableCapacityTonnes: profile?.availableCapacityTonnes || (isWarehousePersonnel ? 100 : 0),
    hasColdStorage: profile?.hasColdStorage ?? true,
    email: profile?.email || user?.email || "",
    state: profile?.location?.state || "Tamil Nadu",
    district: profile?.location?.district || "Coimbatore",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm((prev) => ({
        ...prev,
        displayName: profile.displayName || user?.displayName || prev.displayName,
        contactPerson: profile.contactPerson || profile.displayName || user?.displayName || prev.contactPerson,
        phone: profile.phone ?? prev.phone,
        warehouseName: profile.warehouseName ?? prev.warehouseName,
        facilityAddress: profile.facilityAddress ?? prev.facilityAddress,
        storageCapacityTonnes: profile.storageCapacityTonnes ?? prev.storageCapacityTonnes,
        availableCapacityTonnes: profile.availableCapacityTonnes ?? prev.availableCapacityTonnes,
        hasColdStorage: profile.hasColdStorage ?? prev.hasColdStorage,
        email: profile.email || user?.email || prev.email,
        state: profile.location?.state || prev.state,
        district: profile.location?.district || prev.district,
      }));
    }
  }, [profile, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      displayName: profileForm.displayName,
      contactPerson: profileForm.contactPerson,
      phone: profileForm.phone,
      warehouseName: profileForm.warehouseName,
      facilityAddress: profileForm.facilityAddress,
      storageCapacityTonnes: Number(profileForm.storageCapacityTonnes),
      availableCapacityTonnes: Number(profileForm.availableCapacityTonnes),
      hasColdStorage: profileForm.hasColdStorage,
      email: profileForm.email,
      location: {
        state: profileForm.state,
        district: profileForm.district,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="page-container" style={{ maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)" }}>
          {t("settings.title", "Preferences & Network Settings")}
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          {t("settings.subtitle", "Customize your supply chain role viewpoint, regional language & business coordinates")}
        </p>
      </div>

      {savedSuccess && (
        <div
          className="animate-fade-in"
          style={{
            background: "rgba(76,175,80,0.15)",
            border: "1px solid rgba(76,175,80,0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
            color: "var(--primary-dark)",
            fontSize: "14px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={20} color="var(--primary)" />
          <span>Preferences and warehouse contact profile updated successfully across the network.</span>
        </div>
      )}

      {/* 1. Supply Chain Persona Viewpoint Switcher */}
      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Building size={20} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              Active Supply Chain Persona
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Switch perspectives to simulate how each stakeholder accesses inventory, pricing, and rebalancing contacts
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          {ROLES.map(({ role: r, icon: Icon, color }) => {
            const isSelected = profile?.role === r;
            return (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                style={{
                  padding: "14px 12px",
                  borderRadius: "12px",
                  border: isSelected ? `2px solid ${color}` : "1px solid var(--border)",
                  background: isSelected ? `${color}12` : "var(--surface)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={color} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: isSelected ? "700" : "500", color: isSelected ? color : "var(--text-primary)", textTransform: "capitalize" }}>
                  {t(`roles.${r}`, r)}
                </span>
                {isSelected && <span className="badge badge-success" style={{ fontSize: "10px", padding: "2px 6px" }}>Active View</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Regional Languages */}
      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Globe size={20} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              {t("settings.language", "Regional Display Language")}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Select your preferred Indian regional language for instant application translation
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
          {LANGUAGES.map((lang) => {
            const isSelected = locale === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                style={{
                  padding: "12px 10px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: isSelected ? "var(--primary-50)" : "var(--surface)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "700", color: isSelected ? "var(--primary-dark)" : "var(--text-primary)" }}>
                  {lang.native}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  {lang.name}
                </span>
                {isSelected && <CheckCircle2 size={14} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Theme Preferences */}
      <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <Sun size={20} color="var(--primary)" />
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
            {t("settings.theme", "Theme Preferences")}
          </h3>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setTheme("light")}
            className={`btn ${theme === "light" ? "btn-primary" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Sun size={16} /> {t("common.lightMode", "Light Mode")}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`btn ${theme === "dark" ? "btn-primary" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Moon size={16} /> {t("common.darkMode", "Dark Mode")}
          </button>
        </div>
      </div>

      {/* 4. Profile & Warehouse Contact Registry */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          {isWarehousePersonnel ? <Building2 size={22} color="var(--primary)" /> : <User size={20} color="var(--primary)" />}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>
              {isWarehousePersonnel
                ? "Warehouse & Wholesale Facility Contact Profile"
                : t("settings.profile", "Profile & Node Location Coordinates")}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {isWarehousePersonnel
                ? "Your contact details and buffer capacity are shown to other warehouse personnel for direct peer-to-peer stock rebalancing."
                : "Manage your account identity and regional location."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            {isWarehousePersonnel ? (
              <>
                <div>
                  <label className="label">Warehouse / Facility Name</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.warehouseName}
                    onChange={(e) => setProfileForm({ ...profileForm, warehouseName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Facility Manager / Contact Person Name</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.contactPerson}
                    onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Contact Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    className="input"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98421 77320"
                    required
                  />
                </div>

                <div>
                  <label className="label">Official Email</label>
                  <input
                    type="email"
                    className="input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="label">Warehouse Facility Address</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.facilityAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, facilityAddress: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Total Storage Capacity (Tonnes)</label>
                  <input
                    type="number"
                    className="input"
                    value={profileForm.storageCapacityTonnes}
                    onChange={(e) => setProfileForm({ ...profileForm, storageCapacityTonnes: Number(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="label">Available Buffer Space (Tonnes)</label>
                  <input
                    type="number"
                    className="input"
                    value={profileForm.availableCapacityTonnes}
                    onChange={(e) => setProfileForm({ ...profileForm, availableCapacityTonnes: Number(e.target.value) })}
                    required
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <input
                    type="checkbox"
                    id="hasColdStorage"
                    checked={profileForm.hasColdStorage}
                    onChange={(e) => setProfileForm({ ...profileForm, hasColdStorage: e.target.checked })}
                    style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  />
                  <label htmlFor="hasColdStorage" style={{ fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                    Equipped with Temperature-Controlled Cold Storage
                  </label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label">{t("auth.name", "Entity / User Display Name")}</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t("auth.email", "Contact Email")}</label>
                  <input
                    type="email"
                    className="input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t("farmer.state", "State")}</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t("farmer.district", "District")}</label>
                  <input
                    type="text"
                    className="input"
                    value={profileForm.district}
                    onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Save size={16} /> {t("settings.saveProfile", "Save Preferences")}
          </button>
        </form>
      </div>
    </div>
  );
}
