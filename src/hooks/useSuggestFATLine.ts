import { NearybyFATs } from "@/types/NearbyFATs";
import { useState, useCallback, useRef } from "react";
import { LineString } from "geojson";
import mapboxgl from "mapbox-gl";

const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
) => {
  const R = 6371e3;
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const lat1 = toRad(coord1[1]);
  const lat2 = toRad(coord2[1]);
  const deltaLat = toRad(coord2[1] - coord1[1]);
  const deltaLong = toRad(coord2[0] - coord1[0]);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLong / 2) *
      Math.sin(deltaLong / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export interface FeatureProperties {
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

const generateUniqueId = () =>
  `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const generateUniqueColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export const useSuggestFATLine = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) => {
  const [suggestedPaths, setSuggestedPaths] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [isPathPanelOpen, setIsPathPanelOpen] = useState(false);
  const isCanceled = useRef(false);

  const fetchNearbyFATs = async (featureProperties: FeatureProperties) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/GetNearbyFATs`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer CBNAIGF8QGBBAJSDIUGTjbwfe34!@#$@#%sgdvcfwe;ppo,n6789",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            Lat: featureProperties.Lat.toString(),
            Long: featureProperties.Long.toString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch nearby FATs");
      }

      const data: NearybyFATs[] = await response.json();

      return data;
    } catch (error) {
      console.error("Error fetching nearby FATs:", error);
      return [];
    }
  };

  const animateLine = (
    pathId: string,
    path: LineString,
    color: string,
    duration: number
  ) => {
    let startTime: number | null = null;
    const totalSteps = 1000;

    const animate = (timestamp: number) => {
      if (isCanceled.current) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const step = Math.floor(progress * totalSteps);
      const numCoordinates = Math.floor(
        step * (path.coordinates.length / totalSteps)
      );
      const coordinates = path.coordinates.slice(0, numCoordinates);

      if (mapRef.current) {
        const source = mapRef.current.getSource(
          pathId
        ) as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
            properties: {},
          });
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const generateAndAnimatePath = async (
    featureProperties: FeatureProperties,
    fat: NearybyFATs,
    delay: number
  ) => {
    if (isCanceled.current) return;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${featureProperties.Long},${featureProperties.Lat};${fat.FAT_Long},${fat.FAT_Lat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}`;
      const response = await fetch(url);
      const data = await response.json();
      //  console.log(data);

      if (data.routes && data.routes.length > 0 && !isCanceled.current) {
        const path = data.routes[0];
        const color = generateUniqueColor();
        const pathId = generateUniqueId();

        const lastPoint = path.geometry.coordinates[
          path.geometry.coordinates.length - 1
        ] as [number, number];
        const fatPosition: [number, number] = [fat.FAT_Long, fat.FAT_Lat];
        const manualDistance = calculateDistance(lastPoint, fatPosition);

        const extendedPath: LineString = {
          type: "LineString",
          coordinates: [
            [featureProperties.Long, featureProperties.Lat],
            ...path.geometry.coordinates,
            fatPosition,
          ],
        };

        const realDistance = path.distance + manualDistance;

        setTimeout(() => {
          if (isCanceled.current || !mapRef.current) return;

          mapRef.current.addSource(pathId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: extendedPath,
              properties: {},
            },
          });

          mapRef.current.addLayer({
            id: pathId,
            type: "line",
            source: pathId,
            paint: {
              "line-color": color,
              "line-width": 6,
            },
          });

          setSuggestedPaths((prevPaths) => [
            ...prevPaths,
            { id: pathId, color, path: extendedPath },
          ]);

          animateLine(pathId, extendedPath, color, 3000);

          if (mapRef.current.getLayer(pathId)) {
            mapRef.current.on("mouseenter", pathId, () => {
              mapRef.current!.getCanvas().style.cursor = "pointer";
            });

            mapRef.current.on("mouseleave", pathId, () => {
              mapRef.current!.getCanvas().style.cursor = "";
            });

            mapRef.current.on("click", pathId, () => {
              setSelectedPath({
                path_id: pathId,
                color,
                Modem_ID: featureProperties.ID,
                Modem_EshopID: featureProperties.Eshop_ID,
                FAT_ID: fat.FAT_ID,
                FAT_Name: fat.Name,
                path: extendedPath,
                originalDistance: path.distance,
                manualDistance,
                realDistance,
                duration: path.duration,
              });
              setIsPathPanelOpen(true);
            });
          }
        }, delay);
      }
    } catch (error) {
      console.error("Error generating paths:", error);
    }
  };

  const generatePaths = async (
    featureProperties: FeatureProperties,
    nearbyFATs: NearybyFATs[]
  ) => {
    nearbyFATs.forEach((fat, index) => {
      generateAndAnimatePath(featureProperties, fat, index * 1500);
    });
  };

  const handleSuggestFATLine = useCallback(
    async (featureProperties: FeatureProperties) => {
      isCanceled.current = false;
      const nearbyFATs = await fetchNearbyFATs(featureProperties);
      if (nearbyFATs.length > 0) {
        generatePaths(featureProperties, nearbyFATs);
      } else {
        alert("No FAT nearby this Pre Order.");
      }
    },
    []
  );

  const handleSavePath = useCallback(async () => {
    if (selectedPath) {
      setIsPathPanelOpen(false);
      console.log(selectedPath);
      console.log(
        "Saving path:",
        JSON.stringify({
          path: selectedPath,
        })
      );
      try {
        const response = await fetch("/your-api-endpoint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: selectedPath,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save the path.");
        }

        const result = await response.json();
        console.log("Save response:", result);
      } catch (error) {
        console.error("Error saving the path:", error);
      }
    }
  }, [selectedPath, setIsPathPanelOpen]);

  const handleCancelPath = () => {
    setIsPathPanelOpen(false);
    setSelectedPath(null);
  };

  const removeSuggestedPaths = () => {
    const map = mapRef.current;
    if (!map) return;

    isCanceled.current = true;

    suggestedPaths.forEach((path) => {
      if (map.getLayer(path.id)) {
        map.removeLayer(path.id);
      }
      if (map.getSource(path.id)) {
        map.removeSource(path.id);
      }
    });

    setSuggestedPaths([]);
  };

  return {
    suggestedPaths,
    handleSuggestFATLine,
    handleSavePath,
    handleCancelPath,
    removeSuggestedPaths,
    isPathPanelOpen,
    selectedPath,
  };
};
