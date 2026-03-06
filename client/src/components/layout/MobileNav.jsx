import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Mic, 
  Key, 
  FileText, 
  BarChart3, 
  Settings 
} from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Transcribe', href: '/transcribe', icon: Mic },
  { name: 'Keys', href: '/api-keys', icon: Key },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}