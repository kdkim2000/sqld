import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 (고정) */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* 본문 영역: 사이드바 + 메인 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
