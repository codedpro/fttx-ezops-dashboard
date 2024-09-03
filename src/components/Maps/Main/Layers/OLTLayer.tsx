import { useFTTHComponentsOtherStore } from "@/store/FTTHComponentsOtherStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useOLTLayer = () => {
  const others = useFTTHComponentsOtherStore((state) => state.others);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const oltData = others.filter(component => component.Type === "OLT");

    if (oltData.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: oltData.map(
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
    id: "olt-layer",
    source,
    visible: true,
  };
};
