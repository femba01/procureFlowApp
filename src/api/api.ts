import type { AuditLog } from "../types/audit";
import type { DashboardData } from "../types/dashboard";
import type { DepartmentBudget, SpendRecord } from "../types/finance";
import type {
  InventoryItem,
  StockAdjustmentInput,
  StockMovement,
  Warehouse,
} from "../types/inventory";
import type {
  CreateOrderInput,
  CreateReceiptInput,
  GoodsReceipt,
  PurchaseOrder,
} from "../types/orders";
import type { Quotation } from "../types/quotations";
import type {
  CreateRequestInput,
  PurchaseRequest,
  PurchaseRequestDetails,
  RequestStatus,
} from "../types/requests";
import type { OrganisationSettings } from "../types/settings";
import type { CreateSupplierInput, Supplier } from "../types/suppliers";
import supabase from "./supabase";
let requests: PurchaseRequest[] = [
  {
    id: "PR-2026-084",
    reference: "PR-2026-084",
    requesterId: "",
    organizationId: "",
    departmentId: "",
    title: "Engineering laptops",
    department: "Technology",
    requester: "Tunde Lawson",
    amount: 4850000,
    status: "Pending approval",
    priority: "High",
    createdAt: "09 Jul 2026",
    items: 8,
  },
  {
    id: "PR-2026-083",
    reference: "PR-2026-083",
    requesterId: "",
    organizationId: "",
    departmentId: "",
    title: "Office stationery restock",
    department: "Operations",
    requester: "Amaka Okafor",
    amount: 385000,
    status: "In procurement",
    priority: "Medium",
    createdAt: "08 Jul 2026",
    items: 24,
  },
  {
    id: "PR-2026-082",
    reference: "PR-2026-082",
    requesterId: "",
    organizationId: "",
    departmentId: "",
    title: "Marketing campaign assets",
    department: "Marketing",
    requester: "David Mensah",
    amount: 1200000,
    status: "Approved",
    priority: "Medium",
    createdAt: "07 Jul 2026",
    items: 5,
  },
  {
    id: "PR-2026-081",
    reference: "PR-2026-081",
    requesterId: "",
    organizationId: "",
    departmentId: "",
    title: "Safety equipment",
    department: "Facilities",
    requester: "Sarah Ibrahim",
    amount: 760000,
    status: "Completed",
    priority: "High",
    createdAt: "05 Jul 2026",
    items: 12,
  },
  {
    id: "PR-2026-080",
    reference: "PR-2026-080",
    requesterId: "",
    organizationId: "",
    departmentId: "",
    title: "Team training subscription",
    department: "People",
    requester: "Bola James",
    amount: 540000,
    status: "Rejected",
    priority: "Low",
    createdAt: "03 Jul 2026",
    items: 1,
  },
];
const details = new Map<string, PurchaseRequestDetails>();
function hydrate(request: PurchaseRequest): PurchaseRequestDetails {
  return {
    ...request,
    businessReason:
      request.id === "PR-2026-084"
        ? "The engineering team requires higher-performance laptops for the new customer analytics platform. Current devices cannot run the development environment reliably."
        : "Required to support planned departmental operations and maintain service delivery.",
    neededBy: "25 Jul 2026",
    costCentre: `${request.department.slice(0, 3).toUpperCase()}-2026`,
    preferredSupplier: "Approved supplier panel",
    lineItems: Array.from({ length: Math.min(request.items, 3) }, (_, i) => ({
      id: `item-${i}`,
      description: i === 0 ? request.title : "Accessories and setup",
      category:
        request.department === "Technology"
          ? "IT equipment"
          : "General supplies",
      quantity: i === 0 ? Math.max(1, request.items - 2) : 1,
      unitPrice:
        i === 0
          ? Math.round(request.amount / Math.max(1, request.items))
          : 45000,
    })),
    timeline: [
      {
        id: "ev-2",
        title: "Request submitted",
        description: "Submitted for department approval.",
        actor: request.requester,
        createdAt: `${request.createdAt}, 10:42`,
        type: "submitted",
      },
      {
        id: "ev-1",
        title: "Request created",
        description: "Draft purchase request created.",
        actor: request.requester,
        createdAt: `${request.createdAt}, 09:18`,
        type: "created",
      },
    ],
  };
}
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
export async function getDashboard(): Promise<DashboardData> {
  await delay();
  return {
    spend: 18450000,
    budget: 24000000,
    pending: 12,
    suppliers: 48,
    monthly: [
      { month: "Feb", spend: 2.1, budget: 3.2 },
      { month: "Mar", spend: 2.8, budget: 3.2 },
      { month: "Apr", spend: 2.4, budget: 3.5 },
      { month: "May", spend: 3.6, budget: 4.0 },
      { month: "Jun", spend: 3.1, budget: 4.2 },
      { month: "Jul", spend: 4.4, budget: 4.6 },
    ],
    categories: [
      { name: "Technology", value: 38, color: "#3c6df0" },
      { name: "Operations", value: 26, color: "#8b5cf6" },
      { name: "Marketing", value: 19, color: "#14b8a6" },
      { name: "Facilities", value: 17, color: "#f59e0b" },
    ],
    requests,
  };
}
export async function getRequests() {
  await delay(300);
  return requests;
}
export async function getRequest(id: string) {
  await delay(350);
  const existing = details.get(id);
  if (existing) return existing;
  const base = requests.find((r) => r.id === id);
  if (!base) throw new Error("Purchase request not found");
  const value = hydrate(base);
  details.set(id, value);
  return value;
}
export async function createRequest(input: CreateRequestInput) {
  await delay(650);
  const amount = input.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const id = `PR-2026-${String(85 + requests.length).padStart(3, "0")}`;
  const createdAt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const request: PurchaseRequest = {
    id,
    reference: id,
    requesterId: "",
    organizationId: "",
    departmentId: input.departmentId,
    title: input.title,
    department: input.departmentId,
    requester: "Muideen Adeogun",
    amount,
    status: "Pending approval",
    priority: input.priority,
    createdAt,
    items: input.lineItems.reduce((sum, item) => sum + item.quantity, 0),
  };
  const value: PurchaseRequestDetails = {
    ...request,
    ...input,
    lineItems: input.lineItems.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
    })),
    timeline: [
      {
        id: `ev-${Date.now()}`,
        title: "Request submitted",
        description:
          amount > 1000000
            ? "Automatically routed to Department Manager and Finance because the value exceeds ₦1,000,000."
            : "Automatically routed to Department Manager for approval.",
        actor: "Muideen Adeogun",
        createdAt: "Just now",
        type: "submitted",
      },
      {
        id: `ev-${Date.now() + 1}`,
        title: "Request created",
        description: "Purchase request created and validated.",
        actor: "Muideen Adeogun",
        createdAt: "Just now",
        type: "created",
      },
    ],
  };
  requests = [value, ...requests];
  details.set(id, value);
  return value;
}
export async function updateRequestStatus({
  id,
  status,
  comment,
}: {
  id: string;
  status: RequestStatus;
  comment?: string;
}) {
  await delay(500);
  const current = await getRequest(id);
  const updated: PurchaseRequestDetails = {
    ...current,
    status,
    timeline: [
      {
        id: `ev-${Date.now()}`,
        title: status === "Approved" ? "Request approved" : "Request rejected",
        description: comment || `Request ${status.toLowerCase()} after review.`,
        actor: "Muideen Adeogun",
        createdAt: "Just now",
        type: status === "Approved" ? "approved" : "rejected",
      },
      ...current.timeline,
    ],
  };
  details.set(id, updated);
  requests = requests.map((r) => (r.id === id ? { ...r, status } : r));
  return updated;
}

let suppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Nexa Technologies Ltd",
    category: "IT equipment",
    contactName: "Chidi Nwosu",
    email: "chidi@nexatech.demo",
    phone: "+234 803 442 1900",
    location: "Lagos",
    status: "Active",
    rating: 4.8,
    onTimeDelivery: 96,
    qualityScore: 94,
    totalOrders: 38,
    totalSpend: 28600000,
    complianceExpiry: "18 Dec 2026",
    initials: "NT",
  },
  {
    id: "SUP-002",
    name: "Prime Office Solutions",
    category: "Office supplies",
    contactName: "Amina Bello",
    email: "amina@primeoffice.demo",
    phone: "+234 806 120 4582",
    location: "Abuja",
    status: "Active",
    rating: 4.5,
    onTimeDelivery: 91,
    qualityScore: 89,
    totalOrders: 24,
    totalSpend: 12850000,
    complianceExpiry: "04 Feb 2027",
    initials: "PO",
  },
  {
    id: "SUP-003",
    name: "Vertex Business Systems",
    category: "IT equipment",
    contactName: "Samuel Eze",
    email: "samuel@vertex.demo",
    phone: "+234 809 558 0214",
    location: "Lagos",
    status: "Under review",
    rating: 4.2,
    onTimeDelivery: 86,
    qualityScore: 92,
    totalOrders: 17,
    totalSpend: 19400000,
    complianceExpiry: "28 Aug 2026",
    initials: "VB",
  },
  {
    id: "SUP-004",
    name: "Greenfield Facilities",
    category: "Facilities",
    contactName: "Fatima Yusuf",
    email: "fatima@greenfield.demo",
    phone: "+234 701 983 6610",
    location: "Ibadan",
    status: "Active",
    rating: 4.6,
    onTimeDelivery: 94,
    qualityScore: 90,
    totalOrders: 31,
    totalSpend: 9200000,
    complianceExpiry: "12 Mar 2027",
    initials: "GF",
  },
  {
    id: "SUP-005",
    name: "Catalyst Creative Agency",
    category: "Marketing",
    contactName: "Kemi Adeyemi",
    email: "kemi@catalyst.demo",
    phone: "+234 805 701 3314",
    location: "Lagos",
    status: "Suspended",
    rating: 3.7,
    onTimeDelivery: 72,
    qualityScore: 84,
    totalOrders: 11,
    totalSpend: 7400000,
    complianceExpiry: "Expired",
    initials: "CC",
  },
];
let quotations: Quotation[] = [
  {
    id: "QT-1001",
    supplierId: "SUP-001",
    supplierName: "Nexa Technologies Ltd",
    requestId: "PR-2026-084",
    subtotal: 4480000,
    deliveryFee: 85000,
    tax: 342375,
    total: 4907375,
    deliveryDays: 5,
    paymentTerms: "30 days",
    warranty: "3 years",
    validUntil: "20 Jul 2026",
    technicalScore: 96,
    status: "Received",
  },
  {
    id: "QT-1002",
    supplierId: "SUP-003",
    supplierName: "Vertex Business Systems",
    requestId: "PR-2026-084",
    subtotal: 4310000,
    deliveryFee: 120000,
    tax: 332250,
    total: 4762250,
    deliveryDays: 8,
    paymentTerms: "50% upfront",
    warranty: "2 years",
    validUntil: "18 Jul 2026",
    technicalScore: 91,
    status: "Received",
  },
  {
    id: "QT-1003",
    supplierId: "SUP-002",
    supplierName: "Prime Office Solutions",
    requestId: "PR-2026-084",
    subtotal: 4620000,
    deliveryFee: 0,
    tax: 346500,
    total: 4966500,
    deliveryDays: 4,
    paymentTerms: "14 days",
    warranty: "2 years",
    validUntil: "22 Jul 2026",
    technicalScore: 88,
    status: "Received",
  },
];
export async function getSuppliers() {
  await delay(350);
  return suppliers;
}
export async function getSupplier(id: string) {
  await delay(300);
  const supplier = suppliers.find((item) => item.id === id);
  if (!supplier) throw new Error("Supplier not found");
  return supplier;
}
export async function createSupplier(input: CreateSupplierInput) {
  await delay(600);
  const supplier: Supplier = {
    id: `SUP-${String(suppliers.length + 1).padStart(3, "0")}`,
    name: input.name,
    category: input.category,
    contactName: input.contactName,
    email: input.email,
    phone: input.phone,
    location: input.location,
    status: "Under review",
    rating: 0,
    onTimeDelivery: 0,
    qualityScore: 0,
    totalOrders: 0,
    totalSpend: 0,
    complianceExpiry: "Pending review",
    initials: input.name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
  };
  suppliers = [supplier, ...suppliers];
  return supplier;
}
export async function getQuotations(requestId = "PR-2026-084") {
  await delay(400);
  return quotations.filter((item) => item.requestId === requestId);
}
export async function selectQuotation(id: string) {
  await delay(550);
  quotations = quotations.map((item) =>
    item.id === id
      ? { ...item, status: "Selected" }
      : item.requestId === quotations.find((q) => q.id === id)?.requestId
        ? { ...item, status: "Declined" }
        : item,
  ) as Quotation[];
  return quotations.find((item) => item.id === id)!;
}

