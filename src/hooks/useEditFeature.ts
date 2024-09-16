import { useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface FeatureProperties {
  ID: number;
  Eshop_ID: number;
  Tracking_Code: string;
  Province: string;
  City: string;
  Created_Date: string;
  icon: string;
  iconSize: number;
  Long: number;
  Lat: number;
}

interface CustomFeature extends mapboxgl.MapboxGeoJSONFeature {
  Long: number;
  Lat: number;
  LayerID: string;
}

export const useEditFeature = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  addLayersToMap: () => void,
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPointData, setEditPointData] = useState<GeoJSON.Feature<
    GeoJSON.Point,
    FeatureProperties
  > | null>(null);
  const [currentCoordinates, setCurrentCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);  // Reference to the marker

  const handleEditPoint = (clickedFeature: CustomFeature | null) => {
    if (clickedFeature && clickedFeature.LayerID === "preorders") {
      const long = clickedFeature.Long;
      const lat = clickedFeature.Lat;

      if (typeof long === "number" && typeof lat === "number") {
        const coordinates = [long, lat] as [number, number];

        setEditPointData({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coordinates,
          },
          properties: clickedFeature as unknown as FeatureProperties,
        });

        setCurrentCoordinates({
          lat: lat,
          lng: long,
        });

        setIsEditMode(true);
        setIsModalOpen(false);
        if (clickedFeature?.LayerID) {
          const layerId = clickedFeature.LayerID;
          if (mapRef.current?.getLayer(layerId)) {
            mapRef.current?.setLayoutProperty(layerId, "visibility", "none");
          }
        }

        if (mapRef.current) {
          mapRef.current.addSource("editable-point", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: coordinates,
              },
              properties: clickedFeature as unknown as FeatureProperties,
            },
          });

          mapRef.current.addLayer({
            id: "editable-point",
            type: "symbol",
            source: "editable-point",
            layout: {
              "icon-image": "marker-15",
              "icon-size": 1.5,
              "icon-allow-overlap": true,
            },
          });

          // Create and store the editable marker in the ref
          const editableMarker = new mapboxgl.Marker({
            draggable: true,
          })
            .setLngLat(coordinates)
            .addTo(mapRef.current);

          markerRef.current = editableMarker;  // Store marker in the ref

          editableMarker.on("dragend", () => {
            const lngLat = editableMarker.getLngLat();
            setCurrentCoordinates({
              lat: lngLat.lat,
              lng: lngLat.lng,
            });

            const updatedPoint: GeoJSON.Feature<GeoJSON.Point> = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [lngLat.lng, lngLat.lat],
              },
              properties: editPointData?.properties || {},
            };

            (
              mapRef.current?.getSource(
                "editable-point"
              ) as mapboxgl.GeoJSONSource
            )?.setData(updatedPoint);
          });
        }
      }
    }
  };

  // Function to move the point and marker on the map without submitting
  const handleMovePoint = (newCoordinates: { lat: number; lng: number }) => {
    if (mapRef.current && editPointData && markerRef.current) {
      setCurrentCoordinates(newCoordinates);

      const updatedPoint: GeoJSON.Feature<GeoJSON.Point> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [newCoordinates.lng, newCoordinates.lat],
        },
        properties: editPointData.properties || {},
      };

      // Update the position of the point on the map
      (
        mapRef.current.getSource("editable-point") as mapboxgl.GeoJSONSource
      )?.setData(updatedPoint);

      // Move the marker to the new coordinates
      markerRef.current.setLngLat([newCoordinates.lng, newCoordinates.lat]);
    }
  };

  // Submit the updated coordinates to the server
  const handleSubmitEdit = async () => {
    if (!currentCoordinates || !editPointData) return;

    const updatedFeature = {
      ...editPointData,
      properties: {
        ...editPointData?.properties,
        Long: currentCoordinates.lng,
        Lat: currentCoordinates.lat,
      },
    };

    try {
      await fetch("/api/save-coordinates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updatedFeature.properties.ID,
          newCoordinates: [currentCoordinates.lng, currentCoordinates.lat],
        }),
      });
    } catch (error) {
      console.error("Failed to save new coordinates", error);
    }

    setIsEditMode(false);
    mapRef.current?.removeLayer("editable-point");
    mapRef.current?.removeSource("editable-point");

    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach((marker) => marker.remove());

    addLayersToMap();
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    mapRef.current?.removeLayer("editable-point");
    mapRef.current?.removeSource("editable-point");

    if (editPointData) {
      const originalLayerId = String(editPointData.properties?.ID);
      mapRef.current?.setLayoutProperty(
        originalLayerId,
        "visibility",
        "visible"
      );
    }

    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach((marker) => marker.remove());

    addLayersToMap();
  };

  return {
    isEditMode,
    currentCoordinates,
    handleEditPoint,
    handleMovePoint,
    handleSubmitEdit,
    handleCancelEdit,
  };
};
