import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Modal } from "./Panels/Modal-Info";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API ?? "???";

interface FTTHMapProps {
  layers: Array<{
    id: string;
    source: GeoJSONSourceSpecification | null;
    visible: boolean;
    type: "point" | "line";
    icons?: { [key: string]: string };
    paint?: {
      "line-color"?: string;
      "line-width"?: number;
      "line-opacity"?: number;
    };
  }>;
  mapStyle: string;
  zoomLocation: { lat: number; lng: number } | null;
}

const FTTHMap: React.FC<FTTHMapProps> = ({
  layers,
  mapStyle,
  zoomLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [modalData, setModalData] = useState<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = () => {
      if (mapRef.current === null && mapContainerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [52.6771, 36.538],
          zoom: 13.5,
        });

        mapRef.current.on("load", () => {
          addLayersToMap();
        });
      }
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyle);

      mapRef.current.once("styledata", () => {
        addLayersToMap();
      });
    }
  }, [mapStyle]);

  useEffect(() => {
    if (mapRef.current && zoomLocation) {
      mapRef.current.flyTo({
        center: [zoomLocation.lng, zoomLocation.lat],
        zoom: 20,
        essential: true,
      });
  
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  }, [zoomLocation]);

  const addLayersToMap = () => {
    layers.forEach(({ id, source, visible, type, icons = {}, paint }) => {
      if (source && mapRef.current && !mapRef.current.getSource(id)) {
        const geoJsonSource = {
          ...source,
          type: "geojson" as const,
        };

        mapRef.current.addSource(id, geoJsonSource);

        if (type === "point") {
          const iconPromises = Object.keys(icons || {}).map((key) => {
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
              mapRef.current?.on("click", id, (e) => {
                const clickedFeatures = e.features;
                if (clickedFeatures && clickedFeatures.length > 0) {
                  setModalData(clickedFeatures[0].properties); // Set modal data based on clicked feature
                }
              });
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

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-screen" />
      {modalData && (
        <Modal data={modalData} onClose={() => setModalData(null)} />
      )}
    </>
  );
};

export default FTTHMap;