let orders: PurchaseOrder[] = [
  {
    id: "PO-2026-0042",
    requestId: "PR-2026-083",
    quotationId: "QT-0998",
    supplierId: "SUP-002",
    supplierName: "Prime Office Solutions",
    status: "Partially received",
    issuedAt: "04 Jul 2026",
    expectedDelivery: "12 Jul 2026",
    total: 385000,
    currency: "NGN",
    paymentTerms: "30 days",
    deliveryAddress: "Acme HQ, Victoria Island, Lagos",
    items: [
      {
        id: "POI-1",
        description: "A4 copy paper — 80gsm",
        orderedQuantity: 20,
        receivedQuantity: 12,
        unitPrice: 12500,
      },
      {
        id: "POI-2",
        description: "Printer toner cartridges",
        orderedQuantity: 4,
        receivedQuantity: 4,
        unitPrice: 33750,
      },
    ],
    receipts: [
      {
        id: "GRN-2026-0015",
        orderId: "PO-2026-0042",
        receivedAt: "09 Jul 2026, 14:20",
        receivedBy: "Muideen Adeogun",
        deliveryNote: "DN-77420",
        condition: "Accepted",
        items: [
          { itemId: "POI-1", quantity: 12 },
          { itemId: "POI-2", quantity: 4 },
        ],
      },
    ],
  },
  {
    id: "PO-2026-0041",
    requestId: "PR-2026-081",
    quotationId: "QT-0994",
    supplierId: "SUP-004",
    supplierName: "Greenfield Facilities",
    status: "Received",
    issuedAt: "28 Jun 2026",
    expectedDelivery: "05 Jul 2026",
    total: 760000,
    currency: "NGN",
    paymentTerms: "14 days",
    deliveryAddress: "Acme Warehouse, Ikeja, Lagos",
    items: [
      {
        id: "POI-3",
        description: "Workplace safety kits",
        orderedQuantity: 12,
        receivedQuantity: 12,
        unitPrice: 63333,
      },
    ],
    receipts: [
      {
        id: "GRN-2026-0014",
        orderId: "PO-2026-0041",
        receivedAt: "04 Jul 2026, 11:05",
        receivedBy: "Amina Lawal",
        deliveryNote: "GF-2281",
        condition: "Accepted",
        items: [{ itemId: "POI-3", quantity: 12 }],
      },
    ],
  },
  {
    id: "PO-2026-0040",
    requestId: "PR-2026-082",
    quotationId: "QT-0991",
    supplierId: "SUP-005",
    supplierName: "Catalyst Creative Agency",
    status: "Acknowledged",
    issuedAt: "25 Jun 2026",
    expectedDelivery: "18 Jul 2026",
    total: 1200000,
    currency: "NGN",
    paymentTerms: "50% upfront",
    deliveryAddress: "Digital delivery",
    items: [
      {
        id: "POI-4",
        description: "Campaign creative assets",
        orderedQuantity: 5,
        receivedQuantity: 0,
        unitPrice: 240000,
      },
    ],
    receipts: [],
  },
];
export async function getOrders() {
  await delay(350);
  return orders;
}
export async function getOrder(id: string) {
  await delay(300);
  const order = orders.find((item) => item.id === id);
  if (!order) throw new Error("Purchase order not found");
  return order;
}
export async function generateOrder(input: CreateOrderInput) {
  await delay(650);
  const quote = quotations.find(
    (item) => item.id === input.quotationId && item.status === "Selected",
  );
  if (!quote)
    throw new Error("Select a quotation before generating a purchase order");
  const existing = orders.find((item) => item.quotationId === quote.id);
  if (existing) return existing;
  const request = await getRequest(quote.requestId);
  const order: PurchaseOrder = {
    id: `PO-2026-${String(orders.length + 43).padStart(4, "0")}`,
    requestId: quote.requestId,
    quotationId: quote.id,
    supplierId: quote.supplierId,
    supplierName: quote.supplierName,
    status: "Issued",
    issuedAt: "Just now",
    expectedDelivery: input.expectedDelivery,
    total: quote.total,
    currency: "NGN",
    paymentTerms: quote.paymentTerms,
    deliveryAddress: input.deliveryAddress,
    items: request.lineItems.map((item, index) => ({
      id: `POI-${Date.now()}-${index}`,
      description: item.description,
      orderedQuantity: item.quantity,
      receivedQuantity: 0,
      unitPrice: item.unitPrice,
    })),
    receipts: [],
  };
  orders = [order, ...orders];
  return order;
}
export async function updateOrderStatus({
  id,
  status,
}: {
  id: string;
  status: PurchaseOrder["status"];
}) {
  await delay(400);
  orders = orders.map((order) =>
    order.id === id ? { ...order, status } : order,
  );
  return orders.find((order) => order.id === id)!;
}
export async function createGoodsReceipt(input: CreateReceiptInput) {
  await delay(650);
  const order = orders.find((item) => item.id === input.orderId);
  if (!order) throw new Error("Purchase order not found");
  for (const received of input.items) {
    const item = order.items.find((value) => value.id === received.itemId);
    if (
      !item ||
      received.quantity < 0 ||
      received.quantity > item.orderedQuantity - item.receivedQuantity
    )
      throw new Error("Received quantity exceeds the outstanding quantity");
  }
  const receipt: GoodsReceipt = {
    id: `GRN-2026-${String(orders.reduce((sum, item) => sum + item.receipts.length, 0) + 16).padStart(4, "0")}`,
    orderId: order.id,
    receivedAt: "Just now",
    receivedBy: "Muideen Adeogun",
    deliveryNote: input.deliveryNote,
    condition: input.condition,
    notes: input.notes,
    items: input.items.filter((item) => item.quantity > 0),
  };
  const items = order.items.map((item) => ({
    ...item,
    receivedQuantity:
      item.receivedQuantity +
      (input.items.find((value) => value.itemId === item.id)?.quantity || 0),
  }));
  const fullyReceived = items.every(
    (item) => item.receivedQuantity === item.orderedQuantity,
  );
  const anyReceived = items.some((item) => item.receivedQuantity > 0);
  const updated: PurchaseOrder = {
    ...order,
    items,
    receipts: [receipt, ...order.receipts],
    status: fullyReceived
      ? "Received"
      : anyReceived
        ? "Partially received"
        : order.status,
  };
  orders = orders.map((item) => (item.id === order.id ? updated : item));
  applyReceiptToInventory(order, receipt);
  return updated;
}

