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
import { usePolygonSelection } from "@/hooks/usePolygonSelection";
import PolygonTool from "@/components/Polygon";
import IranFTTXMap from "@/components/Maps/IranFTTX";
import PolygonDetailModal from "@/components/Polygon/PolygonDetailModal";
import {
  RasterLayerSpecification,
  RasterSourceSpecification,
  StyleSpecification,
} from "mapbox-gl";
import ScreenshotEditorModal from "@/components/ScreenshotEditorModal";

const FTTHModemsMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState<StyleSpecification>({
    version: 8,
    sources: {
      "grayscale-tiles": {
        type: "raster",
        tiles: [
          "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "Irancell",
      } as RasterSourceSpecification,
    },
    layers: [
      {
        id: "grayscale-layer",
        type: "raster",
        source: "grayscale-tiles",
        minzoom: 0,
        maxzoom: 20,
      } as RasterLayerSpecification,
    ],
  });
  const [selectedStyleId, setSelectedStyleId] = useState<string>("Dark");

  const modems = useFTTHModemsStore((state) => state.modems);
  const others = useFTTHComponentsOtherStore((state) => state.others);
  const [zoomLocation, setZoomLocation] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
  const searchParams = useSearchParams();
  const [isPointPanelMinimized, setIsPointPanelMinimized] = useState(false);

  const selectedLayers = [
    //Points
    "ModemLayer",
    "FTTHPreorderLayer",
    "IranFTTXAreasFill",
  ] as LayerKeys[];

  const defaultVisibility = {
    ModemLayer: true,
    FTTHPreorderLayer: true,
    IranFTTXAreasFill: true,
  };
  const { activeLayers } = useLayerManager(selectedLayers, defaultVisibility);

  const pointLayers = activeLayers.filter(
    (layer) => layer.type === "point" || layer.type === "fill"
  );

  const handleStyleChange = (
    newStyle: StyleSpecification,
    newStyleId: string
  ) => {
    setMapStyle(newStyle);
    setSelectedStyleId(newStyleId); // Set the selected style ID
  };

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

  const {
    isPolygonMode,
    togglePolygonMode,
    isModalOpen,
    setIsModalOpen,
    selectedFeatures,
    takeScreenshot,
    startPolygonMode,
    deleteLastPolygon,
    screenshotData,
    isScreenShotModalOpen,
    setIsScreenShotModalOpen,
  } = usePolygonSelection(ftthMapRef.current?.mapRef ?? { current: null });

  useEffect(() => {
    const areVisibleLayersLoaded = activeLayers.every((layer) => layer.source);
    if (areVisibleLayersLoaded) {
      console.log(activeLayers);
      setLoading(false);
    }
  }, [activeLayers]);

  return (
    <DefaultLayout className="p-0 md:p-0">
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] z-0 relative overflow-hidden">
          {isPolygonMode && (
            <>
              {" "}
              <PolygonTool
                startPolygonMode={startPolygonMode}
                deleteLastPolygon={deleteLastPolygon}
                takeScreenshot={takeScreenshot}
                isPolygonMode={isPolygonMode}
                selectedFeatures={selectedFeatures}
                openDetailsModal={() => setIsModalOpen(true)}
              />
              <PolygonDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedFeatures={selectedFeatures}
              />
              {screenshotData ? (
                <ScreenshotEditorModal
                  isOpen={isScreenShotModalOpen}
                  onClose={() => setIsScreenShotModalOpen(false)}
                  screenshotData={screenshotData}
                />
              ) : (
                <></>
              )}
            </>
          )}
          <CityPanel onCityClick={handleCityClick} />
          <LayerPanel
            title=""
            layers={pointLayers}
            isMinimized={isPointPanelMinimized}
            toggleMinimized={() => setIsPointPanelMinimized((prev) => !prev)}
            customPosition="top-left"
            isPolygonMode={isPolygonMode}
            togglePolygonMode={togglePolygonMode}
          />
          <StylePanel
            onStyleChange={handleStyleChange}
            selectedStyleId={selectedStyleId}
          />
          <div className="z-20 w-full">
            <IranFTTXMap
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

export default FTTHModemsMap;
