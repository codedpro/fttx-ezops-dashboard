import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import mapboxgl, { StyleSpecification } from "mapbox-gl";
import * as turf from "@turf/turf";

import { dynamicZoom } from "@/utils/dynamicZoom";
import { LayerType } from "@/types/FTTHMapProps";
import {
  addFillLayer,
  addHeatmapLayer,
  addLineLayer,
  addPointLayer,
} from "@/utils/mapLayers";
import { Modal } from "@/components/Modal-Info";
import { ObjectData } from "@/types/ObjectData";
import { LineData } from "@/types/LineData";

mapboxgl.accessToken = "dummy-token";

interface FTTHMapProps {
  layers: Array<{
    id: string;
    source: any | null;
    visible: boolean;
    type: "point" | "line" | "heatmap" | "fill" | "polygon";
    icons?: { [key: string]: string };
    paint?: {
      "line-color"?: string;
      "line-width"?: number;
      "line-opacity"?: number;
    };
  }>;
  mapStyle: StyleSpecification;
  zoomLocation: { lat: number; lng: number; zoom: number } | null;
  isDrawing: boolean;
  onEditLines: (lineData: LineData) => void;
  onDeleteLines: (lineData: LineData) => void;
  onEditObject: (ObjectData: ObjectData) => void;
  onDeleteObject: (ObjectData: ObjectData) => void;
  onAddObjectToLines?: (
    lineData: LineData,
    objectLabel: string,
    clickedLatLng: { lat: number; lng: number }
  ) => void;
  onEditDetailObject: (ObjectData: ObjectData) => void;
  onEditDetailLine: (lineData: LineData) => void;
  onConnectLine: (LineData: LineData) => void;
}

const DesignDeskMap = forwardRef<
  { mapRef: React.MutableRefObject<mapboxgl.Map | null> },
  FTTHMapProps
