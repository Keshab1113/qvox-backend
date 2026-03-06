import { NavLink } from 'react-router-dom'
import {
  Home,
  Mic,
  Key,
  FileText,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transcribe', href: '/transcribe', icon: Mic },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="w-64 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                    <span>{item.name}</span>
                    {item.name === 'Transcribe' && !isActive && (
                      <Sparkles className="h-3 w-3 ml-auto text-yellow-500" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium">QVox API Tester</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}