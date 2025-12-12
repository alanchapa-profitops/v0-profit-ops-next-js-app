// ProfitOps API Configuration
// Conecta el frontend con los webhooks de n8n

const N8N_BASE_URL = "https://profitops.app.n8n.cloud";

export const API_ENDPOINTS = {
  dashboard: `${N8N_BASE_URL}/webhook/profitops-coaching`,
  chat: `${N8N_BASE_URL}/webhook/profitops-chat`,
  crm: `${N8N_BASE_URL}/webhook/profitops-crm`,
};

// Types
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

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  system: string;
  pipelineData?: DashboardData;
}

export interface ChatResponse {
  response: string;
  tool_used?: boolean;
  tool_result?: any;
}

// API Functions

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const response = await fetch(API_ENDPOINTS.dashboard, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching dashboard: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  systemPrompt: string,
  pipelineData?: DashboardData
): Promise<ChatResponse> {
  try {
    const response = await fetch(API_ENDPOINTS.chat, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history,
        system: systemPrompt,
        pipelineData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error sending chat: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyShort(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
}

export function getStatusColor(estado: Deal["estado"]): string {
  switch (estado) {
    case "rojo":
      return "bg-red-500";
    case "verde":
      return "bg-green-500";
    case "gris":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
}

export const SYSTEM_PROMPT_BASE = "Eres el Coach de Ventas B2B de Alan Chapa, Director Comercial de Catalyst Group.\n\nTu rol es ayudarle a:\n1. Analizar su pipeline y priorizar deals\n2. Preparar estrategias para llamadas y reuniones\n3. Identificar riesgos y oportunidades en su cartera\n4. Dar coaching basado en metodologias SPIN, Challenger Sale, MEDDIC y Sandler\n\nCaracteristicas de tu comunicacion:\n- Se directo y accionable\n- Usa datos especificos del pipeline cuando los tengas\n- Haz preguntas que generen reflexion\n- Celebra los avances y manten el momentum\n\nContexto del usuario:\n- Alan tiene 10+ anos de experiencia en BD (Dropbox, Rubrik, Canonical)\n- Catalyst Group genera ~$900K MXN/mes con servicios de marketing B2B\n- Su objetivo es escalar de $245K a $400K MXN/mes para octubre 2025\n- Pipeline actual: Catalyst - Prospectos (pipeline_id: 5)";
