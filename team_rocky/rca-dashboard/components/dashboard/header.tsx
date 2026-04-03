'use client'

import { useState, useEffect, useMemo } from 'react'
import { Bell, Clock, Activity, AlertOctagon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  logs: any[]
}

export function DashboardHeader({ logs = [] }: DashboardHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // FILTER: Only show "Anomalies" (anything not a cylinder)
  const anomalies = useMemo(() => {
    return logs
      .filter(log => log.class_name.toLowerCase() !== 'cylinder')
      .slice(0, 8) // Keep last 8 problems
      .map(log => ({
        id: log.id,
        title: 'Classification Mismatch',
        message: `Foreign object detected as "${log.class_name}" (ID #${log.tracking_id})`,
        timestamp: new Date(log.created_at),
      }))
  }, [logs])

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-card/95 backdrop-blur shadow-sm">
      <div className="flex h-full items-center justify-between px-4">
        
        {/* Left: System Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">QA Pipeline Active</span>
          </div>
        </div>

        {/* Center: Live Clock */}
        <div className="flex items-center gap-4 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-xs text-primary">
            {mounted ? currentTime.toLocaleTimeString() : '--:--:--'}
          </span>
        </div>

        {/* Right: Anomaly-Only Bell */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-secondary">
                <Bell className={cn("h-5 w-5", anomalies.length > 0 ? "text-destructive" : "text-foreground")} />
                {anomalies.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-card animate-bounce">
                    {anomalies.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover border-border p-2">
              <DropdownMenuLabel className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-4 w-4" />
                Active Quality Alerts
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {anomalies.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground italic">
                  No quality deviations detected.
                </div>
              ) : (
                anomalies.map((n) => (
                  <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 mb-1 rounded-md border-l-2 border-l-destructive bg-destructive/5 focus:bg-destructive/10">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-destructive uppercase">Mismatch</span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {n.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300">
                      {n.message}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}