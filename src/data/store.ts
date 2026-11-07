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
