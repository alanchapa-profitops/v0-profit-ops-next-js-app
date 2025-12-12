"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Target, AlertCircle } from "lucide-react"
import { type DashboardData, formatCurrencyShort, getStatusColor } from "@/lib/api"

interface MiniDashboardProps {
  data?: DashboardData
  isLoading?: boolean
}

export function MiniDashboard({ data, isLoading }: MiniDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="border-border bg-card animate-pulse">
          <CardContent className="p-4">
            <div className="h-16 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="border-border bg-card animate-pulse">
          <CardContent className="p-4">
            <div className="h-16 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="border-border bg-card animate-pulse">
          <CardContent className="p-4">
            <div className="h-16 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercent = data && data.objetivo_imr > 0
    ? Math.round((data.ganado_imr_mes / data.objetivo_imr) * 100) 
    : 0

  const priorityDeals = data?.accion_inmediata?.slice(0, 5) || []

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pipeline Total</p>
              <p className="text-2xl font-bold text-foreground">
                {data ? formatCurrencyShort(data.pipeline_generado_imr || 0) : "$0"}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Deals Activos</p>
              <p className="text-2xl font-bold text-foreground">
                {data?.deals_abiertos || 0}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Meta Mensual</p>
              <p className="text-2xl font-bold text-foreground">{progressPercent}%</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/80"
              style={{ width: progressPercent + "%" }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertCircle className="h-4 w-4 text-primary" />
            Deals Prioritarios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {priorityDeals.length > 0 ? (
            <div className="space-y-2">
              {priorityDeals.map((deal) => (
                <div
                  key={deal.deal_id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
                >
                  <div className={"h-2 w-2 rounded-full " + getStatusColor(deal.estado)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{deal.deal_title}</p>
                    <p className="text-xs text-muted-foreground">{deal.org_name}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrencyShort(deal.value_imr || 0)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay deals prioritarios</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
