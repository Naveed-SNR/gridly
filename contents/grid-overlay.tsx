import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useState } from "react"
import styleText from "data-text:../style.css"
import type { GridConfig } from "../types"
import { DEFAULT_CONFIG } from "../types"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const GridOverlay = () => {
  const [gridConfig, setGridConfig] = useState<GridConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    // 1. Initial Load
    chrome.storage.local.get(["gridConfig"], (result) => {
      if (result.gridConfig) {
        setGridConfig(result.gridConfig)
      }
    })

    // 2. Listen for Storage Changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === "local" && changes.gridConfig) {
        setGridConfig(changes.gridConfig.newValue)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  if (!gridConfig.isEnabled) return null

  const color = gridConfig.color || "#ef4444"

  return (
    <div className="fixed inset-0 pointer-events-none z-[2147483647]">
      <div 
        style={{
          display: 'grid',
          height: '100vh',
          width: '100vw',
          gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
          gap: `${gridConfig.gutter}px`,
          paddingLeft: `${gridConfig.margin}px`,
          paddingRight: `${gridConfig.margin}px`,
          boxSizing: 'border-box'
        }}
      >
        {Array.from({ length: gridConfig.columns }).map((_, i) => (
          <div 
            key={i} 
            style={{
              height: '100%',
              backgroundColor: color,
              opacity: 0.15,
              borderLeft: `1px solid ${color}`,
              borderRight: `1px solid ${color}`,
              boxSizing: 'border-box'
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default GridOverlay
