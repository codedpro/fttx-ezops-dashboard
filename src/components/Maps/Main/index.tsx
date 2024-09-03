import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";
import { Feature, FeatureCollection, Geometry } from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API ?? "???";

const FTTHModemsMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const modems = useFTTHModemsStore((state) => state.modems);

  const createGeoJSON = (): FeatureCollection<Geometry> => ({
    type: "FeatureCollection",
    features: modems.map((modem): Feature => ({
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
      },
    })),
  });

  useEffect(() => {
    console.log("Modems data:", modems); 
    if (!mapContainerRef.current) return;

    if (mapRef.current === null) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [51.4699361114553, 35.7580195079693],
        zoom: 12,
      });

      // Add the GeoJSON layer for modems
      mapRef.current.on("load", () => {
        mapRef.current!.addSource("modems", {
          type: "geojson",
          data: createGeoJSON(),
        });

        mapRef.current!.addLayer({
          id: "modems",
          type: "circle",
          source: "modems",
          paint: {
            "circle-radius": 6,
            "circle-color": "#007cbf",
          },
        });

        // Add popups
        mapRef.current!.on("click", "modems", (e) => {
          const coordinates = (e.features![0].geometry as any).coordinates.slice();
          const { Modem_ID, OLT, POP, FAT, Symbol, Error } = e.features![0].properties as any;

          new mapboxgl.Popup()
            .setLngLat(coordinates as [number, number])
            .setHTML(
              `<h3>Modem ID: ${Modem_ID}</h3>
               <p>OLT: ${OLT}</p>
               <p>POP: ${POP}</p>
               <p>FAT: ${FAT}</p>
               <p>Symbol: ${Symbol}</p>
               <p>Error: ${Error}</p>`
            )
            .addTo(mapRef.current!);
        });

        // Change the cursor to a pointer when hovering over modems
        mapRef.current!.on("mouseenter", "modems", () => {
          mapRef.current!.getCanvas().style.cursor = "pointer";
        });

        // Change the cursor back to normal when not hovering over modems
        mapRef.current!.on("mouseleave", "modems", () => {
          mapRef.current!.getCanvas().style.cursor = "";
        });
      });
    } else if (mapRef.current.getSource("modems")) {
      // Update the data in the existing source
      (mapRef.current.getSource("modems") as mapboxgl.GeoJSONSource).setData(createGeoJSON());
    }
  }, [modems]);

  return <div ref={mapContainerRef} style={{ width: "50%", height: "1000px" }} />;
};

export default FTTHModemsMap;
