import { usePostBlockStore } from "@/store/FTTHPostBlockStore";
import { FeatureCollection, Feature, Polygon, Geometry } from "geojson";
import { useEffect, useState } from "react";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";

export const usePostBlockPolygonLayer = () => {
  const blocks = usePostBlockStore((state) => state.blocks);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  // Function to group blocks by ID and create polygons
  const groupBlocksByBlockIDAndCreatePolygon = (
    blocks: PostBlock[]
  ): FeatureCollection<Geometry> => {
    const blockGroups: { [key: number]: PostBlock[] } = {};

    blocks.forEach((block) => {
      if (!blockGroups[block.id]) {
        blockGroups[block.id] = [];
      }
      blockGroups[block.id].push(block);
    });

    const features: Feature[] = Object.values(blockGroups).map((blockGroup) => {
      const coordinates = blockGroup
        .flatMap((block) => block.coordinates)
        .concat([blockGroup[0].coordinates[0]]); // Ensure the polygon is closed

      return {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coordinates],
        } as Polygon,
        properties: {
          id: blockGroup[0].id,
        },
      };
    });

    return {
      type: "FeatureCollection",
      features,
    };
  };

  useEffect(() => {
    if (blocks.length > 0) {
      const geoJsonData = groupBlocksByBlockIDAndCreatePolygon(blocks);

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [blocks]);

  return {
    id: "postBlockLayer",
    source,
    visible: true,
    type: "fill" as const,
    paint: {
      "fill-color": "#00ff00",
      "fill-opacity": 0.4,
      "fill-outline-color": "#000000",
    },
  };
};
