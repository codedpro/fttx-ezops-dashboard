import { useFTTHPreordersStore } from "@/store/FTTHPreordersStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useFTTHPreorderLayer = () => {
  const preorders = useFTTHPreordersStore((state) => state.preorders);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (preorders.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: preorders.map(
          (preorder): Feature => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [preorder.Long, preorder.Lat],
            },
            properties: {
              ID: preorder.ID,
              Eshop_ID: preorder.Eshop_ID,
              Tracking_Code: preorder.Tracking_Code,
              Province: preorder.Province,
              City: preorder.City,
              Created_Date: preorder.Created_Date,
              icon: "ftthPreorderIcon",
              iconSize: 0.5,
              Long: preorder.Long,
              Lat: preorder.Lat,
              LayerID: "preorders",
            },
          })
        ),
      };

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [preorders]);

  return {
    id: "preorders",
    source,
    visible: true,
    type: "point" as const,
    icons: { ftthPreorderIcon: "/images/map/FTTHPreorder.png" },
  };
};
