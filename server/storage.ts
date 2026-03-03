import { db } from "./db";
import { 
  medications, 
  sales, 
  type InsertMedication, 
  type InsertSale,
  type Medication,
  type Sale,
  type AnalyticsSummary
} from "@shared/schema";
import { eq, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  // Medications
  getMedications(): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication>;
  deleteMedication(id: number): Promise<void>;
  
  // Sales
  getSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Analytics
  getAnalyticsSummary(): Promise<AnalyticsSummary>;
}

export class DatabaseStorage implements IStorage {
  // Medications
  async getMedications(): Promise<Medication[]> {
    return await db.select().from(medications).orderBy(desc(medications.id));
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    const [med] = await db.select().from(medications).where(eq(medications.id, id));
    return med;
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const [med] = await db.insert(medications).values(medication).returning();
    return med;
  }

  async updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication> {
    const [med] = await db.update(medications)
      .set(updates)
      .where(eq(medications.id, id))
      .returning();
    return med;
  }

  async deleteMedication(id: number): Promise<void> {
    await db.delete(medications).where(eq(medications.id, id));
  }

  // Sales
  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.date));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }

  // Analytics
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const allSales = await this.getSales();
    const totalSalesValue = allSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    
    const allMeds = await this.getMedications();
    const lowStockCount = allMeds.filter(m => m.stockLevel <= m.reorderThreshold).length;

    return {
      totalSales: totalSalesValue.toFixed(2),
      totalOrders: allSales.length,
      lowStockCount
    };
  }
}

export const storage = new DatabaseStorage();
