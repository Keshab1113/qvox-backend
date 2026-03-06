import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Loader2 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Success'
  },
  failed: {
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Failed'
  },
  pending: {
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Pending'
  },
  processing: {
    icon: Loader2,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    label: 'Processing'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    label: 'Warning'
  }
}

export default function StatusBadge({ status, showIcon = true, className }) {
  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge className={cn('flex items-center gap-1 w-fit', config.className, className)}>
      {showIcon && (
        <Icon className={cn('h-3 w-3', status === 'processing' && 'animate-spin')} />
      )}
      {config.label}
    </Badge>
  )
}