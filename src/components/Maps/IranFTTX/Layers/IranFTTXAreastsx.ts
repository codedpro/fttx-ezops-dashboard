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
import { useIranFTTXAreasStore } from "@/store/IranFTTXAreasStore";
export const useIranFTTXAreaLayer = () => {
  const IranFTTXAreas = useIranFTTXAreasStore((state) => state.areas);
  const [fillSource, setFillSource] =
    useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (IranFTTXAreas.length > 0) {
      const fillGeoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: IranFTTXAreas.map(
          (IranFTTXArea): Feature<Polygon | MultiPolygon> => {
            const point = turf.point([IranFTTXArea.Long, IranFTTXArea.Lat]);
            const buffer = turf.buffer(point, IranFTTXArea.Radius / 1000, {
              units: "kilometers",
            });

            if (
              buffer &&
              (buffer.geometry.type === "Polygon" ||
                buffer.geometry.type === "MultiPolygon")
            ) {
              return {
                type: "Feature",
                geometry: buffer.geometry,
                properties: {
                  ID: IranFTTXArea.ID,
                  Iran_FTTX_ID: IranFTTXArea.Iran_FTTX_ID,
                  Name: IranFTTXArea.Name,
                  Province: IranFTTXArea.Province,
                  City: IranFTTXArea.City,
                  Radius: IranFTTXArea.Radius,
                  Precess_Serial: IranFTTXArea.Precess_Serial,
                  Long: IranFTTXArea.Long,
                  Lat: IranFTTXArea.Lat,
                  LayerID: "IranFTTXAreas",
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

      setFillSource({
        type: "geojson",
        data: fillGeoJsonData,
      });
    }
  }, [IranFTTXAreas]);

  return {
    fillLayer: {
      id: "IranFTTXAreasFill",
      source: fillSource,
      type: "fill",
      paint: {
        "fill-color": "#beca88",
        "fill-opacity": 0.75,
      },
    },
  };
};
