import { useEffect, useState } from "react"
import "./style.css"
import type { GridConfig } from "./types"
import { DEFAULT_CONFIG, QUICK_COLUMNS } from "./types"

const NumberInput = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 1000 
}: { 
  label: string, 
  value: number, 
  onChange: (val: number) => void,
  min?: number,
  max?: number
}) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <div className="flex items-center">
      <button 
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="px-2 py-1.5 bg-white border border-slate-200 rounded-l-md hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer select-none"
      >
        -
      </button>
      <input 
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value)
          if (!isNaN(val)) {
            onChange(Math.min(max, Math.max(min, val)))
          } else if (e.target.value === "") {
            onChange(0)
          }
        }}
        className="w-full text-center py-1.5 text-xs border-y border-slate-200 outline-none focus:bg-blue-50/30 transition-colors font-medium text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button 
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-2 py-1.5 bg-white border border-slate-200 rounded-r-md hover:bg-slate-50 text-slate-500 transition-colors cursor-pointer select-none"
      >
        +
      </button>
    </div>
  </div>
)

// --- Color Math Helpers (Pure JS for performance) ---
const parseToRgb = (color: string) => {
  if (color.startsWith("hsl")) {
    const [h, s, l] = color.match(/\d+/g)!.map(Number)
    const s1 = s / 100, l1 = l / 100
    const k = (n: number) => (n + h / 30) % 12
    const a = s1 * Math.min(l1, 1 - l1)
    const f = (n: number) => l1 - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) }
  }
  if (color.startsWith("#")) {
    const hex = color.length === 4 ? "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] : color
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    }
  }
  return { r: 239, g: 68, b: 68 } // Default red
}

const rgbToHsv = ({ r, g, b }: { r: number, g: number, b: number }) => {
  const r1 = r / 255, g1 = g / 255, b1 = b / 255
  const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1)
  const d = max - min
  let h = 0, s = max === 0 ? 0 : d / max, v = max
  if (max !== min) {
    switch (max) {
      case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break
      case g1: h = (b1 - r1) / d + 2; break
      case b1: h = (r1 - g1) / d + 4; break
    }
    h /= 6
  }
  return { h: h * 360, s: s * 100, v: v * 100 }
}

const hsvToHex = (h: number, s: number, v: number) => {
  const s1 = s / 100, v1 = v / 100
  const l1 = v1 * (1 - s1 / 2)
  const sl = (l1 === 0 || l1 === 1) ? 0 : (v1 - l1) / Math.min(l1, 1 - l1)
  const h1 = h, s2 = Math.round(sl * 100), l2 = Math.round(l1 * 100)
  return `hsl(${Math.round(h1)}, ${s2}%, ${l2}%)`
}

function IndexPopup() {
  const [config, setConfig] = useState<GridConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    chrome.storage.local.get(["gridConfig"], (result) => {
      if (result.gridConfig) setConfig(result.gridConfig)
    })
  }, [])

  const updateConfig = (newConfig: Partial<GridConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig }
      chrome.storage.local.set({ gridConfig: updated })
      return updated
    })
  }

  const hsv = rgbToHsv(parseToRgb(config.color))
  const PRESET_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#000000"]

  return (
    <div className="p-4 w-72 bg-white flex flex-col gap-5 font-sans shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none mb-1">Gridly</h1>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${config.isEnabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{config.isEnabled ? 'Grid Active' : 'Grid Hidden'}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={config.isEnabled}
            onChange={(e) => updateConfig({ isEnabled: e.target.checked })}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
        </label>
      </div>

      <div className="space-y-4">
        {/* Columns */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Columns</label>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{config.columns}</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_COLUMNS.map((num) => (
              <button
                key={num}
                onClick={() => updateConfig({ columns: num })}
                className={`text-[10px] px-2.5 py-1.5 font-bold border rounded-md transition-all flex-shrink-0 ${
                  config.columns === num
                    ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                }`}>
                {num}
              </button>
            ))}
          </div>
          <input 
            type="range"
            min="1"
            max="64"
            value={config.columns}
            onChange={(e) => updateConfig({ columns: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Gutter & Margin */}
        <div className="grid grid-cols-2 gap-4">
          <NumberInput 
            label="Gutter (px)" 
            value={config.gutter} 
            onChange={(val) => updateConfig({ gutter: val })} 
          />
          <NumberInput 
            label="Margin (px)" 
            value={config.margin} 
            onChange={(val) => updateConfig({ margin: val })} 
          />
        </div>

        {/* Intuitive 2D Color Picker */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color</label>
          
          <div className="flex flex-col gap-3">
            {/* 2D Saturation/Brightness Square */}
            <div 
              className="relative w-full h-32 rounded-lg cursor-crosshair overflow-hidden select-none"
              style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
              onMouseDown={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                const update = (ev: MouseEvent | React.MouseEvent) => {
                  const s = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100))
                  const v = Math.min(100, Math.max(0, (1 - (ev.clientY - rect.top) / rect.height) * 100))
                  updateConfig({ color: hsvToHex(hsv.h, s, v) })
                }
                
                update(e)
                
                const move = (ev: MouseEvent) => update(ev)
                const up = () => {
                  window.removeEventListener("mousemove", move)
                  window.removeEventListener("mouseup", up)
                }
                
                window.addEventListener("mousemove", move)
                window.addEventListener("mouseup", up)
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div 
                className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md -translate-x-1/2 translate-y-1/2 pointer-events-none"
                style={{ left: `${hsv.s}%`, bottom: `${hsv.v}%` }}
              />
            </div>

            {/* Hue Slider */}
            <input 
              type="range" min="0" max="360" value={hsv.h}
              onChange={(e) => updateConfig({ color: hsvToHex(parseInt(e.target.value), hsv.s, hsv.v) })}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
            />
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-8 h-8 rounded-md border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: config.color }} />
            <input 
              type="text"
              value={config.color}
              onChange={(e) => updateConfig({ color: e.target.value })}
              className="w-full bg-transparent text-xs font-mono font-bold text-slate-700 outline-none p-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
