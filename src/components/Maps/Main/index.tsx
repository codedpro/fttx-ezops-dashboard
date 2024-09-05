import React, { useRef, useEffect } from "react";
import mapboxgl, { GeoJSONSourceOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API ?? "???";

interface FTTHMapProps {
  layers: Array<{
    id: string;
    source: GeoJSONSourceOptions | null;
    visible: boolean;
    type: "point" | "line";
    icons?: { [key: string]: string };
  }>;
  mapStyle: string;
  zoomLocation: { lat: number; lng: number } | null;
}

const FTTHMap: React.FC<FTTHMapProps> = ({ layers, mapStyle, zoomLocation}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = () => {
      if (mapRef.current === null && mapContainerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: mapStyle,
          center: [51.4699361114553, 35.7580195079693],
          zoom: 12,
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
        zoom: 14,
        essential: true, // This ensures the animation is essential
      });
    }
  }, [zoomLocation]);

  const addLayersToMap = () => {
    layers.forEach(({ id, source, visible, type, icons }) => {
      if (source && mapRef.current && !mapRef.current.getSource(id)) {
        const geoJsonSource = {
          ...source,
          type: "geojson" as const,
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

  return <div ref={mapContainerRef} className="w-full h-screen" />;
};

export default FTTHMap;
