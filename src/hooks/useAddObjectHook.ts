import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

interface DrawEvent {
  type: "draw.create" | "draw.delete" | "draw.update";
  features: GeoJSON.Feature<GeoJSON.Geometry>[];
}

export const useAddObjectHook = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) => {
  const [isAddingObject, setIsAddingObject] = useState(false);
  const [objectLat, setObjectLat] = useState<number | null>(null);
  const [objectLng, setObjectLng] = useState<number | null>(null);
  const [objectIcon, setObjectIcon] = useState<string | null>(null);

  const [draw, setDraw] = useState<MapboxDraw | null>(null);
  const [drawnFeatureId, setDrawnFeatureId] = useState<string | null>(null);

  const startAddingObject = (lat: number, lng: number, icon: string) => {
    setIsAddingObject(true);
    setObjectLat(lat);
    setObjectLng(lng);
    setObjectIcon(icon);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    const drawControl = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
      },
      styles: [
        {
          id: "gl-draw-point-inactive",
          type: "circle",
          paint: {
            "circle-radius": 10,
            "circle-opacity": 0.5,
            "circle-color": "#3887be",
          },
        },
      ],
    });

    map.addControl(drawControl);
    setDraw(drawControl);

    return () => {
      map.removeControl(drawControl);
    };
  }, [mapRef]);

  useEffect(() => {
    if (
      !mapRef.current ||
      !isAddingObject ||
      !draw ||
      !objectIcon ||
      objectLat === null ||
      objectLng === null
    )
      return;

    const map = mapRef.current;

    if (objectLat !== null && objectLng !== null) {
      const feature = {
        type: "Feature",
        properties: {
          icon: objectIcon,
        },
        geometry: {
          type: "Point",
          coordinates: [objectLng, objectLat],
        },
      };

      const featureId = draw.add(feature as any);
      setDrawnFeatureId(featureId[0]);

      map.flyTo({
        center: [objectLng, objectLat],
        zoom: 18,
      });
    }

    const handleUpdate = (event: DrawEvent) => {
      const updatedFeature = event.features[0];
      if (updatedFeature.geometry.type === "Point") {
        const [lng, lat] = updatedFeature.geometry.coordinates;
        setObjectLat(lat);
        setObjectLng(lng);
      }
    };

    map.on("draw.update", handleUpdate);

    return () => {
      map.off("draw.update", handleUpdate);

      if (drawnFeatureId) {
        draw.delete(drawnFeatureId);
      }
    };
  }, [mapRef, isAddingObject, objectLat, objectLng, draw, objectIcon]);

  const finalizeObjectPosition = () => {
    setIsAddingObject(false);
  };

  const cancelObjectAdding = () => {
    if (drawnFeatureId && draw) {
      draw.delete(drawnFeatureId);
    }
    setIsAddingObject(false);
    setDrawnFeatureId(null);
  };

  return {
    startAddingObject,
    objectLat,
    objectLng,
    setObjectLat,
    setObjectLng,
    finalizeObjectPosition,
    cancelObjectAdding,
  };
};
