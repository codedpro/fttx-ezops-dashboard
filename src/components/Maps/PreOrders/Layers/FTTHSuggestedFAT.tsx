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
  const [pointSource, setPointSource] =
    useState<GeoJSONSourceSpecification | null>(null); // Point source for the center points

  useEffect(() => {
    if (suggestedFATS.length > 0) {
      // Fill layer geojson data
      const fillGeoJsonData: FeatureCollection<Geometry> = {
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

      // Point layer geojson data (for center points)
      const pointGeoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: suggestedFATS.map((suggestedFAT): Feature<Geometry> => {
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [suggestedFAT.Long, suggestedFAT.Lat], // Center point coordinates
            },
            properties: {
              SuggestedFAT_ID: suggestedFAT.ID,
              Count: suggestedFAT.Count,
              icon: "marker-15",
              iconSize: 1.5,
            },
          };
        }),
      };

      setFillSource({
        type: "geojson",
        data: fillGeoJsonData,
      });

      setPointSource({
        type: "geojson",
        data: pointGeoJsonData,
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
    pointLayer: {
      id: "suggestedFATSPoints",
      source: pointSource,
      visible: true,
      type: "symbol",
      layout: {
        "icon-image": ["get", "icon"], // Use the marker icon from Mapbox
        "icon-size": ["get", "iconSize"],
        "icon-allow-overlap": true,
      },
    },
  };
};
