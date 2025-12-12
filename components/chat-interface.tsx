"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, Target, Plus, Save, X } from "lucide-react"
import { 
  sendChatMessage, 
  SYSTEM_PROMPT_BASE, 
  saveConversation,
  getConversation,
  updateConversation,
  type ChatMessage, 
  type DashboardData,
  type SavedMessage 
} from "@/lib/api"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: string
}

interface ChatInterfaceProps {
  pipelineData?: DashboardData
}

export function ChatInterface({ pipelineData }: ChatInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [conversationName, setConversationName] = useState("")
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMounted(true)
    
    // Verificar si hay una conversacion para cargar
    const loadId = searchParams.get("load")
    if (loadId) {
      const saved = getConversation(loadId)
      if (saved) {
        setMessages(saved.mensajes.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })))
        setCurrentConversationId(loadId)
        setConversationName(saved.nombre)
        return
      }
    }
    
    // Mensaje inicial por defecto
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hola Alan, soy tu Coach de Ventas B2B. Estoy aqui para ayudarte a cerrar mas deals, analizar tu pipeline y optimizar tu estrategia. En que puedo ayudarte hoy?",
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      },
    ])
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const buildSystemPrompt = () => {
    let prompt = SYSTEM_PROMPT_BASE
    
    if (pipelineData) {
      prompt += "\n\n=== DATOS ACTUALES DEL PIPELINE ==="
      prompt += "\nFecha de hoy: " + new Date().toLocaleDateString("es-MX")
      prompt += "\nPipeline Total: $" + (pipelineData.pipeline_generado_imr || 0).toLocaleString() + " MXN"
      prompt += "\nDeals Abiertos: " + (pipelineData.deals_abiertos || 0)
      prompt += "\nCierres Esta Semana: " + (pipelineData.cierres_esta_semana || 0)
      prompt += "\nGanado Este Mes: $" + (pipelineData.ganado_imr_mes || 0).toLocaleString() + " MXN"
      prompt += "\nObjetivo Mensual: $" + (pipelineData.objetivo_imr || 105000).toLocaleString() + " MXN"
      
      if (pipelineData.accion_inmediata && pipelineData.accion_inmediata.length > 0) {
        prompt += "\n\n=== DEALS EN ACCION INMEDIATA (Requieren atencion urgente) ==="
        pipelineData.accion_inmediata.forEach((deal, index) => {
          prompt += "\n\n" + (index + 1) + ". " + deal.deal_title
          prompt += "\n   Empresa: " + deal.org_name
          prompt += "\n   Contacto: " + (deal.person_name || "No especificado")
          prompt += "\n   Valor IMR: $" + (deal.value_imr || 0).toLocaleString() + " MXN"
          if (deal.value_vtc) prompt += "\n   Valor VTC: $" + deal.value_vtc.toLocaleString() + " MXN"
          prompt += "\n   Estado: " + deal.estado.toUpperCase()
          prompt += "\n   Alerta: " + (deal.estado_mensaje || "Sin alerta especifica")
          prompt += "\n   Fecha de Cierre: " + (deal.expected_close_date || "No definida")
          prompt += "\n   Etapa: " + (deal.stage_name || "No especificada")
          prompt += "\n   Probabilidad: " + (deal.probability || 0) + "%"
          if (deal.next_activity_subject) {
            prompt += "\n   Proxima Actividad: " + deal.next_activity_subject
            if (deal.next_activity_date) prompt += " (" + deal.next_activity_date + ")"
          } else {
            prompt += "\n   Proxima Actividad: SIN ACTIVIDAD PROGRAMADA"
          }
        })
      }
      
      if (pipelineData.proximos_cierres && pipelineData.proximos_cierres.length > 0) {
        prompt += "\n\n=== PROXIMOS CIERRES (Deals cercanos a cerrar) ==="
        pipelineData.proximos_cierres.forEach((deal, index) => {
          prompt += "\n" + (index + 1) + ". " + deal.deal_title + " (" + deal.org_name + ") - $" + (deal.value_imr || 0).toLocaleString() + " - Cierre: " + deal.expected_close_date
        })
      }
    }
    
    return prompt
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const history: ChatMessage[] = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const systemPrompt = buildSystemPrompt()
      const response = await sendChatMessage(input.trim(), history, systemPrompt, pipelineData)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response || "Lo siento, hubo un error procesando tu mensaje.",
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error conectando con el servidor. Por favor intenta de nuevo.",
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleNewConversation = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hola Alan, soy tu Coach de Ventas B2B. En que puedo ayudarte?",
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setCurrentConversationId(null)
    setConversationName("")
    router.push("/coach")
  }

  const handleSaveConversation = () => {
    if (!conversationName.trim()) return
    
    const savedMessages: SavedMessage[] = messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }))
    
    if (currentConversationId) {
      updateConversation(currentConversationId, savedMessages)
    } else {
      const saved = saveConversation(conversationName.trim(), savedMessages)
      setCurrentConversationId(saved.id)
    }
    
    setShowSaveDialog(false)
  }

  if (!mounted) {
    return (
      <Card className="flex h-full flex-col border-border bg-card">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {currentConversationId ? conversationName : "Coach de Ventas B2B"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentConversationId ? "Conversacion guardada" : "Asistente inteligente"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Activo</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleNewConversation}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
            <Save className="mr-2 h-4 w-4" />
            {currentConversationId ? "Actualizar" : "Guardar"}
          </Button>
        </div>
        
        {showSaveDialog && (
          <div className="mt-4 p-3 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
                placeholder="Nombre de la conversacion..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveConversation()
                  if (e.key === "Escape") setShowSaveDialog(false)
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveConversation} disabled={!conversationName.trim()}>
                Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowSaveDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className="max-w-[80%]">
                <div className={message.role === "user" ? "rounded-2xl p-4 bg-primary text-primary-foreground" : "rounded-2xl p-4 border border-border bg-muted/50"}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="px-2 text-xs text-muted-foreground mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-muted/50 p-4">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: "0.1s"}} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{animationDelay: "0.2s"}} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setInput("Analiza mis alertas del pipeline")}>
            Analizar alertas
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput("Dame un plan para esta semana")}>
            Plan semanal
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput("Que deals puedo cerrar pronto?")}>
            Deals a cerrar
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Escribe tu mensaje..."
            className="min-h-[60px] resize-none"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="shrink-0 bg-primary"
            disabled={isTyping || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
