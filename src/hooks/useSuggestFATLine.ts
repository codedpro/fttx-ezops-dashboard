import { NearybyFATs } from "@/types/NearbyFATs";
import { useState, useCallback } from "react";
import { LineString } from "geojson";

const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
) => {
  const R = 6371e3;
  const lat1 = coord1[1] * (Math.PI / 180);
  const lat2 = coord2[1] * (Math.PI / 180);
  const deltaLat = (coord2[1] - coord1[1]) * (Math.PI / 180);
  const deltaLong = (coord2[0] - coord1[0]) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLong / 2) *
      Math.sin(deltaLong / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
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

const generateUniqueId = () => {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export const useSuggestFATLine = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) => {
  const [suggestedPaths, setSuggestedPaths] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [isPathPanelOpen, setIsPathPanelOpen] = useState(false);

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
      console.error("Failed to fetch nearby FATs:", error);
      return [];
    }
  };

  const generateUniqueColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return randomColor;
  };

  const generatePaths = async (
    featureProperties: FeatureProperties,
    nearbyFATs: NearybyFATs[]
  ) => {
    const paths = [];

    for (const fat of nearbyFATs) {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${featureProperties.Long},${featureProperties.Lat};${fat.FAT_Long},${fat.FAT_Lat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_API}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
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

        paths.push({
          id: pathId,
          color: color,
          path: extendedPath,
          FAT_ID: fat.FAT_ID,
          FAT_Name: fat.Name,
          originalDistance: path.distance,
          manualDistance,
          realDistance,
          duration: path.duration,
        });

        if (mapRef.current) {
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
              "line-width": 3,
            },
          });

          mapRef.current.on("click", pathId, () => {
            setSelectedPath({
              id: pathId,
              color: color,
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
      }
    }

    setSuggestedPaths(paths);
  };

  const handleSuggestFATLine = useCallback(
    async (featureProperties: FeatureProperties) => {
      const nearbyFATs = await fetchNearbyFATs(featureProperties);
      if (nearbyFATs.length) {
        generatePaths(featureProperties, nearbyFATs);
      }
    },
    []
  );

  const handleSavePath = useCallback(() => {
    if (selectedPath) {
      console.log("Saving path:", selectedPath);
      setIsPathPanelOpen(false);
    }
  }, [selectedPath]);

  const handleCancelPath = () => {
    setIsPathPanelOpen(false);
    setSelectedPath(null);
  };

  const removeSuggestedPaths = () => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

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
