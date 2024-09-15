import { useState, useCallback, useEffect } from "react";
import { LineString, FeatureCollection, Feature, Point } from "geojson";
import mapboxgl from "mapbox-gl";

export const useCustomFATLine = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  fatLayerId: string
) => {
  const [drawnLine, setDrawnLine] = useState<LineString | null>(null);
  const [lineCoordinates, setLineCoordinates] = useState<
    Array<[number, number]>
  >([]);
  const [lineColor, setLineColor] = useState<string>("#ff0000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [geoJson, setGeoJson] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [isConnectedToFAT, setIsConnectedToFAT] = useState(false);
  const [fatCoordinate, setFatCoordinate] = useState<[number, number] | null>(
    null
  );
  const [startFeature, setStartFeature] = useState<Feature<Point> | null>(null);
  const [fatFeatureData, setFatFeatureData] = useState<any>(null);

  const updateMapLayer = useCallback(
    (coordinates: Array<[number, number]>, points: Array<[number, number]>) => {
      const lineFeature: Feature<LineString> = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {},
      };

      const pointFeatures: Feature<Point>[] = points.map((coord) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coord,
        },
        properties: {},
      }));

      const updatedGeoJson: FeatureCollection = {
        type: "FeatureCollection",
        features: [lineFeature, ...pointFeatures],
      };

      const sourceId = "line-drawing";

      if (mapRef.current?.getSource(sourceId)) {
        (mapRef.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(
          updatedGeoJson
        );
      } else {
        mapRef.current?.addSource(sourceId, {
          type: "geojson",
          data: updatedGeoJson,
        });

        mapRef.current?.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": lineColor,
            "line-width": 3,
          },
        });

        mapRef.current?.addLayer({
          id: `${sourceId}-points`,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 5,
            "circle-color": "#808080",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
          },
          filter: ["==", "$type", "Point"],
        });
      }

      setGeoJson(updatedGeoJson);
    },
    [mapRef, lineColor]
  );

  const handleStartDrawing = useCallback(
    (startFeature: Feature<Point>) => {
      const startCoordinate: [number, number] = [
        (startFeature as any).Long,
        (startFeature as any).Lat,
      ];
      setStartFeature(startFeature);
      setLineCoordinates([startCoordinate]);
      setIsDrawing(true);
      setIsConnectedToFAT(false);
      updateMapLayer([startCoordinate], [startCoordinate]);
    },
    [updateMapLayer]
  );

  const handleDrawNextPoint = useCallback(
    (nextCoordinate: [number, number]) => {
      if (isDrawing) {
        setLineCoordinates((prevCoords) => {
          const newCoords = [...prevCoords, nextCoordinate];
          updateMapLayer(newCoords, newCoords);
          return newCoords;
        });
      }
    },
    [isDrawing, updateMapLayer]
  );

  const handleConnectToFAT = useCallback(
    (fatFeature: Feature) => {
      const geometry = fatFeature.geometry;

      if (geometry.type === "Point") {
        const fatCoordinates: [number, number] = [
          fatFeature.properties?.Long,
          fatFeature.properties?.Lat,
        ];

        setLineCoordinates((prevCoords) => {
          const newCoords = [...prevCoords, fatCoordinates];
          updateMapLayer(newCoords, newCoords);
          setIsConnectedToFAT(true);
          setFatCoordinate(fatCoordinates);
          setFatFeatureData(fatFeature.properties);
          return newCoords;
        });
      }
    },
    [updateMapLayer]
  );

  const handleUndoLastPoint = useCallback(() => {
    setLineCoordinates((prevCoords) => {
      if (prevCoords.length <= 1) return prevCoords;
      const newCoords = prevCoords.slice(0, -1);
      updateMapLayer(newCoords, newCoords);
      return newCoords;
    });
  }, [updateMapLayer]);

  const handleCancelLine = useCallback(() => {
    const sourceId = "line-drawing";

    if (mapRef.current?.getLayer(`${sourceId}-points`)) {
      mapRef.current.removeLayer(`${sourceId}-points`);
    }

    if (mapRef.current?.getLayer(sourceId)) {
      mapRef.current.removeLayer(sourceId);
    }

    if (mapRef.current?.getSource(sourceId)) {
      mapRef.current.removeSource(sourceId);
    }

    setLineCoordinates([]);
    setIsDrawing(false);
    setGeoJson({
      type: "FeatureCollection",
      features: [],
    });
    setIsConnectedToFAT(false);
    setFatCoordinate(null);
    setStartFeature(null);
  }, [mapRef]);

  const handleColorChange = useCallback(
    (color: string) => {
      setLineColor(color);

      const sourceId = "line-drawing";

      if (mapRef.current?.getLayer(sourceId)) {
        mapRef.current.setPaintProperty(sourceId, "line-color", color);
      }
    },
    [mapRef]
  );

  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const fatFeatures = mapRef.current?.queryRenderedFeatures(e.point, {
        layers: [fatLayerId],
      });

      if (fatFeatures && fatFeatures.length > 0) {
        const fatFeature = fatFeatures[0];
        handleConnectToFAT(fatFeature);
      } else if (isDrawing) {
        const newCoordinate: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        handleDrawNextPoint(newCoordinate);
      }
    };

    mapRef.current.on("click", handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
      }
    };
  }, [isDrawing, fatLayerId, handleDrawNextPoint, handleConnectToFAT, mapRef]);

  const handleSaveLine = useCallback(() => {
    if (lineCoordinates.length > 1 && isConnectedToFAT && fatCoordinate) {
      const lastCoordinate = lineCoordinates[lineCoordinates.length - 1];
      if (
        lastCoordinate[0] === fatCoordinate[0] &&
        lastCoordinate[1] === fatCoordinate[1]
      ) {
        const lineString: LineString = {
          type: "LineString",
          coordinates: lineCoordinates,
        };

        console.log("Line Coordinates:", lineCoordinates);
        console.log("FAT_ID:", fatFeatureData);
        console.log("Start Feature Data:", startFeature);

        setDrawnLine(lineString);
        handleCancelLine();
      } else {
        alert("The last point must be connected to a FAT to save.");
      }
    } else {
      alert("The last point must be connected to a FAT to save.");
    }
  }, [
    lineCoordinates,
    isConnectedToFAT,
    fatCoordinate,
    fatFeatureData,
    startFeature,
    handleCancelLine,
  ]);

  return {
    drawnLine,
    lineCoordinates,
    isDrawing,
    lineColor,
    handleStartDrawing,
    handleDrawNextPoint,
    handleUndoLastPoint,
    handleSaveLine,
    handleCancelLine,
    handleColorChange,
  };
};
