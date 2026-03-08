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

function IndexPopup() {
  const [config, setConfig] = useState<GridConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    chrome.storage.local.get(["gridConfig"], (result) => {
      if (result.gridConfig) {
        setConfig(result.gridConfig)
      }
    })
  }, [])

  const updateConfig = (newConfig: Partial<GridConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig }
      chrome.storage.local.set({ gridConfig: updated })
      return updated
    })
  }

  // Helper to ensure the picker only shows if it's a valid 6-char hex
  const isValidPickerHex = (str: string) => /^#[0-9A-Fa-f]{6}$/.test(str)

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

        {/* Color Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Color</label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-200 shadow-sm shrink-0">
              <input 
                type="color"
                value={isValidPickerHex(config.color) ? config.color : "#ef4444"}
                onChange={(e) => updateConfig({ color: e.target.value })}
                className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer border-0 p-0 m-0"
              />
            </div>
            <input 
              type="text"
              value={config.color}
              onChange={(e) => updateConfig({ color: e.target.value })}
              placeholder="hex, hsl, oklch..."
              className="w-full bg-transparent text-xs font-mono font-bold text-slate-700 outline-none p-1 placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div 
          className="h-1 rounded-full opacity-30 transition-all" 
          style={{ backgroundColor: config.color }} 
        />
      </div>
    </div>
  )
}

export default IndexPopup
