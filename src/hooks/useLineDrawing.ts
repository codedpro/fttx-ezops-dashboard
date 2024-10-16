import { useState, useEffect, MutableRefObject, useCallback } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl, { MapMouseEvent } from "mapbox-gl";
import {
  LineString,
  Feature,
  Geometry,
  FeatureCollection,
  Position,
  Point,
} from "geojson";
import { DrawEvent } from "../../mapbox-gl-draw";

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

  const snappingDistance = 0.001;

  const [undoStack, setUndoStack] = useState<FeatureCollection[]>([]);
  const [redoStack, setRedoStack] = useState<FeatureCollection[]>([]);
  const [isUndoRedoRunning, setIsUndoRedoRunning] = useState(false);
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
    try {
      if (mapRef?.current && draw && !mapRef.current.hasControl(draw)) {
        mapRef.current.addControl(draw);
        mapRef.current.getCanvas().style.cursor = "crosshair";
        draw.changeMode("draw_line_string");
      }
    } catch (error) {
      console.error("Error adding draw control and starting drawing:", error);
    }
  };

  const removeDrawControl = () => {
    try {
      if (mapRef?.current && draw) {
        mapRef.current.removeControl(draw);
        mapRef.current.getCanvas().style.cursor = "";
      }
    } catch (error) {
      console.warn("Error removing draw control:", error);
    }
  };

  const isPoint = (geometry: Geometry): geometry is Point => {
    return geometry.type === "Point";
  };

  const getClosestFatFeature = (
    point: [number, number]
  ): Feature<Point> | null => {
    if (!mapRef.current) return null;

    const features = mapRef.current.queryRenderedFeatures(
      mapRef.current.project(point),
      { layers: fatLayerIds }
    );

    let closestFeature: Feature<Point> | null = null;
    let minDistance = Infinity;

    features.forEach((feature) => {
      if (isPoint(feature.geometry)) {
        const featureCoords = feature.geometry.coordinates as [number, number];
        const distance = Math.hypot(
          point[0] - featureCoords[0],
          point[1] - featureCoords[1]
        );

        if (distance < snappingDistance && distance < minDistance) {
          minDistance = distance;
          closestFeature = feature as Feature<Point>;
        }
      }
    });

    return closestFeature;
  };

  const saveState = useCallback(() => {
    const currentFeatures = draw.getAll();
    setUndoStack((prevUndoStack) => [...prevUndoStack, currentFeatures]);
    setRedoStack([]);
  }, [draw]);

  const snapVertexToFatFeature = (
    coords: [number, number],
    vertexIndex: number,
    featureId: string,
    shouldForceSnap: boolean = false
  ) => {
    // First sync any existing points with Draw before snapping
    syncLinePointsWithDraw();

    const feature = draw.getAll().features.find((f) => f.id === featureId);

    if (feature && feature.geometry.type === "LineString") {
      const updatedCoords = [...(feature.geometry as LineString).coordinates];

      // Perform snapping logic only after syncing
      if (vertexIndex === 0) {
        const closestFatFeature = getClosestFatFeature(coords);
        if (closestFatFeature) {
          const snappedCoords = closestFatFeature.geometry.coordinates as [
            number,
            number,
          ];
          updatedCoords[vertexIndex] = snappedCoords;
          setFirstClickedFeature(closestFatFeature);
          setInitialFirstFeatureCoords(snappedCoords);
        }
      } else if (vertexIndex === updatedCoords.length - 1) {
        const closestFatFeature = getClosestFatFeature(coords);
        if (closestFatFeature) {
          const snappedCoords = closestFatFeature.geometry.coordinates as [
            number,
            number,
          ];
          updatedCoords[vertexIndex] = snappedCoords;
          setLastClickedFeature(closestFatFeature);
          setInitialLastFeatureCoords(snappedCoords);
        }
      }

      feature.geometry.coordinates = updatedCoords;
      draw.set({ type: "FeatureCollection", features: [feature] });

      syncLinePointsWithDraw();
    }
  };

  const syncLinePointsWithDraw = useCallback(() => {
    const currentFeature = draw
      .getAll()
      .features.find((feature) => feature.geometry.type === "LineString") as
      | Feature<LineString>
      | undefined;

    if (currentFeature) {
      const newLinePoints = currentFeature.geometry.coordinates.map(
        (coord) => ({
          lng: coord[0],
          lat: coord[1],
        })
      );
      setLinePoints(newLinePoints);
    } else {
      setLinePoints([]);
    }
  }, [draw]);

  const handleDrawUpdate = useCallback(
    (e: any) => {
      try {
        if (!e.features || e.features.length === 0) {
          return;
        }
        syncLinePointsWithDraw();

        const updatedFeature = e.features[0] as Feature<LineString>;
        const coords = updatedFeature.geometry.coordinates;
        console.log(coords.length);
        if (coords.length >= 1) {
          // Snap the first point to the nearest FAT feature and force it
          console.log("Snapping it");
          snapVertexToFatFeature(
            coords[0] as [number, number],
            0,
            updatedFeature.id as string,
            true // Force snapping for the first point
          );

          // Snap the last point to the nearest FAT feature and force it
          if (coords.length > 1) {
            snapVertexToFatFeature(
              coords[coords.length - 1] as [number, number],
              coords.length - 1,
              updatedFeature.id as string,
              true // Force snapping for the last point
            );
          }

          syncLinePointsWithDraw();

          saveState();
        }
      } catch (error) {
        console.error("Error during draw update:", error);
      }
    },
    [snapVertexToFatFeature, saveState, syncLinePointsWithDraw]
  );

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
    saveState();
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
        console.log("Feature clicked:", clickedFeature);
        console.log("First clicked feature:", firstClickedFeature);
        console.log("Last clicked feature:", lastClickedFeature);

        if (!firstClickedFeature) {
          setFirstClickedFeature(clickedFeature);
          setInitialFirstFeatureCoords(coordinates);
          setLinePoints([{ lng: coordinates[0], lat: coordinates[1] }]);
        } else {
          addPointAtFeature(coordinates, clickedFeature);
        }
      } else {
        console.warn("Clicked feature is not a Point.");
      }
    },
    [firstClickedFeature, lastClickedFeature, addPointAtFeature]
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
    syncLinePointsWithDraw();

    if (firstClickedFeature && initialFirstFeatureCoords) {
      const allFeatures = draw.getAll().features;
      const lineFeature = allFeatures.find(
        (feature): feature is Feature<LineString> =>
          feature.geometry.type === "LineString"
      );

      if (!lineFeature) {
        alert("No line drawn.");
        return;
      }

      const latestCoordinates = lineFeature.geometry.coordinates;

      const startPointMatches = checkCoordinatesMatch(
        { lat: latestCoordinates[0][1], lng: latestCoordinates[0][0] },
        initialFirstFeatureCoords
      );

      const lastCoordIndex = latestCoordinates.length - 1;

      let lastPointMatches = false;
      if (lastClickedFeature && initialLastFeatureCoords) {
        lastPointMatches = checkCoordinatesMatch(
          {
            lat: latestCoordinates[lastCoordIndex][1],
            lng: latestCoordinates[lastCoordIndex][0],
          },
          initialLastFeatureCoords
        );
      }

      if (!startPointMatches) {
        alert("The first point does not match the selected feature.");
        return;
      }

      // Handle the case where lastClickedFeature is missing
      const startPointId =
        firstClickedFeature?.properties?.FAT_ID ||
        firstClickedFeature?.properties?.Component_ID;
      const startPointType = firstClickedFeature?.properties?.Type || "Unknown";
      const startPointName = firstClickedFeature?.properties?.Name || "Unknown";

      let endPointId =
        lastClickedFeature?.properties?.FAT_ID ||
        lastClickedFeature?.properties?.Component_ID ||
        0;
      let endPointType = lastClickedFeature?.properties?.Type || "CP";
      let endPointName = lastClickedFeature?.properties?.Name || "";

      if (!lastClickedFeature) {
        // If no last feature, set the last point in the coordinates as the endpoint
        endPointId = 0; // Default ID
        endPointType = "CP"; // Default type
        endPointName = ""; // Empty name
      }

      if (startPointId === endPointId) {
        alert("The first and last features must not be the same.");
        return;
      }

      const lines = latestCoordinates.map((coord: Position) => ({
        Lat: coord[1],
        Long: coord[0],
      }));

      const newRoute = {
        StartPointId: startPointId,
        StartPointType: startPointType,
        EndPointId: endPointId,
        EndPointType: endPointType,
        StartPointName: startPointName,
        EndPointName: endPointName,
        LineType: lineType,
        Lines: lines,
      };

      setUndoStack([]);
      setRedoStack([]);

      return newRoute;
    } else {
      alert("You must connect the first point to a feature to save the line.");
    }
  }, [
    firstClickedFeature,
    lastClickedFeature,
    initialFirstFeatureCoords,
    initialLastFeatureCoords,
    checkCoordinatesMatch,
    removeDrawControl,
    lineType,
    syncLinePointsWithDraw, // Added dependency
  ]);

  useEffect(() => {
    if (firstClickedFeature && lastClickedFeature) {
      setIsConnectedToFeature(true);
    } else {
      setIsConnectedToFeature(false);
    }
  }, [firstClickedFeature, lastClickedFeature]);

  const handleCancelLineDraw = useCallback(() => {
    setLinePoints([]);
    setIsDrawing(false);
    setIsConnectedToFeature(false);
    removeDrawControl();
    setFirstClickedFeature(null);
    setLastClickedFeature(null);
    setInitialFirstFeatureCoords(null);
    setInitialLastFeatureCoords(null);

    setUndoStack([]);
    setRedoStack([]);
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

      setUndoStack([]);
      setRedoStack([]);
      addDrawControlAndStartDrawing();
    },
    [addDrawControlAndStartDrawing]
  );

  const handleDrawDelete = (e: DrawEvent) => {
    try {
      if (!e.features || e.features.length === 0) {
        return;
      }
      saveState();

      const deletedLineStrings = e.features.filter(
        (feature: Feature<Geometry>) => feature.geometry.type === "LineString"
      );

      if (deletedLineStrings.length > 0) {
        const remainingFeatures = draw.getAll().features;
        const remainingLineStrings = remainingFeatures.filter(
          (feature: Feature<Geometry>) => feature.geometry.type === "LineString"
        );

        if (remainingLineStrings.length === 0) {
          handleCancelLineDraw();
          startDrawing(lineType);
        } else {
          // Synchronize linePoints with Mapbox Draw
          syncLinePointsWithDraw();
        }
      }
    } catch (error) {
      console.error("Error during draw delete:", error);
    }
  };
  const handleDrawCreate = useCallback(
    (e: any) => {
      try {
        if (!e.features || e.features.length === 0) return;

        saveState(); // Save the state for undo/redo functionality
        const createdFeature = e.features[0] as Feature<LineString>;

        // Ensure the geometry is a LineString
        if (createdFeature.geometry.type !== "LineString") {
          console.warn("Created feature is not a LineString.");
          return;
        }

        const coords = createdFeature.geometry.coordinates;

        // Ensure coords[0] and coords[coords.length - 1] are valid 2-element arrays
        if (
          Array.isArray(coords) &&
          coords.length > 1 &&
          Array.isArray(coords[0]) &&
          Array.isArray(coords[coords.length - 1]) &&
          coords[0].length >= 2 &&
          coords[coords.length - 1].length >= 2
        ) {
          // Create a new coordinates array to avoid directly mutating the original one
          const newCoords = [...coords];

          // Snap first and last coordinates, if applicable
          if (firstClickedFeature && lastClickedFeature) {
            // Ensure firstClickedFeature and lastClickedFeature have coordinates
            if (
              firstClickedFeature.geometry.type === "Point" &&
              lastClickedFeature.geometry.type === "Point"
            ) {
              const firstCoords = firstClickedFeature.geometry.coordinates as [
                number,
                number,
              ];
              const lastCoords = lastClickedFeature.geometry.coordinates as [
                number,
                number,
              ];

              // Replace only the first and last coordinates while keeping the rest intact
              newCoords[0] = firstCoords;
              newCoords[newCoords.length - 1] = lastCoords;

              // Update the feature's geometry with the new coordinates
              const updatedFeature: Feature<LineString> = {
                ...createdFeature,
                geometry: {
                  type: "LineString",
                  coordinates: newCoords, // Use updated coordinates with snapping
                },
              };

              if (createdFeature.id && typeof createdFeature.id === "string") {
                // Remove the old feature
                draw.delete(createdFeature.id);

                // Add the updated feature
                draw.add(updatedFeature);

                // Optionally, select the feature
                draw.changeMode("simple_select", {
                  featureIds: [String(createdFeature.id)],
                });
              } else {
                console.warn("Created feature has no valid ID.");
              }
            }
          } else {
            // Proceed with snapping logic if first/last features are not available
            snapVertexToFatFeature(
              newCoords[0] as [number, number],
              0,
              createdFeature.id as string,
              true
            );
            snapVertexToFatFeature(
              newCoords[newCoords.length - 1] as [number, number],
              newCoords.length - 1,
              createdFeature.id as string,
              true
            );
          }

          // Always sync line points after creating or modifying features
          syncLinePointsWithDraw();
        } else {
          console.warn("Coordinates are not valid for snapping.");
        }
      } catch (error) {
        console.error("Error during draw create:", error);
      }
    },
    [
      snapVertexToFatFeature,
      saveState,
      syncLinePointsWithDraw,
      firstClickedFeature,
      lastClickedFeature,
    ]
  );

  useEffect(() => {
    if (isDrawing && mapRef.current) {
      mapRef.current.on("draw.delete", handleDrawDelete);
      mapRef.current.on("draw.update", handleDrawUpdate);
      mapRef.current.on("draw.create", handleDrawCreate);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("draw.delete", handleDrawDelete);
        mapRef.current.off("draw.update", handleDrawUpdate);
        mapRef.current.off("draw.create", handleDrawCreate);
      }
    };
  }, [
    isDrawing,
    draw,
    mapRef,
    handleDrawUpdate,
    saveState,
    handleDrawDelete,
    handleDrawCreate,
  ]);

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
      if (
        !isDrawing ||
        !mapRef.current ||
        (firstClickedFeature && lastClickedFeature)
      ) {
        return;
      }

      const clickedFeatures = mapRef.current.queryRenderedFeatures(e.point, {
        layers: fatLayerIds,
      });

      if (clickedFeatures && clickedFeatures.length > 0) {
        handleFeatureClick(clickedFeatures[0]); // Ensure it's correctly set
      } else if (firstClickedFeature && !lastClickedFeature) {
        saveState();
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
    saveState,
    syncLinePointsWithDraw, // Added dependency
  ]);

  const undo = useCallback(() => {
    if (isUndoRedoRunning) {
      console.log("Undo operation is already running, skipping this attempt.");
      return;
    }

    setIsUndoRedoRunning(true);
    console.log("Undo operation started.");

    try {
      if (undoStack.length > 1) {
        // Pop the last state from undoStack
        const currentFeatures = undoStack[undoStack.length - 1];
        const previousFeatures = undoStack[undoStack.length - 2];

        setUndoStack((prevUndoStack) => prevUndoStack.slice(0, -1));
        setRedoStack((prevRedoStack) => [...prevRedoStack, currentFeatures]);

        draw.set(previousFeatures);

        // Synchronize linePoints with Mapbox Draw
        syncLinePointsWithDraw();
      } else if (undoStack.length === 1) {
        const currentFeatures = undoStack[0];
        setUndoStack([]);

        setRedoStack((prevRedoStack) => [...prevRedoStack, currentFeatures]);

        draw.deleteAll();
        setLinePoints([]);
      } else {
        console.log("No more undo steps available.");
      }
    } catch (error) {
      console.error("Error during undo operation:", error);
    } finally {
      setIsUndoRedoRunning(false);
      console.log("Undo operation finished.");
    }
  }, [undoStack, redoStack, draw, isUndoRedoRunning, syncLinePointsWithDraw]);

  const redo = useCallback(() => {
    if (isUndoRedoRunning) {
      console.log("Redo operation is already running, skipping this attempt.");
      return;
    }

    setIsUndoRedoRunning(true);

    try {
      if (redoStack.length > 0) {
        const nextFeatures = redoStack[redoStack.length - 1];

        setRedoStack((prevRedoStack) => prevRedoStack.slice(0, -1));
        setUndoStack((prevUndoStack) => [...prevUndoStack, draw.getAll()]);

        draw.set(nextFeatures);

        // Synchronize linePoints with Mapbox Draw
        syncLinePointsWithDraw();
      } else {
        console.log("No more redo steps available.");
      }
    } catch (error) {
      console.error("Error during redo operation:", error);
    } finally {
      setIsUndoRedoRunning(false);
      console.log("Redo operation finished.");
    }
  }, [redoStack, undoStack, draw, isUndoRedoRunning, syncLinePointsWithDraw]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      const preventContextMenu = (
        e: mapboxgl.MapMouseEvent & mapboxgl.Event
      ) => {
        if (isDrawing) {
          e.preventDefault();
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
          undo();
        }
      };

      map.on("contextmenu", preventContextMenu);

      return () => {
        map.off("contextmenu", preventContextMenu);
      };
    }
  }, [isDrawing, undo, mapRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.key === "Y" || e.key === "y")) {
        e.preventDefault();
        redo();
      }
    };

    if (isDrawing) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawing, undo, redo]);

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
    removeDrawControl,
    setIsDrawing,
    undo,
    redo,
  };
};
