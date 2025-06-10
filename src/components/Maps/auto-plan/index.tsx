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

import { TileConfig } from "@/hooks/useTiles";
import { useClosestBlock } from "@/hooks/useClosestBlock";
import { ClosestBlockModal } from "@/components/ClosestBlockModal";

mapboxgl.accessToken = "Dummy"; // Replace with real token

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
  tileLayers?: TileConfig[];
  mapStyle: StyleSpecification;
  zoomLocation: { lat: number; lng: number; zoom: number } | null;
}

const FTTHMap = forwardRef<
  { mapRef: React.MutableRefObject<mapboxgl.Map | null> },
  FTTHMapProps
>(({ layers, tileLayers = [], mapStyle, zoomLocation }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  // Closest-block hook
  const {
    data: closestBlockData,
    fetchClosestBlock,
  } = useClosestBlock();
  const [showClosestBlockModal, setShowClosestBlockModal] = useState(false);

  useEffect(() => {
    setShowClosestBlockModal(!!closestBlockData?.length);
  }, [closestBlockData]);

  const closeClosestBlockModal = () => {
    setShowClosestBlockModal(false);
  };

  const addVectorLayersToMap = () => {
    if (!mapRef.current) return;
    layers.forEach(({ id, source, visible, type, icons = {}, paint }) => {
      const src = mapRef.current!.getSource(id);
      const lyr = mapRef.current!.getLayer(id);

      if (!src && source) {
        mapRef.current!.addSource(id, source);
      }

      if (!lyr && mapRef.current!.getSource(id)) {
        switch (type) {
          case "point":
            addPointLayer(mapRef, id, source!, icons, visible);
            break;
          case "line":
            addLineLayer(mapRef, id, source!, paint, visible);
            break;
          case "heatmap":
            addHeatmapLayer(mapRef, id, source!, paint, visible);
            break;
          case "fill":
          case "polygon":
            addFillLayer(mapRef, id, source!, paint, visible);
            break;
          default:
            console.error("Unknown vector layer type", type);
        }
      } else if (lyr) {
        mapRef.current!.setLayoutProperty(
          id,
          "visibility",
          visible ? "visible" : "none"
        );
      }
    });
  };

  const addTileLayersToMap = () => {
    if (!mapRef.current) return;
    tileLayers.forEach(({ id, source, layer, visible }) => {
      if (!source || !layer) return;

      const src = mapRef.current!.getSource(id);
      const lyr = mapRef.current!.getLayer(id);

      if (!src) {
        mapRef.current!.addSource(id, source as RasterSourceSpecification);
      }
      if (!lyr) {
        mapRef.current!.addLayer(layer as RasterLayerSpecification);
      }
      mapRef.current!.setLayoutProperty(
        id,
        "visibility",
        visible ? "visible" : "none"
      );
    });
  };

  const enableMiddleClickRotate = (map: mapboxgl.Map) => {
    const dragRotate = (map as any).dragRotate;
    if (!dragRotate) return;

    const canvas = map.getCanvas();
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      dragRotate._onMouseDown(e);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    const onMouseMove = (e: MouseEvent) => dragRotate._onMouseMove(e);
    const onMouseUp = (e: MouseEvent) => {
      dragRotate._onMouseUp(e);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
    };
  };

  // Initialize map once
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [52.6771, 36.538],
      zoom: 13.5,
      maxZoom: 18,
    });

    mapRef.current.on("load", () => {
      setMapIsLoaded(true);
      addVectorLayersToMap();
      addTileLayersToMap();
      dynamicZoom(mapRef, layers as LayerType[]);
      setIsStyleLoaded(true);
    });

    mapRef.current.on("zoom", () =>
      dynamicZoom(mapRef, layers as LayerType[])
    );

    const cleanupRotate = enableMiddleClickRotate(mapRef.current);

    return () => {
      cleanupRotate?.();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply style
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setStyle(mapStyle);
    mapRef.current.once("styledata", () => {
      if (mapIsLoaded) {
        addVectorLayersToMap();
        addTileLayersToMap();
      }
    });
  }, [mapStyle, mapIsLoaded]);

  // Fly to new zoomLocation & show marker
  useEffect(() => {
    if (!mapRef.current || !zoomLocation || !isStyleLoaded) return;
    const { lat, lng, zoom } = zoomLocation;

    mapRef.current.flyTo({ center: [lng, lat], zoom, essential: true });
    const marker = new Marker().setLngLat([lng, lat]).addTo(mapRef.current);

    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, "", url.toString());

    return () => {
      marker.remove();
    };
  }, [zoomLocation, isStyleLoaded]);

  // Keep vector layers in sync
  useEffect(() => {
    if (mapRef.current && mapIsLoaded) {
      addVectorLayersToMap();
    }
  }, [layers, mapIsLoaded]);

  // Keep tile layers in sync
  useEffect(() => {
    if (mapRef.current && mapIsLoaded) {
      addTileLayersToMap();
    }
  }, [tileLayers, mapIsLoaded]);

  // Simple feature click → show modal; else fetch closest block
  useEffect(() => {
    if (!mapRef.current) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      // 1) Only query features from your GeoJSON/vector layers:
      const vectorLayerIds = layers.map((l) => l.id);
      const features = mapRef.current!.queryRenderedFeatures(e.point, {
        layers: vectorLayerIds,
      });

      // 2) If you clicked one of those, show its modal and bail out:
      if (features.length > 0) {
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

  // Resize observer
  const debounce = <T extends any[]>(fn: (...args: T) => void, ms: number) => {
    let t: NodeJS.Timeout;
    return (...args: T) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };
  const resizeMap = debounce(() => mapRef.current?.resize(), 100);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(resizeMap);
    observer.observe(container);
    return () => observer.unobserve(container);
  }, [resizeMap]);

  useImperativeHandle(ref, () => ({ mapRef }));

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-screen" />
      {modalData && <Modal data={modalData} onClose={() => setModalData(null)} />}
      {showClosestBlockModal && closestBlockData && (
        <ClosestBlockModal data={closestBlockData} onClose={closeClosestBlockModal} />
      )}
    </>
  );
});

export default FTTHMap;
