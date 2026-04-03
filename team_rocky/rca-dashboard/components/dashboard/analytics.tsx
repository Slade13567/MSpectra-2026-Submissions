'use client'

import { useState, useMemo, useEffect } from 'react'
import { Package, Gauge, Target, AlertCircle, History, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Line, LineChart, Bar, BarChart, Area, AreaChart, 
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, Legend, ReferenceLine 
} from 'recharts'
import { cn } from '@/lib/utils'

interface AnalyticsProps {
  logs: any[]
}

export function AnalyticsSection({ logs = [] }: AnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // Fix for Next.js Hydration errors
  useEffect(() => {
    setHasMounted(true)
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    
    // 1. MINUTE-BASED DATA
    const minuteData = Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 60000)
      const minuteLogs = logs.filter(l => {
        const d = new Date(l.created_at)
        return d.getMinutes() === time.getMinutes() && d.getHours() === time.getHours()
      })
      const avgConf = minuteLogs.length > 0 
        ? (minuteLogs.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / minuteLogs.length) * 100 
        : 0
      return {
        time: `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`,
        objects: minuteLogs.length,
        accuracy: parseFloat(avgConf.toFixed(1))
      }
    })

    // 2. DAILY DATA (History)
    const dateMap: Record<string, { date: string, total: number, anomalies: number, ts: number }> = {}
    logs.forEach(log => {
      const d = new Date(log.created_at)
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, total: 0, anomalies: 0, ts: d.setHours(0,0,0,0) }
      }
      dateMap[dateStr].total++
      if (log.class_name.toLowerCase() !== 'cylinder') dateMap[dateStr].anomalies++
    })

    // SORTING: Today at index 0 (Leftmost position)
    const dailyHistory = Object.values(dateMap).sort((a, b) => b.ts - a.ts)

    return { minuteData, dailyHistory, today: dailyHistory[0] }
  }, [logs])

  const metricCards = [
    {
      id: 'total',
      title: 'Total Processed',
      value: stats.today?.total || 0,
      icon: Package,
      color: '#3b82f6',
      chartType: 'bar',
      data: stats.dailyHistory,
      dataKey: 'total',
      yAxisLabel: 'Count'
    },
    {
      id: 'throughput',
      title: 'Throughput',
      value: stats.minuteData[9]?.objects || 0,
      icon: Gauge,
      color: '#10b981',
      chartType: 'area',
      data: stats.minuteData,
      dataKey: 'objects',
      yAxisLabel: 'Objs/Min'
    },
    {
      id: 'accuracy',
      title: 'Model Accuracy',
      value: `${stats.minuteData[9]?.accuracy || 0}%`,
      icon: Target,
      color: '#a855f7',
      chartType: 'line',
      data: stats.minuteData,
      dataKey: 'accuracy',
      yAxisLabel: 'Conf %'
    },
    {
      id: 'alerts',
      title: 'Active Alerts',
      value: stats.today?.anomalies || 0,
      icon: AlertCircle,
      color: '#ef4444',
      chartType: 'bar',
      data: stats.dailyHistory,
      dataKey: 'anomalies',
      yAxisLabel: 'Alerts'
    }
  ]

  // Prevent rendering until client-side mount is complete
  if (!hasMounted) return <div className="grid grid-cols-4 gap-4 h-24 animate-pulse bg-zinc-900 rounded-lg" />

  return (
    <section id="analytics" className="scroll-mt-20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.id} className="cursor-pointer border-border bg-card transition-all hover:border-primary/40" onClick={() => setSelectedMetric(card)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{card.title}</p>
                  <p className="text-2xl font-mono font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
                </div>
                <card.icon className="h-5 w-5 opacity-20" style={{ color: card.color }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL 1: Standard Analysis */}
      <Dialog open={!!selectedMetric && !isHistoryOpen} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
            <DialogTitle className="text-xs font-mono uppercase tracking-[0.2em]">{selectedMetric?.title} Analysis</DialogTitle>
            {(selectedMetric?.id === 'total' || selectedMetric?.id === 'alerts') && (
              <Button variant="outline" size="sm" className="h-6 text-[9px] border-zinc-700 bg-zinc-900 px-2" onClick={() => setIsHistoryOpen(true)}>
                <ExternalLink className="mr-2 h-3 w-3" /> FULL HISTORY
              </Button>
            )}
          </DialogHeader>
          <div className="p-6 h-[340px]"> {/* Height increased slightly */}
            {selectedMetric && (
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric.chartType === 'area' ? (
                  <AreaChart data={selectedMetric.data}>
                    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.3}/><stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                    <Area type="monotone" dataKey={selectedMetric.dataKey} stroke={selectedMetric.color} fill="url(#g1)" strokeWidth={3} />
                  </AreaChart>
                ) : selectedMetric.chartType === 'bar' ? (
                  <BarChart data={selectedMetric.data.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="date" stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                    <Bar dataKey={selectedMetric.dataKey} fill={selectedMetric.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={selectedMetric.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#555" fontSize={10} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey={selectedMetric.dataKey} stroke={selectedMetric.color} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Full History Audit */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-[98vw] max-h-[82vh] bg-zinc-950 border-zinc-800 p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-zinc-900 bg-zinc-900/20">
            <DialogTitle className="text-sm font-mono uppercase text-primary flex items-center gap-3 tracking-widest">
              <History className="h-4 w-4" /> {selectedMetric?.title} Historical Archive
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 bg-[#050505]">
            <div style={{ width: Math.max(1200, (selectedMetric?.data?.length || 0) * 120) + 'px', height: '420px' }}>
              {selectedMetric && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedMetric.data} margin={{ bottom: 20, left: 10, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickMargin={12} axisLine={{ stroke: '#27272a' }} />
                    <YAxis stroke="#52525b" fontSize={11} axisLine={{ stroke: '#27272a' }} />
                    <Tooltip cursor={{fill: '#111'}} contentStyle={{ backgroundColor: '#000', border: '1px solid #27272a' }} />
                    <Legend verticalAlign="top" align="right" height={30} iconType="circle" />
                    <Bar dataKey={selectedMetric.dataKey} name="Unit Count" fill={selectedMetric.color} radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <DialogFooter className="bg-zinc-900/40 p-3 border-t border-zinc-800 justify-between items-center px-6">
            <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase italic">Present (Today) ← Timeline History → Past Data</p>
            <Button variant="ghost" size="sm" className="h-6 text-[9px] text-zinc-400" onClick={() => setIsHistoryOpen(false)}>CLOSE AUDIT</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}