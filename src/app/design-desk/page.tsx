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
import { useConfirmation } from "@/hooks/useConfirmation";
import { cn } from "@/lib/utils";
import { drawingLayers } from "@/data/drawingLayers";
import AddNewRouteModal from "@/components/Maps/DesignDesk/Panels/AddNewRouteModal";
import axios from "axios";
import { useFTTHComponentsFatStore } from "@/store/FTTHComponentsFatStore";
import { useEditObjectHook } from "@/hooks/useEditObjectHook";
import { ObjectData } from "@/types/ObjectData";
import { OBJECTS } from "@/data/designdeskMenu";
interface RouteData {
  StartPointId: number;
  StartPointType: string;
  StartPointName: string;
  EndPointId: number;
  EndPointType: string;
  EndPointName: string;
  LineType: string;
  Lines: {
    Lat: number;
    Long: number;
  }[];
}
interface LineData {
  coordinates: [number, number][];
  chainId: number | null;
  type: string | null;
}
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

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [formLineValues, setFormLineValues] = useState({
    city: "",
    planType: "",
    isReverse: false,
  });

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
  const [objectLabel, setObjectLabel] = useState<string>("MFAT");
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
  const { forceUpdate: forceUpdateComponentsOther } =
    useFTTHComponentsOtherStore();
  const { forceUpdate: forceUpdateComponentsFAT } = useFTTHComponentsFatStore();

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
  const { confirm, ConfirmationModal } = useConfirmation();
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
    startEditingObject,
    finalizeObjectPosition: finilizeObjectEditPosition,
    isEditingObject,
    cancelObjectEditing,
    setEditObjectLat: setEditObjectLat,
    setEditObjectLng: setEditObjectLng,
    editObjectLat: editObjectLat,
    editObjectLng: editObjectLng,
  } = useEditObjectHook(ftthMapRef.current?.mapRef ?? { current: null });

  const {
    isDrawing,
    startDrawing,
    handleFinishLineDraw,
    handleCancelLineDraw,
    linePoints,
  } = useLineDrawing(
    ftthMapRef.current?.mapRef ?? { current: null },
    drawingLayers
  );

  const {
    isEditing,
    startEditingLine,
    handleFinishEditing,

    handleCancelEditing,
  } = useLineEditing(
    ftthMapRef.current?.mapRef ?? { current: null },
    drawingLayers
  );

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
    Plan_Type: string;
  }) => {
    fetch(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHAddNewFATPoint`, {
      method: "POST",
      body: JSON.stringify({
        ...objectDetails,
        ...data,
        Plan_Type: +data.Plan_Type,
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
            forceUpdateComponentsFAT(userservice.getToken() ?? "");
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

  const handleOtherModalSubmit = (data: {
    City: string;
    Name: string;
    Plan_Type: string;
  }) => {
    fetch(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHAddNewComponentPoint`, {
      method: "POST",
      body: JSON.stringify({
        ...objectDetails,
        ...data,
        Plan_Type: +data.Plan_Type,
        Type: objectDetails.object,
        Long: objectDetails.lng,
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
            forceUpdateComponentsOther(userservice.getToken() ?? "");
            setIsOtherModalOpen(false);
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
    confirm(() => {
      console.log("Deleted", LineData.type);
      toast.success("Line deleted successfully!");
    });
  };
  const handleOnAddObjectToLine = (
    lineData: LineData,
    objectLabel: string,
    clickedLatLng: { lat: number; lng: number }
  ) => {
    alert("Object Added on Line");
    console.log(clickedLatLng);
  };
  const { handleSearchPlaces } = useSearchPlaces(
    ftthMapRef.current?.mapRef ?? { current: null }
  );

  const handleFinishLineDrawing = async () => {
    const newRoute = await handleFinishLineDraw();
    if (newRoute) {
      setRouteData(newRoute);
      setIsRouteModalOpen(true);
    }
  };

  const handleOnEditObject = (ObjectData: ObjectData) => {
    const object = OBJECTS.find((o) => o.label === ObjectData.Type);
    console.log(ObjectData);
    console.log(object);

    if (ObjectData && object) {
      startEditingObject(

        object?.image ?? "/images/map/odc.png",
        ObjectData
      );
    }
    setObjectLabel(ObjectData.Type);
  };
  const handleOnDeleteObject = (ObjectData: ObjectData) => {
    confirm(() => {
      console.log("Deleted", ObjectData.ID);
      toast.success("Line deleted successfully!");
    });
  };
  const handleRouteModalSubmit = () => {
    const payload = {
      ...routeData,
      Name: formLineValues.isReverse
        ? routeData?.EndPointName + "_To_" + routeData?.StartPointName
        : routeData?.StartPointName + "_To_" + routeData?.EndPointName,
      City: formLineValues.city,
      Plan_Type: formLineValues.planType,
      IsReverse: formLineValues.isReverse,
    };
    console.log(payload);
    axios
      .post(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHAddNewRoute`, payload, {
        headers: {
          Authorization: `Bearer ${userservice.getToken()}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Route added successfully!");
        } else {
          toast.error("Failed to add route.");
        }
      })
      .catch((error) => {
        toast.error("Error adding route: " + error.message);
      });

    setIsRouteModalOpen(false);
  };
  const handleSubmitObjectEditing = () => {
    finilizeObjectEditPosition();
  };

  return (
    <DefaultLayout className="p-0 md:p-0">
      <ConfirmationModal message="Are you sure you want to delete this ?" />
      <AddNewRouteModal
        isOpen={isRouteModalOpen}
        onClose={() => {
          setIsRouteModalOpen(false);
          setFormLineValues({
            city: "",
            planType: "",
            isReverse: false,
          });
        }}
        onSubmit={handleRouteModalSubmit}
        formValues={formLineValues}
        setFormValues={setFormLineValues}
        startPointType={routeData?.StartPointType ?? ""}
        endPointType={routeData?.EndPointType ?? ""}
        endPointName={routeData?.StartPointName ?? ""}
        startPointName={routeData?.EndPointName ?? ""}
      />
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
      <ToastContainer
        theme={"dark"}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName={cn("custom-toast dark-toast")}
      />
      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] relative overflow-hidden">
          <MenuPanel
            isEditing={isEditing}
            isEditingObject={isEditingObject}
            setObjectLat={setObjectLat}
            setObjectLng={setObjectLng}
            onAddObject={handleAddObject}
            onStartLineDraw={handleStartDrawing}
            onFinishLineDraw={handleFinishLineDrawing}
            onCancelLineDraw={handleCancelLineDraw}
            onAddKMZ={handleAddKMZ}
            onSelectKMZ={handleAddKMZ}
            onSelectDraft={handleSelectDraft}
            onFlyToObject={handleFlyToObject}
            onFlyToLine={handleFlyToLine}
            onIsAddingObjectChange={handleIsAddingObjectChange}
            objectLat={objectLat}
            objectLng={objectLng}
            editObjectLat={editObjectLat}
            editObjectLng={editObjectLng}
            linePoints={linePoints}
            setEditObjectLat={setEditObjectLat}
            setEditObjectLng={setEditObjectLng}
            onCancelEditing={handleCancelEditing}
            onFinishLineEditing={handleFinishEditing}
            onFinishObjectEditing={handleSubmitObjectEditing}
            onCancelObjectEditing={cancelObjectEditing}
            EditingObjectLabel={objectLabel}
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
              onEditObject={handleOnEditObject}
              onDeleteObject={handleOnDeleteObject}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default DesignDesk;
