import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function Layout() {
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-50 dark:via-gray-200 dark:to-gray-100">
      <Header />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed bottom-4 right-4 z-50 lg:hidden bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      {isMobile && <MobileNav />}
    </div>
  )
}