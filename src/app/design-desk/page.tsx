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
import ModeModal from "@/components/Maps/DesignDesk/Panels/ModeModal";
import { useFTTHPointsStore } from "@/store/FTTHPointsStore";
import { RouteData } from "@/types/RouteData";
import { LineData } from "@/types/LineData";
import {
  getBoundingBox,
  getCenterPoint,
  getZoomLevel,
} from "@/utils/mapCalculations";
import FatDetailModal from "@/components/Maps/DesignDesk/Panels/FatDetailModal";
import LineDetailModal from "@/components/Maps/DesignDesk/Panels/LineDetailModal";
import OtherDetailModal from "@/components/Maps/DesignDesk/Panels/OtherDetailModal";
import { ConnectedLines } from "@/types/connectedLines";
import AddObjectToLineModal from "@/components/Maps/DesignDesk/Panels/AddObjectToLineModal";
const DesignDesk: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFATDetailOpen, setIsFATDetailOpen] = useState(false);
  const [isObjectAddToLineOpen, setIsObjectAddToLineOpen] = useState(false);
  const [isOtherDetailOpen, setIsOtherDetailOpen] = useState(false);
  const [isLineDetailOpen, setIsLineDetailOpen] = useState(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [objectDetails, setObjectDetails] = useState({
    object: "",
    lat: 0,
    lng: 0,
    image: "",
  });
  const [addobjectToLineDetails, setAddObjectToLineDetails] = useState<{
    object: string;
    lat: number;
    lng: number;
    chainId: number | null;
  }>({
    object: "",
    lat: 0,
    lng: 0,
    chainId: null,
  });

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [formLineValues, setFormLineValues] = useState({
    city: "BL",
    planType: "0",
    isReverse: false,
  });
  const [fatDetailData, setFatDetailData] = useState<ObjectData | null>(null);
  const [otherDetailData, setOtherDetailData] = useState<ObjectData | null>(
    null
  );
  const [lineDetailData, setLineDetailsData] = useState<LineData | null>(null);

  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [resetMenuPanel, setResetMenuPanel] = useState<() => void>(() => {});

  const [modeValue, setModeValue] = useState<number>(0);

  const [connectedLinestocomponent, setConnectedLinesToComponent] =
    useState<ConnectedLines>({
      count: 0,
      firstComponentChainID: 0,
      firstComponentName: "",
      secondComponentChainID: 0,
      secondComponentName: "",
    });

  const [objectDataToDelete, setObjectDataToDelete] =
    useState<ObjectData | null>();

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
  const [isConnectingLineData, setIsConnectingLineData] =
    useState<boolean>(false);
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
  const { forceUpdate: forceUpdatePoints } = useFTTHPointsStore();
  const selectedLayers = [
    "FTTHPreorderLayer",
    "ModemLayer",
    "MFATLayer",
    "SFATLayer",
    "FATLayer",
    "HHLayer",
    "OLTLayer",
    "ODCLayer",
    "TCLayer",
    "CPLayer",
    "ODCLineLayer",
    "FATLineLayer",
    "MetroLineLayer",
    "DropCableLineLayer",
  ] as LayerKeys[];

  const defaultVisibility = {
    FTTHPreorderLayer: false,
    ModemLayer: false,
    MFATLayer: true,
    SFATLayer: true,
    FATLayer: true,
    HHLayer: true,
    TCLayer: true,
    ODCLayer: true,
    CPLayer: true,
    OLTLayer: true,
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
    setIsEditingObject,
    setEditObjectLat: setEditObjectLat,
    setEditObjectLng: setEditObjectLng,
    editObjectLat: editObjectLat,
    editObjectLng: editObjectLng,
  } = useEditObjectHook(ftthMapRef.current?.mapRef ?? { current: null });

  const [filteredLayerIds, setFilteredLayerIds] = useState<string[]>([]);
  const prevLayerCountRef = useRef(filteredLayerIds.length);

  useEffect(() => {
    const nonNullLayerIds = activeLayers
      .filter((layer) => layer.source !== null)
      .map((layer) => layer.id)
      .filter((id) => drawingLayers.includes(id));

    if (
      nonNullLayerIds.length !== filteredLayerIds.length ||
      !nonNullLayerIds.every((id) => filteredLayerIds.includes(id))
    ) {
      setFilteredLayerIds(nonNullLayerIds);
      prevLayerCountRef.current = nonNullLayerIds.length;
    }
  }, [activeLayers]);

  const {
    isDrawing,
    startDrawing,
    handleFinishLineDraw,
    handleCancelLineDraw,
    undo,
    redo,
    liveMeters,
    removeDrawControl,
    suggestLine,
    setIsDrawing,
  } = useLineDrawing(
    ftthMapRef.current?.mapRef ?? { current: null },
    filteredLayerIds || drawingLayers
  );
  const points = useFTTHPointsStore((state) => state.points);

  const {
    isEditing,
    startEditingLine,
    handleFinishEditing,
    handleCancelEditing,
    setIsEditing,
    suggestLine: suggestLineEditing,
    liveMeters: liveMetersEditing,
  } = useLineEditing(
    ftthMapRef.current?.mapRef ?? { current: null },
    filteredLayerIds || drawingLayers
  );
  const handleAddObject = (
    object: string,
    lat: number,
    lng: number,
    selectedObjectImage: string
  ) => {
    setObjectDetails({ object, lat, lng, image: selectedObjectImage });
    if (object === "MFAT" || object === "SFAT" || object === "FAT") {
      setIsModalOpen(true);
    } else {
      setIsOtherModalOpen(true);
    }
  };

  const handleAddObjectToLineSubmit = async (data: {
    OLT?: string;
    POP?: string;
    FAT?: string;
    Name?: string;
    City: string;
    Plan_Type: string;
    chainId: number | null;
    lat: number;
    lng: number;
    object: string;
  }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHSeperateLines`,
        {
          ...data,
          Type: data.object,
          Line_Chain_ID: data.chainId,
          Long: data.lng,
        },
        {
          headers: {
            Authorization: `Bearer ${userservice.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Object added successfully!");

        setTimeout(() => {
          forceUpdateComponentsFAT(userservice.getToken() ?? "");
          forceUpdateComponentsOther(userservice.getToken() ?? "");
          forceUpdatePoints(userservice.getToken() ?? "");
          setIsObjectAddToLineOpen(false);
        }, 300);
      } else {
        toast.error("Failed to add object." + response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(
        "Error adding object: " + (error.response?.data || error.message)
      );
    }
  };
  const handleModalSubmit = async (data: {
    OLT: string;
    POP: string;
    FAT: string;
    City: string;
    Plan_Type: string;
  }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHAddNewFATPoint`,
        {
          ...objectDetails,
          ...data,
          Plan_Type: +data.Plan_Type,
          Type: objectDetails.object,
          Long: objectDetails.lng,
          Name: "",
        },
        {
          headers: {
            Authorization: `Bearer ${userservice.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Object added successfully!");

        setTimeout(() => {
          finalizeObjectPosition();
          forceUpdateComponentsFAT(userservice.getToken() ?? "");
          setIsModalOpen(false);
        }, 300);
      } else {
        toast.error("Failed to add object." + response.data.message);
      }
    } catch (error: any) {
      toast.error(
        "Error adding object: " + (error.response?.data || error.message)
      );
    }
  };

  const handleFATDetailSubmit = (ObjectData: any) => {
    fetch(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHEditFATPoint`, {
      method: "POST",
      body: JSON.stringify({
        ...ObjectData,
      }),
      headers: {
        Authorization: `Bearer ${userservice.getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success("FAT Edited successfully!");

          setTimeout(() => {
            forceUpdateComponentsFAT(userservice.getToken() ?? "");
            setIsFATDetailOpen(false);
            setFatDetailData(null);
          }, 300);
        } else {
          toast.error("Failed to edit FAT");
        }
      })
      .catch((err) => {
        toast.error("Error Editing FAT: " + err.message);
      });
  };

  const handleOtherDetailSubmit = (ObjectData: any) => {
    fetch(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHEditComponentPoint`, {
      method: "POST",
      body: JSON.stringify({
        ...ObjectData,
      }),
      headers: {
        Authorization: `Bearer ${userservice.getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Component Edited successfully!");

          setTimeout(() => {
            forceUpdateComponentsFAT(userservice.getToken() ?? "");
            setIsOtherDetailOpen(false);
            setOtherDetailData(null);
          }, 300);
        } else {
          toast.error("Failed to edit Component");
        }
      })
      .catch((err) => {
        toast.error("Error Editing Component: " + err.message);
      });
  };

  const handleLineDetailSubmit = (lineData: any) => {
    fetch(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHEditLineDetail`, {
      method: "POST",
      body: JSON.stringify({
        ...lineData,
      }),
      headers: {
        Authorization: `Bearer ${userservice.getToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Line Edited successfully!");

          setTimeout(() => {
            forceUpdatePoints(userservice.getToken() ?? "");
            setIsLineDetailOpen(false);
            setLineDetailsData(null);
          }, 300);
        } else {
          toast.error("Failed to edit Line");
        }
      })
      .catch((err) => {
        toast.error("Error Editing Line: " + err.message);
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
        toast.error("Error adding object: " + err.message);
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
    if (points.length > 0) {
      const { minLat, maxLat, minLng, maxLng } = getBoundingBox(points);
      const { centerLat, centerLng } = getCenterPoint(
        minLat,
        maxLat,
        minLng,
        maxLng
      );
      const zoom = getZoomLevel(minLat, maxLat, minLng, maxLng);

      setZoomLocation({
        lat: centerLat,
        lng: centerLng,
        zoom: zoom,
      });
    }
  };
  const handleStartDrawing = (lineType: string) => {
    startDrawing(lineType);
  };

  const handleOnEditLine = (LineData: LineData) => {
    const filteredPoints = points
      .filter((point) => point.Chain_ID === LineData.chainId)
      .map((point) => {
        if (typeof point.Lat === "number" && typeof point.Long === "number") {
          return [point.Long, point.Lat] as [number, number];
        }
        return null;
      })
      .filter((coordinates) => coordinates !== null) as [number, number][];

    const updatedLineData = {
      ...LineData,
      coordinates: filteredPoints,
    };

    startEditingLine(updatedLineData);
  };

  const handleOnConnectLine = (LineData: LineData) => {
    const filteredPoints = points
      .filter((point) => point.Chain_ID === LineData.chainId)
      .map((point) => {
        if (typeof point.Lat === "number" && typeof point.Long === "number") {
          return [point.Long, point.Lat] as [number, number];
        }
        return null;
      })
      .filter((coordinates) => coordinates !== null) as [number, number][];

    const updatedLineData = {
      ...LineData,
      coordinates: filteredPoints,
    };

    setIsConnectingLineData(true);
    startEditingLine(updatedLineData);
  };

  const handleOnDeleteLine = (LineData: LineData) => {
    confirm(() => {
      const payload = LineData.chainId;

      axios
        .post(
          `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDeleteRoute`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${userservice.getToken()}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            forceUpdatePoints(userservice.getToken() ?? "");
            toast.success("Line deleted successfully!");
          } else {
            toast.error("Failed to delete line.");
          }
        })
        .catch((error) => {
          toast.error("Error deleting line: " + error);
        });
    });
  };
  const handleOnAddObjectToLine = (
    lineData: LineData,
    objectLabel: string,
    clickedLatLng: { lat: number; lng: number }
  ) => {
    console.log("We are here");
    setAddObjectToLineDetails({
      object: objectLabel,
      lat: clickedLatLng.lat,
      lng: clickedLatLng.lng,
      chainId: lineData.chainId,
    });
    setIsObjectAddToLineOpen(true);
  };

  const { handleSearchPlaces, removeAllMarkers: clearExistingMarkers } =
    useSearchPlaces(ftthMapRef.current?.mapRef ?? { current: null });

  const handleFinishLineEditing = async () => {
    const editedRoute = await handleFinishEditing();
    const payload = {
      ...editedRoute,
    };

    axios
      .post(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/${isConnectingLineData ? "FTTHConnectLine" : "FTTHEditLine"}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userservice.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          forceUpdatePoints(userservice.getToken() ?? "");
          forceUpdateComponentsOther(userservice.getToken() ?? "");
          forceUpdateComponentsFAT(userservice.getToken() ?? "");
          toast.success("Route added successfully!");
          handleCancelEditing();
          setIsConnectingLineData(false);
          setIsEditing(false);

          if (resetMenuPanel) {
            resetMenuPanel();
          }
        } else {
          toast.error("Failed to add route.");
        }
      })
      .catch((error) => {
        toast.error(
          "Error adding route: " + error?.response?.data || error.message
        );
      });
  };

  const handleFinishLineDrawing = async () => {
    const newRoute = await handleFinishLineDraw();

    if (newRoute) {
      setRouteData(newRoute);
      setIsRouteModalOpen(true);
    }
  };

  const handleOnEditObject = (ObjectData: ObjectData) => {
    const object = OBJECTS.find((o) => o.label === ObjectData.Type);

    if (ObjectData && object) {
      startEditingObject(object?.image ?? "/images/map/odc.png", ObjectData);
    }
    setObjectLabel(ObjectData.Type);
  };

  const handleOnDeleteObject = (ObjectData: ObjectData) => {
    setObjectDataToDelete(ObjectData);
    handleModeModalSubmit(ObjectData);
  };
  const handleOnEditDetailObject = (ObjectData: ObjectData) => {
    if (!ObjectData) return;
    if (
      ObjectData.Type === "MFAT" ||
      ObjectData.Type === "SFAT" ||
      ObjectData.Type === "FAT"
    ) {
      setFatDetailData(ObjectData);
      setIsFATDetailOpen(true);
    } else {
      setOtherDetailData(ObjectData);
      setIsOtherDetailOpen(true);
    }
  };
  const handleOnEditDetailLine = (lineData: LineData) => {
    if (!lineData) return;
    setLineDetailsData(lineData);
    setIsLineDetailOpen(true);
  };
  const handleModeModalSubmit = (objectData: ObjectData) => {
    const fetchConnectedLines = async (token: string) => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHHowManyLinesConnected`,
          objectData.Chain_ID,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data;
        const connectedLines = data.count;
        setConnectedLinesToComponent(data);

        if (connectedLines === 0) {
          submitMode(0, objectData);
        } else if (connectedLines === 1) {
          submitMode(2, objectData);
        } else if (connectedLines > 2) {
          toast.error(
            "You can't delete " +
              objectData.Name +
              " because it has " +
              connectedLines +
              " lines connected to it"
          );
        } else if (connectedLines === 2) {
          setIsModeModalOpen(true);
          console.log("its here");
        }
      } catch (error) {
        console.error("Error fetching connected lines: ", error);
      }
    };

    const token = userservice.getToken() ?? "";
    fetchConnectedLines(token);
  };

  const submitMode = (
    mode: number,
    objectData?: ObjectData,
    chainOrder?: number[]
  ) => {
    const dataToProcess = objectData || objectDataToDelete;

    if (!dataToProcess) return;

    confirm(() => {
      let endpoint: string;
      let payload: any;

      if (chainOrder && chainOrder.length >= 2) {
        payload = {
          chain_ID: dataToProcess.Chain_ID,
          name:
            chainOrder[0] === connectedLinestocomponent.firstComponentChainID
              ? connectedLinestocomponent.firstComponentName +
                "_TO_" +
                connectedLinestocomponent.secondComponentName
              : connectedLinestocomponent.secondComponentName +
                "_TO_" +
                connectedLinestocomponent.firstComponentName,
          start_Chain_ID: chainOrder[0],
          end_Chain_ID: chainOrder[1],
        };
        endpoint = "/FTTHMergeLines";
      } else {
        payload = {
          id: Number(dataToProcess.ID),
          type: dataToProcess.Type,
          chain_ID: Number(dataToProcess.Chain_ID),
          mode: mode,
        };
        endpoint = "/FTTHDeleteComponent";
      }

      axios
        .post(`${process.env.NEXT_PUBLIC_LNM_API_URL}${endpoint}`, payload, {
          headers: {
            Authorization: `Bearer ${userservice.getToken()}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          if (response.status === 200) {
            if (endpoint === "/FTTHDeleteComponent") {
              toast.success("Object deleted successfully!");
            } else if (endpoint === "/FTTHMergeLines") {
              toast.success("Lines merged successfully!");
            }
            const token = userservice.getToken() ?? "";
            forceUpdateComponentsOther(token);
            forceUpdateComponentsFAT(token);
            forceUpdatePoints(token);
          } else {
            if (endpoint === "/FTTHDeleteComponent") {
              toast.error("Failed to delete object.");
            } else if (endpoint === "/FTTHMergeLines") {
              toast.error("Failed to merge lines.");
            }
          }
        })
        .catch((error) => {
          if (endpoint === "/FTTHDeleteComponent") {
            toast.error("Error deleting object: " + error.response.data);
          } else if (endpoint === "/FTTHMergeLines") {
            toast.error("Error merging lines: " + error.response.data);
          }
        })
        .finally(() => {
          setObjectDataToDelete(null);
          setModeValue(0);
          setIsModeModalOpen(false);
        });
    });
  };

  const handleRouteModalSubmit = (data: {
    formValues: { city: string; planType: string; isReverse: boolean };
    AddCP: boolean;
  }) => {
    const payload = {
      ...routeData,
      Name: data.formValues.isReverse
        ? routeData?.EndPointName + "_To_" + routeData?.StartPointName
        : routeData?.StartPointName + "_To_" + routeData?.EndPointName,
      City: data.formValues.city,
      Plan_Type: data.formValues.planType,
      IsReverse: data.formValues.isReverse,
    };

    axios
      .post(`${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHAddNewRoute`, payload, {
        headers: {
          Authorization: `Bearer ${userservice.getToken()}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (response.status === 200) {
          forceUpdatePoints(userservice.getToken() ?? "");
          forceUpdateComponentsOther(userservice.getToken() ?? "");
          forceUpdateComponentsFAT(userservice.getToken() ?? "");
          toast.success("Route added successfully!");
          handleCancelLineDraw();
          removeDrawControl();
          setIsDrawing(false);
          setRouteData(null);
          setIsModalOpen(false);
          setIsRouteModalOpen(false);
          setFormLineValues({
            city: "BL",
            planType: "0",
            isReverse: false,
          });

          if (resetMenuPanel) {
            resetMenuPanel();
          }
        } else {
          toast.error("Failed to add route.");
        }
      })
      .catch((error) => {
        toast.error(
          "Error adding route: " + error?.response?.data || error.message
        );
      });
  };

  const handleSubmitObjectEditing = async () => {
    const object = await finilizeObjectEditPosition();
    const payload = {
      ...object,
    };

    axios
      .post(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHMoveComponent`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userservice.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          forceUpdatePoints(userservice.getToken() ?? "");
          forceUpdateComponentsOther(userservice.getToken() ?? "");
          forceUpdateComponentsFAT(userservice.getToken() ?? "");
          toast.success("Route added successfully!");
          cancelObjectEditing();
          setIsEditingObject(false);

          if (resetMenuPanel) {
            resetMenuPanel();
          }
        } else {
          toast.error("Failed to add route.");
        }
      })
      .catch((error) => {
        toast.error(
          "Error adding route: " + error?.response?.data || error.message
        );
      });
  };

  return (
    <DefaultLayout className="p-0 md:p-0 z-30">
      <div className="z-999">
        {" "}
        <ModeModal
          isOpen={isModeModalOpen}
          onClose={() => {
            setIsModeModalOpen(false);
            setObjectDataToDelete(null);
            setModeValue(0);
          }}
          onSubmit={submitMode}
          ConnectedLinesToComponent={connectedLinestocomponent}
        />
        <ConfirmationModal message="Are you sure you want to delete this ?" />
        <FatDetailModal
          isOpen={isFATDetailOpen}
          onClose={() => setIsFATDetailOpen(false)}
          objectData={fatDetailData}
          onSubmit={handleFATDetailSubmit}
        />
        <LineDetailModal
          isOpen={isLineDetailOpen}
          onClose={() => setIsLineDetailOpen(false)}
          lineData={lineDetailData}
          onSubmit={handleLineDetailSubmit}
        />
        <OtherDetailModal
          isOpen={isOtherDetailOpen}
          onClose={() => setIsOtherDetailOpen(false)}
          otherData={otherDetailData}
          onSubmit={handleOtherDetailSubmit}
        />
        <AddNewRouteModal
          isOpen={isRouteModalOpen}
          onClose={() => {
            setIsRouteModalOpen(false);
            setFormLineValues({
              city: "BL",
              planType: "0",
              isReverse: false,
            });
          }}
          onSubmit={handleRouteModalSubmit}
          formValues={formLineValues}
          setFormValues={setFormLineValues}
          startPointType={routeData?.StartPointType ?? ""}
          endPointType={routeData?.EndPointType ?? ""}
          endPointName={routeData?.EndPointName ?? ""}
          endPointId={routeData?.EndPointId ?? 1}
          startPointName={routeData?.StartPointName ?? ""}
        />
        <AddObjectModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            cancelObjectAdding();
          }}
          object={objectDetails.object}
          lat={objectDetails.lat}
          lng={objectDetails.lng}
          image={objectDetails.image}
          onSubmit={handleModalSubmit}
        />
        <AddObjectToLineModal
          isOpen={isObjectAddToLineOpen}
          onClose={() => {
            setIsObjectAddToLineOpen(false);
            setAddObjectToLineDetails({
              object: "",
              lat: 0,
              lng: 0,
              chainId: null,
            });
          }}
          objectDetails={addobjectToLineDetails}
          onSubmit={handleAddObjectToLineSubmit}
        />
        <AddOtherObjectModal
          isOpen={isOtherModalOpen}
          onClose={() => {
            setIsOtherModalOpen(false);
            cancelObjectAdding();
          }}
          object={objectDetails.object}
          lat={objectDetails.lat}
          lng={objectDetails.lng}
          image={objectDetails.image}
          onSubmit={handleOtherModalSubmit}
        />
        <ToastContainer
          theme="dark"
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center w-full h-[80vh] dark:bg-gray-800 dark:text-white">
          <div className="text-2xl font-bold">Loading Map...</div>
        </div>
      ) : (
        <div className="w-full h-[80vh] relative overflow-hidden z-0">
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
            setEditObjectLat={setEditObjectLat}
            setEditObjectLng={setEditObjectLng}
            onCancelEditing={() => {
              handleCancelEditing();
              setIsConnectingLineData(false);
            }}
            onFinishLineEditing={handleFinishLineEditing}
            onFinishObjectEditing={handleSubmitObjectEditing}
            onCancelObjectEditing={cancelObjectEditing}
            EditingObjectLabel={objectLabel}
            onResetMenuPanel={setResetMenuPanel}
            liveMeters={liveMeters}
            handleSuggestLine={suggestLine}
            handleSuggestLineEditing={suggestLineEditing}
            liveMetersEditing={liveMetersEditing}
          />

          <CityPanel
            onCityClick={handleCityClick}
            onSearch={handleSearchPlaces}
            onClear={clearExistingMarkers}
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
              onEditDetailLine={handleOnEditDetailLine}
              onEditDetailObject={handleOnEditDetailObject}
              onConnectLine={handleOnConnectLine}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default DesignDesk;
