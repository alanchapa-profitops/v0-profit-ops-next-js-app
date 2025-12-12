import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { MiniDashboard } from "@/components/mini-dashboard"

export default function CoachPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="flex h-full gap-4 p-4">
          {/* Left column: Mini Dashboard */}
          <div className="w-[35%] overflow-y-auto">
            <MiniDashboard />
          </div>

          {/* Right column: Chat Interface */}
          <div className="flex-1">
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  )
}
