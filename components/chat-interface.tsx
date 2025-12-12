"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Paperclip, Send, Download, Target, Plus } from "lucide-react"

interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hola Alan, soy tu Coach de Ventas B2B. Estoy aquí para ayudarte a cerrar más deals, analizar tu pipeline y optimizar tu estrategia. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Entendido. Basándome en tu pipeline actual de $245K y tus 13 deals activos, veo oportunidades clave en TechCorp S.A. e Innovate Inc. Ambos están marcados como 'hot' y tienen fechas de cierre próximas. ¿Quieres que analicemos estrategias específicas para estos deals?",
        timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
    textareaRef.current?.focus()
  }

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      {/* Header */}
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
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Activo</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMessages([
                {
                  id: "1",
                  role: "assistant",
                  content:
                    "Hola Alan, soy tu Coach de Ventas B2B. Estoy aquí para ayudarte a cerrar más deals, analizar tu pipeline y optimizar tu estrategia. ¿En qué puedo ayudarte hoy?",
                  timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
                },
              ])
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva conversación
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Descargar como Markdown</DropdownMenuItem>
              <DropdownMenuItem>Descargar como PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] space-y-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary to-primary/80 text-white"
                      : "border border-border bg-muted/50"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed ${message.role === "user" ? "text-white" : "text-foreground"}`}
                  >
                    {message.content}
                  </p>
                </div>
                <p className="px-2 text-xs text-muted-foreground">{message.timestamp}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] space-y-1">
                <div className="rounded-2xl border border-border bg-muted/50 p-4">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-transparent"
            onClick={() => handleQuickAction("Analiza las alertas de mi pipeline")}
          >
            📊 Analizar alertas
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-transparent"
            onClick={() => handleQuickAction("Crea un plan de acción para esta semana")}
          >
            📅 Plan semanal
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-transparent"
            onClick={() => handleQuickAction("¿Qué deals tengo más cerca de cerrar?")}
          >
            🎯 Deals a cerrar
          </Button>
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
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
          />
          <Button
            onClick={handleSend}
            size="icon"
            className="shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
