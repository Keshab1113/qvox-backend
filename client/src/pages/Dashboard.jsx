import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import StatsCards from '@/components/dashboard/StatsCards'
import ActivityChart from '@/components/dashboard/ActivityChart'
import { getStats } from '../services/api'
import { Activity, Users, FileText, Clock } from 'lucide-react'

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Overview of your API usage and performance
        </p>
      </div>

      <StatsCards stats={stats?.overall} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityChart data={stats?.daily} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.by_api_key?.slice(0, 5).map((key) => (
                    <div key={key.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{key.key_name}</p>
                        <p className="text-sm text-gray-500">
                          {key.total_calls} calls
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${key.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Success Rate</span>
                    </div>
                    <span className="font-medium">
                      {stats?.overall?.total_calls 
                        ? ((stats.overall.success_calls / stats.overall.total_calls) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Avg Duration</span>
                    </div>
                    <span className="font-medium">
                      {stats?.overall?.avg_duration_ms 
                        ? `${(stats.overall.avg_duration_ms / 1000).toFixed(2)}s`
                        : '0s'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}