const warehouses: Warehouse[] = [
  {
    id: "WH-LAG-01",
    name: "Lagos Main Warehouse",
    location: "Ikeja, Lagos",
    manager: "Amina Lawal",
  },
  {
    id: "WH-ABJ-01",
    name: "Abuja Distribution Hub",
    location: "Jabi, Abuja",
    manager: "Tunde Bello",
  },
  {
    id: "WH-HQ-01",
    name: "Head Office Store",
    location: "Victoria Island, Lagos",
    manager: "Grace Okoro",
  },
];
let inventory: InventoryItem[] = [
  {
    id: "INV-001",
    sku: "IT-LAP-014",
    name: "Dell Latitude 5540 Laptop",
    category: "IT equipment",
    warehouseId: "WH-HQ-01",
    warehouseName: "Head Office Store",
    quantity: 18,
    reserved: 6,
    reorderLevel: 8,
    unitCost: 565000,
    lastUpdated: "09 Jul 2026",
    status: "In stock",
  },
  {
    id: "INV-002",
    sku: "OFF-PAP-002",
    name: "A4 Copy Paper — 80gsm",
    category: "Office supplies",
    warehouseId: "WH-LAG-01",
    warehouseName: "Lagos Main Warehouse",
    quantity: 12,
    reserved: 4,
    reorderLevel: 20,
    unitCost: 12500,
    lastUpdated: "09 Jul 2026",
    status: "Low stock",
  },
  {
    id: "INV-003",
    sku: "OFF-TON-008",
    name: "Printer Toner Cartridge",
    category: "Office supplies",
    warehouseId: "WH-LAG-01",
    warehouseName: "Lagos Main Warehouse",
    quantity: 4,
    reserved: 1,
    reorderLevel: 6,
    unitCost: 33750,
    lastUpdated: "09 Jul 2026",
    status: "Low stock",
  },
  {
    id: "INV-004",
    sku: "SAF-KIT-001",
    name: "Workplace Safety Kit",
    category: "Safety",
    warehouseId: "WH-LAG-01",
    warehouseName: "Lagos Main Warehouse",
    quantity: 12,
    reserved: 0,
    reorderLevel: 5,
    unitCost: 63333,
    lastUpdated: "04 Jul 2026",
    status: "In stock",
  },
  {
    id: "INV-005",
    sku: "IT-MON-006",
    name: "27-inch Business Monitor",
    category: "IT equipment",
    warehouseId: "WH-ABJ-01",
    warehouseName: "Abuja Distribution Hub",
    quantity: 0,
    reserved: 0,
    reorderLevel: 4,
    unitCost: 245000,
    lastUpdated: "02 Jul 2026",
    status: "Out of stock",
  },
  {
    id: "INV-006",
    sku: "OFF-CHR-011",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    warehouseId: "WH-HQ-01",
    warehouseName: "Head Office Store",
    quantity: 9,
    reserved: 2,
    reorderLevel: 5,
    unitCost: 185000,
    lastUpdated: "30 Jun 2026",
    status: "In stock",
  },
];
let movements: StockMovement[] = [
  {
    id: "MOV-1042",
    itemId: "INV-002",
    type: "Goods receipt",
    quantity: 12,
    balanceAfter: 12,
    reference: "GRN-2026-0015",
    warehouseName: "Lagos Main Warehouse",
    performedBy: "Muideen Adeogun",
    createdAt: "09 Jul 2026, 14:20",
  },
  {
    id: "MOV-1041",
    itemId: "INV-003",
    type: "Goods receipt",
    quantity: 4,
    balanceAfter: 4,
    reference: "GRN-2026-0015",
    warehouseName: "Lagos Main Warehouse",
    performedBy: "Muideen Adeogun",
    createdAt: "09 Jul 2026, 14:20",
  },
  {
    id: "MOV-1040",
    itemId: "INV-001",
    type: "Issue",
    quantity: -3,
    balanceAfter: 18,
    reference: "ISS-2026-0081",
    warehouseName: "Head Office Store",
    performedBy: "Grace Okoro",
    createdAt: "08 Jul 2026, 10:15",
  },
  {
    id: "MOV-1039",
    itemId: "INV-004",
    type: "Goods receipt",
    quantity: 12,
    balanceAfter: 12,
    reference: "GRN-2026-0014",
    warehouseName: "Lagos Main Warehouse",
    performedBy: "Amina Lawal",
    createdAt: "04 Jul 2026, 11:05",
  },
];
const stockStatus = (
  quantity: number,
  reorderLevel: number,
): InventoryItem["status"] =>
  quantity === 0
    ? "Out of stock"
    : quantity <= reorderLevel
      ? "Low stock"
      : "In stock";