>(
  (
    {
      layers,
      mapStyle,
      zoomLocation,
      isDrawing,
      onEditLines,
      onDeleteLines,
      onAddObjectToLines,
      onEditObject,
      onDeleteObject,
      onEditDetailLine,
      onEditDetailObject,
      onConnectLine,
    },
    ref
  ) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [modalData, setModalData] = useState<any>(null);
    const [modalLineData, setModalLineData] = useState<any>(null);
    const [clickedLatLng, setClickedLatLng] = useState<{
      lat: number;
      lng: number;
    } | null>(null);

    const [isStyleloaded, setIsStyleLoaded] = useState<boolean>(false);

    useEffect(() => {
      if (!mapContainerRef.current) return;

      const initializeMap = () => {
        if (!mapRef.current && mapContainerRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: mapStyle,
            center: [53.29974681542001, 36.652031726978095],
            zoom: 13.5,
            maxZoom: 19,
          });

          mapRef.current.on("load", () => {
            addLayersToMap();
            dynamicZoom(mapRef, layers as LayerType[]);
            setIsStyleLoaded(true);
          });

          mapRef.current.on("zoom", () =>
            dynamicZoom(mapRef, layers as LayerType[])
          );
        }
      };

      initializeMap();
    }, []);

    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.once("styledata", () => {
          addLayersToMap();
        });
      }
    }, [mapRef.current?.isStyleLoaded]);

    useEffect(() => {
      if (mapRef.current && zoomLocation && isStyleloaded) {
        mapRef.current.flyTo({
          center: [zoomLocation.lng, zoomLocation.lat],
          zoom: zoomLocation.zoom,
          essential: true,
        });

        const url = new URL(window.location.href);
        url.search = "";
        window.history.replaceState({}, "", url.toString());
      }
    }, [zoomLocation, isStyleloaded]);

    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.setStyle(mapStyle);

        mapRef.current.once("styledata", () => {
          addLayersToMap();
        });
      }
    }, [mapStyle]);
    const addLayersToMap = () => {
      if (!mapRef.current) return;

      layers.forEach(({ id, source, visible, type, icons = {}, paint }) => {
        const layerExists = mapRef.current?.getLayer(id);
        const sourceExists = mapRef.current?.getSource(id);

        if (!sourceExists && source) {
          mapRef.current?.addSource(id, {
            ...source,
          });
        }

        if (!layerExists && mapRef.current?.getSource(id)) {
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
              addFillLayer(mapRef, id, source, paint, visible);
              break;
            default:
              console.error("Unknown layer type", type);
              break;
          }
        }
      });
    };
    useEffect(() => {
      if (mapRef.current) {
        layers.forEach(({ id, source, visible }) => {
          const layerExists = mapRef.current?.getLayer(id);
          const existingSource = mapRef.current?.getSource(id);

          if (existingSource && source) {
            (existingSource as mapboxgl.GeoJSONSource).setData(
              source.data as GeoJSON.FeatureCollection<GeoJSON.Geometry>
            );
          }
          if (layerExists) {
            mapRef.current?.setLayoutProperty(
              id,
              "visibility",
              visible ? "visible" : "none"
            );
          } else {
            console.error(`Layer with id ${id} does not exist.`);
          }
        });
      }
    }, [layers]);

    useEffect(() => {
      if (!mapRef.current) return;

      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const features = mapRef.current?.queryRenderedFeatures(e.point);
        if (features && features.length > 0) {
          const clickedFeature = features.find(
            (feature) =>
              feature.layer &&
              layers.map((layer) => layer.id).includes(feature.layer.id)
          );

          if (clickedFeature && !isDrawing) {
            if (clickedFeature.geometry.type === "LineString") {
              const clickedLatLng = { lat: e.lngLat.lat, lng: e.lngLat.lng };

              const lineCoords = clickedFeature.geometry.coordinates;

              const line = turf.lineString(lineCoords);
              const clickedPoint = turf.point([
                clickedLatLng.lng,
                clickedLatLng.lat,
              ]);

              const snappedPoint = turf.nearestPointOnLine(line, clickedPoint, {
                units: "meters",
              });

              const snappedLatLng = {
                lat: snappedPoint.geometry.coordinates[1],
                lng: snappedPoint.geometry.coordinates[0],
              };
              setClickedLatLng(snappedLatLng);

              const geometryType = clickedFeature.geometry.type;

              const lineData = {
                ...clickedFeature.properties,
                geometryType,
              };

              setModalData(lineData);
              setModalLineData(clickedFeature);
            } else {
              const geometryType = clickedFeature.geometry.type;
              const featureData = {
                ...clickedFeature.properties,
                geometryType,
              };

              setClickedLatLng(null);
              setModalData(featureData);
              setModalLineData(null);
            }
          }
        }
      };

      mapRef.current.on("click", handleClick);

      return () => {
        if (mapRef.current) {
          mapRef.current.off("click", handleClick);
        }
      };
    }, [layers, isDrawing]);

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
      const observer = new ResizeObserver(() => {
        resizeMap();
      });

      if (mapContainerRef.current) {
        observer.observe(mapContainerRef.current);
      }

      return () => {
        if (mapContainerRef.current) {
          observer.unobserve(mapContainerRef.current);
        }
      };
    }, []);
    useImperativeHandle(ref, () => ({
      mapRef,
    }));
    return (
      <>
        <div ref={mapContainerRef} className="w-full h-screen" />
        {modalData && !isDrawing && (
          <Modal
            data={modalData}
            lineData={modalLineData}
            onClose={() => setModalData(null)}
            onEditLine={onEditLines}
            onDeleteLine={onDeleteLines}
            onAddObjectToLine={onAddObjectToLines}
            clickedLatLng={clickedLatLng}
            onEditObject={onEditObject}
            onDeleteObject={onDeleteObject}
            onEditDetailLine={onEditDetailLine}
            onEditDetailObject={onEditDetailObject}
            onConnectLine={onConnectLine}
          />
        )}
      </>
    );
  }
);

export default DesignDeskMap;
