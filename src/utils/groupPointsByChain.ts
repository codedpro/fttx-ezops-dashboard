import {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Polygon,
} from "geojson";
import { FTTHPoint } from "../types/FTTHPoint";
import { FTTHBlock } from "../types/FTTHBlock";

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
        City: chainPoints[0].City,
      },
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
};
export const groupBlocksByBlockIDAndCreatePolygon = (
  blocks: FTTHBlock[]
): FeatureCollection<Geometry> => {
  const blockGroups: { [key: number]: FTTHBlock[] } = {};

  blocks.forEach((block) => {
    if (!blockGroups[block.Block_ID]) {
      blockGroups[block.Block_ID] = [];
    }
    blockGroups[block.Block_ID].push(block);
  });

  const features: Feature[] = Object.values(blockGroups).map((blockGroup) => {
    const coordinates = blockGroup
      .sort((a, b) => a.Order - b.Order)
      .map((block) => [block.Long, block.Lat]);

    if (coordinates.length > 2) {
      coordinates.push(coordinates[0]);
    }

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      } as Polygon,
      properties: {
        ...blockGroup[0],
      },
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
  };
};
