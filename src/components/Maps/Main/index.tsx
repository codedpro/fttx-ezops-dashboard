import React, { useRef, useEffect } from "react";
import mapboxgl, { GeoJSONSourceOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API ?? "???";

interface FTTHMapProps {
  layers: Array<{
    id: string;
    source: GeoJSONSourceOptions | null; // Correct type for the source
    visible: boolean;
    type: "point" | "line";
    icons?: { [key: string]: string };
  }>;
}

const FTTHMap: React.FC<FTTHMapProps> = ({ layers }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = () => {
      if (mapRef.current === null && mapContainerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [51.4699361114553, 35.7580195079693],
          zoom: 12,
        });

        mapRef.current.on("load", () => {
          layers.forEach(({ id, source, visible, type, icons }) => {
            if (source && mapRef.current && !mapRef.current.getSource(id)) {
              // Ensure the type is 'geojson'
              const geoJsonSource = {
                ...source,
                type: 'geojson' as const, // Correct type specification
              };

              mapRef.current.addSource(id, geoJsonSource);

              if (type === "point") {
                const defaultIcon = "marker-15";
                mapRef.current.addLayer({
                  id: id,
                  type: "symbol",
                  source: id,
                  layout: {
                    "icon-image": icons ? ["get", "icon"] : defaultIcon,
                    "icon-size": 1.5,
                    "icon-allow-overlap": true,
                  },
                });
              } else if (type === "line") {
                mapRef.current.addLayer({
                  id: id,
                  type: "line",
                  source: id,
                  paint: {
                    "line-width": 3,
                    "line-color": "#ff0000",
                    "line-opacity": 0.8,
                  },
                });
              }

              mapRef.current.setLayoutProperty(
                id,
                "visibility",
                visible ? "visible" : "none"
              );

              if (icons && type === "point") {
                Object.keys(icons).forEach((key) => {
                  if (!mapRef.current?.hasImage(key)) {
                    mapRef.current?.loadImage(icons[key], (error, image) => {
                      if (error) {
                        console.error(`Error loading icon ${key}:`, error);
                      } else if (image) {
                        mapRef.current?.addImage(key, image);
                      }
                    });
                  }
                });
              }
            }
          });
        });
      }
    };

    if (!mapRef.current) {
      initializeMap();
    } else if (mapRef.current?.isStyleLoaded()) {
      initializeMap();
    } else {
      mapRef.current?.once("style.load", initializeMap);
    }

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

  return <div ref={mapContainerRef} className="w-full h-screen" />;
};

export default FTTHMap;
