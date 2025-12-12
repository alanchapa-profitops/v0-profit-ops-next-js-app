import { Sidebar } from "@/components/sidebar"

export default function ConfiguracionPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
            <p className="text-muted-foreground">Ajusta las preferencias de tu cuenta</p>
          </div>

          <div className="flex h-[600px] items-center justify-center rounded-lg border-2 border-dashed border-border">
            <p className="text-muted-foreground">Funcionalidad de Configuración en desarrollo</p>
          </div>
        </div>
      </main>
    </div>
  )
}
