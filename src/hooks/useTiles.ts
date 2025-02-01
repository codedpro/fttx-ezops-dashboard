"use client";
import { useState } from "react";
import { RasterLayerSpecification, RasterSourceSpecification } from "mapbox-gl";

/** List of tile keys we support. Extend as needed. */
export type TileKeys = "blocks" ; // or more...

/** Describes the shape of each Tile configuration. */
export interface TileConfig {
  id: string; // Unique tile identifier
  label: string; // Display name in UI
  icon: string; // Icon path for the panel
  type: "raster"; // Always 'raster' for tiles
  visible: boolean; // Whether currently visible
  toggle: () => void; // Toggle function

  // For Mapbox:
  source: RasterSourceSpecification | null;
  layer: RasterLayerSpecification | null;
}

/**
 * Hook to manage multiple raster tiles on a map,
 * similar to how `useLayerManager` manages vector layers.
 */
export function useTiles(
  selectedTiles: TileKeys[],
  defaultVisibility: Partial<Record<TileKeys, boolean>>
) {
  // 1) Visibility state for each tile key
  const [tileVisibility, setTileVisibility] = useState<
    Record<TileKeys, boolean>
  >(() =>
    selectedTiles.reduce(
      (acc, tileKey) => {
        acc[tileKey] = defaultVisibility[tileKey] ?? false;
        return acc;
      },
      {} as Record<TileKeys, boolean>
    )
  );

  // 2) Toggling logic
  const toggleTileVisibility = (tileKey: TileKeys) => {
    setTileVisibility((prev) => ({
      ...prev,
      [tileKey]: !prev[tileKey],
    }));
  };

  // 3) Define all possible tile layers here
  const allTiles: Record<TileKeys, Omit<TileConfig, "visible" | "toggle">> = {
    blocks: {
      id: "blocks",
      label: "blocks",
      icon: "/images/map/blocks.png",
      type: "raster",
      source: {
        type: "raster",
        tiles: [
          "https://fttx.mtnirancell.ir/tiles/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "© LNM TEAM, MTN IRANCELL",
      } as RasterSourceSpecification,
      layer: {
        id: "blocks",
        type: "raster",
        source: "blocks",
      } as RasterLayerSpecification,
    },
  
  };

  // 4) Build the final list of tile configs for the selected tile keys
  const activeTiles: TileConfig[] = selectedTiles.map((tileKey) => {
    const definition = allTiles[tileKey];
    return {
      id: definition.id,
      label: definition.label,
      icon: definition.icon,
      type: definition.type,
      source: definition.source,
      layer: definition.layer,
      visible: tileVisibility[tileKey],
      toggle: () => toggleTileVisibility(tileKey),
    };
  });

  // 5) Return them for map + UI usage
  return { activeTiles };
}
