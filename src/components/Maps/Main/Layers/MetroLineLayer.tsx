import { useFTTHPointsStore } from "@/store/FTTHPointsStore";
import { FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
import { groupPointsByChainAndCreateLine } from "@/utils/groupPointsByChain";

export const useMetroLineLayer = () => {
  const points = useFTTHPointsStore((state) => state.points);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const metroPoints = points.filter((point) => point.Type === "Metro");

    if (metroPoints.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> =
        groupPointsByChainAndCreateLine(metroPoints);

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [points]);

  return {
    id: "metro-line-layer",
    source,
    visible: true,
    type: "line" as const,
    paint: {
      "line-color": "#ddddff",
      "line-width": 5,
      "line-opacity": 0.8,
    },
  };
};
