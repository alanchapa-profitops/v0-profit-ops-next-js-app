"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Deal, formatCurrencyShort, getStatusColor } from "@/lib/api"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DealsListProps {
  deals?: Deal[]
  isLoading?: boolean
  onRefresh?: () => void
}

export function DealsList({ deals, isLoading, onRefresh }: DealsListProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Pipeline Activo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4 animate-pulse"
              >
                <div className="h-3 w-3 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-6 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Pipeline Activo</CardTitle>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {deals && deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.deal_id}
                className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className={`h-3 w-3 rounded-full ${getStatusColor(deal.estado)}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{deal.deal_title}</p>
                      <p className="text-sm text-muted-foreground">
                        {deal.org_name} {deal.person_name && `• ${deal.person_name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCurrencyShort(deal.value_imr)}
                      </p>
                      {deal.value_vtc && deal.value_vtc !== deal.value_imr && (
                        <p className="text-xs text-muted-foreground">
                          VTC: {formatCurrencyShort(deal.value_vtc)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Cierre: {deal.expected_close_date}
                    </span>
                    {deal.next_activity_subject && (
                      <span className={`${deal.estado === 'rojo' ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {deal.next_activity_subject}
                        {deal.next_activity_date && ` • ${deal.next_activity_date}`}
                      </span>
                    )}
                  </div>
                  {deal.estado_mensaje && (
                    <p className={`text-xs ${deal.estado === 'rojo' ? 'text-red-400' : 'text-muted-foreground'}`}>
                      ⚠️ {deal.estado_mensaje}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No hay deals en el pipeline
          </div>
        )}
      </CardContent>
    </Card>
  )
}
