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
import { throttle } from "lodash";
import { distance } from "@turf/turf";
import axios from "axios";

export const useLineDrawing = (
  mapRef: MutableRefObject<mapboxgl.Map | null>,
  fatLayerIds: string[]
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [linePoints, setLinePoints] = useState<{ lat: number; lng: number }[]>(
    []
  );
  const [liveMeters, setLiveMeters] = useState<string>("0");
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
  const MAX_STACK_SIZE = 2000;
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

        if (mapRef.current.getCanvas().style.cursor !== "crosshair") {
          mapRef.current.getCanvas().style.cursor = "crosshair";
        }

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
    setUndoStack((prevUndoStack) => {
      const newStack = [...prevUndoStack, currentFeatures];
      if (newStack.length > MAX_STACK_SIZE) {
        newStack.shift();
      }
      return newStack;
    });
    setRedoStack([]);
  }, [draw]);

  const snapVertexToFatFeature = (
    coords: [number, number],
    vertexIndex: number,
    featureId: string,
    shouldForceSnap: boolean = false
  ) => {
    syncLinePointsWithDraw();

    const feature = draw.getAll().features.find((f) => f.id === featureId);

    if (feature && feature.geometry.type === "LineString") {
      const updatedCoords = [...(feature.geometry as LineString).coordinates];

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

  const syncLinePointsWithDraw = useCallback(
    throttle(() => {
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

        setLinePoints((prev) => {
          const hasChanged =
            JSON.stringify(prev) !== JSON.stringify(newLinePoints);
          return hasChanged ? newLinePoints : prev;
        });

        if (newLinePoints.length > 1) {
          let totalDistance = 0;
          for (let i = 1; i < newLinePoints.length; i++) {
            const from = [newLinePoints[i - 1].lng, newLinePoints[i - 1].lat];
            const to = [newLinePoints[i].lng, newLinePoints[i].lat];
            totalDistance += distance(from, to, { units: "meters" });
          }
          setLiveMeters(totalDistance.toFixed(2));
        }
      } else {
        setLinePoints((prev) => (prev.length > 0 ? [] : prev));
      }
    }, 50),
    [draw]
  );

  const handleDrawUpdate = useCallback(
    (e: any) => {
      try {
        if (!e.features || e.features.length === 0) {
          return;
        }
        syncLinePointsWithDraw();

        const updatedFeature = e.features[0] as Feature<LineString>;
        const coords = updatedFeature.geometry.coordinates;
        if (coords.length >= 1) {
          snapVertexToFatFeature(
            coords[0] as [number, number],
            0,
            updatedFeature.id as string,
            true
          );

          if (coords.length > 1) {
            snapVertexToFatFeature(
              coords[coords.length - 1] as [number, number],
              coords.length - 1,
              updatedFeature.id as string,
              true
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

  // In handleFeatureClick, ensure the line continuation is triggered for LineString features
  const handleFeatureClick = useCallback(
    (clickedFeature: Feature) => {
      const geometry = clickedFeature.geometry;

      if (geometry.type === "Point") {
        // Handle clicking on a point feature
        const coordinates = geometry.coordinates as [number, number];
        console.log("Feature clicked (Point):", clickedFeature);

        if (!firstClickedFeature) {
          setFirstClickedFeature(clickedFeature);
          setInitialFirstFeatureCoords(coordinates);
          setLinePoints([{ lng: coordinates[0], lat: coordinates[1] }]);
        } else {
          addPointAtFeature(coordinates, clickedFeature);
        }
      } else {
        console.warn("Clicked feature is neither a Point nor a LineString.");
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
        endPointId = 0;
        endPointType = "CP";
        endPointName = "";
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
    syncLinePointsWithDraw,
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

        const createdFeature = e.features[0] as Feature<LineString>;

        if (createdFeature.geometry.type !== "LineString") {
          console.warn("Created feature is not a LineString.");
          return;
        }

        const coords = createdFeature.geometry.coordinates;

        if (
          Array.isArray(coords) &&
          coords.length > 1 &&
          Array.isArray(coords[0]) &&
          Array.isArray(coords[coords.length - 1]) &&
          coords[0].length >= 2 &&
          coords[coords.length - 1].length >= 2
        ) {
          const newCoords = [...coords];

          if (firstClickedFeature && lastClickedFeature) {
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

              newCoords[0] = firstCoords;
              newCoords[newCoords.length - 1] = lastCoords;

              const updatedFeature: Feature<LineString> = {
                ...createdFeature,
                geometry: {
                  type: "LineString",
                  coordinates: newCoords,
                },
              };

              if (createdFeature.id && typeof createdFeature.id === "string") {
                draw.delete(createdFeature.id);

                draw.add(updatedFeature);

                draw.changeMode("simple_select", {
                  featureIds: [String(updatedFeature.id)],
                });
              } else {
                console.warn("Created feature has no valid ID.");
              }
            }
          } else {
            if (createdFeature.id) {
              snapVertexToFatFeature(
                newCoords[0] as [number, number],
                0,
                String(createdFeature.id),
                true
              );
              snapVertexToFatFeature(
                newCoords[newCoords.length - 1] as [number, number],
                newCoords.length - 1,
                String(createdFeature.id),
                true
              );
            }
          }

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
        handleFeatureClick(clickedFeatures[0]);
      } else if (firstClickedFeature && !lastClickedFeature) {
        saveState();
        syncLinePointsWithDraw();
        /*     const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        setLinePoints((prev) => [
          ...prev,
          { lng: coordinates[0], lat: coordinates[1] },
        ]); */
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
    syncLinePointsWithDraw,
  ]);
  const submitLineToMapboxDraw = (features: FeatureCollection) => {
    try {
      // Ensure that there are features to submit
      if (features.features.length > 0) {
        features.features.forEach((feature) => {
          if (feature.geometry.type === "LineString") {
            // Submit the feature to Mapbox Draw and get the new feature's ID
            const featureIds = draw.add({
              type: "Feature",
              geometry: feature.geometry,
              properties: feature.properties, // Keep the properties unchanged
            });

            // Ensure that featureIds is not empty and contains valid IDs
            if (featureIds.length > 0) {
              const newFeatureId = featureIds[0]; // Access the first feature ID

              // Optional: Unselect the current drawing mode after submission
              draw.changeMode("simple_select", {
                featureIds: [newFeatureId], // Use the ID to select the new feature
              });
            }

            // Deselect the feature to exit selection mode
            draw.changeMode("simple_select");
          }
        });

        // Optionally, quit the drawing mode after submission
        draw.changeMode("simple_select");
      }
    } catch (error) {
      console.error("Error submitting features to Mapbox Draw:", error);
    }
  };

  const undo = useCallback(() => {
    if (isUndoRedoRunning || undoStack.length === 0) {
      console.log("No undo steps available or operation is running.");
      return;
    }

    syncLinePointsWithDraw();
    setIsUndoRedoRunning(true);

    try {
      const currentFeatures = draw.getAll();

      if (currentFeatures.features.length > 0) {
        submitLineToMapboxDraw(currentFeatures);
      }

      const previousFeatures = undoStack.pop();
      const lastFeatures = undoStack[undoStack.length - 1] || null;

      if (lastFeatures) {
        setRedoStack((prevRedoStack) => [...prevRedoStack, currentFeatures]);
        draw.set(lastFeatures);
      } else {
        if (currentFeatures) {
          setRedoStack((prevRedoStack) => [...prevRedoStack, currentFeatures]);
        }
        draw.deleteAll();
        setLinePoints([]);
      }

      const remainingFeatures = draw.getAll().features;
      if (remainingFeatures.length > 0) {
        const lastFeatureId = remainingFeatures[0].id;
        if (lastFeatureId) {
          draw.changeMode("direct_select", {
            featureId: String(lastFeatureId),
          });
        }
      } else {
        draw.changeMode("draw_line_string");
      }
    } catch (error) {
      console.error("Error during undo operation:", error);
    } finally {
      setIsUndoRedoRunning(false);
      syncLinePointsWithDraw();
    }
  }, [undoStack, redoStack, draw, isUndoRedoRunning]);

  const redo = useCallback(() => {
    if (isUndoRedoRunning || redoStack.length === 0) {
      console.log("No redo steps available or operation is running.");
      return;
    }

    setIsUndoRedoRunning(true);
    syncLinePointsWithDraw();
    try {
      const nextFeatures = redoStack.pop();

      if (nextFeatures) {
        setUndoStack((prevUndoStack) => [...prevUndoStack, draw.getAll()]);
        draw.set(nextFeatures);
        syncLinePointsWithDraw();
      }
    } catch (error) {
      console.error("Error during redo operation:", error);
    } finally {
      setIsUndoRedoRunning(false);
      syncLinePointsWithDraw();
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

  const suggestLine = useCallback(async () => {
    if (!firstClickedFeature || !lastClickedFeature) {
      alert("Please draw a line connecting two features.");
      return;
    }

    const currentFeature = draw.getAll().features[0] as Feature<LineString>;
    const coords = currentFeature?.geometry.coordinates;
    saveState();
    syncLinePointsWithDraw();
    if (!coords || coords.length < 2) {
      alert("Not enough points to suggest a line.");
      return;
    }

    try {
      const firstCoords = (firstClickedFeature.geometry as Point)
        .coordinates as [number, number];
      const lastCoords = (lastClickedFeature.geometry as Point).coordinates as [
        number,
        number,
      ];

      const waypoints = [
        `${firstCoords[0]},${firstCoords[1]}`,
        ...coords.map((point) => `${point[0]},${point[1]}`),
        `${lastCoords[0]},${lastCoords[1]}`,
      ].join(";");

      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${waypoints}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}`
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const suggestedRoute = response.data.routes[0].geometry.coordinates;

        const updatedSuggestedRoute = [
          firstCoords,
          ...suggestedRoute,
          lastCoords,
        ];

        const updatedFeature: Feature<LineString> = {
          ...currentFeature,
          geometry: {
            type: "LineString",
            coordinates: updatedSuggestedRoute,
          },
        };

        draw.set({
          type: "FeatureCollection",
          features: [updatedFeature],
        });

        saveState();
        syncLinePointsWithDraw();
      } else {
        alert("Could not find a route.");
      }
    } catch (error) {
      console.error("Error fetching route from Mapbox Directions API:", error);
      alert("Error fetching the suggested line. Please try again.");
    }
  }, [firstClickedFeature, lastClickedFeature, draw, saveState]);

  return {
    isDrawing,
    startDrawing,
    handleFinishLineDraw,
    handleCancelLineDraw,
    linePoints,
    removeDrawControl,
    setIsDrawing,
    undo,
    redo,
    liveMeters,
    suggestLine,
  };
};
