import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCards from "@/components/dashboard/StatsCards";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { getStats } from "../services/api";
import {
  Activity,
  Users,
  FileText,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-white min-h-screen">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[450px] rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-4 md:p-6 lg:p-8 bg-white min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview of your API usage and performance
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white font-medium">
            Last 30 days
          </button>
          <button className="px-3 py-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
            Custom
          </button>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div variants={itemVariants}>
        <StatsCards stats={stats?.overall} />
      </motion.div>

      {/* Tabs Section */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto flex-nowrap sm:flex-wrap justify-start">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all text-gray-600 data-[state=active]:text-gray-900"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all text-gray-600 data-[state=active]:text-gray-900"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all text-gray-600 data-[state=active]:text-gray-900"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Activity Chart Card */}
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <TrendingUp className="h-5 w-5 text-gray-700" />
                      Activity Overview
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-gray-600">Total Calls</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-gray-600">Success</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-gray-600">Failed</span>
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <ActivityChart data={stats?.daily} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Bottom Cards Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Top API Keys Card */}
              <motion.div variants={itemVariants}>
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white h-full">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <Users className="h-5 w-5 text-gray-700" />
                      Top API Keys
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                      {stats?.by_api_key?.slice(0, 5).map((key, index) => (
                        <motion.div
                          key={key.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start gap-3 mb-2 sm:mb-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium
                              ${
                                index === 0
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                  : index === 1
                                    ? "bg-gray-50 text-gray-700 border border-gray-200"
                                    : index === 2
                                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {key.key_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {key.total_calls.toLocaleString()} calls
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-11 sm:ml-0">
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${
                                key.is_active
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {key.is_active ? "Active" : "Inactive"}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </motion.div>
                      ))}

                      {(!stats?.by_api_key ||
                        stats.by_api_key.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No API keys data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats Card */}
              <motion.div variants={itemVariants}>
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white h-full">
                  <CardHeader className="border-b border-gray-100 bg-white">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <Calendar className="h-5 w-5 text-gray-700" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Success Rate Card */}
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm">
                            <Activity className="h-4 w-4 text-gray-700" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Success Rate
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats?.overall?.total_calls
                            ? (
                                (stats.overall.success_calls /
                                  stats.overall.total_calls) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stats?.overall?.success_calls?.toLocaleString()}{" "}
                          successful calls
                        </p>
                      </div>

                      {/* Avg Duration Card */}
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm">
                            <Clock className="h-4 w-4 text-gray-700" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            Avg Duration
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats?.overall?.avg_duration_ms
                            ? `${(stats.overall.avg_duration_ms / 1000).toFixed(2)}s`
                            : "0s"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Average response time
                        </p>
                      </div>

                      {/* Total Requests Card - Full Width */}
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">
                              Total Requests
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                              {stats?.overall?.total_calls?.toLocaleString() ||
                                "0"}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                            <FileText className="h-6 w-6 text-gray-700" />
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-green-700 font-medium">
                              {stats?.overall?.success_calls?.toLocaleString() ||
                                "0"}
                            </span>
                            <span className="text-gray-500">success</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-red-700 font-medium">
                              {stats?.overall?.failed_calls?.toLocaleString() ||
                                "0"}
                            </span>
                            <span className="text-gray-500">failed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="analytics">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-500">
                  Advanced analytics and insights will be available in the next
                  update
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab Content */}
          <TabsContent value="reports">
            <Card className="border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reports Coming Soon
                </h3>
                <p className="text-gray-500">
                  Generate and download detailed reports
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
