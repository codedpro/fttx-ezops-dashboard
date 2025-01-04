"use client";
import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import StylePanel from "@/components/Maps/Main/Panels/StylePanel";
import CityPanel from "@/components/Maps/Main/Panels/CityPanel";
import LayerPanel from "@/components/Maps/Main/Panels/LayerPanel";
import { useSearchParams } from "next/navigation";
import { LayerKeys } from "@/types/Layers";
import { useLayerManager } from "@/utils/layerManager";
import { usePolygonSelection } from "@/hooks/usePolygonSelection";
import PolygonTool from "@/components/Polygon";
import PolygonDetailModal from "@/components/Polygon/PolygonDetailModal";
import {
  RasterLayerSpecification,
  RasterSourceSpecification,
  StyleSpecification,
} from "mapbox-gl";
import ScreenshotEditorModal from "@/components/ScreenshotEditorModal";
import useSearchPlaces from "@/hooks/useSearchPlaces";
import FTTHMap from "@/components/Maps/auto-plan";
import { UserService } from "@/services/userService";
import { useInitializePostBlocks } from "@/hooks/useInitializePostBlocks";

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

  const [zoomLocation, setZoomLocation] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);
  const searchParams = useSearchParams();
  const handleCityClick = (city: {
    lat: number;
    lng: number;
    zoom: number;
  }) => {
    setZoomLocation(city);
  };
  const [isPointPanelMinimized, setIsPointPanelMinimized] = useState(false);
  const [isLinePanelMinimized, setIsLinePanelMinimized] = useState(false);

  const userservice = new UserService();
  const token = userservice.getToken();

  useEffect(() => {
    if (token) useInitializePostBlocks(token);
  }, [token]);
  const selectedLayers = [
    //Points
    "MFATLayer",
    "SFATLayer",
    "OLTLayer",
    "autoFATLayer",
    "postBlockLayer",

    //Lines
    "ODCLineLayer",
    "FATLineLayer",
    "MetroLineLayer",
    "DropCableLineLayer",
  ] as LayerKeys[];

  const defaultVisibility = {
    MFATLayer: true,
    SFATLayer: true,
    OLTLayer: true,
    autoFATLayer: true,
    postBlockLayer: true,
    ODCLineLayer: true,
    FATLineLayer: true,
    MetroLineLayer: true,
    DropCableLineLayer: true,
  };

  const { activeLayers } = useLayerManager(selectedLayers, defaultVisibility);
  const pointLayers = activeLayers.filter(
    (layer) =>
      layer.type === "point" ||
      layer.type === "heatmap" ||
      (layer.type === "fill" && layer.id !== "suggestedFATSGrayFill")
  );
  const lineLayers = activeLayers.filter((layer) => layer.type === "line");

  const handleStyleChange = (
    newStyle: StyleSpecification,
    newStyleId: string
  ) => {
    setMapStyle(newStyle);
    setSelectedStyleId(newStyleId);
  };

  const ftthMapRef = useRef<{
    handleEditPoint: (data: any) => void;
    handleSubmitPointEdit: () => void;
    handleCancelPointEdit: () => void;
    handleSuggestFATLine: (data: any) => void;
    handleSaveSuggestedPath: () => void;
    handleCancelSuggestedPath: () => void;
    handleCancelEditPath: () => void;
    handlemoveEditPoint: (newCoordinates: { lat: number; lng: number }) => void;
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
    const search = searchParams.get("search");
    if (!search) return;

    if (search.includes(",")) {
      const [lat, lng] = search.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setZoomLocation({ lat, lng, zoom: 20 });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const areVisibleLayersLoaded = activeLayers.every((layer) => layer.source);
    if (areVisibleLayersLoaded) {
      setLoading(false);
    }
  }, [activeLayers]);

  const { handleSearchPlaces, removeAllMarkers } = useSearchPlaces(
    ftthMapRef.current?.mapRef ?? { current: null }
  );
  return (
    <DefaultLayout className="p-0 md:p-0">
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Downloading Data...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] z-0 relative overflow-hidden">
          <CityPanel
            onCityClick={handleCityClick}
            onSearch={handleSearchPlaces}
            onClear={removeAllMarkers}
          />
          {isPolygonMode && (
            <>
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

          <>
            <LayerPanel
              title=""
              layers={pointLayers}
              isMinimized={isPointPanelMinimized}
              toggleMinimized={() => setIsPointPanelMinimized((prev) => !prev)}
              customPosition="top-left"
              isPolygonMode={isPolygonMode}
              togglePolygonMode={togglePolygonMode}
            />
            <LayerPanel
              title=""
              layers={lineLayers}
              isMinimized={isLinePanelMinimized}
              toggleMinimized={() => setIsLinePanelMinimized((prev) => !prev)}
              customPosition="bottom-left"
              isPolygonMode={isPolygonMode}
              togglePolygonMode={togglePolygonMode}
            />
            <StylePanel
              onStyleChange={handleStyleChange}
              selectedStyleId={selectedStyleId}
            />
          </>

          <div className="w-full z-0">
            <FTTHMap
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
