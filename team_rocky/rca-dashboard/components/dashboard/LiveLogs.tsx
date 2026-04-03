'use client'

import React from 'react'

interface LiveLogsProps {
  logs: any[]
}

export default function LiveLogs({ logs }: LiveLogsProps) {
  return (
    <div className="p-4 border border-zinc-800 rounded-lg bg-black text-green-500 font-mono w-full">
      <h3 className="text-sm font-bold mb-4 text-white uppercase tracking-widest">Live Detection Stream</h3>
      <div className="space-y-2">
        {logs.length === 0 ? <p className="text-zinc-500 text-xs italic">Waiting for edge device heartbeat...</p> : null}
        {logs.map((log) => (
          <div key={log.id} className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 p-2 rounded text-xs">
            <span className="text-green-400">ID: #{log.tracking_id}</span>
            <span className="uppercase font-bold text-[10px] bg-green-900/30 px-2 py-0.5 rounded">{log.class_name}</span>
            <span className="text-zinc-500">{new Date(log.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}