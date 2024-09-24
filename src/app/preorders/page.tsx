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
import { FaDrawPolygon } from "react-icons/fa";
import { usePolygonSelection } from "@/hooks/usePolygonSelection";
import PolygonTool from "@/components/Polygon";

const FTTHModemsMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v10");
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

  const { activeLayers } = useLayerManager(selectedLayers, defaultVisibility);
  const pointLayers = activeLayers.filter(
    (layer) =>
      layer.type === "point" ||
      layer.type === "heatmap" ||
      (layer.type === "fill" && layer.id !== "suggestedFATSGrayFill")
  );
  const lineLayers = activeLayers.filter((layer) => layer.type === "line");

  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle);
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

  const [editData, setEditData] = useState<any>(null);
  const handleEdit = (data: any) => {
    setIsEditMode(true);
    setEditData(data);
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

  const handleEditPosition = () => {
    if (ftthMapRef.current) {
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
    if (ftthMapRef.current) {
      ftthMapRef.current.handleCancelEditPath();

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
  const {
    isPolygonMode,
    togglePolygonMode,
    isModalOpen,
    setIsModalOpen,
    selectedFeatures,
    takeScreenshot,
    startPolygonMode,
    deleteLastPolygon,
  } = usePolygonSelection(ftthMapRef.current?.mapRef ?? { current: null });

  useEffect(() => {
    const areVisibleLayersLoaded = activeLayers.every((layer) => layer.source);
    if (areVisibleLayersLoaded) {
      setLoading(false);
    }
  }, [activeLayers]);
  return (
    <DefaultLayout>
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] relative overflow-hidden flex">
          {isPolygonMode && (
            <PolygonTool
              startPolygonMode={startPolygonMode}
              deleteLastPolygon={deleteLastPolygon}
            />
          )}
          {/*          {isModalOpen && (
            <div className="absolute top-50 right-4 z-10 bg-white shadow-lg p-4 rounded-lg">
              <h2 className="font-bold">Selected Features</h2>
              <ul>
                {selectedFeatures.length > 0 ? (
                  selectedFeatures.map((feature, index) => (
                    <li key={index}>
                      <strong>{feature.properties.Name || "Unnamed"}</strong>
                    </li>
                  ))
                ) : (
                  <li>No features found</li>
                )}
              </ul>
              <div className="flex justify-between mt-4">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={takeScreenshot}
                >
                  Take Screenshot
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )} */}

          <CityPanel onCityClick={handleCityClick} />
          {!isEditMode && (
            <>
              <LayerPanel
                title=""
                layers={pointLayers}
                isMinimized={isPointPanelMinimized}
                toggleMinimized={() =>
                  setIsPointPanelMinimized((prev) => !prev)
                }
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
                selectedStyle={mapStyle}
              />
              {FTTHSuggestedFATLayer?.visible ? <LegendPanel /> : null}
            </>
          )}
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
          <div className="w-full">
            <FTTHMap
              ref={ftthMapRef}
              layers={activeLayers}
              mapStyle={mapStyle}
              zoomLocation={zoomLocation}
              onEdit={handleEdit}
              isEditMode={isEditMode}
              onCoordinatesChange={handleCoordinatesChange}
              onPathPanelChange={handlePathPanelChange}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default FTTHModemsMap;
