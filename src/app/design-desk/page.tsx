"use client";
import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import StylePanel from "@/components/Maps/Main/Panels/StylePanel";
import CityPanel from "@/components/Maps/Main/Panels/CityPanel";
import LayerPanel from "@/components/Maps/Main/Panels/LayerPanel";
import { useSearchParams } from "next/navigation";
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";
import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";
import { useLayerManager } from "@/utils/layerManager";
import { LayerKeys } from "@/types/Layers";
import DesignDeskMap from "@/components/Maps/DesignDesk";
import MenuPanel from "@/components/Maps/DesignDesk/Panels/Menu";
import { StyleSpecification } from "mapbox-gl";

const DesignDesk: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState<StyleSpecification>({
    version: 8,
    sources: {
      "osm-tiles": {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: "osm-tiles-layer",
        type: "raster",
        source: "osm-tiles",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  });
  
  const modems = useFTTHModemsStore((state) => state.modems);
  const others = useFTTHComponentsOtherStore((state) => state.others);
  const [zoomLocation, setZoomLocation] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
  const searchParams = useSearchParams();
  const [isPointPanelMinimized, setIsPointPanelMinimized] = useState(false);
  const [isLinePanelMinimized, setIsLinePanelMinimized] = useState(false);

  const selectedLayers = [
    //Points
    "FTTHPreorderLayer",
    "ModemLayer",
    "MFATLayer",
    "SFATLayer",
    "HHLayer",
    "OLTLayer",
    "ODCLayer",
    "TCLayer",
    //Lines
    "ODCLineLayer",
    "FATLineLayer",
    "MetroLineLayer",
    "DropCableLineLayer",
  ] as LayerKeys[];

  const defaultVisibility = {
    FTTHPreorderLayer: false,
    ModemLayer: true,
    MFATLayer: false,
    SFATLayer: false,
    HHLayer: false,
    OLTLayer: false,
    ODCLineLayer: true,
    FATLineLayer: true,
    MetroLineLayer: true,
    DropCableLineLayer: true,
  };
  const { activeLayers } = useLayerManager(selectedLayers, defaultVisibility);

  const pointLayers = activeLayers.filter((layer) => layer.type === "point");
  const lineLayers = activeLayers.filter((layer) => layer.type === "line");

 /*  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle);
  }; */

  const handleCityClick = (city: {
    lat: number;
    lng: number;
    zoom: number;
  }) => {
    setZoomLocation(city);
  };

  useEffect(() => {
    const search = searchParams.get("search");
    if (!search) return;

    if (search.includes(",")) {
      const [lat, lng] = search.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setZoomLocation({ lat, lng, zoom: 20 });
      }
    }

    if (search.startsWith("8411")) {
      const modem = modems.find(
        (modem) => modem.Modem_ID.toString() === search
      );
      if (modem) {
        setZoomLocation({ lat: modem.Lat, lng: modem.Long, zoom: 20 });
      }
    }

    const oltPattern = /^[A-Z]\d{4}$/;

    if (oltPattern.test(search)) {
      const oltData = others.filter(
        (component) => component.Type === "OLT" && component.Name === search
      );
      if (oltData.length > 0) {
        const olt = oltData[0];
        setZoomLocation({ lat: olt.Lat, lng: olt.Long, zoom: 20 });
      }
    }
  }, [searchParams]);

  const ftthMapRef = useRef<{
    mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  } | null>(null);

  useEffect(() => {
    const areVisibleLayersLoaded = activeLayers.every((layer) => layer.source);
    if (areVisibleLayersLoaded) {
      console.log(activeLayers);
      setLoading(false);
    }
  }, [activeLayers]);

  const handleAddObject = (object: string) => {
    alert(`Add Object: ${object}`);
    // Actual logic for adding objects
  };

  const handleDrawLine = (line: string) => {
    alert(`Draw Line: ${line}`);
    // Actual logic for drawing lines
  };

  const handleAddKMZ = () => {
    alert(`Add KMZ File:`);
  };

  const handleSelectDraft = (draft: string) => {
    alert(`Select Draft: ${draft}`);
  };

  return (
    <DefaultLayout>
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] relative overflow-hidden">
          <MenuPanel
            onAddObject={handleAddObject}
            onDrawLine={handleDrawLine}
            onAddKMZ={handleAddKMZ}
            onSelectKMZ={handleAddKMZ}
            onSelectDraft={handleSelectDraft}
          />
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
       {/*    <StylePanel
            onStyleChange={handleStyleChange}
            selectedStyle={mapStyle}
          /> */}
          <div className="z-20 w-full">
            <DesignDeskMap
              ref={ftthMapRef}
              layers={activeLayers}
              mapStyle={mapStyle}
              zoomLocation={zoomLocation}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default DesignDesk;
