import { readFile } from "node:fs/promises";
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

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(fileName: string): Promise<T> {
  const text = await readFile(path.join(DATA_DIR, fileName), "utf-8");
  return JSON.parse(text) as T;
}

export async function findCustomer(id: string): Promise<Customer | undefined> {
  const customers = await readJson<Customer[]>("customers.json");
  return customers.find((customer) => customer.id === id);
}

export async function findProduct(id: string): Promise<Product | undefined> {
  const products = await readJson<Product[]>("products.json");
  return products.find((product) => product.id === id);
}

export async function filterProducts(
  filter: ProductFilter,
): Promise<Product[]> {
  const products = await readJson<Product[]>("products.json");
  const text = filter.text?.toLowerCase();
  return products.filter((product) => {
    if (
      text &&
      !`${product.name} ${product.description}`.toLowerCase().includes(text)
    )
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
