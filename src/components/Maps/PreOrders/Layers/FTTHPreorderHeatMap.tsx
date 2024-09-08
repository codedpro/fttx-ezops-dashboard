import { useFTTHPreordersStore } from "@/store/FTTHPreordersStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { useEffect, useState } from "react";
import { GeoJSONSourceSpecification } from "mapbox-gl";

export const useFTTHPreorderHMLayer = () => {
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
    id: "preorders-heatmap",
    source,
    visible: true,
    type: "heatmap" as const,
    paint: {
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["get", "Tracking_Code"],
        1,
        0.2,
        10,
        1,
      ],
      "heatmap-intensity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        0.5,
        20,
        2,
      ],
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(33,102,172,0)",
        0.2,
        "rgb(103,169,207)",
        0.4,
        "rgb(209,229,240)",
        0.6,
        "rgb(253,219,199)",
        0.8,
        "rgb(239,138,98)",
        1,
        "rgb(178,24,43)",
      ],
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,  // Lower zoom levels
        10,  // Larger radius at lower zoom
        20,  // Higher zoom levels
        50,  // Much larger radius at higher zoom
      ],
      "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0.7, 20, 0],
    },
  };
};
