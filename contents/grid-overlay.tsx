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
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div 
        className="grid h-screen w-screen box-border"
        style={{
          gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
          columnGap: `${gridConfig.gutter}px`,
          paddingInline: `${gridConfig.margin}px`
        }}
      >
        {Array.from({ length: gridConfig.columns }).map((_, i) => (
          <div 
            key={i} 
            className="h-full box-border border-x opacity-15"
            style={{
              backgroundColor: color,
              borderColor: color
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default GridOverlay
