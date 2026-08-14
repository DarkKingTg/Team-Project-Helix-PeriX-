"use client";

import { useState } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  X,
  MessageSquare,
  ShieldCheck,
  Package,
  ThermometerSnowflake,
  ExternalLink,
} from "lucide-react";

export interface WarehouseContactInfo {
  warehouseName: string;
  managerName: string;
  phone: string;
  email: string;
  address: string;
  role: "wholesaler" | "mandi";
  surplusCommodity?: string;
  surplusQuantityKg?: number;
  availableCapacityTonnes?: number;
  hasColdStorage?: boolean;
}

interface WarehouseContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: WarehouseContactInfo | null;
}

export function WarehouseContactModal({
  isOpen,
  onClose,
  warehouse,
}: WarehouseContactModalProps) {
  if (!isOpen || !warehouse) return null;

  const cleanPhone = warehouse.phone.replace(/[^0-9+]/g, "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "28px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(33,150,243,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1976D2",
              }}
            >
              <Building2 size={26} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)" }}>
                  {warehouse.warehouseName || "Warehouse Facility"}
                </h3>
                <span className="badge badge-success">Verified Hub</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                Managed by {warehouse.managerName || "Facility Manager"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ padding: "6px", borderRadius: "8px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stock / Capacity Info Badge */}
        {(warehouse.surplusQuantityKg || warehouse.availableCapacityTonnes) && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(46,125,50,0.1), rgba(33,150,243,0.08))",
              border: "1px solid rgba(46,125,50,0.25)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {warehouse.surplusCommodity && (
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: "600" }}>
                    Available Surplus Produce
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary-dark)" }}>
                    {warehouse.surplusQuantityKg?.toLocaleString()} kg {warehouse.surplusCommodity}
                  </div>
                </div>
              )}

              {warehouse.availableCapacityTonnes !== undefined && (
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: "600" }}>
                    Available Buffer Storage
                  </span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#1565C0" }}>
                    {warehouse.availableCapacityTonnes} Tonnes
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Details Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {/* Phone */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "var(--surface-hover)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Phone size={18} color="var(--primary)" />
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Direct Phone / Voice</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  {warehouse.phone || "+91 98421 77320"}
                </div>
              </div>
            </div>
            <a
              href={`tel:${cleanPhone || "+919842177320"}`}
              className="btn btn-sm btn-primary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Call Now
            </a>
          </div>

          {/* WhatsApp */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "var(--surface-hover)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MessageSquare size={18} color="#25D366" />
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>WhatsApp Instant Dispatch</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  {warehouse.phone || "+91 98421 77320"}
                </div>
              </div>
            </div>
            <a
              href={`https://wa.me/${cleanPhone.replace("+", "") || "919842177320"}?text=Hello%20${encodeURIComponent(warehouse.managerName || "Manager")},%20I%20saw%20your%20warehouse%20inventory%20on%20PeriX%20and%20would%20like%20to%20coordinate%20a%20produce%20rebalancing%20transfer.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              WhatsApp
            </a>
          </div>

          {/* Email */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "var(--surface-hover)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Mail size={18} color="#1565C0" />
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Official Email</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  {warehouse.email || "dispatch@perix-warehouse.in"}
                </div>
              </div>
            </div>
            <a
              href={`mailto:${warehouse.email || "dispatch@perix-warehouse.in"}?subject=PeriX Produce Rebalancing Request`}
              className="btn btn-sm btn-ghost"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Email
            </a>
          </div>

          {/* Facility Location Address */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "var(--surface-hover)",
              border: "1px solid var(--border)",
            }}
          >
            <MapPin size={18} color="var(--primary)" style={{ marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Facility Physical Address</div>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", marginTop: "2px" }}>
                {warehouse.address || "APMC Agro Cluster Phase II, Coimbatore, Tamil Nadu 641004"}
              </div>
            </div>
          </div>
        </div>

        {/* Notice for P2P Inter-Warehouse Transfer */}
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", textAlign: "center", margin: 0 }}>
          Direct peer-to-peer warehouse rebalancing. Connect with the facility manager to lock consignment quantities and schedule reefer pickups.
        </p>
      </div>
    </div>
  );
}
