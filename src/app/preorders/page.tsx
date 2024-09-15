"use client";
import React, { useState, useEffect, useRef } from "react";
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
import EditPanel from "@/components/Maps/PreOrders/Panels/EditPanel";
import LegendPanel from "@/components/Maps/PreOrders/Panels/LegendPanel";
interface Layer {
  id: string;
  visible: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  icon: string;
  source: mapboxgl.GeoJSONSourceSpecification | null;
  type: "point" | "line" | "heatmap" | "fill";
}
import { useFTTHPreorderLayer } from "@/components/Maps/PreOrders/Layers/FTTHPreorder";
import { useFTTHPreorderHMLayer } from "@/components/Maps/PreOrders/Layers/FTTHPreorderHeatMap";
import { useFTTHSuggestedFATLayer } from "@/components/Maps/PreOrders/Layers/FTTHSuggestedFAT";
import { useCustomFATLine } from "@/hooks/useCustomFATLine";

const FTTHModemsMap: React.FC = () => {
  const preOrdersLayer = useFTTHPreorderLayer();
  const preOrdersHMLayer = useFTTHPreorderHMLayer();
  const mFatLayer = useMFATLayer();
  const sFatLayer = useSFATLayer();
  const fatLineLayer = useFATLineLayer();
  const metroLineLayer = useMetroLineLayer();
  const odcLineLayer = useODCLineLayer();
  const dropCableLineLayer = useDropCableLineLayer();
  const suggestedFATLayer = useFTTHSuggestedFATLayer();
  const [isMFATLayerVisible, setIsMFATLayerVisible] = useState(true);
  const [isSFATLayerVisible, setIsSFATLayerVisible] = useState(true);
  const [isFATLayerVisible, setIsFATLayerVisible] = useState(true);
  const [isMetroLayerVisible, setIsMetroLayerVisible] = useState(true);
  const [isODCLineLayerVisible, setIsODCLineLayerVisible] = useState(true);
  const [isDropCableLayerVisible, setIsDropCableLayerVisible] = useState(true);
  const [isPreOrdersVisable, setIsPreOrdersVisable] = useState(false);
  const [isPreOrdersHMVisable, setIsPreOrdersHMVisable] = useState(true);
  const [isSuggestedFATVisable, setIsSuggestedFATVisable] = useState(false);
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

  const handleCoordinatesChange = (
    coordinates: { lat: number; lng: number } | null
  ) => {
    setCurrentCoordinates(coordinates);
  };

  const handlePathPanelChange = (isOpen: boolean, path: any) => {
    setIsPathPanelOpen(isOpen);
    setSelectedPath(path);
  };

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
    {
      ...suggestedFATLayer.fillLayer,
      visible: isSuggestedFATVisable,
      toggle: setIsSuggestedFATVisable,
      label: "Suggested FAT Areas",
      icon: "",
      type: "fill",
    },
    {
      ...suggestedFATLayer.smallFillLayer,
      visible: isSuggestedFATVisable,
      toggle: setIsSuggestedFATVisable,
      label: "",
      icon: "",
      type: "fill",
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

  const areVisibleLayersLoaded =
    pointLayers.every((layer) => layer.source) &&
    lineLayers.every((layer) => layer.source);
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
    if (areVisibleLayersLoaded) {
      setLoading(false);
    }
  }, [areVisibleLayersLoaded]);

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

  const handleSuggestFATSubmit = () => {
    if (ftthMapRef.current) {
      setIsEditingPosition(false);
      ftthMapRef.current.handleSaveSuggestedPath();
      handleCancelSuggestFAT()
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
  } = useCustomFATLine(ftthMapRef.current?.mapRef ?? { current: null }, "sfat-layer");

  const handleCustomFATLine = () => {
    if (ftthMapRef.current && editData) {

      handleStartDrawing(editData);

    }
  };

  return (
    <DefaultLayout>
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] relative overflow-hidden">
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
              {!isSuggestedFATVisable ? null : <LegendPanel />}
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
            />
          )}
          <div className="z-20">
            <FTTHMap
              ref={ftthMapRef}
              layers={pointLayers.concat(lineLayers)}
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
