import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down"
  trendValue?: string
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue }: MetricCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="mt-4 flex items-center gap-1">
            <span className={`text-sm font-medium ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
              {trend === "up" ? "↑" : "↓"} {trendValue}
            </span>
            <span className="text-sm text-muted-foreground">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
