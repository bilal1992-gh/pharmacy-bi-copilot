import { z } from "zod";
import { insertMedicationSchema, insertSaleSchema, medications, sales, conversations, messages } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  medications: {
    list: {
      method: "GET" as const,
      path: "/api/medications" as const,
      responses: {
        200: z.array(z.custom<typeof medications.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/medications/:id" as const,
      responses: {
        200: z.custom<typeof medications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/medications" as const,
      input: insertMedicationSchema,
      responses: {
        201: z.custom<typeof medications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/medications/:id" as const,
      input: insertMedicationSchema.partial(),
      responses: {
        200: z.custom<typeof medications.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/medications/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  sales: {
    list: {
      method: "GET" as const,
      path: "/api/sales" as const,
      responses: {
        200: z.array(z.custom<typeof sales.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/sales" as const,
      input: insertSaleSchema,
      responses: {
        201: z.custom<typeof sales.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  analytics: {
    summary: {
      method: "GET" as const,
      path: "/api/analytics/summary" as const,
      responses: {
        200: z.object({
          totalSales: z.string(),
          totalOrders: z.number(),
          lowStockCount: z.number(),
        }),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
