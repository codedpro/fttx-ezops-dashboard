"use client";
import React, { useState, useEffect } from "react";
import FTTHMap from "@/components/Maps/Main";
import { useFTTHModemLayer } from "@/components/Maps/Main/Layers/FTTHModem";
import { useMFATLayer } from "@/components/Maps/Main/Layers/MFATLayer";
import { useSFATLayer } from "@/components/Maps/Main/Layers/SFATLayer";
import { useHHLayer } from "@/components/Maps/Main/Layers/HHLayer";
import { useOLTLayer } from "@/components/Maps/Main/Layers/OLTLayer";
import { useODCLayer } from "@/components/Maps/Main/Layers/ODCLayer";
import { useTCLayer } from "@/components/Maps/Main/Layers/TCLayer";
import { useFATLineLayer } from "@/components/Maps/Main/Layers/FATLineLayer";
import { useMetroLineLayer } from "@/components/Maps/Main/Layers/MetroLineLayer";
import { useODCLineLayer } from "@/components/Maps/Main/Layers/ODCLineLayer";
import { useDropCableLineLayer } from "@/components/Maps/Main/Layers/DropCableLineLayer";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import StylePanel from "@/components/Maps/Main/Panels/StylePanel";
import CityPanel from "@/components/Maps/Main/Panels/CityPanel";
import {
  FaSatelliteDish,
  FaWifi,
  FaNetworkWired,
  FaMapMarkerAlt,
  FaProjectDiagram,
} from "react-icons/fa";
import LayerPanel from "@/components/Maps/Main/Panels/LayerPanel";
import { useSearchParams } from "next/navigation";

interface Layer {
  id: string;
  visible: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  icon: React.ReactNode;
  source: mapboxgl.GeoJSONSourceSpecification | null;
  type: "point" | "line";
}
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";
import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";

const FTTHModemsMap: React.FC = () => {
  const modemLayer = useFTTHModemLayer();
  const mFatLayer = useMFATLayer();
  const sFatLayer = useSFATLayer();
  const hhLayer = useHHLayer();
  const oltLayer = useOLTLayer();
  const odcLayer = useODCLayer();
  const tcLayer = useTCLayer();
  const fatLineLayer = useFATLineLayer();
  const metroLineLayer = useMetroLineLayer();
  const odcLineLayer = useODCLineLayer();
  const dropCableLineLayer = useDropCableLineLayer();

  const [isModemLayerVisible, setIsModemLayerVisible] = useState(true);
  const [isMFATLayerVisible, setIsMFATLayerVisible] = useState(false);
  const [isSFATLayerVisible, setIsSFATLayerVisible] = useState(false);
  const [isHHLayerVisible, setIsHHLayerVisible] = useState(false);
  const [isOLTLayerVisible, setIsOLTLayerVisible] = useState(false);
  const [isODCLayerVisible, setIsODCLayerVisible] = useState(false);
  const [isTCLayerVisible, setIsTCLayerVisible] = useState(false);
  const [isFATLayerVisible, setIsFATLayerVisible] = useState(true);
  const [isMetroLayerVisible, setIsMetroLayerVisible] = useState(true);
  const [isODCLineLayerVisible, setIsODCLineLayerVisible] = useState(true);
  const [isDropCableLayerVisible, setIsDropCableLayerVisible] = useState(true);

  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState(
    "mapbox://styles/mapbox/dark-v10"
  );

  const modems = useFTTHModemsStore((state) => state.modems);
  const others = useFTTHComponentsOtherStore((state) => state.others);

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
      ...modemLayer,
      visible: isModemLayerVisible,
      toggle: setIsModemLayerVisible,
      label: "Modem Layer",
      icon: <FaWifi />,
      type: "point",
    },
    {
      ...mFatLayer,
      visible: isMFATLayerVisible,
      toggle: setIsMFATLayerVisible,
      label: "MFAT Layer",
      icon: <FaSatelliteDish />,
      type: "point",
    },
    {
      ...sFatLayer,
      visible: isSFATLayerVisible,
      toggle: setIsSFATLayerVisible,
      label: "SFAT Layer",
      icon: <FaNetworkWired />,
      type: "point",
    },
    {
      ...hhLayer,
      visible: isHHLayerVisible,
      toggle: setIsHHLayerVisible,
      label: "HH Layer",
      icon: <FaMapMarkerAlt />,
      type: "point",
    },
    {
      ...oltLayer,
      visible: isOLTLayerVisible,
      toggle: setIsOLTLayerVisible,
      label: "OLT Layer",
      icon: <FaProjectDiagram />,
      type: "point",
    },
    {
      ...odcLayer,
      visible: isODCLayerVisible,
      toggle: setIsODCLayerVisible,
      label: "ODC Layer",
      icon: <FaNetworkWired />,
      type: "point",
    },
    {
      ...tcLayer,
      visible: isTCLayerVisible,
      toggle: setIsTCLayerVisible,
      label: "TC Layer",
      icon: <FaProjectDiagram />,
      type: "point",
    },
  ];

  const lineLayers: Layer[] = [
    {
      ...fatLineLayer,
      visible: isFATLayerVisible,
      toggle: setIsFATLayerVisible,
      label: "FAT Line Layer",
      icon: <FaNetworkWired />,
      type: "line",
    },
    {
      ...metroLineLayer,
      visible: isMetroLayerVisible,
      toggle: setIsMetroLayerVisible,
      label: "Metro Line Layer",
      icon: <FaMapMarkerAlt />,
      type: "line",
    },
    {
      ...odcLineLayer,
      visible: isODCLineLayerVisible,
      toggle: setIsODCLineLayerVisible,
      label: "ODC Line Layer",
      icon: <FaProjectDiagram />,
      type: "line",
    },
    {
      ...dropCableLineLayer,
      visible: isDropCableLayerVisible,
      toggle: setIsDropCableLayerVisible,
      label: "Drop Cable Layer",
      icon: <FaNetworkWired />,
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

    if (search.startsWith("8411")) {
      const modem = modems.find(
        (modem) => modem.Modem_ID.toString() === search
      );
      if (modem) {
        setZoomLocation({ lat: modem.Lat, lng: modem.Long });
      }
    }

    const oltPattern = /^[A-Z]\d{4}$/;
    if (oltPattern.test(search)) {
      const oltData = others.filter(
        (component) => component.Type === "OLT" && component.Name === search
      );
      if (oltData.length > 0) {
        const olt = oltData[0];
        setZoomLocation({ lat: olt.Lat, lng: olt.Long });
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
            title="Point Layers"
            layers={pointLayers}
            isMinimized={isPointPanelMinimized}
            toggleMinimized={() => setIsPointPanelMinimized((prev) => !prev)}
            customPosition="top-left"
          />
          <LayerPanel
            title="Line Layers"
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
