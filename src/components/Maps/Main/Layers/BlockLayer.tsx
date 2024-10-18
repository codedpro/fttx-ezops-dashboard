import { useFTTHBlocksStore } from "@/store/useFTTHPointsStore";
import { FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
import { groupBlocksByBlockIDAndCreatePolygon } from "@/utils/groupPointsByChain";

export const useFTTHBlockPolygonLayer = () => {
  const blocks = useFTTHBlocksStore((state) => state.blocks);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (blocks.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> =
        groupBlocksByBlockIDAndCreatePolygon(blocks);

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [blocks]);

  return {
    id: "ftth-block-polygon-layer",
    source,
    visible: true,
    type: "polygon" as const,
    paint: {
      "fill-color": "#00ff00",
      "fill-opacity": 0.4,
      "fill-outline-color": "#000000",
    },
  };
};
