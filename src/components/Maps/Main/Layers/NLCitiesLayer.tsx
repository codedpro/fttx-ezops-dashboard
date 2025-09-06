import { Feature, FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";
import { mockFTTHCities } from "@/lib/mocks/data";

export const useNLCitiesLayer = () => {
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    const cities = mockFTTHCities().filter((c) => c.Name !== "all");
    const geoJsonData: FeatureCollection<Geometry> = {
      type: "FeatureCollection",
      features: cities.map((c): Feature => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [c.Long, c.Lat],
        },
        properties: {
          label: c.Full_Name,
          icon: "nlCityMarker",
          iconSize: 0.6,
        },
      })),
    };
    setSource({ type: "geojson", data: geoJsonData });
  }, []);

  return {
    id: "nl-cities",
    source,
    visible: true,
    type: "point" as const,
    icons: {
      nlCityMarker: "/images/map/HandHole.png",
    },
  };
};

