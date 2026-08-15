"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Package,
  Truck,
  Store,
  CheckCircle2,
  Clock,
  IndianRupee,
  ThermometerSnowflake,
  ShieldCheck,
  Send,
  Plus,
  X,
  Building2,
  Phone,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useI18n } from "@/lib/i18n-context";

import {
  saveDocument,
  updateDocument,
  subscribeCollection,
} from "@/lib/firestore-helpers";

export interface WholesalerReceivedItem {
  id: string;
  commodity: string;
  quantity: number;
  qualityGrade: string;
  buyPrice: number;
  sellPrice: number;
  storageType: string;
  coldChain: boolean;
  expiryDays: number;
  originWarehouse: string;
  destinationNode?: string;
  orderNumber?: string;
  status: string;
  allocatedRetailer?: string;
  allocatedQuantity?: number;
  receivedDate: string;
  userId?: string;
}

const RETAILER_DESTINATIONS = [
  "FreshMart Supermarket Chain - Chennai Metro",
  "Nilgiris Daily Groceries - Coimbatore West",
  "Reliance Smart Hypermarket - Tiruppur Center",
  "BigBasket Dark Store Fulfillment - Bengaluru",
  "Metro Cash & Carry Retail Hub - Chennai",
  "Green Grocers Express - Erode Central",
];

