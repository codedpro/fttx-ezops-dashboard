"use client";
import React, { useState, useEffect, useRef } from "react";
import FTTHMap from "@/components/Maps/PreOrders";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import StylePanel from "@/components/Maps/Main/Panels/StylePanel";
import CityPanel from "@/components/Maps/Main/Panels/CityPanel";
import LayerPanel from "@/components/Maps/Main/Panels/LayerPanel";
import { useSearchParams } from "next/navigation";
import EditPanel from "@/components/Maps/PreOrders/Panels/EditPanel";
import LegendPanel from "@/components/Maps/PreOrders/Panels/LegendPanel";
import { useCustomFATLine } from "@/hooks/useCustomFATLine";
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
import { useFTTHPreordersStore } from "@/store/FTTHPreordersStore";

// 1) Import useTiles
import { useTiles } from "@/hooks/useTiles";

const FTTHModemsMap: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Base style (Dark) as your initial style:
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

  // 2) Manage tile overlays (for multiple tile layers on top of base)
  //    Here we define we want 2 tile layers: "stadiaDark" and "stadiaLight"
  //    and their default visibilities.
  // TODO: Undo this
  //const { activeTiles } = useTiles(["blocks"], {
  //  blocks: true,
 // });

  const [selectedStyleId, setSelectedStyleId] = useState<string>("Dark");

  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingPosition, setIsEditingPosition] = useState(false);
  const [isSuggestingLine, setIsSuggestingLine] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isPathPanelOpen, setIsPathPanelOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<any>(null);
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

  // Vector layers we want to manage
  const selectedLayers = [
    //Points
    "FTTHPreorderLayer",
    "MFATLayer",
    "SFATLayer",
    "OLTLayer",
    "FTTHPreorderHMLayer",
    "FTTHSuggestedFATLayer",
    "FTTHSuggestedFATSmallFillLayer",
    //Lines
    "ODCLineLayer",
    "FATLineLayer",
    "MetroLineLayer",
    "DropCableLineLayer",
  ] as LayerKeys[];

  // Default visibility for those vector layers
  const defaultVisibility = {
    FTTHPreorderLayer: false,
    MFATLayer: true,
    SFATLayer: true,
    FTTHPreorderHMLayer: true,
    FTTHSuggestedFATLayer: false,
    FTTHSuggestedFATSmallFillLayer: false,
    OLTLayer: false,
    ODCLineLayer: true,
    FATLineLayer: true,
    MetroLineLayer: true,
    DropCableLineLayer: true,
  };

  // 3) Use our vector layer manager
  const { activeLayers } = useLayerManager(selectedLayers, defaultVisibility);

  // For display grouping in the panel:
  const pointLayers = activeLayers.filter(
    (layer) =>
      layer.type === "point" ||
      layer.type === "heatmap" ||
      (layer.type === "fill" && layer.id !== "suggestedFATSGrayFill")
  );
  const lineLayers = activeLayers.filter((layer) => layer.type === "line");

  // For changing base style in StylePanel
  const handleStyleChange = (
    newStyle: StyleSpecification,
    newStyleId: string
  ) => {
    setMapStyle(newStyle);
    setSelectedStyleId(newStyleId);
  };

  const handleCoordinatesChange = (
    coordinates: { lat: number; lng: number } | null
  ) => {
    setCurrentCoordinates(coordinates);
  };

  const handlePathPanelChange = (isOpen: boolean, path: any) => {
    setIsPathPanelOpen(isOpen);
    setSelectedPath(path);
  };

  const preorders = useFTTHPreordersStore((state) => state.preorders);

  useEffect(() => {
    const search = searchParams.get("search");
    if (!search) return;

    if (search.includes(",")) {
      const [lat, lng] = search.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        setZoomLocation({ lat, lng, zoom: 20 });
      }
    }
    if (search.startsWith("FTH")) {
      const preorder = preorders.find((p) => p.Tracking_Code === search);
      if (preorder) {
        setZoomLocation({ lat: preorder.Lat, lng: preorder.Long, zoom: 20 });
      }
    }
  }, [searchParams]);

  const [editData, setEditData] = useState<any>(null);
  const handleEdit = (data: any) => {
    setIsEditMode(true);
    setEditData(data);
  };

  // The map ref
  const ftthMapRef = useRef<{
    handleEditPoint: (data: any) => void;
    handleSubmitPointEdit: () => void;
    handleCancelPointEdit: () => void;
    handleSuggestFATLine: (data: any) => void;
    handleSaveSuggestedPath: () => void;
    handleCancelSuggestedPath: () => void;
    handleCancelEditPath: () => void;
    handlemoveEditPoint: (coords: { lat: number; lng: number }) => void;
    mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  } | null>(null);

  // Various editing logic
  const handleEditPosition = () => {
    if (ftthMapRef.current && editData) {
      setIsEditingPosition(true);
      ftthMapRef.current.handleCancelEditPath();
      setZoomLocation({ lat: editData.Lat, lng: editData.Long, zoom: 20 });
      ftthMapRef.current.handleEditPoint(editData);
    }
  };

  const handleSaveEditPointCoordinates = (newCoordinates: {
    lat: number;
    lng: number;
  }) => {
    if (ftthMapRef.current) {
      setZoomLocation({
        lat: newCoordinates.lat,
        lng: newCoordinates.lng,
        zoom: 20,
      });
      ftthMapRef.current.handlemoveEditPoint(newCoordinates);
    }
  };

  const handleSuggestFATSubmit = () => {
    if (ftthMapRef.current) {
      setIsEditingPosition(false);
      ftthMapRef.current.handleSaveSuggestedPath();
      handleCancelSuggestFAT();
    }
  };

  const handleCancelSuggestFAT = () => {
    if (ftthMapRef.current) {
      setIsEditingPosition(false);
      ftthMapRef.current.handleCancelSuggestedPath();
    }
  };

  const handleSuggestFATLine = () => {
    if (ftthMapRef.current && editData) {
      ftthMapRef.current.handleCancelEditPath();

      // Toggle off some lines if they're visible
      activeLayers.forEach((layer) => {
        if (
          [
            "FATLineLayer",
            "MetroLineLayer",
            "ODCLineLayer",
            "DropCableLineLayer",
          ].includes(layer.id) &&
          layer.visible
        ) {
          layer.toggle();
        }
      });

      setZoomLocation({ lat: editData.Lat, lng: editData.Long, zoom: 20 });
      ftthMapRef.current.handleSuggestFATLine(editData);
      setIsSuggestingLine(true);
    }
  };

  const handleExitEditMode = () => {
    if (ftthMapRef.current) {
      setIsEditMode(false);
      setIsEditingPosition(false);
      ftthMapRef.current.handleCancelEditPath();
    }
  };

  const handleCancelSuggesting = () => {
    if (ftthMapRef.current) {
      // Toggle back on lines that were turned off, if needed
      activeLayers.forEach((layer) => {
        if (
          [
            "FATLineLayer",
            "MetroLineLayer",
            "ODCLineLayer",
            "DropCableLineLayer",
          ].includes(layer.id) &&
          !layer.visible
        ) {
          layer.toggle();
        }
      });
      ftthMapRef.current.handleCancelSuggestedPath();
      ftthMapRef.current.handleCancelEditPath();
      setIsSuggestingLine(false);
    }
  };

  const handleSubmitEdit = () => {
    if (ftthMapRef.current) {
      setIsEditingPosition(false);
      ftthMapRef.current.handleSubmitPointEdit();
    }
  };

  const handleCancelEdit = () => {
    if (ftthMapRef.current) {
      setIsEditingPosition(false);
      ftthMapRef.current.handleCancelEditPath();
      ftthMapRef.current.handleCancelPointEdit();
    }
  };

  // Hook for custom FAT line drawing
  const {
    isDrawing,
    lineColor,
    handleStartDrawing,
    handleDrawNextPoint,
    handleUndoLastPoint,
    handleSaveLine,
    handleCancelLine,
    handleColorChange,
  } = useCustomFATLine(ftthMapRef.current?.mapRef ?? { current: null }, [
    "sfat-layer",
    "mfat-layer",
  ]);

  const handleCustomFATLine = () => {
    if (ftthMapRef.current && editData) {
      handleStartDrawing(editData);
    }
  };

  const FTTHSuggestedFATLayer = activeLayers.find(
    (layer) => layer.id === "suggestedFATSGrayFill"
  );

  // Polygon selection hook
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

  // Once all visible layers are loaded, remove "Loading..."
  useEffect(() => {
    const areVisibleLayersLoaded = activeLayers.every((layer) => layer.source);
    if (areVisibleLayersLoaded) {
      setLoading(false);
    }
  }, [activeLayers]);

  // Searching
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
          {/* City search panel, top-left */}
          <CityPanel
            onCityClick={handleCityClick}
            onSearch={handleSearchPlaces}
            onClear={removeAllMarkers}
          />

          {/* Polygon selection UI */}
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
              ) : null}
            </>
          )}

          {/* Show panels unless in edit mode */}
          {!isEditMode && (
            <>
              {/* Panel for point-type layers, plus tile overlays */}
              <LayerPanel
                title=""
                layers={pointLayers}
                  // TODO: Undo this

               // tiles={activeTiles}
                isMinimized={isPointPanelMinimized}
                toggleMinimized={() =>
                  setIsPointPanelMinimized((prev) => !prev)
                }
                customPosition="top-left"
                isPolygonMode={isPolygonMode}
                togglePolygonMode={togglePolygonMode}
              />

              {/* Panel for line layers (separate) */}
              <LayerPanel
                title=""
                layers={lineLayers}
             //   tiles={undefined}
                isMinimized={isLinePanelMinimized}
                toggleMinimized={() => setIsLinePanelMinimized((prev) => !prev)}
                customPosition="bottom-left"
                isPolygonMode={isPolygonMode}
                togglePolygonMode={togglePolygonMode}
              />

              {/* Style selector for base style */}
              <StylePanel
                onStyleChange={handleStyleChange}
                selectedStyleId={selectedStyleId}
              />

              {/* If user toggles the suggestedFAT layer on, show legend */}
              {FTTHSuggestedFATLayer?.visible ? <LegendPanel /> : null}
            </>
          )}

          {/* If editing is on, show the EditPanel */}
          {isEditMode && ftthMapRef.current && (
            <EditPanel
              onEditPosition={handleEditPosition}
              onSuggestFATLine={handleSuggestFATLine}
              onCustomFATLine={handleCustomFATLine}
              onExitEditMode={handleExitEditMode}
              currentCoordinates={currentCoordinates}
              handleSubmitEdit={handleSubmitEdit}
              handleCancelEdit={handleCancelEdit}
              isEditingPosition={isEditingPosition}
              isPathPanelOpen={isPathPanelOpen}
              handleSavePath={handleSuggestFATSubmit}
              handleCancelPath={handleCancelSuggestFAT}
              selectedPath={selectedPath}
              handleUndoCustomLine={handleUndoLastPoint}
              handleColorChange={handleColorChange}
              isDrawingLine={isDrawing}
              lineColor={lineColor}
              handleSaveCustomLine={handleSaveLine}
              isSuggestingFATLine={isSuggestingLine}
              handleCancelCustomLine={handleCancelLine}
              handleCancelSuggestingFATLine={handleCancelSuggesting}
              handleSaveEditCoordinates={handleSaveEditPointCoordinates}
            />
          )}

          {/* The actual map component */}
          <div className="w-full z-0">
            <FTTHMap
              ref={ftthMapRef}
              layers={activeLayers}
              // TODO : Undo this
              // tileLayers={activeTiles}
              mapStyle={mapStyle}
              zoomLocation={zoomLocation}
              // onEdit, isEditMode, onCoordinatesChange, etc. omitted if not used
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default FTTHModemsMap;
