// FTTHMap.tsx
import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import mapboxgl, {
  GeoJSONSourceSpecification,
  Marker,
  StyleSpecification,
  RasterSourceSpecification,
  RasterLayerSpecification,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { dynamicZoom } from "@/utils/dynamicZoom";
import { LayerType } from "@/types/FTTHMapProps";
import {
  addFillLayer,
  addHeatmapLayer,
  addLineLayer,
  addPointLayer,
} from "@/utils/mapLayers";
import { Modal } from "@/components/Modal-Info";

// For the tile overlay definitions:
import { TileConfig } from "@/hooks/useTiles"; // Our tile interface

// NEW: Import our closest block hook and modal
import { useClosestBlock } from "@/hooks/useClosestBlock";
import { ClosestBlockModal } from "@/components/ClosestBlockModal";

mapboxgl.accessToken = "Dummy"; // Replace with real token if needed

interface FTTHMapProps {
  layers: Array<{
    id: string;
    source: GeoJSONSourceSpecification | null;
    visible: boolean;
    type: "point" | "line" | "heatmap" | "fill" | "polygon";
    icons?: { [key: string]: string };
    paint?: {
      "line-color"?: string;
      "line-width"?: number;
      "line-opacity"?: number;
    };
  }>;
  tileLayers?: TileConfig[]; // Additional raster tile layers
  mapStyle: StyleSpecification;
  zoomLocation: { lat: number; lng: number; zoom: number } | null;
}

/**
 * ForwardRef so the parent can access 'mapRef'.
 */
const FTTHMap = forwardRef<
  {
    mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  },
  FTTHMapProps
>(({ layers, tileLayers = [], mapStyle, zoomLocation }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState<boolean>(false);

  // NEW: Our custom hook for fetching the closest block
  const {
    data: closestBlockData,
    loading: closestBlockLoading,
    error: closestBlockError,
    fetchClosestBlock,
  } = useClosestBlock();

  // NEW: Track whether to show the closest-block modal
  const [showClosestBlockModal, setShowClosestBlockModal] = useState(false);

  useEffect(() => {
    if (closestBlockData && closestBlockData.length > 0) {
      setShowClosestBlockModal(true);
    } else {
      setShowClosestBlockModal(false);
    }
  }, [closestBlockData]);

  const closeClosestBlockModal = () => {
    setShowClosestBlockModal(false);
  };

  /**
   * Add vector layers from 'layers' to the map
   */
  const addVectorLayersToMap = () => {
    if (!mapRef.current) return;

    layers.forEach(({ id, source, visible, type, icons = {}, paint }) => {
      if (!mapRef.current) return;

      const sourceExists = mapRef.current.getSource(id);
      const layerExists = mapRef.current.getLayer(id);

      // Add source if needed
      if (!sourceExists && source) {
        mapRef.current.addSource(id, source);
      }

      // Add layer if not already present
      if (!layerExists && mapRef.current.getSource(id)) {
        switch (type) {
          case "point":
            addPointLayer(mapRef, id, source, icons, visible);
            break;
          case "line":
            addLineLayer(mapRef, id, source, paint, visible);
            break;
          case "heatmap":
            addHeatmapLayer(mapRef, id, source, paint, visible);
            break;
          case "fill":
          case "polygon":
            addFillLayer(mapRef, id, source, paint, visible);
            break;
          default:
            console.error("Unknown vector layer type", type);
        }
      } else if (layerExists) {
        // Update visibility
        mapRef.current.setLayoutProperty(
          id,
          "visibility",
          visible ? "visible" : "none"
        );
      }
    });
  };

  /**
   * Add raster tile layers from 'tileLayers' to the map
   */
  const addTileLayersToMap = () => {
    if (!mapRef.current) return;

    tileLayers.forEach((tile) => {
      const { id, source, layer, visible } = tile;
      if (!source || !layer) return;
      if (!mapRef.current) return;

      // Check if source/layer exist
      const src = mapRef.current.getSource(id);
      const lyr = mapRef.current.getLayer(id);

      // If source not found, add it
      if (!src) {
        mapRef.current.addSource(id, source as RasterSourceSpecification);
      }

      // If layer not found, add it
      if (!lyr) {
        // By default, add the tile layer on top
        mapRef.current.addLayer(layer as RasterLayerSpecification);
      }

      // Then set visibility
      mapRef.current.setLayoutProperty(
        id,
        "visibility",
        visible ? "visible" : "none"
      );
    });
  };
 function  enableMiddleClickRotate(map: mapboxgl.Map) {
  // Mapbox’s built-in right-click rotate handler
  const dragRotate = (map as any).dragRotate;
  if (!dragRotate) {
    console.warn("[enableMiddleClickRotate] no dragRotate handler found");
    return;
  }

  // Grab the canvas element
  const canvas = map.getCanvas();

  // Handlers that forward the native mouse events:
  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 1) return;       // only middle-click
    e.preventDefault();               // stop default pan/scroll
    dragRotate._onMouseDown(e);       // start the rotate/pitch gesture

    // while dragging, forward move & up
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => dragRotate._onMouseMove(e);
  const onMouseUp   = (e: MouseEvent) => {
    dragRotate._onMouseUp(e);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  // Wire it all up
  canvas.addEventListener("mousedown", onMouseDown);

  // (Optionally return a cleanup function if you ever want to remove it)
  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
  };
}
  useEffect(() => {
    // Initialize map once
    if (mapRef.current) return; // Already initialized
    if (!mapContainerRef.current) return; // Container not ready

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [52.6771, 36.538],
      zoom: 13.5,
      maxZoom: 18,
    });

    // On load, add layers
    mapRef.current.on("load", () => {
      setMapIsLoaded(true);
      // Immediately add both vector and tile layers
      addVectorLayersToMap();
      addTileLayersToMap();

      // Dynamic zoom logic for vector layers
      dynamicZoom(mapRef, layers as LayerType[]);
      setIsStyleLoaded(true);
    });
    enableMiddleClickRotate(mapRef.current);

    // If you rely on dynamic zoom on each zoom event:
    mapRef.current.on("zoom", () => {
      dynamicZoom(mapRef, layers as LayerType[]);
    });
  }, [mapStyle, layers, tileLayers]);

  // If base style changes, re-add vector and tile layers
  useEffect(() => {
    if (!mapRef.current) return;

    // Update style
    mapRef.current.setStyle(mapStyle);
    mapRef.current.once("styledata", () => {
      if (mapIsLoaded) {
        addVectorLayersToMap();
        addTileLayersToMap();
      }
    });
  }, [mapStyle, mapIsLoaded]);

  // If zoomLocation changes, fly to it
  useEffect(() => {
    if (!mapRef.current || !zoomLocation || !isStyleLoaded) return;

    mapRef.current.flyTo({
      center: [zoomLocation.lng, zoomLocation.lat],
      zoom: zoomLocation.zoom,
      essential: true,
    });

    // Show a marker (optional)
    const marker = new Marker()
      .setLngLat([zoomLocation.lng, zoomLocation.lat])
      .addTo(mapRef.current);

    // Clear query params from URL (if that's your custom logic)
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, "", url.toString());

    return () => {
      marker.remove();
    };
  }, [zoomLocation, isStyleLoaded]);

  // Watch for changes to vector layers
  useEffect(() => {
    if (!mapRef.current || !mapIsLoaded) return;
    addVectorLayersToMap();
  }, [layers, mapIsLoaded]);

  // Watch for changes to tile layers
  useEffect(() => {
    if (!mapRef.current || !mapIsLoaded) return;
    addTileLayersToMap();
  }, [tileLayers, mapIsLoaded]);

  // Simple feature click → show modal with data, or if no feature → fetchClosestBlock
  useEffect(() => {
    if (!mapRef.current) return;

const handleClick = (e: mapboxgl.MapMouseEvent) => {
  // 1) Only query features from your GeoJSON/vector layers:
  const vectorLayerIds = layers.map((l) => l.id);
  const features = mapRef.current?.queryRenderedFeatures(e.point, {
    layers: vectorLayerIds,
  });

  // 2) If you clicked one of those, show its modal and bail out:
  if (features && features.length > 0) {
    setModalData(features[0].properties || {});
    return;
  }

  // 3) Otherwise, check if the "blocks" tile is on and fetch nearest block:
  const blockTile = tileLayers.find((tile) => tile.id === "blocks");
  if (blockTile?.visible) {
    fetchClosestBlock(e.lngLat.lat, e.lngLat.lng);
  }
};


    mapRef.current.on("click", handleClick);

    return () => {
      mapRef.current?.off("click", handleClick);
    };
  }, [layers, tileLayers, fetchClosestBlock]);

  // Resize observer to keep map from glitching on container resize
  function debounce(func: (...args: any[]) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  const resizeMap = debounce(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, 100);

  useEffect(() => {
    const containerElem = mapContainerRef.current;
    if (!containerElem) return;

    const observer = new ResizeObserver(() => {
      resizeMap();
    });

    observer.observe(containerElem);

    return () => {
      observer.unobserve(containerElem);
    };
  }, []);

  // Expose mapRef to parent
  useImperativeHandle(ref, () => ({
    mapRef,
  }));

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-screen" />

      {modalData && (
        <Modal data={modalData} onClose={() => setModalData(null)} />
      )}

      {showClosestBlockModal && closestBlockData && (
        <ClosestBlockModal
          data={closestBlockData}
          onClose={closeClosestBlockModal}
        />
      )}
    </>
  );
});

export default FTTHMap;
