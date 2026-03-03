import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function MetricCard({ title, value, icon, trend, description, className }: MetricCardProps) {
  return (
    <Card className={cn("glass-card overflow-hidden relative group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            {icon}
          </div>
        </div>
        
        {(trend || description) && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            {trend && (
              <span className={cn(
                "font-medium px-2 py-0.5 rounded-md", 
                trend.isPositive ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
              )}>
                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
              </span>
            )}
            <span className="text-muted-foreground">{description}</span>
          </div>
        )}
      </CardContent>
      {/* Decorative gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
