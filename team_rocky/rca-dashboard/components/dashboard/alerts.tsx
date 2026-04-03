'use client'

import { useMemo } from 'react'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AlertsSectionProps {
  logs: any[]
}

export function AlertsSection({ logs = [] }: AlertsSectionProps) {
  const anomalies = useMemo(() => {
    return logs
      .filter(l => l.class_name.toLowerCase() !== 'cylinder')
      .map(l => ({
        id: l.id,
        name: l.class_name,
        trackingId: l.tracking_id,
        time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }))
  }, [logs])

  return (
    <section id="alerts" className="scroll-mt-20">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quality Exceptions</h2>
        <Badge variant="destructive" className="font-mono">{anomalies.length} TOTAL</Badge>
      </div>

      {/* FIXED SCROLLABLE BOX */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="h-[320px] overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {anomalies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <ShieldCheck className="h-10 w-10 mb-2" />
              <p className="text-xs uppercase font-mono">No Deviations Detected</p>
            </div>
          ) : (
            anomalies.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded bg-destructive/5 border border-destructive/10 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-xs font-bold text-destructive uppercase tracking-widest">Mismatch: {alert.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">TRACKING_ID: #{alert.trackingId}</p>
                  </div>
                </div>
                {/* TIMESTAMP COLUMN */}
                <span className="font-mono text-[10px] bg-zinc-900 px-2 py-1 rounded text-zinc-500 border border-zinc-800">
                  {alert.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}