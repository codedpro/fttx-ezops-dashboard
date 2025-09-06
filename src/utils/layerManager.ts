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
import { LayerKeys } from "@/types/Layers";
import { useFTTHComplainLayer } from "@/components/Maps/Main/Layers/FTTHComplain";
import { useTCLayer } from "@/components/Maps/Main/Layers/TCLayer";
import { useODCLayer } from "@/components/Maps/Main/Layers/ODCLayer";
import { useIranFTTXAreaLayer } from "@/components/Maps/IranFTTX/Layers/IranFTTXAreastsx";
import { useFATLayer } from "@/components/Maps/Main/Layers/FATLayer";
import { useCPLayer } from "@/components/Maps/DesignDesk/Layers/CPLayer";
import { useFTTHPowerLayer } from "@/components/Maps/PreOrders/Layers/FTTHPower";
import { useAutoFATLayer } from "@/components/Maps/auto-plan/Layers/autoFATLayer";
// Removed NL city/province layers per user request
//import { usePostBlockPolygonLayer } from "@/components/Maps/auto-plan/Layers/PostBlockLayer";
import { useOLTPowerAlarmLayer } from "@/components/Maps/Main/Layers/OLTPowerAlarmLayer";
import { useOLTDownSiteAlarmLayer } from "@/components/Maps/Main/Layers/OLTDownSiteAlarmLayer";

interface LayerConfig {
  id: string;
  label: string;
  icon: string;
  type: "point" | "line" | "heatmap" | "fill";
  visible: boolean;
  source: mapboxgl.GeoJSONSourceSpecification | null;
  toggle: () => void;
  loading?: boolean;
}

