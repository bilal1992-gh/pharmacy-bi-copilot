import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { DollarSign, ShoppingCart, AlertTriangle, Activity } from "lucide-react";
import { useAnalyticsSummary } from "@/hooks/use-analytics";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for the chart since it's not provided by the API
const salesData = [
  { name: 'Mon', total: 4000 },
  { name: 'Tue', total: 3000 },
  { name: 'Wed', total: 2000 },
  { name: 'Thu', total: 2780 },
  { name: 'Fri', total: 1890 },
  { name: 'Sat', total: 2390 },
  { name: 'Sun', total: 3490 },
];

export default function Dashboard() {
  const { data: summary, isLoading } = useAnalyticsSummary();

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back. Here's your pharmacy's performance.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading || !summary ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[140px] rounded-2xl" />
            ))
          ) : (
            <>
              <MetricCard 
                title="Total Revenue" 
                value={summary.totalSales} 
                icon={<DollarSign className="w-6 h-6" />}
                trend={{ value: 12.5, isPositive: true }}
                description="vs. last week"
              />
              <MetricCard 
                title="Orders Fulfilled" 
                value={summary.totalOrders.toLocaleString()} 
                icon={<ShoppingCart className="w-6 h-6" />}
                trend={{ value: 4.1, isPositive: true }}
                description="vs. last week"
              />
              <MetricCard 
                title="Low Stock Alerts" 
                value={summary.lowStockCount} 
                icon={<AlertTriangle className="w-6 h-6" />}
                className={summary.lowStockCount > 0 ? "border-destructive/30 shadow-destructive/5" : ""}
                description="Requires immediate action"
              />
              <MetricCard 
                title="System Health" 
                value="99.9%" 
                icon={<Activity className="w-6 h-6" />}
                description="All services operational"
              />
            </>
          )}
        </div>

        {/* Charts and Tables Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="font-display">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 glass-card">
            <CardHeader>
              <CardTitle className="font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors cursor-pointer group">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Reorder Low Stock</h4>
                <p className="text-sm text-muted-foreground mt-1">Review {summary?.lowStockCount || 0} items below threshold.</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors cursor-pointer group">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Generate Report</h4>
                <p className="text-sm text-muted-foreground mt-1">Export weekly sales and inventory report.</p>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer group relative overflow-hidden">
                <div className="absolute right-[-10px] top-[-10px] opacity-10 text-primary">
                  <MessageSquarePlus className="w-24 h-24" />
                </div>
                <h4 className="font-semibold text-primary">Ask AI Copilot</h4>
                <p className="text-sm text-primary/80 mt-1">Get insights on your current inventory data.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
