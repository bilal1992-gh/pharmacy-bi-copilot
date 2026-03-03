import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register chat integration
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Medications API
  app.get(api.medications.list.path, async (req, res) => {
    try {
      const meds = await storage.getMedications();
      res.json(meds);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.get(api.medications.get.path, async (req, res) => {
    try {
      const med = await storage.getMedication(Number(req.params.id));
      if (!med) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(med);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  app.post(api.medications.create.path, async (req, res) => {
    try {
      const input = api.medications.create.input.parse(req.body);
      const med = await storage.createMedication(input);
      res.status(201).json(med);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create medication" });
    }
  });

  app.put(api.medications.update.path, async (req, res) => {
    try {
      const input = api.medications.update.input.parse(req.body);
      const med = await storage.updateMedication(Number(req.params.id), input);
      if (!med) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(med);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update medication" });
    }
  });

  app.delete(api.medications.delete.path, async (req, res) => {
    try {
      const med = await storage.getMedication(Number(req.params.id));
      if (!med) {
        return res.status(404).json({ message: "Medication not found" });
      }
      await storage.deleteMedication(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Failed to delete medication" });
    }
  });

  // Sales API
  app.get(api.sales.list.path, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post(api.sales.create.path, async (req, res) => {
    try {
      const input = api.sales.create.input.parse(req.body);
      const sale = await storage.createSale(input);
      
      // Also update the stock level
      const med = await storage.getMedication(input.medicationId);
      if (med) {
        await storage.updateMedication(input.medicationId, {
          stockLevel: Math.max(0, med.stockLevel - input.quantity)
        });
      }
      
      res.status(201).json(sale);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Analytics API
  app.get(api.analytics.summary.path, async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch analytics summary" });
    }
  });

  // Seed data function to run at startup
  seedDatabase().catch(console.error);

  return httpServer;
}

async function seedDatabase() {
  const existingMeds = await storage.getMedications();
  if (existingMeds.length === 0) {
    const meds = [
      { name: "Amoxicillin", category: "Antibiotics", stockLevel: 500, price: "12.99", reorderThreshold: 100 },
      { name: "Lisinopril", category: "Antibiotics", stockLevel: 50, price: "8.50", reorderThreshold: 100 }, // Low stock
      { name: "Ibuprofen", category: "Pain Relief", stockLevel: 1200, price: "5.99", reorderThreshold: 200 },
      { name: "Acetaminophen", category: "Pain Relief", stockLevel: 80, price: "6.50", reorderThreshold: 150 }, // Low stock
      { name: "Atorvastatin", category: "Cardiovascular", stockLevel: 300, price: "45.00", reorderThreshold: 50 },
      { name: "Metformin", category: "Cardiovascular", stockLevel: 450, price: "18.25", reorderThreshold: 100 },
    ];
    
    for (const med of meds) {
      await storage.createMedication(med);
    }
    
    // Add some initial sales
    const allMeds = await storage.getMedications();
    if (allMeds.length > 0) {
      await storage.createSale({
        medicationId: allMeds[0].id,
        quantity: 2,
        totalAmount: "25.98"
      });
      await storage.createSale({
        medicationId: allMeds[2].id,
        quantity: 5,
        totalAmount: "29.95"
      });
    }
  }
}
