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
  files?: FileAttachment[]
}

interface FileAttachment {
  name: string
  type: string
  content: string
}

interface ChatInterfaceProps {
  pipelineData?: DashboardData
}

const WELCOME_MESSAGE = `¡Hola Alan! 👋 Soy tu Coach de Ventas B2B.

Estoy aquí para ayudarte a:
- Analizar tu pipeline y priorizar deals
- Preparar estrategias para tus llamadas
- Identificar riesgos y oportunidades
- Darte coaching personalizado

¿En qué puedo ayudarte hoy?`

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
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if (!input.trim() && attachedFiles.length === 0) return

    let messageContent = input.trim()
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map(f => f.name).join(", ")
      messageContent = messageContent 
        ? `${messageContent}\n\n[Archivos adjuntos: ${fileNames}]`
        : `[Archivos adjuntos: ${fileNames}]`
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      files: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachedFiles([])
    setIsTyping(true)

    try {
      const history: ChatMessage[] = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      let systemPrompt = SYSTEM_PROMPT_BASE
      if (pipelineData) {
        systemPrompt += `\n\n=== DATOS ACTUALES DEL PIPELINE ===
Pipeline Total: $${pipelineData.pipeline_generado_imr?.toLocaleString() || 0} MXN
Deals Abiertos: ${pipelineData.deals_abiertos || 0}
Cierres Esta Semana: ${pipelineData.cierres_esta_semana || 0}
Ganado Este Mes: $${pipelineData.ganado_imr_mes?.toLocaleString() || 0} / $${pipelineData.objetivo_imr?.toLocaleString() || 105000} MXN

Deals en Acción Inmediata:
${pipelineData.accion_inmediata?.slice(0, 5).map(d => 
  `- ${d.deal_title} (${d.org_name}) - $${d.value_imr?.toLocaleString()} - Estado: ${d.estado} - ${d.estado_mensaje}`
).join('\n') || 'No hay datos disponibles'}`
      }

      let fullMessage = messageContent
      if (attachedFiles.length > 0) {
        const fileContents = attachedFiles
          .filter(f => f.type.startsWith('text/') || f.type === 'application/json')
          .map(f => `\n--- Contenido de ${f.name} ---\n${f.content}`)
          .join('\n')
        if (fileContents) {
          fullMessage += fileContents
        }
      }

      const response = await sendChatMessage(fullMessage, history, systemPrompt, pipelineData)

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const reader = new FileReader()
      
      if (file.type.startsWith('image/')) {
        reader.onload = () => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            content: reader.result as string,
          }])
        }
        reader.readAsDataURL(file)
      } else {
        reader.onload = () => {
          setAttachedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            content: reader.result as string,
          }])
        }
        reader.readAsText(file)
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
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
      .map(m => `**${m.role === 'assistant' ? 'Coach' : 'Alan'}** (${m.timestamp}):\n${m.content}`)
      .join('\n\n---\n\n')

    if (format === "markdown") {
      const blob = new Blob([`# Conversación ProfitOps Coach\n\n${content}`], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `profitops-chat-${new Date().toISOString().split('T')[0]}.md`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
