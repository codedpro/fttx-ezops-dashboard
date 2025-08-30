"use client"
import { useState } from "react"
import type {
  RasterLayerSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
  FillExtrusionLayerSpecification,
} from "mapbox-gl"

export type TileKeys = "blocks"

export interface TileConfig {
  id: string // Unique tile identifier
  label: string // Display name in UI
  icon: string // Icon path for the panel
  type: "raster" | "vector" // Support both raster and vector types
  visible: boolean // Whether currently visible
  toggle: () => void // Toggle function

  // For Mapbox:
  source: RasterSourceSpecification | VectorSourceSpecification | null
  layer: RasterLayerSpecification | FillExtrusionLayerSpecification | any | null
}

/**
 * Hook to manage multiple raster and vector tiles on a map,
 * similar to how `useLayerManager` manages vector layers.
 */
export function useTiles(selectedTiles: TileKeys[], defaultVisibility: Partial<Record<TileKeys, boolean>>) {
  // 1) Visibility state for each tile key
  const [tileVisibility, setTileVisibility] = useState<Record<TileKeys, boolean>>(() =>
    selectedTiles.reduce(
      (acc, tileKey) => {
        acc[tileKey] = defaultVisibility[tileKey] ?? false
        return acc
      },
      {} as Record<TileKeys, boolean>,
    ),
  )

  // 2) Toggling logic
  const toggleTileVisibility = (tileKey: TileKeys) => {
    setTileVisibility((prev) => ({
      ...prev,
      [tileKey]: !prev[tileKey],
    }))
  }

  // 3) Define all possible tile layers here
  const allTiles: Record<TileKeys, Omit<TileConfig, "visible" | "toggle">> = {
    blocks: {
      id: "blocks",
      label: "OpenStreetMap (English)",
      icon: "/images/map/blocks.png",
      type: "raster",
      source: {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution: "© OpenStreetMap contributors",
      } as RasterSourceSpecification,
      layer: {
        id: "blocks",
        type: "raster",
        source: "blocks",
      } as RasterLayerSpecification,
    },
  }

  // 4) Build the final list of tile configs for the selected tile keys
  const activeTiles: TileConfig[] = selectedTiles.map((tileKey) => {
    const definition = allTiles[tileKey]
    return {
      id: definition.id,
      label: definition.label,
      icon: definition.icon,
      type: definition.type,
      source: definition.source,
      layer: definition.layer,
      visible: tileVisibility[tileKey],
      toggle: () => toggleTileVisibility(tileKey),
    }
  })

  // 5) Return them for map + UI usage
  return { activeTiles }
}