function applyReceiptToInventory(order: PurchaseOrder, receipt: GoodsReceipt) {
  for (const received of receipt.items) {
    const orderItem = order.items.find((item) => item.id === received.itemId);
    if (!orderItem || received.quantity <= 0) continue;
    const needle = orderItem.description.toLowerCase().replace(/s$/, "");
    let item = inventory.find((value) => {
      const name = value.name.toLowerCase().replace(/s$/, "");
      return name.includes(needle) || needle.includes(name);
    });
    if (!item) {
      const warehouse = warehouses[0];
      item = {
        id: `INV-${String(inventory.length + 1).padStart(3, "0")}`,
        sku: `NEW-${String(inventory.length + 1).padStart(3, "0")}`,
        name: orderItem.description,
        category: "Received goods",
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        quantity: 0,
        reserved: 0,
        reorderLevel: 5,
        unitCost: orderItem.unitPrice,
        lastUpdated: "Just now",
        status: "Out of stock",
      };
      inventory = [item, ...inventory];
    }
    const quantity = item.quantity + received.quantity;
    const updated = {
      ...item,
      quantity,
      lastUpdated: "Just now",
      status: stockStatus(quantity, item.reorderLevel),
    };
    inventory = inventory.map((value) =>
      value.id === item!.id ? updated : value,
    );
    movements = [
      {
        id: `MOV-${1043 + movements.length}`,
        itemId: item.id,
        type: "Goods receipt",
        quantity: received.quantity,
        balanceAfter: quantity,
        reference: receipt.id,
        warehouseName: item.warehouseName,
        performedBy: receipt.receivedBy,
        createdAt: receipt.receivedAt,
        notes: `Received against ${order.id}`,
      },
      ...movements,
    ];
  }
}
export async function getWarehouses() {
  await delay(200);
  return warehouses;
}
export async function getInventory() {
  await delay(350);
  return inventory;
}
export async function getInventoryItem(id: string) {
  await delay(250);
  const item = inventory.find((value) => value.id === id);
  if (!item) throw new Error("Inventory item not found");
  return item;
}
export async function getStockMovements(itemId?: string) {
  await delay(300);
  return itemId
    ? movements.filter((value) => value.itemId === itemId)
    : movements;
}
export async function adjustStock(input: StockAdjustmentInput) {
  await delay(550);
  const item = inventory.find((value) => value.id === input.itemId);
  if (!item) throw new Error("Inventory item not found");
  const change =
    input.type === "Positive adjustment" ? input.quantity : -input.quantity;
  if (item.quantity + change < 0)
    throw new Error("Adjustment cannot reduce stock below zero");
  const quantity = item.quantity + change;
  const updated = {
    ...item,
    quantity,
    status: stockStatus(quantity, item.reorderLevel),
    lastUpdated: "Just now",
  };
  inventory = inventory.map((value) =>
    value.id === item.id ? updated : value,
  );
  const movement: StockMovement = {
    id: `MOV-${1043 + movements.length}`,
    itemId: item.id,
    type: input.type,
    quantity: change,
    balanceAfter: quantity,
    reference: input.reference,
    warehouseName: item.warehouseName,
    performedBy: "Muideen Adeogun",
    createdAt: "Just now",
    notes: input.reason,
  };
  movements = [movement, ...movements];
  return updated;
}

