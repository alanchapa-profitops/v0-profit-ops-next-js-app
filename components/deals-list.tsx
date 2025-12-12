import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Deal {
  id: string
  name: string
  company: string
  value: string
  closeDate: string
  status: "hot" | "cold" | "neutral"
}

const deals: Deal[] = [
  {
    id: "1",
    name: "Sistema CRM Enterprise",
    company: "TechCorp S.A.",
    value: "$45,000",
    closeDate: "15 Dic 2024",
    status: "hot",
  },
  {
    id: "2",
    name: "Licencias SaaS Anuales",
    company: "Innovate Inc.",
    value: "$28,500",
    closeDate: "20 Dic 2024",
    status: "hot",
  },
  {
    id: "3",
    name: "Consultoría Digital",
    company: "Global Solutions",
    value: "$12,800",
    closeDate: "30 Dic 2024",
    status: "neutral",
  },
  {
    id: "4",
    name: "Integración API",
    company: "StartupXYZ",
    value: "$8,200",
    closeDate: "10 Ene 2025",
    status: "cold",
  },
  {
    id: "5",
    name: "Desarrollo Custom",
    company: "Enterprise Co.",
    value: "$65,000",
    closeDate: "25 Ene 2025",
    status: "hot",
  },
  {
    id: "6",
    name: "Soporte Premium",
    company: "MidSize Corp",
    value: "$15,400",
    closeDate: "05 Feb 2025",
    status: "neutral",
  },
]

export function DealsList() {
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
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Pipeline Activo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              {/* Status indicator */}
              <div className={`h-3 w-3 rounded-full ${getStatusColor(deal.status)}`} />

              {/* Deal info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{deal.name}</p>
                    <p className="text-sm text-muted-foreground">{deal.company}</p>
                  </div>
                  <p className="font-bold text-primary">{deal.value}</p>
                </div>
                <p className="text-xs text-muted-foreground">Cierre: {deal.closeDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
