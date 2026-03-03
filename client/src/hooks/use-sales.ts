import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Sale {
  id: number;
  medicationId: number;
  quantity: number;
  totalAmount: string;
  date: string;
}

export function useSales() {
  return useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    queryFn: async () => {
      const res = await fetch("/api/sales", { credentials: "include" });
      if (!res.ok) {
        // Provide mock data if not implemented yet
        if (res.status === 404) return [];
        throw new Error("Failed to fetch sales");
      }
      return res.json();
    },
  });
}
