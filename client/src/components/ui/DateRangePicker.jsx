import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export default function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Select date range',
}) {
  const [date, setDate] = useState(value)

  const handleSelect = (range) => {
    setDate(range)
    onChange?.(range)
  }

  const handleClear = () => {
    setDate({ from: null, to: null })
    onChange?.({ from: null, to: null })
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date?.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="text-sm font-medium">Select date range</span>
            {date?.from && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
          <div className="p-3 border-t flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {date?.from ? (
                date?.to ? (
                  <>
                    {format(date.from, 'PPP')} - {format(date.to, 'PPP')}
                  </>
                ) : (
                  format(date.from, 'PPP')
                )
              ) : (
                'No date selected'
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}