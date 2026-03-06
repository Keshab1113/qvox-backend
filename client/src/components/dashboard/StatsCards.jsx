import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  MinusCircle 
} from 'lucide-react'

const statCards = [
  {
    title: 'Total Calls',
    key: 'total_calls',
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    format: (value) => value?.toLocaleString() || '0'
  },
  {
    title: 'Success',
    key: 'success_calls',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    format: (value) => value?.toLocaleString() || '0'
  },
  {
    title: 'Failed',
    key: 'failed_calls',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    format: (value) => value?.toLocaleString() || '0'
  },
  {
    title: 'Pending',
    key: 'pending_calls',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    format: (value) => value?.toLocaleString() || '0'
  }
]

export default function StatsCards({ stats }) {
  if (!stats) return null

  const successRate = stats.total_calls 
    ? ((stats.success_calls / stats.total_calls) * 100).toFixed(1)
    : 0

  return (
    <>
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        
        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg ${card.bgColor} p-2`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.format(value)}</div>
              {card.key === 'success_calls' && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    {successRate}% success rate
                  </div>
                  {successRate > 80 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : successRate > 50 ? (
                    <MinusCircle className="h-3 w-3 text-yellow-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
              )}
              {card.key === 'failed_calls' && stats.failed_calls > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {((stats.failed_calls / stats.total_calls) * 100).toFixed(1)}% failure rate
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}