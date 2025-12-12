"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Trash2, Calendar, ChevronRight } from "lucide-react"
import { getSavedConversations, deleteConversation, formatDate, type SavedConversation } from "@/lib/api"

export default function HistorialPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<SavedConversation[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadConversations()
  }, [])

  const loadConversations = () => {
    const saved = getSavedConversations()
    setConversations(saved)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("¿Eliminar esta conversacion?")) {
      deleteConversation(id)
      loadConversations()
    }
  }

  const handleOpen = (id: string) => {
    router.push("/coach?load=" + id)
  }

  if (!mounted) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Historial</h1>
          <p className="text-muted-foreground">Tus conversaciones guardadas con el Coach</p>
        </div>

        {conversations.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No hay conversaciones guardadas</h3>
              <p className="text-muted-foreground text-center mb-4">
                Cuando tengas una conversacion valiosa con el Coach, haz clic en "Guardar" para verla aqui.
              </p>
              <Button onClick={() => router.push("/coach")}>
                Ir al Coach
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Card 
                key={conv.id} 
                className="border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleOpen(conv.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{conv.nombre}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(conv.fecha)}</span>
                            <span>•</span>
                            <span>{conv.mensajes.length} mensajes</span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground truncate pl-11">
                        {conv.preview}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {conversations.length > 0 && (
          <p className="mt-6 text-sm text-muted-foreground text-center">
            {conversations.length} conversacion{conversations.length !== 1 ? "es" : ""} guardada{conversations.length !== 1 ? "s" : ""}
          </p>
        )}
      </main>
    </div>
  )
}
