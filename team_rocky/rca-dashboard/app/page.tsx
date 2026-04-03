'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { LiveFeedSection } from '@/components/dashboard/live-feed'
import { AnalyticsSection } from '@/components/dashboard/analytics'
import { LiveDataTable } from '@/components/dashboard/live-data-table'
import { AlertsSection } from '@/components/dashboard/alerts'
import { SystemLogsSection } from '@/components/dashboard/system-logs'
import LiveLogs from '@/components/dashboard/LiveLogs'

export default function DashboardPage() {
  const [realtimeLogs, setRealtimeLogs] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    // 1. Initial Fetch
    const getData = async () => {
      const { data, error } = await supabase
        .from('conveyor_logs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) {
        setRealtimeLogs(data)
        setTotalCount(data.length)
      }
    }
    getData()

    // 2. Realtime Listener
    const channel = supabase.channel('dashboard-main')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conveyor_logs' }, (payload) => {
        setRealtimeLogs(prev => [payload.new, ...prev])
        setTotalCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader logs={realtimeLogs} />
      <DashboardSidebar />

      <main className="ml-56 mt-14 p-6">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* FIXED: Passing the logs prop now */}
          <AnalyticsSection logs={realtimeLogs} />

          <LiveFeedSection />

          {/* Real-time Data Table */}
          <LiveDataTable data={realtimeLogs.slice(0, 10)} />
          
          <AlertsSection logs={realtimeLogs} />
          
          <SystemLogsSection logs={realtimeLogs} />

          {/* Debug view */}
          <div className="mt-10 p-4 border border-dashed border-zinc-700 opacity-50">
            <p className="text-xs text-zinc-500 mb-2 font-mono">DEBUG MODE: RAW DATA STREAM</p>
            <LiveLogs logs={realtimeLogs.slice(0, 5)} /> 
          </div>
        </div>
      </main>
    </div>
  )
}