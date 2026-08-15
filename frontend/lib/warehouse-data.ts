export interface WarehouseFacility {
  id: string;
  warehouseName: string;
  managerName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  state: string;
  role: "wholesaler" | "mandi";
  storageType: "cold_storage" | "warehouse" | "controlled_atmosphere";
  hasColdStorage: boolean;
  temperatureRange: string;
  availableCapacityTonnes: number;
  totalCapacityTonnes: number;
  surplusCommodity?: string;
  surplusQuantityKg?: number;
  status: "Operational" | "Surplus Available" | "High Intake" | "Near Capacity";
}

export const AVAILABLE_WAREHOUSES: WarehouseFacility[] = [
  {
    id: "wh-coimbatore-01",
    warehouseName: "Kovai Agro Hub & Cold Storage",
    managerName: "Suresh Kumar",
    phone: "+91 98421 77320",
    email: "suresh.kovai@perix-logistics.in",
    address: "Plot 42, APMC Industrial Cluster, Coimbatore",
    district: "Coimbatore",
    state: "Tamil Nadu",
    role: "wholesaler",
    storageType: "cold_storage",
    hasColdStorage: true,
    temperatureRange: "2°C - 4°C",
    availableCapacityTonnes: 120,
    totalCapacityTonnes: 300,
    surplusCommodity: "Tomato",
    surplusQuantityKg: 4200,
    status: "Surplus Available",
  },
  {
    id: "wh-nilgiris-02",
    warehouseName: "Nilgiris Fresh Harvest Consolidation Center",
    managerName: "Anand Rajan",
    phone: "+91 94432 11890",
    email: "anand.nilgiris@perix-logistics.in",
    address: "Mettupalayam Agro Cold Terminal",
    district: "Mettupalayam",
    state: "Tamil Nadu",
    role: "mandi",
    storageType: "cold_storage",
    hasColdStorage: true,
    temperatureRange: "0°C - 4°C",
    availableCapacityTonnes: 240,
    totalCapacityTonnes: 500,
    surplusCommodity: "Potato",
    surplusQuantityKg: 8500,
    status: "Surplus Available",
  },
  {
    id: "wh-tiruppur-03",
    warehouseName: "Tiruppur Wholesale Buffer Terminal",
    managerName: "Vignesh Murugan",
    phone: "+91 98940 55214",
    email: "vignesh.tiruppur@perix-logistics.in",
    address: "Ring Road Logistics Park, Tiruppur",
    district: "Tiruppur",
    state: "Tamil Nadu",
    role: "wholesaler",
    storageType: "warehouse",
    hasColdStorage: false,
    temperatureRange: "18°C - 24°C",
    availableCapacityTonnes: 85,
    totalCapacityTonnes: 250,
    surplusCommodity: "Onion",
    surplusQuantityKg: 6200,
    status: "Operational",
  },
  {
    id: "wh-koyambedu-04",
    warehouseName: "Koyambedu Wholesale Aggregation Depot",
    managerName: "K. Ranganathan",
    phone: "+91 98401 23456",
    email: "ranganathan.koyambedu@perix-logistics.in",
    address: "Gate 4, Wholesale Market Complex, Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    role: "wholesaler",
    storageType: "cold_storage",
    hasColdStorage: true,
    temperatureRange: "2°C - 6°C",
    availableCapacityTonnes: 350,
    totalCapacityTonnes: 800,
    surplusCommodity: "Banana",
    surplusQuantityKg: 12000,
    status: "Operational",
  },
  {
    id: "wh-yeshwanthpur-05",
    warehouseName: "Yeshwanthpur APMC Logistics Hub",
    managerName: "Mohan Gowda",
    phone: "+91 98801 87654",
    email: "mohan.yeshwanthpur@perix-logistics.in",
    address: "Subhash Nagar APMC Yard, Bengaluru",
    district: "Bengaluru",
    state: "Karnataka",
    role: "wholesaler",
    storageType: "cold_storage",
    hasColdStorage: true,
    temperatureRange: "1°C - 4°C",
    availableCapacityTonnes: 280,
    totalCapacityTonnes: 650,
    surplusCommodity: "Green Chilli",
    surplusQuantityKg: 5400,
    status: "Operational",
  },
  {
    id: "wh-madanapalle-06",
    warehouseName: "Madanapalle APMC Perishable Terminal",
    managerName: "V. Sudhakar",
    phone: "+91 94402 34567",
    email: "sudhakar.mpalle@perix-logistics.in",
    address: "Tomato Yard Road, Madanapalle",
    district: "Chittoor",
    state: "Andhra Pradesh",
    role: "mandi",
    storageType: "cold_storage",
    hasColdStorage: true,
    temperatureRange: "4°C - 8°C",
    availableCapacityTonnes: 200,
    totalCapacityTonnes: 450,
    surplusCommodity: "Tomato",
    surplusQuantityKg: 9800,
    status: "High Intake",
  },
  {
    id: "wh-lasalgaon-07",
    warehouseName: "Lasalgaon Multi-Commodity Warehouse",
    managerName: "Nitin Patil",
    phone: "+91 98220 67890",
    email: "nitin.lasalgaon@perix-logistics.in",
    address: "Station Road APMC Complex, Lasalgaon, Nashik",
    district: "Nashik",
    state: "Maharashtra",
    role: "mandi",
    storageType: "warehouse",
    hasColdStorage: false,
    temperatureRange: "16°C - 22°C",
    availableCapacityTonnes: 400,
    totalCapacityTonnes: 900,
    surplusCommodity: "Onion",
    surplusQuantityKg: 18000,
    status: "Surplus Available",
  },
  {
    id: "wh-azadpur-08",
    warehouseName: "Azadpur National Cold Hub",
    managerName: "Rakesh Sharma",
    phone: "+91 98110 56789",
    email: "rakesh.azadpur@perix-logistics.in",
    address: "Block C, Azadpur Mandi, New Delhi",
    district: "Delhi",
    state: "Delhi",
    role: "wholesaler",
    storageType: "cold_storage",
    hasColdStorage: true,
    temperatureRange: "0°C - 4°C",
    availableCapacityTonnes: 500,
    totalCapacityTonnes: 1200,
    surplusCommodity: "Apple",
    surplusQuantityKg: 25000,
    status: "Operational",
  },
];

export function getAvailableWarehouses(): WarehouseFacility[] {
  return AVAILABLE_WAREHOUSES;
}

export function getWarehouseById(id: string): WarehouseFacility | undefined {
  return AVAILABLE_WAREHOUSES.find((w) => w.id === id);
}

export function getWarehouseByName(name: string): WarehouseFacility | undefined {
  return AVAILABLE_WAREHOUSES.find((w) => w.warehouseName.toLowerCase() === name.toLowerCase());
}
