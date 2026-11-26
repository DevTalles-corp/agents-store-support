import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type OrderStatus = "preparing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  number: string;
  customerId: string;
  status: OrderStatus;
  purchaseDate: string;
  estimatedDelivery: string;
  carrier: string;
  items: { productId: string; quantity: number }[];
  total: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}
export interface ProductFilter {
  text: string | null;
  category: string | null;
  maxPrice: number | null;
  inStockOnly: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Complaint {
  id: string;
  customerId: string;
  orderNumber: string;
  reason: string;
  details: string;
  status: "open" | "refunded";
  createdAt: string;
  refundAmount?: number;
}

export async function saveComplaint(
  data: Omit<Complaint, "id" | "status" | "createdAt">,
): Promise<Complaint> {
  const complaints = await readJson<Complaint[]>("complaints.json");
  const complaint: Complaint = {
    ...data,
    id: `R-${String(complaints.length + 1).padStart(3, "0")}`,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  complaints.push(complaint);
  await writeJson("complaints.json", complaints);
  return complaint;
}

export async function recordRefund(
  customerId: string,
  complaintId: string,
  amount: number,
): Promise<Complaint | undefined> {
  const complaints = await readJson<Complaint[]>("complaints.json");
  // Solo se reembolsan reclamos del cliente actual
  const complaint = complaints.find(
    (r) => r.id === complaintId && r.customerId === customerId,
  );
  if (!complaint) return undefined;
  complaint.status = "refunded";
  complaint.refundAmount = amount;
  await writeJson("complaints.json", complaints);
  return complaint;
}

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(fileName: string): Promise<T> {
  const text = await readFile(path.join(DATA_DIR, fileName), "utf-8");
  return JSON.parse(text) as T;
}

async function writeJson(fileName: string, data: unknown): Promise<void> {
  await writeFile(path.join(DATA_DIR, fileName), JSON.stringify(data, null, 2));
}

export async function findCustomer(id: string): Promise<Customer | undefined> {
  const customers = await readJson<Customer[]>("customers.json");
  return customers.find((customer) => customer.id === id);
}

export async function findProduct(id: string): Promise<Product | undefined> {
  const products = await readJson<Product[]>("products.json");
  return products.find((product) => product.id === id);
}
// Minúsculas y sin tildes: "Audífonos" → "audifonos"
const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Plural simple en español: "parlantes" → "parlante", "relojes" → "reloj"
const singular = (word: string) =>
  word.length > 4 && word.endsWith("es") && !/[aeiou]es$/.test(word.slice(-3))
    ? word.slice(0, -2)
    : word.length > 3 && word.endsWith("s")
      ? word.slice(0, -1)
      : word;

export async function filterProducts(
  filter: ProductFilter,
): Promise<Product[]> {
  const products = await readJson<Product[]>("products.json");
  const words = normalize(filter.text ?? "")
    .split(/\s+/)
    .filter(Boolean);

  return products.filter((product) => {
    const searchText = normalize(`${product.name} ${product.description}`);
    if (words.some((word) => !searchText.includes(singular(word))))
      return false;
    if (filter.category && filter.category !== product.category) return false;
    if (filter.maxPrice !== null && product.price > filter.maxPrice)
      return false;
    if (filter.inStockOnly && product.stock === 0) return false;
    return true;
  });
}

export async function findOrder(
  orderNumber: string,
): Promise<Order | undefined> {
  const orders = await readJson<Order[]>("orders.json");
  return orders.find((order) => order.number === orderNumber);
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const orders = await readJson<Order[]>("orders.json");
  return orders.filter((order) => order.customerId === customerId);
}

export async function readPolices(): Promise<string> {
  return readFile(path.join(DATA_DIR, "policies.md"), "utf-8");
}
