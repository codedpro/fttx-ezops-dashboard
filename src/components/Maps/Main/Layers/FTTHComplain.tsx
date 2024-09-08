import { useFTTHModemsStore } from "@/store/FTTHModemsStore";
import { Feature, FeatureCollection, Geometry } from "geojson";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import { useEffect, useState } from "react";

export const useFTTHModemLayer = () => {
  const modems = useFTTHModemsStore((state) => state.modems);
  const [source, setSource] = useState<GeoJSONSourceSpecification | null>(null);

  useEffect(() => {
    if (modems.length > 0) {
      const geoJsonData: FeatureCollection<Geometry> = {
        type: "FeatureCollection",
        features: modems.map(
          (modem): Feature => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [modem.Long, modem.Lat],
            },
            properties: {
              Modem_ID: modem.Modem_ID,
              OLT: modem.OLT,
              POP: modem.POP,
              FAT: modem.FAT,
              Symbol: modem.Symbol,
              Error: modem.Error,
              coordinates: [modem.Long, modem.Lat],
            },
          })
        ),
      };

      setSource({
        type: "geojson",
        data: geoJsonData,
      });
    }
  }, [modems]);

  return {
    id: "modems",
    source,
    visible: true,
    type: "point" as const, 
  };
};