export default function WholesalerPage() {
  const { user, profile, switchRole } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<WholesalerReceivedItem[]>([]);
  const [filterCommodity, setFilterCommodity] = useState<string>("all");
  const [allocateModalItem, setAllocateModalItem] = useState<WholesalerReceivedItem | null>(null);
  const [allocateForm, setAllocateForm] = useState({
    retailerName: RETAILER_DESTINATIONS[0],
    quantity: 500,
    retailPrice: 46,
    transportMode: "Temperature-Controlled Delivery Van",
  });

  const storageKey = `perix_wholesaler_received_${user?.uid || "global"}`;

  // 1. Initial Load of Wholesaler-Specific Consignments
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let loadedItems: WholesalerReceivedItem[] = [];
        const seenIds = new Set<string>();

        // Load direct wholesaler storage
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            parsed.forEach((i) => {
              if (i && i.id && !seenIds.has(i.id)) {
                seenIds.add(i.id);
                loadedItems.push(i);
              }
            });
          }
        }

        // Load confirmed dispatches sent from warehouses
        const whFeed = localStorage.getItem("perix_wholesaler_received_feed");
        if (whFeed) {
          const parsedFeed = JSON.parse(whFeed);
          if (Array.isArray(parsedFeed)) {
            parsedFeed.forEach((f) => {
              if (f && f.id && !seenIds.has(f.id)) {
                seenIds.add(f.id);
                loadedItems.unshift(f);
              }
            });
          }
        }

        // Also check wholesaler backend inventory API if available
        apiClient.inventory.getWholesalerInventory().then((res) => {
          if (res && Array.isArray(res) && res.length > 0) {
            setItems((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              const fresh = res
                .filter((r: any) => !ids.has(r.id))
                .map((r: any) => ({
                  id: r.id,
                  commodity: r.commodity,
                  quantity: Number(r.quantity || 0),
                  qualityGrade: r.qualityGrade || "A - Premium",
                  buyPrice: Number(r.buyPrice || 34),
                  sellPrice: Number(r.sellPrice || 44),
                  storageType: r.storageType || "cold_storage",
                  coldChain: !!r.coldChain,
                  expiryDays: Number(r.expiryDays || 8),
                  originWarehouse: r.destinationNode || "Warehouse Central Depot",
                  status: "Received & In Cold Storage",
                  receivedDate: new Date().toISOString().split("T")[0],
                }));
              return [...fresh, ...prev];
            });
          }
        });

        if (loadedItems.length > 0) {
          setItems(loadedItems);
        }
      } catch (err) {
        console.warn("Wholesaler feed read error:", err);
      }
    }
  }, [storageKey, user]);

  // 2. Real-time Firestore sync for wholesaler_inventory
  useEffect(() => {
    const unsubscribe = subscribeCollection<WholesalerReceivedItem>("wholesaler_inventory", (dbItems) => {
      if (dbItems && dbItems.length > 0) {
        setItems((prev) => {
          const map = new Map<string, WholesalerReceivedItem>();
          prev.forEach((i) => {
            if (i.id) map.set(i.id, i);
          });
          dbItems.forEach((i) => {
            if (i.id) map.set(i.id, { ...(map.get(i.id) || {}), ...i });
          });
          const merged = Array.from(map.values());
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(storageKey, JSON.stringify(merged));
            } catch {}
          }
          return merged;
        });
      }
    });

    return () => unsubscribe();
  }, [storageKey]);

  // Handle Allocate to Supermarket / Retail Store
  const handleConfirmRetailAllocation = async () => {
    if (!allocateModalItem) return;

    const updated = items.map((i) => {
      if (i.id === allocateModalItem.id) {
        return {
          ...i,
          status: `Allocated to: ${allocateForm.retailerName}`,
          allocatedRetailer: allocateForm.retailerName,
          allocatedQuantity: Number(allocateForm.quantity),
          sellPrice: Number(allocateForm.retailPrice),
        };
      }
      return i;
    });

    setItems(updated);

    // Create Retail Dispatch Order
    const retailOrder = {
      id: `ord-ret-${Date.now()}`,
      orderNumber: `RETAIL-${Math.floor(100000 + Math.random() * 900000)}`,
      senderNode: user?.displayName || "Wholesale Aggregation Terminal",
      receiverNode: allocateForm.retailerName,
      commodity: allocateModalItem.commodity,
      quantityKg: Number(allocateForm.quantity),
      totalAmount: Math.round(Number(allocateForm.quantity) * Number(allocateForm.retailPrice)),
      escrowStatus: "in_transit" as const,
      routeDistanceKm: 18,
      expectedDelivery: new Date(Date.now() + 43200000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      userId: user?.uid,
    };

    // Save allocation and order to Firestore
    try {
      await updateDocument("wholesaler_inventory", allocateModalItem.id, {
        status: `Allocated to: ${allocateForm.retailerName}`,
        allocatedRetailer: allocateForm.retailerName,
        allocatedQuantity: Number(allocateForm.quantity),
        sellPrice: Number(allocateForm.retailPrice),
      });
      await saveDocument("orders", retailOrder.id, retailOrder);
    } catch (err) {
      console.warn("Firestore retail allocation notice:", err);
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        localStorage.setItem("perix_wholesaler_received_feed", JSON.stringify(updated));

        const globalOrders = JSON.parse(localStorage.getItem("perix_orders_global") || "[]");
        localStorage.setItem("perix_orders_global", JSON.stringify([retailOrder, ...globalOrders]));
      } catch (e) {
        console.warn("Retail dispatch sync error:", e);
      }
    }

    setAllocateModalItem(null);
  };

  const commodities = Array.from(new Set(items.map((i) => i.commodity)));
  const filteredItems = filterCommodity === "all" ? items : items.filter((i) => i.commodity === filterCommodity);

  const totalReceivedKg = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalAllocatedKg = items.reduce((sum, i) => sum + (Number(i.allocatedQuantity) || (i.allocatedRetailer ? Number(i.quantity) : 0)), 0);
  const totalValue = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.buyPrice || 34)), 0);
  const avgCostPerKg = totalReceivedKg > 0 ? (totalValue / totalReceivedKg).toFixed(1) : "0.0";

  if (profile && profile.role !== "wholesaler" && profile.role !== "admin") {
    return (
      <div className="page-container animate-fade-in" style={{ padding: "40px 16px", maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
        <div className="card" style={{ padding: "48px 32px", border: "1px dashed rgba(33,150,243,0.4)", background: "var(--surface)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(33,150,243,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Truck size={32} color="#2196F3" />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
            {t("wholesaler.title", "Wholesaler Inward Hub & Retail Consignment Console")}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
            {t("roles.roleRestrictedDesc", "This dashboard is exclusively dedicated to the active role.")} ({t("roles.wholesaler", "Wholesaler")}).
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              style={{ background: "#2196F3", borderColor: "#2196F3", color: "#fff", fontWeight: "700", gap: "8px", padding: "10px 24px" }}
              onClick={() => switchRole("wholesaler")}
            >
              <Truck size={18} /> {t("roles.switchPersona", "Switch Role")} → {t("roles.wholesaler", "Wholesaler")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: "8px 0" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              {t("wholesaler.title", "Wholesaler Inward Hub & Retail Consignment Console")}
            </h1>
            <span className="badge badge-info">{t("roles.wholesaler", "Wholesaler Hub")}</span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {t("wholesaler.subtitle", "Live tracking of confirmed produce dispatches received from regional cold storage warehouses, quality inspection, and retail chain allocation.")}
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("wholesaler.totalReceived", "Total Received from Warehouses")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#1976D2" }}>
            {totalReceivedKg.toLocaleString()} {t("common.kg", "kg")}
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{t("nav.inventory", "Warehouse Dispatches")}</span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("wholesaler.allocatedSupermarkets", "Allocated to Supermarkets")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--primary)" }}>
            {totalAllocatedKg.toLocaleString()} {t("common.kg", "kg")}
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
            {totalReceivedKg > 0 ? `${((totalAllocatedKg / totalReceivedKg) * 100).toFixed(1)}% ${t("wholesaler.allocated", "channeled to retail")}` : "0%"}
          </span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("wholesaler.avgProcurementRate", "Avg Procurement Rate")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
            ₹{avgCostPerKg} / kg
          </h3>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{t("inventory.procurementRate", "Acquisition cost")}</span>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t("wholesaler.activeBatches", "Active Consignment Batches")}</p>
          <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#E65100" }}>
            {items.length} {t("common.status", "Batches")}
          </h3>
          <span style={{ fontSize: "11px", color: "#E65100" }}>{t("wholesaler.inColdStorage", "In Cold Storage")}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      {commodities.length > 1 && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
          <button
            onClick={() => setFilterCommodity("all")}
            className={`btn ${filterCommodity === "all" ? "btn-primary" : "btn-secondary"}`}
            style={{ fontSize: "12px", padding: "6px 14px" }}
          >
            {t("common.all", "All Produce")} ({items.length})
          </button>
          {commodities.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCommodity(c)}
              className={`btn ${filterCommodity === c ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "12px", padding: "6px 14px" }}
            >
              {c} ({items.filter((i) => i.commodity === c).length})
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center", border: "1px dashed var(--border)", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(33,150,243,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Truck size={28} color="#1976D2" />
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)" }}>
            {t("wholesaler.emptyTitle", "No Warehouse Consignments Received Yet")}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto" }}>
            {t("wholesaler.emptyDesc", "Dispatches confirmed by regional warehouse operators will automatically stream into this console with live cold-chain telemetry.")}
          </p>
        </div>
      )}

      {/* Main Received Consignments Table */}
      {items.length > 0 && (
        <div className="card" style={{ padding: "20px", overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              {t("wholesaler.title", "Received Warehouse Shipments & Retail Distribution")}
            </h3>
            <span className="badge badge-success">{filteredItems.length} {t("common.available", "Available")}</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>{t("wholesaler.commodity", "Commodity")}</th>
                <th>{t("wholesaler.quantityReceived", "Quantity Received")}</th>
                <th>{t("wholesaler.qualityGrade", "Quality Grade")}</th>
                <th>{t("wholesaler.dispatchedBy", "Dispatched By Warehouse")}</th>
                <th>{t("wholesaler.wholesaleBuyRate", "Wholesale Buy Rate")}</th>
                <th>{t("wholesaler.targetRetailRate", "Target Retail Rate")}</th>
                <th>{t("wholesaler.estimatedShelfLife", "Estimated Shelf Life")}</th>
                <th>{t("wholesaler.status", "Status / Allocation")}</th>
                <th>{t("wholesaler.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isAllocated = !!item.allocatedRetailer || item.status.includes("Allocated to");
                const isNearExpiry = (item.expiryDays || 8) <= 3;

                return (
                  <tr key={item.id}>
                    {/* Commodity */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(33,150,243,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Package size={16} color="#1976D2" />
                        </div>
                        <div>
                          <span style={{ fontWeight: "600" }}>{item.commodity}</span>
                          {item.coldChain && (
                            <span style={{ display: "block", fontSize: "11px", color: "#2196F3" }}>{t("inventory.coldChainActive", "Reefer Cold Chain")}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                      {item.quantity.toLocaleString()} {t("common.kg", "kg")}
                    </td>

                    {/* Quality */}
                    <td>
                      <span className="badge badge-success">{item.qualityGrade}</span>
                    </td>

                    {/* Dispatched By */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Building2 size={13} color="#1565C0" />
                        <strong style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                          {item.originWarehouse || "Regional Agro Cold Hub"}
                        </strong>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                        {t("common.date", "Received")}: {item.receivedDate}
                      </span>
                    </td>

                    {/* Buy Rate */}
                    <td>
                      <span style={{ fontWeight: "600" }}>₹{item.buyPrice}/kg</span>
                    </td>

                    {/* Target Retail Rate */}
                    <td>
                      <span style={{ fontWeight: "600", color: "var(--primary)" }}>₹{item.sellPrice || Math.round(item.buyPrice * 1.2)}/kg</span>
                    </td>

                    {/* Shelf Life */}
                    <td>
                      <span className={`badge ${isNearExpiry ? "badge-warning" : "badge-info"}`}>
                        {item.expiryDays || 8} {t("common.days", "days")}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      {isAllocated ? (
                        <div>
                          <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Store size={11} /> {t("wholesaler.allocated", "Allocated")}
                          </span>
                          <span style={{ display: "block", fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", maxWidth: "170px" }}>
                            {item.allocatedRetailer || "Supermarket Chain"}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-info">
                          <CheckCircle2 size={11} style={{ marginRight: "4px" }} />
                          {t("wholesaler.inColdStorage", "In Cold Storage")}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      {!isAllocated ? (
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: "11px", padding: "4px 8px", gap: "4px" }}
                          onClick={() => {
                            setAllocateModalItem(item);
                            setAllocateForm({
                              retailerName: RETAILER_DESTINATIONS[0],
                              quantity: item.quantity,
                              retailPrice: item.sellPrice || Math.round(item.buyPrice * 1.25),
                              transportMode: "Temperature-Controlled Delivery Van",
                            });
                          }}
                        >
                          <Store size={12} /> {t("wholesaler.allocateToSupermarket", "Allocate to Supermarket")}
                        </button>
                      ) : (
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontStyle: "italic" }}>
                          {t("wholesaler.allocated", "Dispatched to Retail")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocate to Retail Modal */}
      {allocateModalItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setAllocateModalItem(null)}
        >
          <div
            className="card animate-scale-in"
            style={{
              maxWidth: "540px",
              width: "100%",
              padding: "24px",
              border: "2px solid var(--primary)",
              background: "var(--surface)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Store size={22} color="var(--primary)" />
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  {t("wholesaler.modalTitle", "Allocate Consignment to Supermarket Chain")}
                </h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setAllocateModalItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "rgba(33,150,243,0.06)", padding: "12px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
              <p style={{ margin: 0, color: "var(--text-primary)" }}>
                <strong>{t("wholesaler.commodity", "Batch Produce")}:</strong> {allocateModalItem.quantity} kg of {allocateModalItem.commodity} ({allocateModalItem.qualityGrade})
              </p>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)" }}>
                <strong>{t("wholesaler.wholesaleBuyRate", "Wholesale Acquisition Cost")}:</strong> ₹{allocateModalItem.buyPrice}/kg (from {allocateModalItem.originWarehouse})
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <label className="label" style={{ fontWeight: "700" }}>{t("wholesaler.destinationSupermarket", "Destination Supermarket / Retail Chain")}</label>
                <select
                  className="input"
                  value={allocateForm.retailerName}
                  onChange={(e) => setAllocateForm({ ...allocateForm, retailerName: e.target.value })}
                >
                  {RETAILER_DESTINATIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" style={{ fontWeight: "700" }}>{t("wholesaler.allocationQuantity", "Allocation Quantity (kg)")}</label>
                <input
                  type="number"
                  className="input"
                  value={allocateForm.quantity}
                  onChange={(e) => setAllocateForm({ ...allocateForm, quantity: Number(e.target.value) })}
                  max={allocateModalItem.quantity}
                  min={1}
                  required
                  style={{ border: "2px solid var(--primary)", fontWeight: "700" }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                  {t("common.available", "Available")}: {allocateModalItem.quantity.toLocaleString()} {t("common.kg", "kg")}
                </span>
              </div>

              <div>
                <label className="label" style={{ fontWeight: "700" }}>{t("wholesaler.retailPrice", "Retail Shelf Price (₹/kg)")}</label>
                <input
                  type="number"
                  className="input"
                  value={allocateForm.retailPrice}
                  onChange={(e) => setAllocateForm({ ...allocateForm, retailPrice: Number(e.target.value) })}
                  required
                  style={{ border: "2px solid var(--primary)", fontWeight: "700" }}
                />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>
                  {t("orders.totalValuation", "Retail Turnover")}: ₹{(allocateForm.quantity * allocateForm.retailPrice).toLocaleString()}
                </span>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label className="label">{t("wholesaler.deliveryVan", "Delivery Fleet / Refrigerated Van")}</label>
                <input
                  type="text"
                  className="input"
                  value={allocateForm.transportMode}
                  onChange={(e) => setAllocateForm({ ...allocateForm, transportMode: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setAllocateModalItem(null)}>
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmRetailAllocation}
              >
                <Store size={16} /> {t("wholesaler.confirmAllocation", "Confirm Supermarket Allocation")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
