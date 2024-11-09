import { useEffect, useState } from "react";
import { GeoJSONSourceSpecification } from "mapbox-gl";
import { Feature, FeatureCollection, Polygon } from "geojson";
import { useFTTHACSRXPowerStore } from "@/store/FTTHACSRXPower";

import circle from "@turf/circle";

export const useFTTHPowerLayer = () => {
  const acsPowers = useFTTHACSRXPowerStore((state) => state.acsPowers);
  const [sourceData, setSourceData] =
    useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (acsPowers.length > 0) {
      type CircleFeature = Feature<
        Polygon,
        {
          color: string;
          RXPower: number;
          Modem_ID: number;
          Lat: number;
          Long: number;
        }
      >;

      const circles: CircleFeature[] = [];

      acsPowers.forEach((acsPower) => {
        const center: [number, number] = [acsPower.Long, acsPower.Lat];
        const radius = 0.05;
        const options = { steps: 64, units: "kilometers" as const };

        const circleFeature = circle(center, radius, options) as CircleFeature;

        circleFeature.properties = {
          Modem_ID: acsPower.Modem_ID,
          RXPower: acsPower.RXPower,
          Lat: acsPower.Lat,
          Long: acsPower.Long,
          color:
            acsPower.RXPower >= -28 && acsPower.RXPower <= -8 ? "green" : "red",
        };

        circles.push(circleFeature);
      });

      const geojsonData: FeatureCollection<Polygon, { color: string }> = {
        type: "FeatureCollection",
        features: circles,
      };

      setSourceData({
        type: "geojson",
        data: geojsonData,
      });
    }
  }, [acsPowers]);

  return {
    id: "FTTHPowerLayer",
    source: sourceData,
    visible: true,
    type: "fill",
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.8,
      "fill-outline-color": "transparent",
    },
  };
};
