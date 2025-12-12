import { Sidebar } from "@/components/sidebar"
import { MetricCard } from "@/components/metric-card"
import { DealsList } from "@/components/deals-list"
import { DollarSign, Briefcase, CheckCircle, Target } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen de tu actividad de ventas</p>
          </div>

          {/* Metrics Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Pipeline Total" value="$245K" icon={DollarSign} trend="up" trendValue="12.5%" />
            <MetricCard title="Deals Activos" value="13" icon={Briefcase} subtitle="6 en negociación" />
            <MetricCard title="Cierres Este Mes" value="3" icon={CheckCircle} trend="up" trendValue="50%" />
            <MetricCard title="Objetivo Mensual" value="$48K" subtitle="de $105K" icon={Target} />
          </div>

          {/* Deals List */}
          <DealsList />
        </div>
      </main>
    </div>
  )
}
