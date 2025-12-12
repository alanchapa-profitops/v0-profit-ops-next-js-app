"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { MiniDashboard } from "@/components/mini-dashboard"
import { fetchDashboardData, type DashboardData, type Deal } from "@/lib/api"

export default function CoachPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchDashboardData()
      setDashboardData(data)
    } catch (err) {
      console.error("Error loading dashboard:", err)
      setError("Error cargando datos del pipeline")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDealClick = (deal: Deal) => {
    console.log("Deal clicked:", deal)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="flex h-full gap-4 p-4">
          <div className="w-[35%] overflow-y-auto">
            <MiniDashboard 
              data={dashboardData}
              isLoading={isLoading}
              onDealClick={handleDealClick}
            />
            {error && (
              <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                {error}
                <button 
                  onClick={loadDashboardData}
                  className="ml-2 underline hover:no-underline"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>

          <div className="flex-1">
            <ChatInterface pipelineData={dashboardData} />
          </div>
        </div>
      </main>
    </div>
  )
}
