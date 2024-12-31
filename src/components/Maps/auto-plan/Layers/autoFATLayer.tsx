import { useFATDataStore } from "@/store/FTTHFATStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useAutoFATLayer = () => {
  const fats = useFATDataStore((state) => state.fats);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (fats.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: fats.map(
          (fat): Feature => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [fat.Long, fat.Lat],
            },
            properties: {
              FAT_Index: fat.FAT_Index,
              Customer_Count: fat.Modem_Count,
              Max_Distance_Covered_m: fat.Max_Distance_Covered_m,
              icon: "fatIcon",
              iconSize: 1,
              Long: fat.Long,
              Lat: fat.Lat,
              LayerID: "autoFATLayer",
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
    id: "autoFATLayer",
    source,
    visible: true,
    type: "point" as const,
    icons: {
      fatIcon: "/images/map/Auto-FAT.png",
    },
  };
};
