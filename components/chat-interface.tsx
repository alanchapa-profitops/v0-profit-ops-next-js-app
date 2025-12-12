"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Paperclip, Send, Download, Target, Plus, X, FileText, Image as ImageIcon } from "lucide-react"
import { sendChatMessage, SYSTEM_PROMPT_BASE, type ChatMessage, type DashboardData } from "@/lib/api"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: string
}

interface ChatInterfaceProps {
  pipelineData?: DashboardData
}

const WELCOME_MESSAGE = `Hola Alan, soy tu Coach de Ventas B2B. Estoy aqui para ayudarte a cerrar mas deals, analizar tu pipeline y optimizar tu estrategia. En que puedo ayudarte hoy?`

export function ChatInterface({ pipelineData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const savedHistory = localStorage.getItem("profitops-chat-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      } catch (e) {
        console.error("Error loading chat history:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("profitops-chat-history", JSON.stringify(messages.slice(-50)))
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

      let systemPrompt = SYSTEM_PROMPT_BASE
      if (pipelineData) {
        systemPrompt += "\n\n=== DATOS ACTUALES DEL PIPELINE ===\n"
        systemPrompt += "Pipeline Total: $" + (pipelineData.pipeline_generado_imr || 0).toLocaleString() + " MXN\n"
        systemPrompt += "Deals Abiertos: " + (pipelineData.deals_abiertos || 0) + "\n"
        systemPrompt += "Cierres Esta Semana: " + (pipelineData.cierres_esta_semana || 0) + "\n"
        systemPrompt += "Ganado Este Mes: $" + (pipelineData.ganado_imr_mes || 0).toLocaleString() + " / $" + (pipelineData.objetivo_imr || 105000).toLocaleString() + " MXN\n"
        
        if (pipelineData.accion_inmediata && pipelineData.accion_inmediata.length > 0) {
          systemPrompt += "\nDeals en Accion Inmediata:\n"
          pipelineData.accion_inmediata.slice(0, 5).forEach(d => {
            systemPrompt += "- " + d.deal_title + " (" + d.org_name + ") - $" + (d.value_imr || 0).toLocaleString() + " - Estado: " + d.estado + " - " + d.estado_mensaje + "\n"
          })
        }
      }

      const response = await sendChatMessage(input.trim(), history, systemPrompt, pipelineData)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response || response.content || "Lo siento, hubo un error procesando tu mensaje.",
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

  const handleQuickAction = (action: string) => {
    setInput(action)
    textareaRef.current?.focus()
  }

  const handleNewConversation = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    localStorage.removeItem("profitops-chat-history")
  }

  const handleDownload = (format: "markdown" | "pdf") => {
    const content = messages
      .map(m => "**" + (m.role === "assistant" ? "Coach" : "Alan") + "** (" + m.timestamp + "):\n" + m.content)
      .join("\n\n---\n\n")

    if (format === "markdown") {
      const blob = new Blob(["# Conversacion ProfitOps Coach\n\n" + content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "profitops-chat-" + new Date().toISOString().split("T")[0] + ".md"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Coach de Ventas B2B</h2>
              <p className="text-sm text-muted-foreground">Asistente inteligente para optimizar tus ventas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Activo</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleNewConversation}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva conversacion
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownload("markdown")}>
                Descargar como Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] space-y-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`rounded-2xl p-4 ${message.role === "user" ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" : "border border-border bg-muted/50"}`}>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${message.role === "user" ? "text-primary-foreground" : "text-foreground"}`}>
                    {message.content}
                  </p>
                </div>
                <p className="px-2 text-xs text-muted-foreground">{message.timestamp}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] space-y-1">
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "-0.3s" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "-0.15s" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={() => handleQuickAction("Analiza las alertas de mi pipeline y dime que deals necesitan atencion urgente")}>
            Analizar alertas
          </Button>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={() => handleQuickAction("Crea un plan de accion para esta semana basado en mis deals prioritarios")}>
            Plan semanal
          </Button>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent" onClick={() => handleQuickAction("Que deals tengo mas cerca de cerrar y que debo hacer para avanzarlos?")}>
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
            className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            disabled={isTyping || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
