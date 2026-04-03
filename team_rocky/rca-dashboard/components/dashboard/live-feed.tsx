'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RefreshCw, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LiveFeedSection() {
  const [isStreamActive, setIsStreamActive] = useState(false)
  const [showInference, setShowInference] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Auto-refresh logic: Setting the URL in a useEffect ensures the browser 
  // starts the stream as soon as the client-side component is ready.
  const streamUrl = `http://localhost:5000/video_feed?inference=${showInference}&t=${refreshKey}`

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <section id="live-feed" className="scroll-mt-20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">Live Monitoring</h2>
            <p className="text-xs text-muted-foreground font-mono">NODE_01_ACTIVE</p>
          </div>
          
          {/* INFERENCE TOGGLE */}
          <div className="flex items-center space-x-2 bg-secondary/30 px-3 py-1.5 rounded-full border border-border">
            <Switch 
              id="inference-mode" 
              checked={showInference}
              onCheckedChange={setShowInference}
            />
            <Label htmlFor="inference-mode" className="text-[10px] font-bold uppercase tracking-wider cursor-pointer">
              Inference View
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleManualRefresh}
            className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-primary"
            title="Refresh Stream"
          >
            <RefreshCw className={cn("h-4 w-4", !isStreamActive && "animate-spin")} />
          </button>
          <Badge variant="outline" className={cn("font-mono", isStreamActive ? "text-primary border-primary/50" : "text-destructive border-destructive/50")}>
            {isStreamActive ? '● STABLE' : '○ CONNECTING'}
          </Badge>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black group">
        <img 
          src={streamUrl} 
          alt="Live Feed"
          className={cn("h-full w-full object-contain transition-all duration-300", showInference ? "brightness-110" : "brightness-100")}
          onLoad={() => setIsStreamActive(true)}
          onError={() => setIsStreamActive(false)}
        />

        {/* Overlay Labels */}
        <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded border border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-mono text-white">
              {showInference ? "MODE: CV_TRACKING_ACTIVE" : "MODE: RAW_SURVEILLANCE"}
            </span>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
          <span className="font-mono text-[10px] text-destructive font-bold">LIVE</span>
        </div>
      </div>
    </section>
  )
}