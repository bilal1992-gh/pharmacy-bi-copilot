import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// === CHAT MODELS ===
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// === PHARMACY DATA MODELS ===
export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  stockLevel: integer("stock_level").notNull(),
  price: text("price").notNull(),
  reorderThreshold: integer("reorder_threshold").notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  quantity: integer("quantity").notNull(),
  totalAmount: text("total_amount").notNull(),
  date: timestamp("date").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, date: true });

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

// Request Types
export type CreateMedicationRequest = InsertMedication;
export type UpdateMedicationRequest = Partial<InsertMedication>;

// Analytics response types
export interface AnalyticsSummary {
  totalSales: string;
  totalOrders: number;
  lowStockCount: number;
}
