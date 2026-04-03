'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface LiveDataTableProps {
  data: any[]
}

export function LiveDataTable({ data }: LiveDataTableProps) {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <section id="live-data" className="scroll-mt-20">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">Live Data Feed</h2>
        <p className="text-sm text-muted-foreground">
          Real-time object tracking logs from Edge AI
        </p>
      </div>

      {/* 🔥 THE FOOLPROOF SCROLL FIX 🔥 
          1. Changed from max-h to a strict absolute height (h-[400px])
          2. Forced it to be a block element to constrain the Shadcn Table wrapper 
      */}
      <div className="h-[400px] overflow-y-auto rounded-lg border border-border bg-card shadow-sm block relative">
        <Table className="relative w-full">
          {/* Increased z-index to 50 so it stays above the pulsing dots */}
          <TableHeader className="sticky top-0 z-50 bg-card shadow-sm border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-muted-foreground font-mono">Tracking ID</TableHead>
              <TableHead className="text-muted-foreground font-mono">Detection Time</TableHead>
              <TableHead className="text-muted-foreground font-mono">Classification</TableHead>
              <TableHead className="text-muted-foreground font-mono text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Waiting for edge detections...
                </TableCell>
              </TableRow>
            ) : (
              data.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-border transition-colors bg-primary/5 hover:bg-primary/10"
                >
                  <TableCell className="font-mono font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {/* Pulsing indicator for live data */}
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      #{log.tracking_id}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {formatTimestamp(log.created_at)}
                  </TableCell>
                  <TableCell className="capitalize font-mono">
                    {log.class_name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="bg-primary/20 text-primary border-primary/50">
                      Live Tracking
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dynamic footer showing current window count */}
      <div className="mt-4 flex items-center justify-between rounded-lg bg-card border border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground font-mono">
            Active Pipe: <span className="text-primary font-bold">Connected</span>
          </span>
        </div>
        <span className="font-mono text-sm text-muted-foreground">
          Displaying last {data.length} detections
        </span>
      </div>
    </section>
  )
}