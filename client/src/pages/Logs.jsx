import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getLogs, getApiKeys } from '../services/api'
import {
  FileText,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Logs() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [filters, setFilters] = useState({
    api_key_id: '',
    status: '',
    mode: '',
    from: '',
    to: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)
  const [dateRange, setDateRange] = useState({ from: null, to: null })

  const { data: keys } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: getApiKeys,
  })

  const { data: logsData, isLoading, refetch } = useQuery({
    queryKey: ['logs', page, limit, filters],
    queryFn: () => getLogs({ page, limit, ...filters }),
  })

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    setFilters(prev => ({
      ...prev,
      from: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      to: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
    }))
  }

  const clearFilters = () => {
    setFilters({
      api_key_id: '',
      status: '',
      mode: '',
      from: '',
      to: '',
    })
    setDateRange({ from: null, to: null })
    setSearchTerm('')
    setPage(1)
  }

  const getStatusBadge = (status) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    }
    
    const icons = {
      success: <CheckCircle className="h-3 w-3 mr-1" />,
      failed: <XCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
    }

    return (
      <Badge className={cn('flex items-center w-fit', variants[status])}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDuration = (ms) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '-'
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Logs</h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and analyze all transcription requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Narrow down logs by specific criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <Select
                value={filters.api_key_id}
                onValueChange={(value) => handleFilterChange('api_key_id', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Keys" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Keys</SelectItem>
                  {keys?.map((key) => (
                    <SelectItem key={key.id} value={key.id.toString()}>
                      {key.key_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mode</Label>
              <Select
                value={filters.mode}
                onValueChange={(value) => handleFilterChange('mode', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button variant="ghost" onClick={clearFilters} className="mb-0.5">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Logs</CardTitle>
          <CardDescription>
            Showing {logsData?.logs?.length || 0} of {logsData?.total || 0} total entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData?.logs?.map((log) => (
                      <TableRow key={log.id} className="group">
                        <TableCell className="font-mono text-xs">
                          {log.request_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>{log.key_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.mode === 'file' ? '📁 File' : '🔗 URL'}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.model || 'QVox'}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{formatDuration(log.duration_ms)}</TableCell>
                        <TableCell>{formatFileSize(log.file_size_bytes)}</TableCell>
                        <TableCell>
                          {format(new Date(log.created_at), 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedLog(log)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Log Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for request {selectedLog?.request_id}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedLog && (
                                <div className="space-y-6">
                                  {/* Overview */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm text-gray-500">Status</Label>
                                      <div className="mt-1">
                                        {getStatusBadge(selectedLog.status)}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-gray-500">HTTP Status</Label>
                                      <div className="mt-1 font-medium">
                                        {selectedLog.http_status || '-'}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-gray-500">Duration</Label>
                                      <div className="mt-1 font-medium">
                                        {formatDuration(selectedLog.duration_ms)}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm text-gray-500">Created</Label>
                                      <div className="mt-1 font-medium">
                                        {format(new Date(selectedLog.created_at), 'PPpp')}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Request Details */}
                                  <div>
                                    <h4 className="font-medium mb-2">Request Details</h4>
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <span className="text-gray-500">API Key:</span>
                                        <span className="font-mono">{selectedLog.key_name}</span>
                                        <span className="text-gray-500">Mode:</span>
                                        <span>{selectedLog.mode}</span>
                                        <span className="text-gray-500">Model:</span>
                                        <span>{selectedLog.model || 'QVox'}</span>
                                        {selectedLog.filename && (
                                          <>
                                            <span className="text-gray-500">Filename:</span>
                                            <span>{selectedLog.filename}</span>
                                          </>
                                        )}
                                        {selectedLog.source_url && (
                                          <>
                                            <span className="text-gray-500">Source URL:</span>
                                            <span className="truncate">{selectedLog.source_url}</span>
                                          </>
                                        )}
                                        <span className="text-gray-500">IP Address:</span>
                                        <span>{selectedLog.ip_address}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Output Text */}
                                  {selectedLog.output_text && (
                                    <div>
                                      <h4 className="font-medium mb-2">Transcription Output</h4>
                                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                                        <p className="whitespace-pre-wrap text-sm">
                                          {selectedLog.output_text}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Error Message */}
                                  {selectedLog.error_message && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-red-600">Error Message</h4>
                                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                          {selectedLog.error_message}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}

                    {logsData?.logs?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-gray-500">No logs found</p>
                          <p className="text-sm text-gray-400">
                            Try adjusting your filters or make some transcription requests
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {logsData?.pages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        />
                      </PaginationItem>
                      
                      {[...Array(Math.min(5, logsData.pages))].map((_, i) => {
                        let pageNum = i + 1
                        if (logsData.pages > 5) {
                          if (page > 3) {
                            pageNum = page - 3 + i
                          }
                        }
                        
                        if (pageNum <= logsData.pages) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setPage(pageNum)}
                                isActive={page === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        }
                        return null
                      })}

                      {logsData.pages > 5 && page < logsData.pages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink onClick={() => setPage(logsData.pages)}>
                              {logsData.pages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(p => Math.min(logsData.pages, p + 1))}
                          disabled={page === logsData.pages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}