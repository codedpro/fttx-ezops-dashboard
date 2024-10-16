import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
export const useCPLayer = () => {
  const others = useFTTHComponentsOtherStore((state) => state.others);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cpData = others.filter((component) => component.Type === "CP");

    if (cpData.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: cpData.map(
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
              icon: "CPIcon",
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
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [others]);

  return {
    id: "cp-layer",
    source,
    loading,
    visible: true,
    type: "point" as const,
    icons: { CPIcon: "/images/map/CP.png" },
  };
};
