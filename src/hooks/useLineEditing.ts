import { useState, useEffect, MutableRefObject, useCallback } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import { LineString, Feature } from "geojson";

export const useLineEditing = (
  mapRef: MutableRefObject<mapboxgl.Map | null>,
  fatLayerIds: string[]
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [linePoints, setLinePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [isConnectedToFeature, setIsConnectedToFeature] = useState(false);
  const [firstClickedFeature, setFirstClickedFeature] = useState<Feature | null>(null);
  const [lastClickedFeature, setLastClickedFeature] = useState<Feature | null>(null);
  const [initialFirstFeatureCoords, setInitialFirstFeatureCoords] = useState<[number, number] | null>(null);
  const [initialLastFeatureCoords, setInitialLastFeatureCoords] = useState<[number, number] | null>(null);

  const snappingDistance = 0.0001;

  const draw = useState(() => new MapboxDraw({ displayControlsDefault: true, controls: {} }))[0];

  // Add draw control to map
  const addDrawControl = () => {
    if (mapRef.current && draw && !mapRef.current.hasControl(draw)) {
      mapRef.current.addControl(draw);
      mapRef.current.getCanvas().style.cursor = "crosshair";
    }
  };

  // Remove draw control from map
  const removeDrawControl = () => {
    if (mapRef.current && draw) {
      try {
        mapRef.current.removeControl(draw);
        mapRef.current.getCanvas().style.cursor = "";
      } catch (error) {
        console.warn("Error removing draw control:", error);
      }
    }
  };

  // Snapping to the nearest feature if within a certain distance
  const snapToFeature = useCallback(
    (point: { lat: number; lng: number }, featureCoords: [number, number]) => {
      const distance = Math.sqrt(
        Math.pow(point.lat - featureCoords[1], 2) +
        Math.pow(point.lng - featureCoords[0], 2)
      );
      return distance < snappingDistance ? { lat: featureCoords[1], lng: featureCoords[0] } : point;
    },
    []
  );

  // Handle clicking on features to add points for line editing
  const handleFeatureClick = useCallback((clickedFeature: Feature) => {
    const geometry = clickedFeature.geometry;
    if (geometry.type === "Point") {
      const coordinates = geometry.coordinates as [number, number];
      if (!firstClickedFeature) {
        setFirstClickedFeature(clickedFeature);
        setInitialFirstFeatureCoords(coordinates);
        setLinePoints([{ lng: coordinates[0], lat: coordinates[1] }]);
      } else {
        const snappedPoint = snapToFeature({ lat: coordinates[1], lng: coordinates[0] }, coordinates);
        setLinePoints((prev) => [...prev, { lng: snappedPoint.lng, lat: snappedPoint.lat }]);
        setLastClickedFeature(clickedFeature);
        setInitialLastFeatureCoords(coordinates);
        setIsConnectedToFeature(true);
      }
    }
  }, [firstClickedFeature, snapToFeature]);

  // Check if two coordinates match within a very small margin
  const checkCoordinatesMatch = useCallback(
    (point: { lat: number; lng: number }, coordinates: [number, number]) => {
      return (
        Math.abs(point.lat - coordinates[1]) < 0.000001 &&
        Math.abs(point.lng - coordinates[0]) < 0.000001
      );
    },
    []
  );

  // Handle finishing the line editing process
  const handleFinishEditing = useCallback(async () => {
    if (linePoints.length > 1 && isConnectedToFeature && firstClickedFeature && lastClickedFeature) {
      const firstPointMatches = checkCoordinatesMatch(linePoints[0], initialFirstFeatureCoords!);
      const lastPointMatches = checkCoordinatesMatch(linePoints[linePoints.length - 1], initialLastFeatureCoords!);

      if (!firstPointMatches || !lastPointMatches) {
        alert("The start or end point does not match the selected features.");
        return;
      }

      const updatedLine = {
        coordinates: linePoints.map(({ lat, lng }) => [lng, lat]),
      };

      // Perform your save logic here (e.g., send updated line to server)
      console.log("Updated line: ", updatedLine);

      removeDrawControl();
      setIsEditing(false);
    } else {
      alert("Please connect both ends of the line to features.");
    }
  }, [linePoints, isConnectedToFeature, firstClickedFeature, lastClickedFeature, checkCoordinatesMatch, removeDrawControl]);

  // Start editing an existing line
  const startEditingLine = useCallback(
    (lineData: { coordinates: [number, number][]; chainId: number | null }) => {
      if (lineData?.coordinates?.length && lineData.chainId !== null) {
        const newLinePoints = lineData.coordinates.map(([lng, lat]) => ({ lng, lat }));
        setLinePoints(newLinePoints);
        setIsEditing(true);

        addDrawControl();

        const lineFeature: Feature<LineString> = {
          id: String(lineData.chainId), // Use chainId as the featureId
          type: "Feature",
          geometry: { type: "LineString", coordinates: lineData.coordinates },
          properties: {},
        };

        draw.add(lineFeature);

        // Use chainId as the featureId for direct_select mode
        draw.changeMode("direct_select", { featureId: String(lineData.chainId) });
      } else {
        console.error("Invalid LineData: Missing coordinates or chainId");
      }
    },
    [addDrawControl, draw]
  );

  return {
    isEditing,
    startEditingLine,
    handleFinishEditing,
    handleFeatureClick,
  };
};
