import LoadingSpinner from './LoadingSpinner'
import { cn } from '@/lib/utils'

export default function LoadingOverlay({ 
  loading = false, 
  children,
  spinnerSize = 'lg',
  text = 'Loading...',
  className 
}) {
  if (!loading) return children

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <LoadingSpinner size={spinnerSize} className="mx-auto mb-3" />
          {text && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
          )}
        </div>
      </div>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
    </div>
  )
}