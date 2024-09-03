import React, { useRef, useEffect } from "react";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API ?? "???";

interface FTTHMapProps {
  layers: Array<{ id: string; source: GeoJSONSourceSpecification | null; visible: boolean }>;
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
          layers.forEach(({ id, source, visible }) => {
            if (source && mapRef.current && !mapRef.current.getSource(id)) {
              mapRef.current.addSource(id, source);
              mapRef.current.addLayer({
                id: id,
                type: "circle",
                source: id,
                paint: {
                  "circle-radius": 6,
                  "circle-color": "#007cbf",
                },
              });

              mapRef.current.setLayoutProperty(
                id,
                "visibility",
                visible ? "visible" : "none"
              );
            }
          });
        });
      } else if (mapRef.current) {
        layers.forEach(({ id, source, visible }) => {
          const existingSource = mapRef.current!.getSource(id);
          if (existingSource && source) {
            (existingSource as mapboxgl.GeoJSONSource).setData(
              source.data as GeoJSON.FeatureCollection<GeoJSON.Geometry>
            );
          } else if (source) {
            mapRef.current!.addSource(id, source);
            mapRef.current!.addLayer({
              id: id,
              type: "circle",
              source: id,
              paint: {
                "circle-radius": 6,
                "circle-color": "#007cbf",
              },
            });
          }

          mapRef.current!.setLayoutProperty(
            id,
            "visibility",
            visible ? "visible" : "none"
          );
        });
      }
    };

    if (!mapRef.current) {
      initializeMap();
    } else if (mapRef.current.isStyleLoaded()) {
      initializeMap();
    } else {
      mapRef.current.once("style.load", initializeMap);
    }
  }, [layers]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "1000px" }} />;
};

export default FTTHMap;