export const useLayerManager = (
  selectedLayers: LayerKeys[],
  defaultVisibility: Partial<Record<LayerKeys, boolean>>
) => {
  const [layerVisibility, setLayerVisibility] = useState<
    Record<LayerKeys, boolean>
  >(() =>
    Object.keys(defaultVisibility).reduce(
      (acc, key) => {
        const layerKey = key as LayerKeys;
        acc[layerKey] = defaultVisibility[layerKey] ?? false;
        return acc;
      },
      {} as Record<LayerKeys, boolean>
    )
  );

  const toggleLayerVisibility = (layerName: LayerKeys) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  };

  const layers: Record<LayerKeys, LayerConfig> = {
    MFATLayer: {
      ...useMFATLayer(),
      label: "MFAT",
      icon: "/images/map/MFAT.png",
      type: "point",
      visible: layerVisibility.MFATLayer,
      toggle: () => toggleLayerVisibility("MFATLayer"),
    },
    SFATLayer: {
      ...useSFATLayer(),
      label: "SFAT",
      icon: "/images/map/SFAT.png",
      type: "point",
      visible: layerVisibility.SFATLayer,
      toggle: () => toggleLayerVisibility("SFATLayer"),
    },
    FATLayer: {
      ...useFATLayer(),
      label: "FAT",
      icon: "/images/map/FAT.png",
      type: "point",
      visible: layerVisibility.FATLayer,
      toggle: () => toggleLayerVisibility("FATLayer"),
    },
    FATLineLayer: {
      ...useFATLineLayer(),
      label: "FAT",
      icon: "#0360f5",
      type: "line",
      visible: layerVisibility.FATLineLayer,
      toggle: () => toggleLayerVisibility("FATLineLayer"),
    },
    MetroLineLayer: {
      ...useMetroLineLayer(),
      label: "Metro",
      icon: "#ddddff",
      type: "line",
      visible: layerVisibility.MetroLineLayer,
      toggle: () => toggleLayerVisibility("MetroLineLayer"),
    },
    ODCLineLayer: {
      ...useODCLineLayer(),
      label: "ODC",
      icon: "#ff0000",
      type: "line",
      visible: layerVisibility.ODCLineLayer,
      toggle: () => toggleLayerVisibility("ODCLineLayer"),
    },

    PowerAlarmLayer: {
      ...useOLTPowerAlarmLayer(),
      label: "OLT Power Alarm",
      icon: "/images/map/PowerAlarm.png",
      type: "point",
      visible: layerVisibility.PowerAlarmLayer,
      toggle: () => toggleLayerVisibility("PowerAlarmLayer"),
    },
     DownSiteAlarmLayer: {
      ...useOLTDownSiteAlarmLayer(),
      label: "OLT Down Alarm",
      icon: "/images/map/DownSiteAlarm.png",
      type: "point",
      visible: layerVisibility.DownSiteAlarmLayer,
      toggle: () => toggleLayerVisibility("DownSiteAlarmLayer"),
    },
//    postBlockLayer: {
//      ...usePostBlockPolygonLayer(),
//      label: "Blocks",
//      icon: "/images/map/blocks.png",
//      type: "fill",
//      visible: layerVisibility.postBlockLayer,
//      toggle: () => toggleLayerVisibility("postBlockLayer"),
//    },

    FTTHPowerLayer: {
      ...useFTTHPowerLayer(),
      label: "RX Power",
      icon: "/images/map/RXPower.png",
      type: "fill",
      visible: layerVisibility.FTTHPowerLayer,
      toggle: () => toggleLayerVisibility("FTTHPowerLayer"),
    },
    DropCableLineLayer: {
      ...useDropCableLineLayer(),
      label: "Drop Cable",
      icon: "#000000",
      type: "line",
      visible: layerVisibility.DropCableLineLayer,
      toggle: () => toggleLayerVisibility("DropCableLineLayer"),
    },
    FTTHPreorderLayer: {
      ...useFTTHPreorderLayer(),
      label: "FTTH Preorder",
      icon: "/images/map/FTTHPreorder.png",
      type: "point",
      visible: layerVisibility.FTTHPreorderLayer,
      toggle: () => toggleLayerVisibility("FTTHPreorderLayer"),
    },
    FTTHPreorderHMLayer: {
      ...useFTTHPreorderHMLayer(),
      label: "FTTH Preorder Heatmap",
      icon: "/images/map/heatmap.png",
      type: "heatmap",
      visible: layerVisibility.FTTHPreorderHMLayer,
      toggle: () => toggleLayerVisibility("FTTHPreorderHMLayer"),
    },
    FTTHSuggestedFATLayer: {
      ...useFTTHSuggestedFATLayer().fillLayer,
      label: "Suggested FAT Areas",
      icon: "/images/map/Auto-FAT.png",
      type: "fill",
      visible: layerVisibility.FTTHSuggestedFATLayer,
      toggle: () => {
        toggleLayerVisibility("FTTHSuggestedFATLayer");
        toggleLayerVisibility("FTTHSuggestedFATSmallFillLayer");
      },
    },

    FTTHSuggestedFATSmallFillLayer: {
      ...useFTTHSuggestedFATLayer().smallFillLayer,
      label: "Small Suggested FAT Areas",
      icon: "",
      type: "fill",
      visible: layerVisibility.FTTHSuggestedFATSmallFillLayer,
      toggle: () => toggleLayerVisibility("FTTHSuggestedFATSmallFillLayer"),
    },
    IranFTTXAreasFill: {
      ...useIranFTTXAreaLayer().fillLayer,
      label: "FTTX Coverage Areas",
      icon: "",
      type: "fill",
      visible: layerVisibility.IranFTTXAreasFill,
      toggle: () => toggleLayerVisibility("IranFTTXAreasFill"),
    },
    
    ModemLayer: {
      ...useFTTHModemLayer(),
      label: "Modem",
      icon: "/images/map/FTTHModem.png",
      type: "point",
      visible: layerVisibility.ModemLayer,
      toggle: () => toggleLayerVisibility("ModemLayer"),
    },
    autoFATLayer: {
      ...useAutoFATLayer(),
      label: "Auto FAT",
      icon: "/images/map/Auto-FAT.png",
      type: "point",
      visible: layerVisibility.autoFATLayer,
      toggle: () => toggleLayerVisibility("autoFATLayer"),
    },
    OLTLayer: {
      ...useOLTLayer(),
      label: "OLT",
      icon: "/images/map/OLT.png",
      type: "point",
      visible: layerVisibility.OLTLayer,
      toggle: () => toggleLayerVisibility("OLTLayer"),
    },
    HHLayer: {
      ...useHHLayer(),
      label: "Hand Hole",
      icon: "/images/map/HandHole.png",
      type: "point",
      visible: layerVisibility.HHLayer,
      toggle: () => toggleLayerVisibility("HHLayer"),
    },
    ODCLayer: {
      ...useODCLayer(),
      label: "ODC",
      icon: "/images/map/ODC.png",
      type: "point",
      visible: layerVisibility.ODCLayer,
      toggle: () => toggleLayerVisibility("ODCLayer"),
    },
    CPLayer: {
      ...useCPLayer(),
      label: "CP",
      icon: "/images/map/CP.png",
      type: "point",
      visible: layerVisibility.CPLayer,
      toggle: () => toggleLayerVisibility("CPLayer"),
    },
    TCLayer: {
      ...useTCLayer(),
      label: "TC",
      icon: "/images/map/TC.png",
      type: "point",
      visible: layerVisibility.TCLayer,
      toggle: () => toggleLayerVisibility("TCLayer"),
    },
    FTTHComplain: {
      ...useFTTHComplainLayer(),
      label: "Complain",
      icon: "/images/map/Complains.png",
      type: "point",
      visible: layerVisibility.FTTHComplain,
      toggle: () => toggleLayerVisibility("FTTHComplain"),
    },
  };

  const activeLayers: LayerConfig[] = selectedLayers
    .map((layerName) => {
      const layer = layers[layerName];
      if (layer.loading !== undefined) {
        return !layer.loading && layer.source !== null ? layer : null;
      }
      return layer;
    })
    .filter((layer): layer is LayerConfig => layer !== null);

  return { activeLayers };
};
