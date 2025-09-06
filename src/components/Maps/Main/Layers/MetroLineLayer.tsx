import { useFTTHPointsStore } from "@/store/FTTHPointsStore";
import { FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
import { groupPointsByChainAndCreateLine } from "@/utils/groupPointsByChain";
import { snapChainsToStreets } from "@/utils/snapToStreets";

export const useMetroLineLayer = () => {
  const points = useFTTHPointsStore((state) => state.points);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const metroPoints = points.filter((point) => point.Type === "Metro");

    if (metroPoints.length > 0) {
      const base: FeatureCollection<Geometry> = groupPointsByChainAndCreateLine(metroPoints);
      (async () => {
        try {
          const snapped = await snapChainsToStreets(base.features as any);
          const data: FeatureCollection<Geometry> = { type: "FeatureCollection", features: snapped } as any;
          setSource({ type: "geojson", data });
        } catch {
          setSource({ type: "geojson", data: base });
        }
      })();
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
