import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function EmptyState({ 
  icon: Icon,
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  action,
  className 
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {Icon && (
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant={action.variant || 'default'}>
          {action.icon && <action.icon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}