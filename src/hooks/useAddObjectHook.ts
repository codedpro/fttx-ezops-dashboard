import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export const useAddObjectHook = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null> | null
) => {
  const [isAddingObject, setIsAddingObject] = useState(false);
  const [objectLat, setObjectLat] = useState<number | null>(null);
  const [objectLng, setObjectLng] = useState<number | null>(null);
  const [objectIcon, setObjectIcon] = useState<string | null>(null);
  const objectIdRef = useRef<string | null>(null);
  const sourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);

  const startAddingObject = (
    lat: number | null,
    lng: number | null,
    icon: string
  ) => {
    setIsAddingObject(true);
    setObjectLat(lat);
    setObjectLng(lng);
    setObjectIcon(icon);
    objectIdRef.current = null;
    sourceRef.current = null;
  };

  const addImageToMap = async (
    map: mapboxgl.Map,
    imageName: string,
    imageUrl: string
  ) => {
    if (map.hasImage(imageName)) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      map.loadImage(imageUrl, (error, image) => {
        if (error) {
          reject(error);
        } else {
          map.addImage(imageName, image as HTMLImageElement | ImageBitmap);
          resolve();
        }
      });
    });
  };

  useEffect(() => {
    if (!mapRef?.current || !isAddingObject || !objectIcon) {
      return;
    }

    const map = mapRef.current;

    const initLayer = async () => {
      try {
        await addImageToMap(map, objectIcon, objectIcon);

        if (!objectIdRef.current) {
          const featureId = `object-${Date.now()}`;
          objectIdRef.current = featureId;

          map.addSource(featureId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          sourceRef.current = map.getSource(
            featureId
          ) as mapboxgl.GeoJSONSource;

          const iconSize = objectIcon.includes("ODC") ? 0.15 : 0.6;

          map.addLayer({
            id: featureId,
            type: "symbol",
            source: featureId,
            layout: {
              "icon-image": objectIcon,
              "icon-size": iconSize,
              "icon-anchor": "bottom",
            },
          });

          if (objectLat !== null && objectLng !== null) {
            sourceRef.current.setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {
                    icon: objectIcon,
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [objectLng, objectLat],
                  },
                },
              ],
            });
          }
        }
      } catch (error) {
        console.error("Error initializing layer:", error);
      }
    };

    initLayer();

    return () => {
      if (objectIdRef.current && map) {
        if (map.getLayer(objectIdRef.current)) {
          map.removeLayer(objectIdRef.current);
        }
        if (map.getSource(objectIdRef.current)) {
          map.removeSource(objectIdRef.current);
        }
        if (objectIcon && map.hasImage(objectIcon)) {
          map.removeImage(objectIcon);
        }
      }
    };
  }, [mapRef, isAddingObject, objectIcon]);

  useEffect(() => {
    if (
      !mapRef?.current ||
      !sourceRef.current ||
      objectLat === null ||
      objectLng === null
    ) {
      return;
    }

    sourceRef.current.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            icon: objectIcon,
          },
          geometry: {
            type: "Point",
            coordinates: [objectLng, objectLat],
          },
        },
      ],
    });
  }, [objectLat, objectLng, objectIcon]);

  useEffect(() => {
    if (!mapRef?.current || !isAddingObject || !objectIcon) {
      return;
    }

    const map = mapRef.current;

    const handleMapClick = (event: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = event.lngLat;

      if (!objectIdRef.current || !sourceRef.current) {
        return;
      }

      sourceRef.current.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              icon: objectIcon,
            },
            geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        ],
      });

      setObjectLat(lat);
      setObjectLng(lng);
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [mapRef, isAddingObject, objectIcon]);

  const finalizeObjectPosition = () => {
    setIsAddingObject(false);
  };

  const cancelObjectAdding = () => {
    if (objectIdRef.current && mapRef?.current) {
      const map = mapRef.current;
      if (map.getLayer(objectIdRef.current)) {
        map.removeLayer(objectIdRef.current);
      }
      if (map.getSource(objectIdRef.current)) {
        map.removeSource(objectIdRef.current);
      }
      if (objectIcon && map.hasImage(objectIcon)) {
        map.removeImage(objectIcon);
      }
    }
    setIsAddingObject(false);
    objectIdRef.current = null;
    sourceRef.current = null;
    setObjectLat(null);
    setObjectLng(null);
  };

  return {
    startAddingObject,
    finalizeObjectPosition,
    cancelObjectAdding,
    setObjectLat,
    setObjectLng,
    objectLat,
    objectLng,
  };
};
