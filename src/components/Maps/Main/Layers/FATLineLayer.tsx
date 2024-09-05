import { useFTTHPointsStore } from "@/store/FTTHPointsStore";
import { FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
import { groupPointsByChainAndCreateLine } from "@/utils/groupPointsByChain";

export const useFATLineLayer = () => {
  const points = useFTTHPointsStore((state) => state.points);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const fatPoints = points.filter(point => point.Type === "FAT");

    if (fatPoints.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = groupPointsByChainAndCreateLine(fatPoints);

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [points]);

  return {
    id: "fat-line-layer",
    source,
    visible: true,
    type: "line" as const, 
    paint: {
        "line-color": "#0360f5",
        "line-width": 5,
        "line-opacity": 0.8,
      },
  };
};
