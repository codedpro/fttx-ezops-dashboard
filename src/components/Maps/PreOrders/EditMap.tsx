import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Ensure Mapbox API token is set
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API ?? "YOUR_MAPBOX_TOKEN";

interface EditMapProps {
  pointData: GeoJSON.Feature<GeoJSON.Point> | null;
  onSubmit: (newCoordinates: { lat: number; lng: number }) => void;
  onCancel: () => void;
  layers: Array<{
    id: string;
    source: GeoJSONSourceSpecification | null;
    visible: boolean;
    type: "point" | "line" | "heatmap";
  }>;
}

const EditMap: React.FC<EditMapProps> = ({ pointData, onSubmit, onCancel, layers }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null); // Reference for map container
  const mapRef = useRef<mapboxgl.Map | null>(null); // Reference for mapbox instance
  const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (pointData?.geometry?.coordinates) {
      setCurrentCoordinates({
        lat: pointData.geometry.coordinates[1],
        lng: pointData.geometry.coordinates[0],
      });
    }
  }, [pointData]);

  // Cleanup map instance on component unmount or rerender
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        console.log("Cleaning up map instance.");
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Initialize the map when the component mounts
  useEffect(() => {
    if (!mapContainerRef.current || !currentCoordinates) return;

    // Log the map initialization for debugging
    console.log("Initializing Mapbox map with coordinates: ", currentCoordinates);

    // Initialize mapbox map only if mapRef is null
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current, // container ID for the map
        style: "mapbox://styles/mapbox/streets-v11", // Mapbox style
        center: [currentCoordinates.lng, currentCoordinates.lat], // Initial map center
        zoom: 16, // Zoom level
      });

      mapRef.current.on("load", () => {
        console.log("Map loaded successfully!");

        // Add layers provided via props
        layers.forEach(({ id, source, visible, type }) => {
          if (source && !mapRef.current?.getSource(id)) {
            mapRef.current?.addSource(id, source); // Add the source to the map
            mapRef.current?.addLayer({
              id,
              type: type === "point" ? "symbol" : type, // Layer type
              source: id,
            });
            mapRef.current?.setLayoutProperty(id, "visibility", visible ? "visible" : "none"); // Set layer visibility
          }
        });

        // Add the selected point if available
        if (pointData) {
          console.log("Adding selected point: ", pointData.geometry.coordinates);
          mapRef.current?.addSource("selected-point", {
            type: "geojson",
            data: pointData,
          });

          mapRef.current?.addLayer({
            id: "selected-point",
            type: "symbol",
            source: "selected-point",
            layout: {
              "icon-image": "marker-15",
              "icon-size": 1.5,
              "icon-allow-overlap": true,
            },
          });
        }
      });

      // Log map click events to debug coordinate updates
      mapRef.current.on("click", (e) => {
        const newLatLng = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        };
        console.log("Map clicked at: ", newLatLng);
        setCurrentCoordinates(newLatLng);

        // Update selected point on click
        if (pointData) {
          const updatedPoint: GeoJSON.Feature<GeoJSON.Point> = {
            ...pointData,
            geometry: {
              type: "Point",
              coordinates: [newLatLng.lng, newLatLng.lat],
            },
          };
          (mapRef.current?.getSource("selected-point") as mapboxgl.GeoJSONSource)?.setData(updatedPoint);
        }
      });
    }
  }, [currentCoordinates, layers, pointData]);

  // Return JSX for map and buttons
  return (
    <div>
      {/* Ensure the map container has proper dimensions */}
      <div ref={mapContainerRef} className="w-full h-[80vh] border border-gray-300" />
      <div className="flex justify-center mt-4">
        <button
          onClick={() => currentCoordinates && onSubmit(currentCoordinates)}
          className="px-4 py-2 bg-green-600 text-white rounded mr-4"
        >
          Submit
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-red-600 text-white rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditMap;
