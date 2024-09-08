import { useFTTHSuggestedFATStore } from "@/store/FTTHSuggestedFAT";
import {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
} from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
import * as turf from "@turf/turf";

export const useFTTHSuggestedFATLayer = () => {
  const suggestedFATS = useFTTHSuggestedFATStore((state) => state.suggestedFAT);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (suggestedFATS.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: suggestedFATS.map(
          (suggestedFAT): Feature<Polygon | MultiPolygon> => {
            const point = turf.point([suggestedFAT.Long, suggestedFAT.Lat]);

            const buffer = turf.buffer(point, 0.2, { units: "kilometers" });

            if (
              buffer &&
              (buffer.geometry.type === "Polygon" ||
                buffer.geometry.type === "MultiPolygon")
            ) {
              return {
                type: "Feature",
                geometry: buffer.geometry,
                properties: {
                  SuggestedFAT_ID: suggestedFAT.ID,
                  Name: suggestedFAT.Name,
                  Count: suggestedFAT.Count,
                  Long: suggestedFAT.Long,
                  Lat: suggestedFAT.Lat,
                  LayerID: "suggestedFATS",
                },
              };
            }

            return {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [],
              },
              properties: {},
            };
          }
        ),
      };

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [suggestedFATS]);

  return {
    id: "suggestedFATS",
    source,
    visible: true,
    type: "fill",
    paint: {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "Count"],
        3,
        "green",
        5,
        "yellowgreen",
        10,
        "yellow",
        15,
        "orange",
        20,
        "orangered",
        25,
        "red",
      ],
      "fill-opacity": 0.4,
      "fill-outline-color": "black",
    },
  };
};
