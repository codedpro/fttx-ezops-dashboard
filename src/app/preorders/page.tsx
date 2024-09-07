"use client";
import React, { useState, useEffect } from "react";
import FTTHMap from "@/components/Maps/PreOrders";
import { useMFATLayer } from "@/components/Maps/Main/Layers/MFATLayer";
import { useSFATLayer } from "@/components/Maps/Main/Layers/SFATLayer";
import { useFATLineLayer } from "@/components/Maps/Main/Layers/FATLineLayer";
import { useMetroLineLayer } from "@/components/Maps/Main/Layers/MetroLineLayer";
import { useODCLineLayer } from "@/components/Maps/Main/Layers/ODCLineLayer";
import { useDropCableLineLayer } from "@/components/Maps/Main/Layers/DropCableLineLayer";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import StylePanel from "@/components/Maps/Main/Panels/StylePanel";
import CityPanel from "@/components/Maps/Main/Panels/CityPanel";
import LayerPanel from "@/components/Maps/Main/Panels/LayerPanel";
import { useSearchParams } from "next/navigation";

interface Layer {
  id: string;
  visible: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  icon: string;
  source: mapboxgl.GeoJSONSourceSpecification | null;
  type: "point" | "line" | "heatmap";
}
import { useFTTHPreorderLayer } from "@/components/Maps/PreOrders/Layers/FTTHPreorder";
import { useFTTHPreorderHMLayer } from "@/components/Maps/PreOrders/Layers/FTTHPreorderHeatMap";

const FTTHModemsMap: React.FC = () => {
  const preOrdersLayer = useFTTHPreorderLayer();
  const preOrdersHMLayer = useFTTHPreorderHMLayer();
  const mFatLayer = useMFATLayer();
  const sFatLayer = useSFATLayer();
  const fatLineLayer = useFATLineLayer();
  const metroLineLayer = useMetroLineLayer();
  const odcLineLayer = useODCLineLayer();
  const dropCableLineLayer = useDropCableLineLayer();

  const [isMFATLayerVisible, setIsMFATLayerVisible] = useState(true);
  const [isSFATLayerVisible, setIsSFATLayerVisible] = useState(true);
  const [isFATLayerVisible, setIsFATLayerVisible] = useState(true);
  const [isMetroLayerVisible, setIsMetroLayerVisible] = useState(true);
  const [isODCLineLayerVisible, setIsODCLineLayerVisible] = useState(true);
  const [isDropCableLayerVisible, setIsDropCableLayerVisible] = useState(true);
  const [isPreOrdersVisable, setIsPreOrdersVisable] = useState(false);
  const [isPreOrdersHMVisable, setIsPreOrdersHMVisable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v10");

  const [zoomLocation, setZoomLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const searchParams = useSearchParams();

  const handleCityClick = (city: { lat: number; lng: number }) => {
    setZoomLocation(city);
  };

  const [isPointPanelMinimized, setIsPointPanelMinimized] = useState(false);
  const [isLinePanelMinimized, setIsLinePanelMinimized] = useState(false);
  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle);
  };
  const pointLayers: Layer[] = [
    {
      ...preOrdersHMLayer,
      visible: isPreOrdersHMVisable,
      toggle: setIsPreOrdersHMVisable,
      label: "Pre Orders heatmap",
      icon: "",
      type: "heatmap",
    },
    {
      ...preOrdersLayer,
      visible: isPreOrdersVisable,
      toggle: setIsPreOrdersVisable,
      label: "Pre Orders",
      icon: "/images/map/FTTHPreorder.png",
      type: "point",
    },

    {
      ...mFatLayer,
      visible: isMFATLayerVisible,
      toggle: setIsMFATLayerVisible,
      label: "MFAT",
      icon: "/images/map/MFAT.png",
      type: "point",
    },
    {
      ...sFatLayer,
      visible: isSFATLayerVisible,
      toggle: setIsSFATLayerVisible,
      label: "SFAT",
      icon: "/images/map/SFAT.png",
      type: "point",
    },
  ];

  const lineLayers: Layer[] = [
    {
      ...fatLineLayer,
      visible: isFATLayerVisible,
      toggle: setIsFATLayerVisible,
      label: "FAT",
      icon: "#0360f5",
      type: "line",
    },
    {
      ...metroLineLayer,
      visible: isMetroLayerVisible,
      toggle: setIsMetroLayerVisible,
      label: "Metro",
      icon: "#ddddff",
      type: "line",
    },
    {
      ...odcLineLayer,
      visible: isODCLineLayerVisible,
      toggle: setIsODCLineLayerVisible,
      label: "ODC",
      icon: "#ff0000",
      type: "line",
    },
    {
      ...dropCableLineLayer,
      visible: isDropCableLayerVisible,
      toggle: setIsDropCableLayerVisible,
      label: "Drop Cable",
      icon: "#000000",
      type: "line",
    },
  ];

  const areVisibleLayersLoaded = lineLayers.every((layer) => layer.source);
  useEffect(() => {
    const search = searchParams.get("search");
    if (!search) return;

    if (search.includes(",")) {
      const [lat, lng] = search.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setZoomLocation({ lat, lng });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (areVisibleLayersLoaded) {
      setLoading(false);
    }
  }, [areVisibleLayersLoaded]);

  return (
    <DefaultLayout>
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] relative overflow-hidden">
          <CityPanel onCityClick={handleCityClick} />
          <LayerPanel
            title=""
            layers={pointLayers}
            isMinimized={isPointPanelMinimized}
            toggleMinimized={() => setIsPointPanelMinimized((prev) => !prev)}
            customPosition="top-left"
          />
          <LayerPanel
            title=""
            layers={lineLayers}
            isMinimized={isLinePanelMinimized}
            toggleMinimized={() => setIsLinePanelMinimized((prev) => !prev)}
            customPosition="bottom-left"
          />
          <StylePanel
            onStyleChange={handleStyleChange}
            selectedStyle={mapStyle}
          />
          <div className="z-20">
            <FTTHMap
              layers={pointLayers.concat(lineLayers)}
              mapStyle={mapStyle}
              zoomLocation={zoomLocation}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default FTTHModemsMap;
