import { useFTTHComponentsFatStore } from "@/store/FTTHComponentsFatStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useMFATLayer = () => {
  const fats = useFTTHComponentsFatStore((state) => state.fats);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const mFatData = fats.filter(fat => fat.Type === "MFAT");

    if (mFatData.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: mFatData.map(
          (fat): Feature => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [fat.Long, fat.Lat],
            },
            properties: {
              FAT_ID: fat.FAT_ID,
              Name: fat.Name,
              OLT: fat.OLT,
              POP: fat.POP,
              FAT: fat.FAT,
              City: fat.City,
              Is_Plan: fat.Is_Plan,
              Chain_ID: fat.Chain_ID,
              Type: fat.Type,
            },
          })
        ),
      };

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [fats]);

  return {
    id: "mfat-layer",
    source,
    visible: true,
    type: "point" as const, 
  };
};