const budgets: DepartmentBudget[] = [
  {
    id: "BUD-TECH",
    department: "Technology",
    owner: "Tunde Lawson",
    allocated: 12000000,
    committed: 4850000,
    spent: 5100000,
    period: "FY 2026",
    status: "Watch",
    monthly: [
      { month: "Feb", actual: 0.6, plan: 1 },
      { month: "Mar", actual: 0.8, plan: 1 },
      { month: "Apr", actual: 0.7, plan: 1 },
      { month: "May", actual: 1.1, plan: 1.2 },
      { month: "Jun", actual: 0.9, plan: 1.2 },
      { month: "Jul", actual: 1, plan: 1.3 },
    ],
  },
  {
    id: "BUD-OPS",
    department: "Operations",
    owner: "Amaka Okafor",
    allocated: 8500000,
    committed: 385000,
    spent: 4200000,
    period: "FY 2026",
    status: "Healthy",
    monthly: [
      { month: "Feb", actual: 0.5, plan: 0.7 },
      { month: "Mar", actual: 0.6, plan: 0.7 },
      { month: "Apr", actual: 0.8, plan: 0.8 },
      { month: "May", actual: 0.7, plan: 0.8 },
      { month: "Jun", actual: 0.8, plan: 0.9 },
      { month: "Jul", actual: 0.8, plan: 0.9 },
    ],
  },
  {
    id: "BUD-MKT",
    department: "Marketing",
    owner: "David Mensah",
    allocated: 6500000,
    committed: 1200000,
    spent: 4900000,
    period: "FY 2026",
    status: "Critical",
    monthly: [
      { month: "Feb", actual: 0.7, plan: 0.6 },
      { month: "Mar", actual: 0.8, plan: 0.7 },
      { month: "Apr", actual: 0.7, plan: 0.7 },
      { month: "May", actual: 0.9, plan: 0.8 },
      { month: "Jun", actual: 0.9, plan: 0.8 },
      { month: "Jul", actual: 0.9, plan: 0.8 },
    ],
  },
  {
    id: "BUD-FAC",
    department: "Facilities",
    owner: "Sarah Ibrahim",
    allocated: 5000000,
    committed: 0,
    spent: 2800000,
    period: "FY 2026",
    status: "Healthy",
    monthly: [
      { month: "Feb", actual: 0.3, plan: 0.5 },
      { month: "Mar", actual: 0.4, plan: 0.5 },
      { month: "Apr", actual: 0.5, plan: 0.5 },
      { month: "May", actual: 0.5, plan: 0.6 },
      { month: "Jun", actual: 0.6, plan: 0.6 },
      { month: "Jul", actual: 0.5, plan: 0.6 },
    ],
  },
  {
    id: "BUD-PPL",
    department: "People",
    owner: "Bola James",
    allocated: 4200000,
    committed: 0,
    spent: 1450000,
    period: "FY 2026",
    status: "Healthy",
    monthly: [
      { month: "Feb", actual: 0.2, plan: 0.4 },
      { month: "Mar", actual: 0.3, plan: 0.4 },
      { month: "Apr", actual: 0.2, plan: 0.4 },
      { month: "May", actual: 0.3, plan: 0.4 },
      { month: "Jun", actual: 0.2, plan: 0.4 },
      { month: "Jul", actual: 0.25, plan: 0.4 },
    ],
  },
];
const spendRecords: SpendRecord[] = [
  {
    id: "SP-001",
    date: "09 Jul 2026",
    department: "Technology",
    category: "IT equipment",
    supplier: "Nexa Technologies Ltd",
    description: "Engineering laptops",
    amount: 4907375,
    type: "Purchase order",
    reference: "PO-2026-0043",
  },
  {
    id: "SP-002",
    date: "04 Jul 2026",
    department: "Facilities",
    category: "Safety",
    supplier: "Greenfield Facilities",
    description: "Workplace safety kits",
    amount: 760000,
    type: "Purchase order",
    reference: "PO-2026-0041",
  },
  {
    id: "SP-003",
    date: "02 Jul 2026",
    department: "Operations",
    category: "Office supplies",
    supplier: "Prime Office Solutions",
    description: "Office stationery restock",
    amount: 385000,
    type: "Purchase order",
    reference: "PO-2026-0042",
  },
  {
    id: "SP-004",
    date: "28 Jun 2026",
    department: "Marketing",
    category: "Marketing",
    supplier: "Catalyst Creative Agency",
    description: "Campaign creative assets",
    amount: 1200000,
    type: "Purchase order",
    reference: "PO-2026-0040",
  },
  {
    id: "SP-005",
    date: "24 Jun 2026",
    department: "People",
    category: "Professional services",
    supplier: "LearnSphere Africa",
    description: "Leadership training",
    amount: 540000,
    type: "Direct expense",
    reference: "EXP-2026-0192",
  },
  {
    id: "SP-006",
    date: "18 Jun 2026",
    department: "Technology",
    category: "Software",
    supplier: "Cloud Systems Ltd",
    description: "Cloud platform subscription",
    amount: 890000,
    type: "Direct expense",
    reference: "EXP-2026-0178",
  },
  {
    id: "SP-007",
    date: "11 Jun 2026",
    department: "Operations",
    category: "Logistics",
    supplier: "Swift Haulage",
    description: "Inter-office deliveries",
    amount: 275000,
    type: "Direct expense",
    reference: "EXP-2026-0161",
  },
];
const auditLogs: AuditLog[] = [
  {
    id: "AUD-1108",
    action: "Adjusted",
    entityType: "Inventory",
    entityId: "INV-002",
    description: "Stock balance adjusted after cycle count",
    actor: "Muideen Adeogun",
    role: "Procurement Officer",
    createdAt: "10 Jul 2026, 16:42",
    metadata: "Quantity +3 · COUNT-2026-014",
  },
  {
    id: "AUD-1107",
    action: "Received",
    entityType: "Goods receipt",
    entityId: "GRN-2026-0015",
    description: "Partial goods receipt recorded for PO-2026-0042",
    actor: "Muideen Adeogun",
    role: "Procurement Officer",
    createdAt: "09 Jul 2026, 14:20",
    metadata: "16 units · Delivery note DN-77420",
  },
  {
    id: "AUD-1106",
    action: "Issued",
    entityType: "Purchase order",
    entityId: "PO-2026-0043",
    description: "Purchase order issued to Nexa Technologies Ltd",
    actor: "Muideen Adeogun",
    role: "Procurement Officer",
    createdAt: "09 Jul 2026, 12:05",
    metadata: "₦4,907,375 · 30 day terms",
  },
  {
    id: "AUD-1105",
    action: "Selected",
    entityType: "Quotation",
    entityId: "QT-1001",
    description: "Supplier quotation selected for engineering laptops",
    actor: "Muideen Adeogun",
    role: "Procurement Officer",
    createdAt: "09 Jul 2026, 11:38",
    metadata: "Nexa Technologies Ltd · Technical score 96",
  },
  {
    id: "AUD-1104",
    action: "Approved",
    entityType: "Purchase request",
    entityId: "PR-2026-084",
    description: "Purchase request approved after finance review",
    actor: "Ngozi Williams",
    role: "Finance Officer",
    createdAt: "09 Jul 2026, 09:55",
    metadata: "Technology · ₦4,850,000",
  },
  {
    id: "AUD-1103",
    action: "Updated",
    entityType: "Supplier",
    entityId: "SUP-003",
    description: "Supplier status moved to compliance review",
    actor: "Sarah Ibrahim",
    role: "Administrator",
    createdAt: "08 Jul 2026, 16:10",
  },
  {
    id: "AUD-1102",
    action: "Created",
    entityType: "Purchase request",
    entityId: "PR-2026-083",
    description: "New purchase request submitted",
    actor: "Amaka Okafor",
    role: "Employee",
    createdAt: "08 Jul 2026, 10:42",
    metadata: "Operations · 24 items",
  },
  {
    id: "AUD-1101",
    action: "Rejected",
    entityType: "Purchase request",
    entityId: "PR-2026-080",
    description: "Request rejected due to insufficient justification",
    actor: "Bola James",
    role: "Department Manager",
    createdAt: "03 Jul 2026, 14:25",
  },
];
export async function getBudgets() {
  await delay(350);
  return budgets;
}
export async function getSpendRecords() {
  await delay(350);
  return spendRecords;
}
export async function getAuditLogs() {
  await delay(300);
  return auditLogs;
}

