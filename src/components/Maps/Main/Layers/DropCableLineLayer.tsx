import { useFTTHPointsStore } from "@/store/FTTHPointsStore";
import { FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
import { groupPointsByChainAndCreateLine } from "@/utils/groupPointsByChain";

export const useDropCableLineLayer = () => {
  const points = useFTTHPointsStore((state) => state.points);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const dropCablePoints = points.filter(point => point.Type === "Drop Cable");

    if (dropCablePoints.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = groupPointsByChainAndCreateLine(dropCablePoints);

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [points]);

  return {
    id: "drop-cable-line-layer",
    source,
    visible: true,
    type: "line" as const, 
  };
};
