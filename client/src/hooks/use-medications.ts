import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// We define types locally to ensure the frontend compiles even if @shared isn't perfectly synced yet
export interface Medication {
  id: number;
  name: string;
  category: string;
  stockLevel: number;
  price: string;
  reorderThreshold: number;
}

export type InsertMedication = Omit<Medication, "id">;
export type UpdateMedication = Partial<InsertMedication>;

export function useMedications() {
  return useQuery<Medication[]>({
    queryKey: ["/api/medications"],
    queryFn: async () => {
      const res = await fetch("/api/medications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch medications");
      return res.json();
    },
  });
}

export function useMedication(id: number) {
  return useQuery<Medication>({
    queryKey: [`/api/medications/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/medications/${id}`, { credentials: "include" });
      if (res.status === 404) return null as any;
      if (!res.ok) throw new Error("Failed to fetch medication");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMedication) => {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create medication");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({ title: "Success", description: "Medication added successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateMedication) => {
      const res = await fetch(`/api/medications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update medication");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      queryClient.invalidateQueries({ queryKey: [`/api/medications/${variables.id}`] });
      toast({ title: "Success", description: "Medication updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete medication");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({ title: "Success", description: "Medication deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
