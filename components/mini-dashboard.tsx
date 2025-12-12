"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Target, AlertCircle } from "lucide-react"
import { type DashboardData, type Deal, formatCurrencyShort, getStatusColor } from "@/lib/api"

interface MiniDashboardProps {
  data?: DashboardData
  isLoading?: boolean
  onDealClick?: (deal: Deal) => void
}

export function MiniDashboard({ data, isLoading, onDealClick }: MiniDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border bg-card animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-8 w-24 bg-muted rounded" />
                </div>
                <div className="h-10 w-10 bg-muted rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-border bg-card animate-pulse">
          <CardHeader className="p-4">
            <div className="h-4 w-32 bg-muted rounded" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercent = data 
    ? Math.round((data.ganado_imr_mes / data.objetivo_imr) * 100) 
    : 0

  const priorityDeals = data?.accion_inmediata?.slice(0, 5) || []

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pipeline Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {data ? formatCurrencyShort(data.pipeline_generado_imr) : "$0"}
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
                {data?.cierres_esta_semana ? (
                  <p className="text-xs text-green-500">
                    {data.cierres_esta_semana} cierres esta semana
                  </p>
                ) : null}
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
                <p className="text-xs text-muted-foreground">
                  {data ? formatCurrencyShort(data.ganado_imr_mes) : "$0"} / {data ? formatCurrencyShort(data.objetivo_imr) : "$105K"}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertCircle className="h-4 w-4 text-primary" />
            Deals Prioritarios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {priorityDeals.length > 0 ? (
            <div className="space-y-3">
              {priorityDeals.map((deal) => (
                <div
                  key={deal.deal_id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => onDealClick?.(deal)}
                >
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getStatusColor(deal.estado)}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      {deal.deal_title}
                    </p>
                    <p className="text-xs text-muted-foreground">{deal.org_name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary">
                        {formatCurrencyShort(deal.value_imr)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deal.expected_close_date}
                      </p>
                    </div>
                    {deal.estado_mensaje && (
                      <p className={`text-xs ${deal.estado === 'rojo' ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {deal.estado_mensaje}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No hay deals prioritarios
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>Urgente</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-500" />
          <span>Programado</span>
        </div>
      </div>
    </div>
  )
}
