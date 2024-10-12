import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { ObjectData } from "@/types/ObjectData";

const imageLoadPromises: Map<string, Promise<void>> = new Map();

export const useEditObjectHook = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null> | null
) => {
  const [isEditingObject, setIsEditingObject] = useState(false);
  const [editObjectLat, setEditObjectLat] = useState<number | null>(null);
  const [editObjectLng, setEditObjectLng] = useState<number | null>(null);
  const [objectIconUrl, setObjectIconUrl] = useState<string>("");
  const [objectId, setObjectId] = useState<string | null>(null);
  const [objectData, setObjectData] = useState<ObjectData | null>(null);

  const sourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);

  const startEditingObject = (iconUrl: string, objectData: ObjectData) => {
    const objectIdStr = objectData.ID.toString();
    if (!objectData) {
      console.error("Missing ObjectData", objectData);
      return;
    }
    if (!objectIdStr || typeof objectIdStr !== "string") {
      console.error("Invalid objectId:", objectIdStr);
      return;
    }
    if (!iconUrl || typeof iconUrl !== "string") {
      console.error("Invalid iconUrl:", iconUrl);
      return;
    }

    setIsEditingObject(true);
    setEditObjectLat(objectData.Lat);
    setEditObjectLng(objectData.Long);
    setObjectIconUrl(iconUrl);
    setObjectId(objectIdStr);
    setObjectData(objectData);
    sourceRef.current = null;
  };

  const addImageToMap = (
    map: mapboxgl.Map,
    imageName: string,
    imageUrl: string
  ): Promise<void> => {
    if (map.hasImage(imageName)) {
      return Promise.resolve();
    }

    if (imageLoadPromises.has(imageName)) {
      return imageLoadPromises.get(imageName)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      map.loadImage(imageUrl, (error, image) => {
        if (error) {
          console.error("Error loading image:", error);
          imageLoadPromises.delete(imageName);
          reject(error);
        } else {
          try {
            map.addImage(imageName, image as HTMLImageElement | ImageBitmap);
            resolve();
          } catch (addImageError) {
            if (
              addImageError instanceof Error &&
              addImageError.message.includes(
                "An image with this name already exists"
              )
            ) {
              resolve();
            } else {
              console.error("Error adding image:", addImageError);
              imageLoadPromises.delete(imageName);
              reject(addImageError);
            }
          }
        }
      });
    });

    imageLoadPromises.set(imageName, promise);
    return promise;
  };

  useEffect(() => {
    if (!mapRef?.current || !isEditingObject || !objectIconUrl || !objectId) {
      return;
    }

    const map = mapRef.current;
    const iconUrl = objectIconUrl;
    const imageName = `icon-${objectId}`;

    const initLayer = async () => {
      try {
        console.log(
          "Initializing layer with objectId:",
          objectId,
          "iconUrl:",
          iconUrl
        );

        await addImageToMap(map, imageName, iconUrl);

        if (!sourceRef.current) {
          if (map.getSource(objectId)) {
            console.warn(`Source with id ${objectId} already exists.`);
            map.removeSource(objectId);
          }

          map.addSource(objectId, {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          });

          sourceRef.current = map.getSource(objectId) as mapboxgl.GeoJSONSource;

          if (map.getLayer(objectId)) {
            console.warn(`Layer with id ${objectId} already exists.`);
            map.removeLayer(objectId);
          }

          map.addLayer({
            id: objectId,
            type: "symbol",
            source: objectId,
            layout: {
              "icon-image": ["get", "icon"],
              "icon-size": objectData?.Type === "ODC" ? 0.2 : 0.8,
              "icon-anchor": "center",
              "icon-allow-overlap": true,
            },
          });

          if (editObjectLat !== null && editObjectLng !== null) {
            sourceRef.current.setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {
                    icon: imageName,
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [editObjectLng, editObjectLat],
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
      if (map.getLayer(objectId)) {
        map.removeLayer(objectId);
      }
      if (map.getSource(objectId)) {
        map.removeSource(objectId);
      }
      if (map.hasImage(imageName)) {
        map.removeImage(imageName);
        imageLoadPromises.delete(imageName);
      }
    };
  }, [mapRef, isEditingObject, objectIconUrl, objectId]);
  useEffect(() => {
    if (
      !mapRef?.current ||
      !sourceRef.current ||
      editObjectLat === null ||
      editObjectLng === null ||
      !objectIconUrl ||
      !objectId
    ) {
      return;
    }

    const map = mapRef.current;
    const imageName = `icon-${objectId}`;

    addImageToMap(map, imageName, objectIconUrl).catch((error) => {
      console.error("Error adding image:", error);
    });

    sourceRef.current.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            icon: imageName,
          },
          geometry: {
            type: "Point",
            coordinates: [editObjectLng, editObjectLat],
          },
        },
      ],
    });
  }, [editObjectLat, editObjectLng, objectIconUrl, objectId]);

  useEffect(() => {
    if (!mapRef?.current || !isEditingObject || !objectIconUrl || !objectId) {
      return;
    }

    const map = mapRef.current;
    const imageName = `icon-${objectId}`;

    const handleMapClick = async (event: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = event.lngLat;
      console.log("Map clicked at:", lng, lat);

      if (!sourceRef.current) {
        console.warn("sourceRef.current is null");
        return;
      }

      try {
        await addImageToMap(map, imageName, objectIconUrl);
      } catch (error) {
        console.error("Error adding image:", error);
        return;
      }

      sourceRef.current.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              icon: imageName,
            },
            geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        ],
      });

      setEditObjectLat(lat);
      setEditObjectLng(lng);
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [mapRef, isEditingObject, objectIconUrl, objectId]);

  const finalizeObjectPosition = () => {
    setIsEditingObject(false);

    return {
      lat: editObjectLat,
      lng: editObjectLng,
      iconUrl: objectIconUrl,
      id: objectId,
      objectData: objectData,
    };
  };

  const cancelObjectEditing = () => {
    if (objectId && mapRef?.current) {
      const map = mapRef.current;
      const imageName = `icon-${objectId}`;

      if (map.getLayer(objectId)) {
        map.removeLayer(objectId);
      }
      if (map.getSource(objectId)) {
        map.removeSource(objectId);
      }
      if (map.hasImage(imageName)) {
        map.removeImage(imageName);
        imageLoadPromises.delete(imageName);
      }
    }
    setIsEditingObject(false);
    setObjectId(null);
    sourceRef.current = null;
    setEditObjectLat(null);
    setEditObjectLng(null);
  };

  return {
    startEditingObject,
    finalizeObjectPosition,
    isEditingObject,
    cancelObjectEditing,
    setEditObjectLat,
    setEditObjectLng,
    editObjectLat,
    editObjectLng,
  };
};
