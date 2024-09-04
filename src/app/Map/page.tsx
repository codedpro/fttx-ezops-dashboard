"use client";
import React, { useState } from "react";
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
import { FaSatelliteDish, FaWifi, FaNetworkWired, FaMapMarkerAlt, FaProjectDiagram } from "react-icons/fa"; // Icons

// Define a common type for point and line layers
type LayerType = "point" | "line";

interface Layer {
  id: string;
  visible: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  icon: React.ReactNode;
  source: mapboxgl.GeoJSONSourceSpecification | null;
  type: LayerType;
}

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
  const [isMFATLayerVisible, setIsMFATLayerVisible] = useState(true);
  const [isSFATLayerVisible, setIsSFATLayerVisible] = useState(true);
  const [isHHLayerVisible, setIsHHLayerVisible] = useState(true);
  const [isOLTLayerVisible, setIsOLTLayerVisible] = useState(true);
  const [isODCLayerVisible, setIsODCLayerVisible] = useState(true);
  const [isTCLayerVisible, setIsTCLayerVisible] = useState(true);
  const [isFATLayerVisible, setIsFATLayerVisible] = useState(true);
  const [isMetroLayerVisible, setIsMetroLayerVisible] = useState(true);
  const [isODCLineLayerVisible, setIsODCLineLayerVisible] = useState(true);
  const [isDropCableLayerVisible, setIsDropCableLayerVisible] = useState(true);

  const pointLayers: Layer[] = [
    { ...modemLayer, visible: isModemLayerVisible, toggle: setIsModemLayerVisible, label: "Modem Layer", icon: <FaWifi />, type: "point" },
    { ...mFatLayer, visible: isMFATLayerVisible, toggle: setIsMFATLayerVisible, label: "MFAT Layer", icon: <FaSatelliteDish />, type: "point" },
    { ...sFatLayer, visible: isSFATLayerVisible, toggle: setIsSFATLayerVisible, label: "SFAT Layer", icon: <FaNetworkWired />, type: "point" },
    { ...hhLayer, visible: isHHLayerVisible, toggle: setIsHHLayerVisible, label: "HH Layer", icon: <FaMapMarkerAlt />, type: "point" },
    { ...oltLayer, visible: isOLTLayerVisible, toggle: setIsOLTLayerVisible, label: "OLT Layer", icon: <FaProjectDiagram />, type: "point" },
  ];

  const lineLayers: Layer[] = [
    { ...fatLineLayer, visible: isFATLayerVisible, toggle: setIsFATLayerVisible, label: "FAT Line Layer", icon: <FaNetworkWired />, type: "line" },
    { ...metroLineLayer, visible: isMetroLayerVisible, toggle: setIsMetroLayerVisible, label: "Metro Line Layer", icon: <FaMapMarkerAlt />, type: "line" },
    { ...odcLineLayer, visible: isODCLineLayerVisible, toggle: setIsODCLineLayerVisible, label: "ODC Line Layer", icon: <FaProjectDiagram />, type: "line" },
    { ...dropCableLineLayer, visible: isDropCableLayerVisible, toggle: setIsDropCableLayerVisible, label: "Drop Cable Layer", icon: <FaNetworkWired />, type: "line" },
  ];

  return (
    <DefaultLayout>
      <div className="w-full h-[80vh] relative">
        {/* Top left container for point layers */}
        <div className="absolute top-0 z-30 left-0 m-4 p-4 bg-white bg-opacity-30 backdrop-blur-md rounded-lg shadow-lg">
          <h3 className="font-bold mb-2">Point Layers</h3>
          <div className="space-y-2">
            {pointLayers.map((layer) => (
              <div className="flex items-center" key={layer.id}>
                {layer.icon}
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => layer.toggle((prev) => !prev)}
                  className="ml-2"
                />
                <label className="ml-2">{layer.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom left container for line layers */}
        <div className="absolute bottom-0 z-30 left-0 m-4 p-4 bg-white bg-opacity-30 backdrop-blur-md rounded-lg shadow-lg">
          <h3 className="font-bold mb-2">Line Layers</h3>
          <div className="space-y-2">
            {lineLayers.map((layer) => (
              <div className="flex items-center" key={layer.id}>
                {layer.icon}
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => layer.toggle((prev) => !prev)}
                  className="ml-2"
                />
                <label className="ml-2">{layer.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="z-20">
          {pointLayers.concat(lineLayers).every(layer => layer.source) && (
            <FTTHMap layers={pointLayers.concat(lineLayers)} />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default FTTHModemsMap;
