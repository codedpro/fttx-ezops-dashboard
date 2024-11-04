import { useFTTHSuggestedFATStore } from "@/store/FTTHSuggestedFAT";
import { useEffect, useState } from "react";
import { GeoJSONSourceSpecification } from "mapbox-gl";
import { Feature, FeatureCollection, Point } from "geojson";

export const useFTTHPowerLayer = () => {
  const suggestedFATS = useFTTHSuggestedFATStore((state) => state.suggestedFAT);
  const [heatmapSource, setHeatmapSource] =
    useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (suggestedFATS.length > 0) {
      const pointsGeoJson: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: suggestedFATS.map(
          (suggestedFAT): Feature<Point> => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [suggestedFAT.Long, suggestedFAT.Lat],
            },
            properties: {
              Count: suggestedFAT.Count,
            },
          })
        ),
      };

      setHeatmapSource({
        type: "geojson",
        data: pointsGeoJson,
      });
    }
  }, [suggestedFATS]);

  return {
    id: "FTTHPowerLayer",
    source: heatmapSource,
    visible: true,
    type: "heatmap",
    paint: {
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", "Count"],
        0,
        0,
        10,
        1,
      ],
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0.5,
        12,
        1.5,
      ],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(0, 128, 0, 0)",
        0.3,
        "green",
        0.6,
        "yellow",
        1,
        "red",
      ],

      "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 10, 12, 25],
      "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 12, 0.6],
    },
  };
};
