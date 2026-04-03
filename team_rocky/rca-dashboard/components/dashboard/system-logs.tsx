'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SystemLogsProps {
  logs: any[]
}

export function SystemLogsSection({ logs: supabaseLogs }: SystemLogsProps) {
  const [mounted, setMounted] = useState(false)
  const [displayLogs, setDisplayLogs] = useState<any[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    setMounted(true)
    setDisplayLogs([{
      id: 'init',
      timestamp: new Date(),
      level: 'success',
      message: 'System Monitoring Active',
      source: 'SYS'
    }])
  }, [])

  // 3. LISTEN TO PROPS: Add a new terminal entry for every Supabase Insert
  // Inside your SystemLogsSection, update the logic that processes 'logs' prop:

  useEffect(() => {
    if (supabaseLogs.length > 0) {
      const latest = supabaseLogs[0]
      const isAnomaly = latest.class_name.toLowerCase() !== 'cylinder'
      
      const newEntry = {
        id: `sys-${latest.id}`,
        timestamp: new Date(latest.created_at),
        level: isAnomaly ? 'error' : 'success', // Highlight anomalies as errors
        message: isAnomaly 
          ? `[QA_FAILURE] Object #${latest.tracking_id} MISCLASSIFIED as ${latest.class_name}`
          : `[PASS] Object #${latest.tracking_id} confirmed as cylinder`,
        source: 'ML_CORE'
      }
      setDisplayLogs(prev => [...prev.slice(-49), newEntry])
    }
  }, [supabaseLogs])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [displayLogs, autoScroll])

  return (
    <section id="logs" className="scroll-mt-20">
      <div className="mb-4 flex items-center gap-3">
        <Terminal className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">System Engine Output</h2>
      </div>

      <div className="rounded-lg border border-border bg-[#0a0a0a] overflow-hidden">
        <div className="h-64 overflow-y-auto p-4 font-mono text-xs" ref={scrollRef}>
          {displayLogs.map((log) => (
            <div key={log.id} className="mb-1 flex gap-2">
              <span className="text-muted-foreground">[{mounted ? log.timestamp.toLocaleTimeString() : '--'}]</span>
              <span className={cn('uppercase', log.level === 'info' ? 'text-blue-400' : 'text-primary')}>[{log.source}]</span>
              <span className="text-zinc-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}