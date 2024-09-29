import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useHHLayer = () => {
  const others = useFTTHComponentsOtherStore((state) => state.others);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const hhData = others.filter((component) => component.Type === "HH");

    if (hhData.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: hhData.map(
          (component): Feature => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [component.Long, component.Lat],
            },
            properties: {
              Component_ID: component.Component_ID,
              Name: component.Name,
              City: component.City,
              Chain_ID: component.Chain_ID,
              Type: component.Type,
              Is_Plan: component.Is_Plan,
              icon: "HH",
              iconSize: 0.8,
              Long: component.Long,
              Lat: component.Lat,
            },
          })
        ),
      };

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [others]);

  return {
    id: "hh-layer",
    source,
    visible: true,
    type: "point" as const,
    icons: { HH: "/images/map/HandHole.png" },
  };
};
