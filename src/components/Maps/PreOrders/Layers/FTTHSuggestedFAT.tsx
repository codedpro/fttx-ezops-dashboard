import { useFTTHSuggestedFATStore } from "@/store/FTTHSuggestedFAT";
import {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
} from "geojson";
import { useEffect, useState } from "react";
import * as turf from "@turf/turf";
import { GeoJSONSourceSpecification } from "mapbox-gl";

export const useFTTHSuggestedFATLayer = () => {
  const suggestedFATS = useFTTHSuggestedFATStore((state) => state.suggestedFAT);
  const [fillSource, setFillSource] =
    useState<GeoJSONSourceSpecification | null>(null);
  const [smallFillSource, setSmallFillSource] =
    useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (suggestedFATS.length > 0) {
      const fillGeoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: suggestedFATS.map(
          (suggestedFAT): Feature<Polygon | MultiPolygon> => {
            const point = turf.point([suggestedFAT.Long, suggestedFAT.Lat]);
            const buffer = turf.buffer(point, 0.15, { units: "kilometers" });

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

      const smallFillGeoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: suggestedFATS.map((suggestedFAT): Feature<Polygon> => {
          const point = turf.point([suggestedFAT.Long, suggestedFAT.Lat]);
          const smallBuffer = turf.buffer(point, 0.01, { units: "kilometers" }); // 10 meters buffer

          if (smallBuffer && smallBuffer.geometry.type === "Polygon") {
            return {
              type: "Feature",
              geometry: smallBuffer.geometry,
              properties: {
                SuggestedFAT_ID: suggestedFAT.ID,
                Count: suggestedFAT.Count,
                LayerID: "smallSuggestedFATS",
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
        }),
      };

      setFillSource({
        type: "geojson",
        data: fillGeoJsonData,
      });

      setSmallFillSource({
        type: "geojson",
        data: smallFillGeoJsonData,
      });
    }
  }, [suggestedFATS]);

  return {
    fillLayer: {
      id: "suggestedFATSFill",
      source: fillSource,
      visible: true,
      type: "fill",
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["get", "Count"],
          3,
          "green",
          8,
          "orange",
          16,
          "red",
        ],
        "fill-opacity": 0.4,
        "fill-outline-color": "black",
      },
    },
    smallFillLayer: {
      id: "suggestedFATSGrayFill",
      source: smallFillSource,
      visible: true,
      type: "fill",
      paint: {
        "fill-color": "black",
        "fill-opacity": 1,
        "fill-outline-color": "black",
      },
    },
  };
};
