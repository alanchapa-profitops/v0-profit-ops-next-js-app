"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MetricCard } from "@/components/metric-card"
import { DealsList } from "@/components/deals-list"
import { DollarSign, Briefcase, CheckCircle, Target, RefreshCw } from "lucide-react"
import { fetchDashboardData, formatCurrencyShort, type DashboardData } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const dashboardData = await fetchDashboardData()
      setData(dashboardData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching dashboard:", err)
      setError("Error cargando datos del pipeline")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const progressPercent = data 
    ? Math.round((data.ganado_imr_mes / data.objetivo_imr) * 100) 
    : 0

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Resumen de tu actividad de ventas
                {lastUpdated && (
                  <span className="ml-2 text-xs">
                    • Actualizado: {lastUpdated.toLocaleTimeString("es-MX")}
                  </span>
                )}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={loadData} 
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-red-500">
              {error}
              <button 
                onClick={loadData}
                className="ml-2 underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Pipeline Total" 
              value={isLoading ? "..." : formatCurrencyShort(data?.pipeline_generado_imr || 0)} 
              icon={DollarSign} 
            />
            <MetricCard 
              title="Deals Activos" 
              value={isLoading ? "..." : String(data?.deals_abiertos || 0)} 
              icon={Briefcase} 
              subtitle={data?.cierres_esta_semana ? `${data.cierres_esta_semana} cierran esta semana` : undefined}
            />
            <MetricCard 
              title="Cierres Este Mes" 
              value={isLoading ? "..." : String(data?.cierres_esta_semana || 0)} 
              icon={CheckCircle} 
            />
            <MetricCard 
              title="Objetivo Mensual" 
              value={isLoading ? "..." : formatCurrencyShort(data?.ganado_imr_mes || 0)} 
              subtitle={`de ${formatCurrencyShort(data?.objetivo_imr || 105000)} (${progressPercent}%)`}
              icon={Target} 
            />
          </div>

          <DealsList 
            deals={data?.accion_inmediata} 
            isLoading={isLoading}
            onRefresh={loadData}
          />
        </div>
      </main>
    </div>
  )
}
