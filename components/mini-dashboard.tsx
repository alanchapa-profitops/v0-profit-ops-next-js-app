import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Target } from "lucide-react"

interface Deal {
  id: string
  name: string
  company: string
  value: string
  status: "hot" | "cold" | "neutral"
}

const priorityDeals: Deal[] = [
  {
    id: "1",
    name: "Sistema CRM Enterprise",
    company: "TechCorp S.A.",
    value: "$45,000",
    status: "hot",
  },
  {
    id: "2",
    name: "Licencias SaaS Anuales",
    company: "Innovate Inc.",
    value: "$28,500",
    status: "hot",
  },
  {
    id: "3",
    name: "Desarrollo Custom",
    company: "Enterprise Co.",
    value: "$65,000",
    status: "hot",
  },
  {
    id: "4",
    name: "Consultoría Digital",
    company: "Global Solutions",
    value: "$12,800",
    status: "neutral",
  },
  {
    id: "5",
    name: "Soporte Premium",
    company: "MidSize Corp",
    value: "$15,400",
    status: "neutral",
  },
]

export function MiniDashboard() {
  const getStatusColor = (status: Deal["status"]) => {
    switch (status) {
      case "hot":
        return "bg-green-500"
      case "cold":
        return "bg-red-500"
      case "neutral":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-4">
      {/* Compact metrics */}
      <div className="grid gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pipeline Total</p>
                <p className="text-2xl font-bold text-foreground">$245K</p>
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
                <p className="text-2xl font-bold text-foreground">13</p>
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
                <p className="text-2xl font-bold text-foreground">46%</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority deals list */}
      <Card className="border-border bg-card">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-semibold text-foreground">Deals Prioritarios</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {priorityDeals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getStatusColor(deal.status)}`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold leading-tight text-foreground">{deal.name}</p>
                  <p className="text-xs text-muted-foreground">{deal.company}</p>
                  <p className="text-xs font-bold text-primary">{deal.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
