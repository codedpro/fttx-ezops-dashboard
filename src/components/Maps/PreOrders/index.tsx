import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Modal } from "./Panels/Modal";
import { useEditFeature } from "@/hooks/useEditFeature";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API ?? "???";

interface FTTHMapProps {
  layers: Array<{
    id: string;
    source: GeoJSONSourceSpecification | null;
    visible: boolean;
    type: "point" | "line" | "heatmap";
    icons?: { [key: string]: string };
    paint?: {
      "line-color"?: string;
      "line-width"?: number;
      "line-opacity"?: number;
      "heatmap-intensity"?: number;
      "heatmap-radius"?: number;
      "heatmap-opacity"?: number;
      "heatmap-color"?: [string, ...any[]];
    };
  }>;
  mapStyle: string;
  zoomLocation: { lat: number; lng: number; zoom: number } | null;
}

const PreOrdersMap: React.FC<FTTHMapProps> = ({
  layers,
  mapStyle,
  zoomLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const addLayersToMap = () => {
    if (!mapRef.current) return;

    layers.forEach(({ id, source, visible, type, icons = {}, paint }) => {
      if (source && mapRef.current && !mapRef.current.getSource(id)) {
        const geoJsonSource = {
          ...source,
          type: "geojson" as const,
        };

        mapRef.current.addSource(id, geoJsonSource);

        if (type === "heatmap") {
          mapRef.current.addLayer({
            id: id,
            type: "heatmap",
            source: id,
            paint: paint,
          });

          mapRef.current.setLayoutProperty(
            id,
            "visibility",
            visible ? "visible" : "none"
          );
        } else if (type === "point") {
          const iconPromises = Object.keys(icons).map((key) => {
            return new Promise<void>((resolve, reject) => {
              if (!mapRef.current?.hasImage(key)) {
                mapRef.current?.loadImage(icons[key], (error, image) => {
                  if (error) {
                    console.error(`Error loading icon ${key}:`, error);
                    reject(error);
                  } else if (image) {
                    mapRef.current?.addImage(key, image);
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            });
          });

          Promise.all(iconPromises)
            .then(() => {
              mapRef.current?.addLayer({
                id: id,
                type: "symbol",
                source: id,
                layout: {
                  "icon-image": ["get", "icon"],
                  "icon-size": ["get", "iconSize"],
                  "icon-allow-overlap": true,
                },
              });

              mapRef.current?.setLayoutProperty(
                id,
                "visibility",
                visible ? "visible" : "none"
              );
            })
            .catch((error) => {
              console.error("Error loading icons:", error);
            });
        } else if (type === "line") {
          mapRef.current.addLayer({
            id: id,
            type: "line",
            source: id,
            paint: {
              "line-color": paint?.["line-color"] || "#ff0000",
              "line-width": paint?.["line-width"] || 5,
              "line-opacity": paint?.["line-opacity"] || 0.8,
            },
          });

          mapRef.current?.setLayoutProperty(
            id,
            "visibility",
            visible ? "visible" : "none"
          );
        }
      }
    });
  };

  const {
    isEditMode,
    currentCoordinates,
    handleEdit,
    handleSubmitEdit,
    handleCancelEdit,
  } = useEditFeature(mapRef, addLayersToMap, setIsModalOpen);
  const customLayerIds = layers.map((layer) => layer.id);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = () => {
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [52.6771, 36.538],
          zoom: 13.5,
          maxZoom: 20,
        });

        mapRef.current.on("load", () => {
          setMapIsLoaded(true);
          addLayersToMap();
        });

        mapRef.current.on("click", (e) => {
          if (!isEditMode) {
            const features = mapRef.current?.queryRenderedFeatures(e.point);
            if (features && features.length > 0) {
              const clickedFeature = features.find(
                (feature) =>
                  feature.layer && customLayerIds.includes(feature.layer.id)
              );

              if (clickedFeature) {
                setModalData(clickedFeature.properties);
                setIsModalOpen(true);
              }
            }
          }
        });
      }
    };

    initializeMap();
  }, [customLayerIds, isEditMode]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle);
      mapRef.current.once("styledata", () => {
        if (mapIsLoaded) {
          addLayersToMap();
        }
      });
    }
  }, [mapStyle, mapIsLoaded]);

  useEffect(() => {
    if (mapRef.current && zoomLocation) {
      mapRef.current.flyTo({
        center: [zoomLocation.lng, zoomLocation.lat],
        zoom: zoomLocation.zoom,
        essential: true,
      });

      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  }, [zoomLocation]);

  useEffect(() => {
    if (mapRef.current && mapIsLoaded && !isEditMode) {
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
          addLayersToMap();
        }
      });
    }
  }, [layers, mapIsLoaded]);

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainerRef} className="w-full h-screen" />
      {isModalOpen && modalData && (
        <Modal data={modalData} onClose={closeModal} onEdit={handleEdit} />
      )}
      {isEditMode && currentCoordinates && (
        <div className="absolute top-1/2 right-1/2 bg-white p-4 rounded shadow-lg">
          <p>Editing Point...</p>
          <p>Latitude: {currentCoordinates.lat.toFixed(6)}</p>
          <p>Longitude: {currentCoordinates.lng.toFixed(6)}</p>
          <button
            onClick={handleSubmitEdit}
            className="px-4 py-2 z-50 bg-green-600 text-white rounded mr-4"
          >
            Save
          </button>
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PreOrdersMap;
