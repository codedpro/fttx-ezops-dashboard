import { useState } from "react";
import { useMFATLayer } from "@/components/Maps/Main/Layers/MFATLayer";
import { useSFATLayer } from "@/components/Maps/Main/Layers/SFATLayer";
import { useFATLineLayer } from "@/components/Maps/Main/Layers/FATLineLayer";
import { useMetroLineLayer } from "@/components/Maps/Main/Layers/MetroLineLayer";
import { useODCLineLayer } from "@/components/Maps/Main/Layers/ODCLineLayer";
import { useDropCableLineLayer } from "@/components/Maps/Main/Layers/DropCableLineLayer";
import { useFTTHPreorderLayer } from "@/components/Maps/PreOrders/Layers/FTTHPreorder";
import { useFTTHPreorderHMLayer } from "@/components/Maps/PreOrders/Layers/FTTHPreorderHeatMap";
import { useFTTHSuggestedFATLayer } from "@/components/Maps/PreOrders/Layers/FTTHSuggestedFAT";
import { useFTTHModemLayer } from "@/components/Maps/Main/Layers/FTTHModem";
import { useOLTLayer } from "@/components/Maps/Main/Layers/OLTLayer";
import { useHHLayer } from "@/components/Maps/Main/Layers/HHLayer";

// Define valid layer keys
type LayerKeys = 
  | "MFATLayer"
  | "SFATLayer"
  | "FATLineLayer"
  | "MetroLineLayer"
  | "ODCLineLayer"
  | "DropCableLineLayer"
  | "FTTHPreorderLayer"
  | "FTTHPreorderHMLayer"
  | "FTTHSuggestedFATLayer"
  | "ModemLayer"
  | "OLTLayer"
  | "HHLayer";

// Define default visibility as an optional argument
interface LayerManagerConfig {
  defaultVisibility?: Partial<Record<LayerKeys, boolean>>;
}

export const useLayerManager = (selectedLayers: LayerKeys[], config?: LayerManagerConfig) => {
  const layers = {
    MFATLayer: useMFATLayer(),
    SFATLayer: useSFATLayer(),
    FATLineLayer: useFATLineLayer(),
    MetroLineLayer: useMetroLineLayer(),
    ODCLineLayer: useODCLineLayer(),
    DropCableLineLayer: useDropCableLineLayer(),
    FTTHPreorderLayer: useFTTHPreorderLayer(),
    FTTHPreorderHMLayer: useFTTHPreorderHMLayer(),
    FTTHSuggestedFATLayer: useFTTHSuggestedFATLayer(),
    ModemLayer: useFTTHModemLayer(),
    OLTLayer: useOLTLayer(),
    HHLayer: useHHLayer(),
  };

  // Initialize the layer visibility state using the provided default visibility
  const [layerVisibility, setLayerVisibility] = useState<Record<LayerKeys, boolean>>(
    () =>
      Object.keys(layers).reduce((acc, key) => {
        const layerKey = key as LayerKeys;
        acc[layerKey] = config?.defaultVisibility?.[layerKey] ?? true; // Use default visibility if provided
        return acc;
      }, {} as Record<LayerKeys, boolean>)
  );

  const toggleLayerVisibility = (layerName: LayerKeys) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  // Only return the selected layers
  const activeLayers = selectedLayers.map((layerName) => ({
    ...layers[layerName],
    visible: layerVisibility[layerName],
    toggle: () => toggleLayerVisibility(layerName),
  }));

  return { activeLayers, layerVisibility, toggleLayerVisibility };
};
