import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, BarChart2, TrendingUp } from 'lucide-react'

const chartTypes = [
  { value: 'area', label: 'Area', icon: Activity },
  { value: 'line', label: 'Line', icon: TrendingUp },
  { value: 'bar', label: 'Bar', icon: BarChart2 },
]

const timeRanges = [
  { value: '7', label: '7d' },
  { value: '30', label: '30d' },
  { value: '90', label: '90d' },
]

export default function ActivityChart({ data = [] }) {
  const [chartType, setChartType] = useState('area')
  const [timeRange, setTimeRange] = useState('30')

  const filteredData = data.slice(-parseInt(timeRange))

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="stat_date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value?.slice(5) || ''}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total_calls" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Total Calls"
            />
            <Line 
              type="monotone" 
              dataKey="success_calls" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              name="Success"
            />
            <Line 
              type="monotone" 
              dataKey="failed_calls" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
              name="Failed"
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="stat_date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value?.slice(5) || ''}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Bar dataKey="total_calls" fill="#3b82f6" name="Total Calls" />
            <Bar dataKey="success_calls" fill="#10b981" name="Success" />
            <Bar dataKey="failed_calls" fill="#ef4444" name="Failed" />
          </BarChart>
        )

      default:
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="stat_date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value?.slice(5) || ''}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="total_calls" 
              stackId="1"
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
              name="Total Calls"
            />
            <Area 
              type="monotone" 
              dataKey="success_calls" 
              stackId="2"
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.3}
              name="Success"
            />
            <Area 
              type="monotone" 
              dataKey="failed_calls" 
              stackId="2"
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.3}
              name="Failed"
            />
          </AreaChart>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={chartType} onValueChange={setChartType} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-3">
            {chartTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger key={type.value} value={type.value}>
                  <Icon className="h-4 w-4 mr-2" />
                  {type.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
          <Activity className="h-12 w-12 mb-3 opacity-50" />
          <p>No activity data available</p>
          <p className="text-sm">Make some transcription requests to see charts</p>
        </div>
      )}
    </div>
  )
}