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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, BarChart2, TrendingUp, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const chartTypes = [
  { value: 'area', label: 'Area', icon: Activity },
  { value: 'line', label: 'Line', icon: TrendingUp },
  { value: 'bar', label: 'Bar', icon: BarChart2 },
]

const timeRanges = [
  { value: '7', label: '7d', description: 'Last 7 days' },
  { value: '30', label: '30d', description: 'Last 30 days' },
  { value: '90', label: '90d', description: 'Last 90 days' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {new Date(label).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function ActivityChart({ data = [] }) {
  const [chartType, setChartType] = useState('area')
  const [timeRange, setTimeRange] = useState('30')
  const [showLegend, setShowLegend] = useState(true)

  const filteredData = data.slice(-parseInt(timeRange))

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    }

    const chartConfig = {
      area: (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis 
            dataKey="stat_date" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ color: '#374151' }}
            />
          )}
          <Area 
            type="monotone" 
            dataKey="total_calls" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fill="url(#colorTotal)"
            name="Total Calls"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#3B82F6' }}
          />
          <Area 
            type="monotone" 
            dataKey="success_calls" 
            stroke="#10B981" 
            strokeWidth={2}
            fill="url(#colorSuccess)"
            name="Success"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
          />
          <Area 
            type="monotone" 
            dataKey="failed_calls" 
            stroke="#EF4444" 
            strokeWidth={2}
            fill="url(#colorFailed)"
            name="Failed"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }}
          />
        </AreaChart>
      ),
      line: (
        <LineChart {...commonProps}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis 
            dataKey="stat_date" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ color: '#374151' }}
            />
          )}
          <Line 
            type="monotone" 
            dataKey="total_calls" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
            name="Total Calls"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#3B82F6' }}
          />
          <Line 
            type="monotone" 
            dataKey="success_calls" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={false}
            name="Success"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }}
          />
          <Line 
            type="monotone" 
            dataKey="failed_calls" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={false}
            name="Failed"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }}
          />
        </LineChart>
      ),
      bar: (
        <BarChart {...commonProps}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis 
            dataKey="stat_date" 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ color: '#374151' }}
            />
          )}
          <Bar 
            dataKey="total_calls" 
            fill="#3B82F6" 
            name="Total Calls"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="success_calls" 
            fill="#10B981" 
            name="Success"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="failed_calls" 
            fill="#EF4444" 
            name="Failed"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      )
    }

    return chartConfig[chartType]
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={chartType} onValueChange={setChartType} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-[300px] bg-gray-100 p-1">
            {chartTypes.map((type) => {
              const Icon = type.icon
              return (
                <TabsTrigger
                  key={type.value}
                  value={type.value}
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all text-gray-600 data-[state=active]:text-gray-900"
                >
                  <Icon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-gray-200 bg-white hover:bg-gray-50"
            onClick={() => setShowLegend(!showLegend)}
          >
            <Filter className="h-4 w-4 text-gray-600" />
          </Button>
          
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range.value)}
                className={`relative px-2 sm:px-3 ${
                  timeRange === range.value 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
                title={range.description}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={chartType + timeRange}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-[300px] sm:h-[350px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {filteredData.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-[300px]"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900">No activity data available</p>
          <p className="text-sm text-gray-500 mt-1">Make some transcription requests to see charts</p>
          <Button variant="outline" size="sm" className="mt-4 border-gray-200 bg-white hover:bg-gray-50">
            View Documentation
          </Button>
        </motion.div>
      )}
    </div>
  )
}