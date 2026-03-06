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
import { motion } from 'framer-motion'

const statCards = [
  {
    title: 'Total Calls',
    key: 'total_calls',
    icon: Activity,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    format: (value) => value?.toLocaleString() || '0',
    description: 'Total API requests'
  },
  {
    title: 'Success',
    key: 'success_calls',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    borderColor: 'border-green-200',
    format: (value) => value?.toLocaleString() || '0',
    description: 'Successful requests'
  },
  {
    title: 'Failed',
    key: 'failed_calls',
    icon: XCircle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50',
    borderColor: 'border-red-200',
    format: (value) => value?.toLocaleString() || '0',
    description: 'Failed requests'
  },
  {
    title: 'Pending',
    key: 'pending_calls',
    icon: Clock,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    format: (value) => value?.toLocaleString() || '0',
    description: 'Pending requests'
  }
]

export default function StatsCards({ stats }) {
  if (!stats) return null

  const successRate = stats.total_calls 
    ? ((stats.success_calls / stats.total_calls) * 100).toFixed(1)
    : 0

  const getSuccessRateIcon = () => {
    if (successRate > 80) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (successRate > 50) return <MinusCircle className="h-3 w-3 text-yellow-600" />
    return <TrendingDown className="h-3 w-3 text-red-600" />
  }

  const getSuccessRateColor = () => {
    if (successRate > 80) return 'text-green-600'
    if (successRate > 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    >
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        const isSuccessCard = card.key === 'success_calls'
        
        return (
          <motion.div key={card.key} variants={item}>
            <Card className="border border-gray-200 bg-white hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`rounded-lg ${card.iconBg} p-2 border ${card.borderColor}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {card.format(value)}
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {card.description}
                  </span>
                  
                  {isSuccessCard && (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${getSuccessRateColor()}`}>
                        {successRate}%
                      </span>
                      {getSuccessRateIcon()}
                    </div>
                  )}
                </div>

                {/* Progress Bar for Success/Failed */}
                {card.key === 'failed_calls' && stats.failed_calls > 0 && (
                  <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.failed_calls / stats.total_calls) * 100}%` }}
                      className="h-full bg-red-500 rounded-full"
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                )}

                {isSuccessCard && (
                  <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${successRate}%` }}
                      className="h-full bg-green-500 rounded-full"
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}