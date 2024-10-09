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
import {
  RasterLayerSpecification,
  RasterSourceSpecification,
  StyleSpecification,
} from "mapbox-gl";
import { useAddObjectHook } from "@/hooks/useAddObjectHook";
import AddObjectModal from "@/components/Maps/DesignDesk/Panels/AddObjectModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserService } from "@/services/userService";
import AddOtherObjectModal from "@/components/Maps/DesignDesk/Panels/AddOtherObjectModal";
import { useLineDrawing } from "@/hooks/useLineDrawing";
import { useLineEditing } from "@/hooks/useLineEditing";
import PlacesSearchInput from "@/components/Maps/DesignDesk/Panels/PlacesSearchInput";
import { fetchLocationData } from "@/lib/fetchLocationData";
import useSearchPlaces from "@/hooks/useSearchPlaces";

const DesignDesk: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [objectDetails, setObjectDetails] = useState({
    object: "",
    lat: 0,
    lng: 0,
    image: "",
  });
  interface LineData {
    coordinates: [number, number][];
    chainId: number | null;
    type: string | null;
  }

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
  const userservice = new UserService();
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

  const [currentLineType, setCurrentLineType] = useState<string | null>(null);
  const [currentLineColor, setCurrentLineColor] = useState<string | null>(null);

  const selectedLayers = [
    "FTTHPreorderLayer",
    "ModemLayer",
    "MFATLayer",
    "SFATLayer",
    "HHLayer",
    "OLTLayer",
    "ODCLayer",
    "TCLayer",
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

  const handleStyleChange = (
    newStyle: StyleSpecification,
    newStyleId: string
  ) => {
    setMapStyle(newStyle);
    setSelectedStyleId(newStyleId);
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

  useEffect(() => {
    const areVisibleLayersLoaded = activeLayers.every((layer) => layer.source);
    if (areVisibleLayersLoaded) {
      setLoading(false);
    }
  }, [activeLayers]);

  const {
    startAddingObject,
    objectLat,
    objectLng,
    setObjectLat,
    setObjectLng,
    finalizeObjectPosition,
    cancelObjectAdding,
  } = useAddObjectHook(ftthMapRef.current?.mapRef ?? { current: null });

  const {
    isDrawing,
    startDrawing,
    handleFinishLineDraw,
    handleCancelLineDraw,
    linePoints,
  } = useLineDrawing(ftthMapRef.current?.mapRef ?? { current: null }, [
    "sfat-layer",
    "mfat-layer",
  ]);

  const {
    isEditing,
    startEditingLine,
    handleFinishEditing,

    handleCancelEditing,
  } = useLineEditing(ftthMapRef.current?.mapRef ?? { current: null }, [
    "sfat-layer",
    "mfat-layer",
  ]);

  const handleAddObject = (
    object: string,
    lat: number,
    lng: number,
    selectedObjectImage: string
  ) => {
    setObjectDetails({ object, lat, lng, image: selectedObjectImage });
    if (object === "MFAT" || object === "SFAT") {
      setIsModalOpen(true);
    } else {
      setIsOtherModalOpen(true);
    }
  };

  const handleModalSubmit = (data: {
    OLT: string;
    POP: string;
    FAT: string;
    City: string;
  }) => {
    fetch(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHAddNewFATPoint`, {
      method: "POST",
      body: JSON.stringify({
        ...objectDetails,
        ...data,
        Plan_Type: 0,
        Type: objectDetails.object,
        Long: objectDetails.lng,
        Name: "",
      }),
      headers: {
        Authorization: `Bearer ${userservice.getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Object added successfully!");

          setTimeout(() => {
            finalizeObjectPosition();
            setIsModalOpen(false);
          }, 300);
        } else {
          toast.error("Failed to add object.");
        }
      })
      .catch((err) => {
        toast.error("Error adding object:" + err);
      });
  };

  const handleOtherModalSubmit = (data: { City: string }) => {
    fetch(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHAddNewComponentPoint`, {
      method: "POST",
      body: JSON.stringify({
        ...objectDetails,
        ...data,
        Plan_Type: 0,
        Type: objectDetails.object,
        Long: objectDetails.lng,
        Name: "",
      }),
      headers: {
        Authorization: `Bearer ${userservice.getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Object added successfully!");

          setTimeout(() => {
            finalizeObjectPosition();
            setIsModalOpen(false);
          }, 300);
        } else {
          toast.error("Failed to add object.");
        }
      })
      .catch((err) => {
        toast.error("Error adding object:" + err);
      });
  };

  const handleIsAddingObjectChange = (
    isAdding: boolean,
    objectDetails: {
      object: string | null;
      lat: number | null;
      lng: number | null;
      image: string | null;
    } | null
  ) => {
    if (isAdding) {
      startAddingObject(
        objectDetails?.lat ?? 0,
        objectDetails?.lng ?? 0,
        objectDetails?.image ?? ""
      );
    } else {
      cancelObjectAdding();
    }
  };

  const handleAddKMZ = () => {
    alert(`Add KMZ File:`);
  };

  const handleSelectDraft = (draft: string) => {
    alert(`Select Draft: ${draft}`);
  };
  const handleFlyToObject = (lat: number, lng: number) => {
    setZoomLocation({ lat, lng, zoom: 20 });
  };
  const handleFlyToLine = (points: { lat: number; lng: number }[]) => {
    console.log(points);
  };

  const handleStartDrawing = (lineType: string) => {
    startDrawing(lineType);
  };

  const handleOnEditLine = (LineData: LineData) => {
    startEditingLine(LineData);
  };
  const handleOnDeleteLine = (LineData: LineData) => {
    startEditingLine(LineData);
  };
  const handleOnAddObjectToLine = (LineData: LineData) => {
    startEditingLine(LineData);
  };
  const { handleSearchPlaces } = useSearchPlaces(
    ftthMapRef.current?.mapRef ?? { current: null }
  );

  return (
    <DefaultLayout className="p-0 md:p-0">
      <AddObjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        object={objectDetails.object}
        lat={objectDetails.lat}
        lng={objectDetails.lng}
        image={objectDetails.image}
        onSubmit={handleModalSubmit}
      />
      <AddOtherObjectModal
        isOpen={isOtherModalOpen}
        onClose={() => setIsOtherModalOpen(false)}
        object={objectDetails.object}
        lat={objectDetails.lat}
        lng={objectDetails.lng}
        image={objectDetails.image}
        onSubmit={handleOtherModalSubmit}
      />
      <ToastContainer position="top-right" autoClose={5000} />
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] relative overflow-hidden">
          <MenuPanel
            isEditing={isEditing}
            setObjectLat={setObjectLat}
            setObjectLng={setObjectLng}
            onAddObject={handleAddObject}
            onStartLineDraw={handleStartDrawing}
            onFinishLineDraw={handleFinishLineDraw}
            onCancelLineDraw={handleCancelLineDraw}
            onAddKMZ={handleAddKMZ}
            onSelectKMZ={handleAddKMZ}
            onSelectDraft={handleSelectDraft}
            onFlyToObject={handleFlyToObject}
            onFlyToLine={handleFlyToLine}
            onIsAddingObjectChange={handleIsAddingObjectChange}
            objectLat={objectLat}
            objectLng={objectLng}
            linePoints={linePoints}
            onCancelEditing={handleCancelEditing}
            onFinishLineEditing={handleFinishEditing}
          />

          <CityPanel
            onCityClick={handleCityClick}
            onSearch={handleSearchPlaces}
          />

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
            selectedStyleId={selectedStyleId}
          />
          <div className="z-20 w-full">
            <DesignDeskMap
              isDrawing={isDrawing || isEditing}
              ref={ftthMapRef}
              layers={activeLayers}
              mapStyle={mapStyle}
              zoomLocation={zoomLocation}
              onEditLines={handleOnEditLine}
              onDeleteLines={handleOnDeleteLine}
              onAddObjectToLines={handleOnAddObjectToLine}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default DesignDesk;
