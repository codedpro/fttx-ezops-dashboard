import { useState, MutableRefObject, useCallback, useEffect } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl from "mapbox-gl";
import {
  LineString,
  Feature,
  Geometry,
  Point,
  Position,
  FeatureCollection,
} from "geojson";
import { throttle } from "lodash";
import { distance } from "@turf/turf";
import axios from "axios";
declare module "mapbox-gl" {
  export interface Map {
    on(
      type:
        | "draw.create"
        | "draw.delete"
        | "draw.update"
        | "draw.selectionchange",
      listener: (e: any) => void
    ): this;
    off(
      type:
        | "draw.create"
        | "draw.delete"
        | "draw.update"
        | "draw.selectionchange",
      listener: (e: any) => void
    ): this;
  }
}

export const useLineEditing = (
  mapRef: MutableRefObject<mapboxgl.Map | null>,
  fatLayerIds: string[]
) => {
  const [liveMeters, setLiveMeters] = useState<string>("0");
  const [isEditing, setIsEditing] = useState(false);
  const [lineType, setLineType] = useState<string | null>(null);
  const [startFatFeature, setStartFatFeature] = useState<Feature<Point> | null>(
    null
  );
  const [endFatFeature, setEndFatFeature] = useState<Feature<Point> | null>(
    null
  );

  const snappingDistance = 0.01;

  const MAX_STACK_SIZE = 2000;
  const [undoStack, setUndoStack] = useState<FeatureCollection[]>([]);
  const [redoStack, setRedoStack] = useState<FeatureCollection[]>([]);
  const [isUndoRedoRunning, setIsUndoRedoRunning] = useState(false);

  const draw = useState(
    () =>
      new MapboxDraw({
        displayControlsDefault: true,
        controls: {},
        defaultMode: "simple_select",
      })
  )[0];

  const addDrawControl = () => {
    if (mapRef.current && draw && !mapRef.current.hasControl(draw)) {
      mapRef.current.addControl(draw);
    }
  };

  const removeDrawControl = () => {
    if (mapRef.current && draw) {
      mapRef.current.removeControl(draw);
    }
  };

  const isPoint = (geometry: Geometry): geometry is Point => {
    return geometry.type === "Point";
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

        if (newLinePoints.length > 1) {
          let totalDistance = 0;
          for (let i = 1; i < newLinePoints.length; i++) {
            const from = [newLinePoints[i - 1].lng, newLinePoints[i - 1].lat];
            const to = [newLinePoints[i].lng, newLinePoints[i].lat];
            totalDistance += distance(from, to, { units: "meters" });
          }
          setLiveMeters(totalDistance.toFixed(2));
        }
      }
    }, 50),
    [draw]
  );

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
    featureId: string
  ) => {
    const feature = draw.getAll().features[0];

    if (feature && feature.geometry && feature.geometry.type === "LineString") {
      const updatedCoords = [...(feature.geometry as LineString).coordinates];

      // Only proceed if the vertex is the first or last point
      if (vertexIndex === 0 || vertexIndex === updatedCoords.length - 1) {
        const closestFatFeature = getClosestFatFeature(coords);

        if (closestFatFeature) {
          const snappedCoords = closestFatFeature.geometry.coordinates;
          updatedCoords[vertexIndex] = snappedCoords;

          draw.set({
            type: "FeatureCollection",
            features: [
              {
                ...feature,
                geometry: { type: "LineString", coordinates: updatedCoords },
              },
            ],
          });

          if (vertexIndex === 0) {
            setStartFatFeature(closestFatFeature);
          } else if (vertexIndex === updatedCoords.length - 1) {
            setEndFatFeature(closestFatFeature);
          }
        }
        // Do not reset startFatFeature or endFatFeature to null
      }
      // For other vertices, do nothing (no snapping)
    }
  };

  const handleDrawUpdate = useCallback(
    (e: any) => {
      saveState();
      const updatedFeature = e.features[0] as Feature<LineString>;
      updatedFeature.geometry.coordinates.forEach((coord, index) => {
        snapVertexToFatFeature(
          coord as [number, number],
          index,
          updatedFeature.id as string
        );
      });
      syncLinePointsWithDraw();
    },
    [snapVertexToFatFeature, saveState]
  );

  const undo = useCallback(() => {
    if (isUndoRedoRunning || undoStack.length === 0) {
      console.log("No undo steps available or operation is running.");
      return;
    }

    syncLinePointsWithDraw();
    setIsUndoRedoRunning(true);

    try {
      const currentFeatures = draw.getAll();

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
  }, [undoStack, redoStack, draw, isUndoRedoRunning, syncLinePointsWithDraw]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && (e.key === "Y" || e.key === "y")) {
        e.preventDefault();
        redo();
      }
    };

    if (isEditing) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, undo, redo]);
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      const preventContextMenu = (
        e: mapboxgl.MapMouseEvent & mapboxgl.Event
      ) => {
        if (isEditing) {
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
  }, [isEditing, undo, mapRef]);

  const handleFinishEditing = useCallback(() => {
    console.log(startFatFeature, endFatFeature);
    if (startFatFeature && endFatFeature) {
      const feature = draw.getAll().features[0] as Feature<LineString>;

      if (
        feature &&
        feature.geometry &&
        feature.geometry.type === "LineString"
      ) {
        const latestCoordinates = feature.geometry.coordinates;

        const startPointId =
          startFatFeature.properties?.FAT_ID ||
          startFatFeature.properties?.Component_ID;
        const startPointType = startFatFeature.properties?.Type || "Unknown";
        const startPointName = startFatFeature.properties?.Name || "Unknown";
        const startPointChain_ID =
          startFatFeature.properties?.Chain_ID || "Unknown";
        const endPointId =
          endFatFeature.properties?.FAT_ID ||
          endFatFeature.properties?.Component_ID;
        const endPointType = endFatFeature.properties?.Type || "Unknown";
        const endPointName = endFatFeature.properties?.Name || "Unknown";
        const endPointChain_ID =
          endFatFeature.properties?.Chain_ID || "Unknown";

        if (startPointId === endPointId) {
          alert("The first and last features must not be the same.");
          return;
        }

        const lines = latestCoordinates.map((coord: Position) => ({
          Lat: coord[1],
          Long: coord[0],
        }));
        const chainId = feature.id;

        const newRoute = {
          lines: lines,
          line_Chain_ID: chainId,
          first_Chain_ID: startPointChain_ID,
          second_Chain_ID: endPointChain_ID,
        };
        console.log(newRoute);

        setUndoStack([]);
        setRedoStack([]);

        return newRoute;
      } else {
        console.error("Feature or geometry is missing.");
      }
    } else {
      alert(
        "The first and last points must be snapped to a FAT feature before finishing."
      );
    }
  }, [startFatFeature, endFatFeature, removeDrawControl, draw]);

  const startEditingLine = useCallback(
    (lineData: {
      coordinates: [number, number][];
      chainId: number | null;
      type: string | null;
    }) => {
      if (lineData?.coordinates?.length && lineData.chainId !== null) {
        setIsEditing(true);
        setStartFatFeature(null);
        setEndFatFeature(null);
        setLineType(lineData?.type);
        addDrawControl();

        const lineFeature: Feature<LineString> = {
          id: String(lineData.chainId),
          type: "Feature",
          geometry: { type: "LineString", coordinates: lineData.coordinates },
          properties: {},
        };

        draw.add(lineFeature);
        draw.changeMode("direct_select", {
          featureId: String(lineData.chainId),
        });
        syncLinePointsWithDraw();

        saveState();
      } else {
        console.error("Invalid LineData: Missing coordinates or chainId");
      }
    },
    [addDrawControl, draw, saveState]
  );

  useEffect(() => {
    if (mapRef.current && isEditing) {
      mapRef.current.on("draw.update", handleDrawUpdate);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("draw.update", handleDrawUpdate);
      }
    };
  }, [mapRef, isEditing, handleDrawUpdate]);

  const handleCancelEditing = useCallback(() => {
    draw.deleteAll();
    removeDrawControl();
    setIsEditing(false);
    setStartFatFeature(null);
    setLiveMeters("0");
    setEndFatFeature(null);

    setUndoStack([]);
    setRedoStack([]);
  }, [removeDrawControl, draw]);

  const suggestLine = useCallback(async () => {
    if (!startFatFeature || !endFatFeature) {
      alert("Please draw a line connecting two features.");
      return;
    }

    const currentFeature = draw.getAll().features[0] as Feature<LineString>;
    const coords = currentFeature?.geometry.coordinates;

    syncLinePointsWithDraw();
    if (!coords || coords.length < 2) {
      alert("Not enough points to suggest a line.");
      return;
    }

    try {
      const firstCoords = (startFatFeature.geometry as Point).coordinates as [
        number,
        number,
      ];
      const lastCoords = (endFatFeature.geometry as Point).coordinates as [
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

        // Construct the updated suggested route
        const updatedSuggestedRoute = [
          firstCoords,
          ...suggestedRoute,
          lastCoords,
        ];

        // Filter out duplicate coordinates
        const uniqueCoordinates = updatedSuggestedRoute.filter(
          (coord, index, self) =>
            index ===
            self.findIndex((c) => c[0] === coord[0] && c[1] === coord[1])
        );

        const updatedFeature: Feature<LineString> = {
          ...currentFeature,
          geometry: {
            type: "LineString",
            coordinates: uniqueCoordinates,
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
  }, [startFatFeature, endFatFeature, draw, saveState]);

  useEffect(() => {
    const snapFirstFeature = async () => {
      if (startFatFeature && startFatFeature.geometry.type === "Point") {
        const allFeatures = draw.getAll().features;
        const lineFeature = allFeatures.find(
          (feature): feature is Feature<LineString> =>
            feature.geometry.type === "LineString"
        );

        if (!lineFeature) {
          alert("No line drawn.");
          return;
        }

        let latestCoordinates = lineFeature.geometry.coordinates;

        if (lineFeature.id) {
          await snapVertexToFatFeature(
            latestCoordinates[0].slice(0, 2) as [number, number],
            0,
            String(lineFeature.id!)
          );

          latestCoordinates = [...lineFeature.geometry.coordinates];
        }
      }
    };

    snapFirstFeature();
  }, [startFatFeature?.geometry.type]);

  useEffect(() => {
    console.log(startFatFeature, endFatFeature);
  }, [startFatFeature, endFatFeature]);
  return {
    isEditing,
    startEditingLine,
    handleFinishEditing,
    handleCancelEditing,
    setIsEditing,
    liveMeters,
    suggestLine,
    undo,
    redo,
  };
};
