import { useState, useEffect, MutableRefObject, useCallback } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import { LineString, Feature } from "geojson";

export const useLineDrawing = (
  mapRef: MutableRefObject<mapboxgl.Map | null>,
  fatLayerIds: string[]
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [linePoints, setLinePoints] = useState<{ lat: number; lng: number }[]>(
    []
  );
  const [lineType, setLineType] = useState<string>("Unknown");
  const [isConnectedToFeature, setIsConnectedToFeature] = useState(false);
  const [firstClickedFeature, setFirstClickedFeature] =
    useState<Feature | null>(null);
  const [lastClickedFeature, setLastClickedFeature] = useState<Feature | null>(
    null
  );
  const [initialFirstFeatureCoords, setInitialFirstFeatureCoords] = useState<
    [number, number] | null
  >(null);
  const [initialLastFeatureCoords, setInitialLastFeatureCoords] = useState<
    [number, number] | null
  >(null);

  const snappingDistance = 0.0001;

  const draw = useState(
    () =>
      new MapboxDraw({
        displayControlsDefault: true,
        controls: {},
        keybindings: true,
        touchEnabled: true,
      })
  )[0];

  const addDrawControlAndStartDrawing = () => {
    if (mapRef?.current && draw && !mapRef.current.hasControl(draw)) {
      mapRef.current.addControl(draw);
      mapRef.current.getCanvas().style.cursor = "crosshair";
      draw.changeMode("draw_line_string");
    }
  };

  const removeDrawControl = () => {
    if (mapRef?.current && draw) {
      try {
        mapRef.current.removeControl(draw);
        mapRef.current.getCanvas().style.cursor = "";
      } catch (error) {
        console.warn("Error removing draw control:", error);
      }
    }
  };
  interface LineData {
    coordinates: [number, number][];
    chainId: number | null;
    type: string | null;
  }

  const snapToFeature = useCallback(
    (point: { lat: number; lng: number }, featureCoords: [number, number]) => {
      const distance = Math.sqrt(
        Math.pow(point.lat - featureCoords[1], 2) +
          Math.pow(point.lng - featureCoords[0], 2)
      );

      if (distance < snappingDistance) {
        return { lat: featureCoords[1], lng: featureCoords[0] };
      }
      return point;
    },
    []
  );

  const addPointAtFeature = (
    coordinates: [number, number],
    feature: Feature | null
  ) => {
    setLinePoints((prev) => {
      const snappedPoint = snapToFeature(
        { lat: coordinates[1], lng: coordinates[0] },
        coordinates
      );
      const updatedLinePoints = [
        ...prev,
        { lng: snappedPoint.lng, lat: snappedPoint.lat },
      ];

      const currentFeature = draw.getAll().features[0];
      if (currentFeature?.id && currentFeature.geometry.type === "LineString") {
        const newCoordinates = updatedLinePoints.map(
          (point) => [point.lng, point.lat] as [number, number]
        );

        const updatedFeature: Feature<LineString> = {
          ...currentFeature,
          geometry: { type: "LineString", coordinates: newCoordinates },
          type: "Feature",
          properties: currentFeature.properties || {},
        };

        draw.set({ type: "FeatureCollection", features: [updatedFeature] });
        draw.changeMode("simple_select", {
          featureIds: [String(currentFeature.id)],
        });
      }

      return updatedLinePoints;
    });

    if (firstClickedFeature) {
      setLastClickedFeature(feature);
      setInitialLastFeatureCoords(coordinates);
    }
    setIsConnectedToFeature(true);
  };

  const handleFeatureClick = useCallback(
    (clickedFeature: Feature) => {
      const geometry = clickedFeature.geometry;

      if (geometry.type === "Point") {
        const coordinates = geometry.coordinates as [number, number];
        if (!firstClickedFeature) {
          setFirstClickedFeature(clickedFeature);
          setInitialFirstFeatureCoords(coordinates);
          setLinePoints([{ lng: coordinates[0], lat: coordinates[1] }]);
        } else {
          addPointAtFeature(coordinates, clickedFeature);
        }
      }
    },
    [firstClickedFeature, addPointAtFeature]
  );

  const checkCoordinatesMatch = useCallback(
    (point: { lat: number; lng: number }, coordinates: [number, number]) => {
      return (
        Math.abs(point.lat - coordinates[1]) < 0.000001 &&
        Math.abs(point.lng - coordinates[0]) < 0.000001
      );
    },
    []
  );

  const handleFinishLineDraw = useCallback(async () => {
    if (
      linePoints.length > 1 &&
      isConnectedToFeature &&
      firstClickedFeature &&
      lastClickedFeature &&
      initialFirstFeatureCoords &&
      initialLastFeatureCoords
    ) {
      const firstPointMatches = checkCoordinatesMatch(
        linePoints[0],
        initialFirstFeatureCoords
      );
      const lastPointMatches = checkCoordinatesMatch(
        linePoints[linePoints.length - 1],
        initialLastFeatureCoords
      );

      if (!firstPointMatches) {
        alert("The first point does not match the selected feature.");
        return;
      }

      if (!lastPointMatches) {
        alert("The last point does not match the selected feature.");
        return;
      }

      const startPointId = firstClickedFeature?.properties?.FAT_ID || "Unknown";
      const startPointType = firstClickedFeature?.properties?.Type || "Unknown";
      const endPointId = lastClickedFeature?.properties?.FAT_ID || "Unknown";
      const endPointType = lastClickedFeature?.properties?.Type || "Unknown";

      const lines = linePoints.map((point) => ({
        Lat: point.lat,
        Long: point.lng,
      }));

      const newRoute = {
        StartPointId: startPointId,
        StartPointType: startPointType,
        EndPointId: endPointId,
        EndPointType: endPointType,
        LineType: lineType,
        Lines: lines,
      };

      try {
        console.log(JSON.stringify(newRoute));
        const response = await fetch(
          "https://your-endpoint.com/api/new-route",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newRoute),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Route saved successfully:", data);
        } else {
          console.error("Failed to save route:", response.statusText);
          alert("Failed to save route.");
        }
      } catch (error) {
        console.error("Error while saving route:", error);
        alert("An error occurred while saving the route.");
      }

      console.log("Line drawing finished.");
      console.log("Points:", linePoints);
      console.log("First clicked feature:", firstClickedFeature);
      console.log("Last clicked feature:", lastClickedFeature);

      removeDrawControl();
      setIsDrawing(false);
    } else {
      alert(
        "You must connect both the first and last points to features to save the line."
      );
    }
  }, [
    linePoints,
    isConnectedToFeature,
    firstClickedFeature,
    lastClickedFeature,
    initialFirstFeatureCoords,
    initialLastFeatureCoords,
    checkCoordinatesMatch,
    removeDrawControl,
  ]);

  const handleCancelLineDraw = useCallback(() => {
    setLinePoints([]);
    setIsDrawing(false);
    setIsConnectedToFeature(false);
    removeDrawControl();
    setFirstClickedFeature(null);
    setLastClickedFeature(null);
    setInitialFirstFeatureCoords(null);
    setInitialLastFeatureCoords(null);
  }, [removeDrawControl]);

  const startDrawing = useCallback(
    (lineType: string) => {
      setLineType(lineType);
      setIsDrawing(true);
      setLinePoints([]);
      setIsConnectedToFeature(false);
      setFirstClickedFeature(null);
      setLastClickedFeature(null);
      setInitialFirstFeatureCoords(null);
      setInitialLastFeatureCoords(null);
      addDrawControlAndStartDrawing();
    },
    [addDrawControlAndStartDrawing]
  );

  useEffect(() => {
    if (isDrawing) {
      addDrawControlAndStartDrawing();
    } else {
      removeDrawControl();
    }
    return () => removeDrawControl();
  }, [isDrawing]);

  useEffect(() => {
    const handleMapClick = (e: MapMouseEvent) => {
      if (!isDrawing || !mapRef.current) return;

      const clickedFeatures = mapRef.current.queryRenderedFeatures(e.point, {
        layers: fatLayerIds,
      });

      if (clickedFeatures && clickedFeatures.length > 0) {
        handleFeatureClick(clickedFeatures[0]);
      } else if (firstClickedFeature && !lastClickedFeature) {
        const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setLinePoints((prev) => [
          ...prev,
          { lng: coordinates[0], lat: coordinates[1] },
        ]);
      }
    };

    if (mapRef.current) {
      mapRef.current.on("click", handleMapClick);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
      }
    };
  }, [
    isDrawing,
    mapRef,
    fatLayerIds,
    handleFeatureClick,
    firstClickedFeature,
    lastClickedFeature,
  ]);

  const handleContinueLine = (selectedFeature: Feature<LineString>) => {
    const existingCoordinates = selectedFeature.geometry.coordinates;
    const newLinePoints = existingCoordinates.map((coord) => ({
      lng: coord[0],
      lat: coord[1],
    }));
    setLinePoints(newLinePoints);
    setIsDrawing(true);

    if (draw && mapRef.current) {
      draw.add(selectedFeature);
      if (selectedFeature.id) {
        draw.changeMode("direct_select", {
          featureId: String(selectedFeature.id),
        });
      }
    }
  };

  return {
    isDrawing,
    startDrawing,
    handleFinishLineDraw,
    handleCancelLineDraw,
    handleContinueLine,
    linePoints,
  };
};