// let organisationSettings: OrganisationSettings = {
//   companyName: "Acme Corporation",
//   legalName: "Acme Corporation Limited",
//   email: "procurement@acme.demo",
//   phone: "+234 201 555 0184",
//   website: "https://acme.example",
//   taxId: "NG-TIN-8842017",
//   address: "24 Adeola Odeku Street, Victoria Island, Lagos",
//   country: "Nigeria",
//   currency: "NGN",
//   timezone: "Africa/Lagos",
//   financialYearStart: "January",
//   purchaseOrderPrefix: "PO",
//   requestPrefix: "PR",
//   defaultPaymentTerms: "30 days",
//   defaultWarehouseId: "WH-LAG-01",
//   requireThreeQuotes: true,
//   allowEmergencyPurchases: true,
//   autoCreateInventory: true,
//   managerApprovalThreshold: 250000,
//   financeApprovalThreshold: 1000000,
//   executiveApprovalThreshold: 10000000,
//   emailApprovals: true,
//   emailOrders: true,
//   emailReceipts: true,
//   emailLowStock: true,
//   dailyDigest: false,
//   lowStockDigestTime: "08:00",
// };
// export async function getOrganisationSettings() {
//   await delay(300);
//   return organisationSettings;
// }

export const getOrganisationSettings = async () => {
  const {data, error} = await supabase.from('organizations').select('*').single();
  if (error) {
    throw new Error(error.message);
  }
  return data as OrganisationSettings;
};
export async function updateOrganisationSettings(input: OrganisationSettings) {
  if (
    input.managerApprovalThreshold > input.financeApprovalThreshold ||
    input.financeApprovalThreshold > input.executiveApprovalThreshold
  )
    throw new Error(
      "Approval thresholds must increase from manager to executive level",
    );
  const { data, error } = await supabase
    .from("organizations")
    .update(input)
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as OrganisationSettings;
}
