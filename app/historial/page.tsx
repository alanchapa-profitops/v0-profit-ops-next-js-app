import { Sidebar } from "@/components/sidebar"

export default function HistorialPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Historial</h1>
            <p className="text-muted-foreground">Historial de actividades y conversaciones</p>
          </div>

          <div className="flex h-[600px] items-center justify-center rounded-lg border-2 border-dashed border-border">
            <p className="text-muted-foreground">Funcionalidad de Historial en desarrollo</p>
          </div>
        </div>
      </main>
    </div>
  )
}
