import { Feature, FeatureCollection, Geometry, LineString } from "geojson";
import { FTTHPoint } from "../types/FTTHPoint";

export const groupPointsByChainAndCreateLine = (
  points: FTTHPoint[]
): FeatureCollection<Geometry> => {
  const chains: { [key: number]: FTTHPoint[] } = {};

  points.forEach((point) => {
    if (!chains[point.Chain_ID]) {
      chains[point.Chain_ID] = [];
    }
    chains[point.Chain_ID].push(point);
  });

  const features: Feature[] = Object.values(chains).map((chainPoints) => {
    const coordinates = chainPoints
      .sort((a, b) => a.Order - b.Order)
      .map((point) => [point.Long, point.Lat]);

    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      } as LineString,
      properties: {
        Chain_ID: chainPoints[0].Chain_ID,
        Type: chainPoints[0].Type,
      },
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
};
