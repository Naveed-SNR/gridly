import { useEffect, useState } from "react"
import "./style.css"
import type { GridConfig } from "./types"
import { DEFAULT_CONFIG, QUICK_COLUMNS } from "./types"

const NumberInput = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 200 
}: { 
  label: string, 
  value: number, 
  onChange: (val: number) => void,
  min?: number,
  max?: number
}) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-semibold text-zinc-500 tracking-wide">{label}</label>
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
        className="w-10 text-right py-0.5 px-1 text-[11px] font-medium text-zinc-800 bg-transparent border-b border-zinc-200 focus:border-zinc-500 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
    <div className="pt-1">
      <input 
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.15)] transition-shadow"
      />
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

  return (
    <div className="p-4 w-[280px] bg-white flex flex-col gap-4 font-sans shadow-2xl selection:bg-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
             <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
             </svg>
          </div>
          <div>
            <h1 className="text-[14px] font-bold text-zinc-900 tracking-tight leading-none">Gridly</h1>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-0.5">{config.isEnabled ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={config.isEnabled}
            onChange={(e) => updateConfig({ isEnabled: e.target.checked })}
          />
          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-800"></div>
        </label>
      </div>

      <div className="space-y-5">
        {/* Columns */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Columns</label>
            <input 
              type="number"
              value={config.columns}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (!isNaN(val)) {
                  updateConfig({ columns: Math.min(64, Math.max(1, val)) })
                } else if (e.target.value === "") {
                  updateConfig({ columns: 1 })
                }
              }}
              className="w-10 text-right py-0.5 px-1 text-[11px] font-medium text-zinc-800 bg-transparent border-b border-zinc-200 focus:border-zinc-500 outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex bg-zinc-100 p-0.5 rounded-lg overflow-hidden border border-zinc-200/50">
            {QUICK_COLUMNS.map((num) => (
              <button
                key={num}
                onClick={() => updateConfig({ columns: num })}
                className={`flex-1 text-[11px] py-1 font-semibold rounded-md transition-all ${
                  config.columns === num
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}>
                {num}
              </button>
            ))}
          </div>
          <div className="pt-1">
             <input 
              type="range"
              min="1"
              max="64"
              value={config.columns}
              onChange={(e) => updateConfig({ columns: parseInt(e.target.value) })}
              className="w-full h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_3px_6px_rgba(0,0,0,0.15)] transition-shadow"
            />
          </div>
        </div>

        {/* Gutter & Margin */}
        <div className="grid grid-cols-2 gap-5">
          <NumberInput 
            label="Gutter" 
            value={config.gutter} 
            onChange={(val) => updateConfig({ gutter: val })} 
          />
          <NumberInput 
            label="Margin" 
            value={config.margin} 
            onChange={(val) => updateConfig({ margin: val })} 
          />
        </div>

        {/* Intuitive 2D Color Picker */}
        <div className="flex flex-col gap-2 pt-1 border-t border-zinc-100">
          <div className="flex items-center justify-between pt-2">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Color</label>
            <button
              onClick={() => updateConfig({ ...DEFAULT_CONFIG, isEnabled: config.isEnabled })}
              className="text-[10px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              Reset to Default
            </button>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {/* 2D Saturation/Brightness Square */}
            <div 
              className="relative w-full h-28 rounded-md cursor-crosshair overflow-hidden select-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
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
                className="absolute w-3.5 h-3.5 border-[2.5px] border-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] -translate-x-1/2 translate-y-1/2 pointer-events-none"
                style={{ left: `${hsv.s}%`, bottom: `${hsv.v}%` }}
              />
            </div>

            {/* Hue Slider */}
            <input 
              type="range" min="0" max="360" value={hsv.h}
              onChange={(e) => updateConfig({ color: hsvToHex(parseInt(e.target.value), hsv.s, hsv.v) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.2)]"
              style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-md shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)] shrink-0" style={{ backgroundColor: config.color }} />
            <input 
              type="text"
              value={config.color}
              onChange={(e) => updateConfig({ color: e.target.value })}
              className="w-full bg-zinc-50 border border-zinc-200 text-[11px] font-mono font-medium text-zinc-700 outline-none px-2 py-1.5 rounded-md focus:border-zinc-400 focus:bg-white transition-colors uppercase"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
