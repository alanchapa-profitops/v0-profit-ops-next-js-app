const N8N_BASE_URL = "https://profitops.app.n8n.cloud";

export const API_ENDPOINTS = {
  dashboard: `${N8N_BASE_URL}/webhook/profitops-coaching`,
  chat: `${N8N_BASE_URL}/webhook/profitops-chat`,
  crm: `${N8N_BASE_URL}/webhook/profitops-crm`,
};

export interface Deal {
  deal_id: number;
  deal_title: string;
  org_name: string;
  person_name: string;
  value_imr: number;
  value_vtc: number;
  expected_close_date: string;
  estado: "rojo" | "verde" | "gris";
  estado_mensaje: string;
  next_activity_subject: string | null;
  next_activity_date: string | null;
  stage_name: string;
  probability: number;
}

export interface DashboardData {
  pipeline_generado_imr: number;
  deals_abiertos: number;
  cierres_esta_semana: number;
  objetivo_imr: number;
  ganado_imr_mes: number;
  accion_inmediata: Deal[];
  proximos_cierres: Deal[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
}

export interface SavedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SavedConversation {
  id: string;
  nombre: string;
  fecha: string;
  mensajes: SavedMessage[];
  preview: string;
}

// ============ API FUNCTIONS ============

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch(API_ENDPOINTS.dashboard, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Error fetching dashboard");
  const data = await response.json();
  
  const metricas = data.metricas || {};
  
  return {
    pipeline_generado_imr: metricas.pipeline_generado_imr || 0,
    deals_abiertos: metricas.deals_abiertos || 0,
    cierres_esta_semana: metricas.cierres_esta_semana || 0,
    objetivo_imr: metricas.objetivo_imr || 105000,
    ganado_imr_mes: metricas.ganado_imr_mes || 0,
    accion_inmediata: data.accion_inmediata || [],
    proximos_cierres: data.proximos_cierres || [],
  };
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  systemPrompt: string,
  pipelineData?: DashboardData
): Promise<ChatResponse> {
  const response = await fetch(API_ENDPOINTS.chat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      system: systemPrompt,
      pipelineData,
    }),
  });
  if (!response.ok) throw new Error("Error sending chat");
  const data = await response.json();
  
  let responseText = "";
  if (data.content && data.content[0] && data.content[0].text) {
    responseText = data.content[0].text;
  } else if (data.response) {
    responseText = data.response;
  } else if (typeof data === "string") {
    responseText = data;
  }
  return { response: responseText };
}

// ============ CONVERSATION STORAGE ============

const STORAGE_KEY = "profitops-saved-conversations";

export function getSavedConversations(): SavedConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveConversation(nombre: string, mensajes: SavedMessage[]): SavedConversation {
  const conversations = getSavedConversations();
  
  const newConversation: SavedConversation = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    nombre,
    fecha: new Date().toISOString(),
    mensajes,
    preview: mensajes.filter(m => m.role === "user")[0]?.content.substring(0, 100) || "Conversacion guardada",
  };
  
  conversations.unshift(newConversation);
  
  // Mantener maximo 50 conversaciones
  const trimmed = conversations.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  
  return newConversation;
}

export function getConversation(id: string): SavedConversation | null {
  const conversations = getSavedConversations();
  return conversations.find(c => c.id === id) || null;
}

export function deleteConversation(id: string): void {
  const conversations = getSavedConversations();
  const filtered = conversations.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateConversation(id: string, mensajes: SavedMessage[]): void {
  const conversations = getSavedConversations();
  const index = conversations.findIndex(c => c.id === id);
  if (index !== -1) {
    conversations[index].mensajes = mensajes;
    conversations[index].fecha = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }
}

// ============ UTILITY FUNCTIONS ============

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1000000) return "$" + (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return "$" + Math.round(value / 1000) + "K";
  return "$" + value;
}

export function getStatusColor(estado: Deal["estado"]): string {
  switch (estado) {
    case "rojo": return "bg-red-500";
    case "verde": return "bg-green-500";
    case "gris": return "bg-gray-500";
    default: return "bg-gray-500";
  }
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SYSTEM_PROMPT_BASE = "Eres el Coach de Ventas B2B de Alan Chapa, Director Comercial de Catalyst Group. Tu rol es ayudarle a analizar su pipeline, priorizar deals, preparar estrategias para llamadas y reuniones, e identificar riesgos y oportunidades. Se directo y accionable. Usa datos especificos del pipeline cuando los tengas.";
