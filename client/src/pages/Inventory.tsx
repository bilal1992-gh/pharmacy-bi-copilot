import { AppLayout } from "@/components/layout/AppLayout";
import { useMedications, useCreateMedication, useUpdateMedication, useDeleteMedication, Medication } from "@/hooks/use-medications";
import { useState } from "react";
import { Plus, Search, MoreHorizontal, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function MedicationDialog({ 
  medication, 
  isOpen, 
  setIsOpen 
}: { 
  medication?: Medication, 
  isOpen: boolean, 
  setIsOpen: (v: boolean) => void 
}) {
  const createMutation = useCreateMedication();
  const updateMutation = useUpdateMedication();
  
  const isEditing = !!medication;
  
  const [formData, setFormData] = useState({
    name: medication?.name || "",
    category: medication?.category || "",
    stockLevel: medication?.stockLevel?.toString() || "",
    price: medication?.price || "",
    reorderThreshold: medication?.reorderThreshold?.toString() || "20",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      stockLevel: parseInt(formData.stockLevel, 10),
      price: formData.price,
      reorderThreshold: parseInt(formData.reorderThreshold, 10),
    };

    if (isEditing && medication) {
      updateMutation.mutate({ id: medication.id, ...payload }, {
        onSuccess: () => setIsOpen(false)
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setIsOpen(false)
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] glass-card border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{isEditing ? "Edit Medication" : "Add Medication"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Medication Name</Label>
            <Input 
              id="name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-white/50 dark:bg-slate-900/50" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input 
              id="category" 
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="bg-white/50 dark:bg-slate-900/50" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input 
                id="stock" 
                type="number" 
                required
                value={formData.stockLevel}
                onChange={(e) => setFormData({...formData, stockLevel: e.target.value})}
                className="bg-white/50 dark:bg-slate-900/50" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (String)</Label>
              <Input 
                id="price" 
                required
                placeholder="$10.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="bg-white/50 dark:bg-slate-900/50" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Reorder Threshold</Label>
            <Input 
              id="threshold" 
              type="number" 
              required
              value={formData.reorderThreshold}
              onChange={(e) => setFormData({...formData, reorderThreshold: e.target.value})}
              className="bg-white/50 dark:bg-slate-900/50" 
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-gradient-to-r from-primary to-primary/80">
              {isPending ? "Saving..." : "Save Medication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Inventory() {
  const { data: medications, isLoading } = useMedications();
  const deleteMutation = useDeleteMedication();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>(undefined);

  const filteredMeds = medications?.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (med: Medication) => {
    setEditingMedication(med);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingMedication(undefined);
    setDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage medications, stock levels, and pricing.</p>
          </div>
          
          <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>

        <Card className="glass-card flex-1 flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-border/50 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or category..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-slate-900/50 border-border/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-secondary/30 sticky top-0 backdrop-blur-md z-10">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Stock Level</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredMeds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No medications found. Try adjusting your search or add a new one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeds.map((med) => {
                    const isLowStock = med.stockLevel <= med.reorderThreshold;
                    return (
                      <TableRow key={med.id} className="group hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium text-foreground">
                          {med.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-secondary/50">{med.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={isLowStock ? "text-destructive font-bold" : ""}>
                              {med.stockLevel}
                            </span>
                            {isLowStock && (
                              <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{med.price}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(med)} className="cursor-pointer">
                                <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Edit details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  if(confirm("Are you sure you want to delete this medication?")) {
                                    deleteMutation.mutate(med.id);
                                  }
                                }}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

      </div>

      <MedicationDialog 
        medication={editingMedication} 
        isOpen={dialogOpen} 
        setIsOpen={setDialogOpen} 
      />
    </AppLayout>
  );
}
