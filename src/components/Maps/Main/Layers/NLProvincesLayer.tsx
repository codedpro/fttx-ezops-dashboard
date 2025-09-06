import { FeatureCollection, Geometry } from "geojson";
import { useEffect, useState } from "react";
import { GeoJSONSourceSpecification } from "mapbox-gl";

export const useNLProvincesLayer = () => {
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/netherlands-provinces.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: FeatureCollection<Geometry> | null) => {
        if (!isMounted || !data) return;
        setSource({ type: "geojson", data });
        setLoaded(true);
      })
      .catch(() => {
        // Silent if file is not present
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    id: "nl-provinces",
    source,
    visible: loaded,
    type: "fill" as const,
    paint: {
      "fill-color": "#2e7dd7",
      "fill-opacity": 0.06,
    },
  };
};

