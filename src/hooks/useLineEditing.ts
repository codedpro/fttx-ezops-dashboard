import { useState, MutableRefObject, useCallback, useEffect } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl from "mapbox-gl";
import { LineString, Feature, Geometry, Point } from "geojson";

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
  const [isEditing, setIsEditing] = useState(false);
  const [startFatFeature, setStartFatFeature] = useState<Feature<Point> | null>(
    null
  );
  const [endFatFeature, setEndFatFeature] = useState<Feature<Point> | null>(
    null
  );

  const snappingDistance = 0.0001;

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

  const snapVertexToFatFeature = (
    coords: [number, number],
    vertexIndex: number,
    featureId: string
  ) => {
    const closestFatFeature = getClosestFatFeature(coords);

    if (closestFatFeature) {
      const snappedCoords = closestFatFeature.geometry.coordinates;
      const feature = draw.getAll().features[0];

      if (
        feature &&
        feature.geometry &&
        feature.geometry.type === "LineString"
      ) {
        const updatedCoords = [...(feature.geometry as LineString).coordinates];
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
    } else {
      if (vertexIndex === 0) {
        setStartFatFeature(null);
      } else if (vertexIndex === coords.length - 1) {
        setEndFatFeature(null);
      }
    }
  };

  const handleDrawUpdate = useCallback(
    (e: any) => {
      const updatedFeature = e.features[0] as Feature<LineString>;
      updatedFeature.geometry.coordinates.forEach((coord, index) => {
        snapVertexToFatFeature(
          coord as [number, number],
          index,
          updatedFeature.id as string
        );
      });
    },
    [snapVertexToFatFeature]
  );

  const handleFinishEditing = useCallback(() => {
    console.log(startFatFeature, endFatFeature);
    if (startFatFeature && endFatFeature) {
      const feature = draw.getAll().features[0] as Feature<LineString>;

      if (
        feature &&
        feature.geometry &&
        feature.geometry.type === "LineString"
      ) {
        const updatedLine = {
          coordinates: feature.geometry.coordinates,
          chainId: feature.id,
        };

        console.log("Updated line coordinates:", updatedLine.coordinates);
        console.log("Chain ID:", updatedLine.chainId);
        console.log("Start FAT Feature:", startFatFeature);
        console.log("End FAT Feature:", endFatFeature);

        setIsEditing(false);
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
    (lineData: { coordinates: [number, number][]; chainId: number | null }) => {
      if (lineData?.coordinates?.length && lineData.chainId !== null) {
        setIsEditing(true);
        setStartFatFeature(null);
        setEndFatFeature(null);

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
      } else {
        console.error("Invalid LineData: Missing coordinates or chainId");
      }
    },
    [addDrawControl, draw]
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
    removeDrawControl();
    setIsEditing(false);
    setStartFatFeature(null);
    setEndFatFeature(null);
  }, [removeDrawControl]);

  return {
    isEditing,
    startEditingLine,
    handleFinishEditing,
    handleCancelEditing,
  };
};
