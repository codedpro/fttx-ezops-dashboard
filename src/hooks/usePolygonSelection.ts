import { useState, useEffect, MutableRefObject } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl from "mapbox-gl";
import { ExtendedFeature } from "@/types/ExtendedFeature";
import * as turf from "@turf/turf";

export const usePolygonSelection = (
  mapRef: MutableRefObject<mapboxgl.Map | null>
) => {
  const [isPolygonMode, setIsPolygonMode] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<ExtendedFeature[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScreenShotModalOpen, setIsScreenShotModalOpen] = useState(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);

  const draw = useState(
    () =>
      new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        keybindings: true,
        touchEnabled: true,
      })
  )[0];

  const updateSelectedFeatures = () => {
    if (mapRef.current && draw) {
      const drawnFeatures = draw.getAll()?.features || [];
      if (drawnFeatures.length > 0) {
        const polygon = drawnFeatures[0];
        if (polygon.geometry.type === "Polygon") {
          const features = mapRef.current.queryRenderedFeatures();

          const filteredFeatures = features.filter((feature) => {
            if (!feature.layer || !feature.layer.source || !feature.layer.id) {
              return false;
            }
            const unwantedSources = ["composite", "mapbox"];
            const unwantedLayerIds = ["place-label", "poi-label", "road-label"];
            return (
              !unwantedSources.includes(feature.layer.source) &&
              !unwantedLayerIds.includes(feature.layer.id)
            );
          });

          const turfPolygon = turf.polygon(polygon.geometry.coordinates);

          const selected = filteredFeatures.filter((feature) => {
            if (feature.geometry.type === "Point") {
              return turf.booleanPointInPolygon(feature.geometry, turfPolygon);
            } else if (
              feature.geometry.type === "Polygon" ||
              feature.geometry.type === "MultiPolygon"
            ) {
              const turfFeature = turf.feature(feature.geometry);
              return (
                turf.booleanWithin(turfFeature, turfPolygon) ||
                turf.booleanOverlap(turfFeature, turfPolygon)
              );
            } else if (feature.geometry.type === "LineString") {
              const turfFeature = turf.feature(feature.geometry);
              return (
                turf.booleanCrosses(turfFeature, turfPolygon) ||
                turf.booleanWithin(turfFeature, turfPolygon)
              );
            } else if (feature.geometry.type === "MultiLineString") {
              return feature.geometry.coordinates.some((lineString) => {
                const turfFeature = turf.lineString(lineString);
                return (
                  turf.booleanCrosses(turfFeature, turfPolygon) ||
                  turf.booleanWithin(turfFeature, turfPolygon)
                );
              });
            }
            return false;
          });

          setSelectedFeatures(selected);
        }
      }
    }
  };

  const deleteLastPolygon = () => {
    if (draw) {
      draw.deleteAll();
      setSelectedFeatures([]);
    }
  };

  const startPolygonMode = () => {
    if (draw) {
      draw.deleteAll();
      setSelectedFeatures([]);

      draw.changeMode("draw_polygon");
    } else {
      console.error("Draw instance is not initialized.");
    }

    if (!isPolygonMode) {
      setIsPolygonMode(true);
    }
  };

  useEffect(() => {
    if (isPolygonMode && mapRef.current && draw) {
      const map = mapRef.current;
      map.addControl(draw);

      draw.changeMode("draw_polygon");

      const handleDrawCreate = () => {
        updateSelectedFeatures();
      };

      const handleDrawUpdate = () => {
        updateSelectedFeatures();
      };

      const handleDrawDelete = () => {
        setSelectedFeatures([]);
      };

      map.on("draw.create", handleDrawCreate);
      map.on("draw.update", handleDrawUpdate);
      map.on("draw.delete", handleDrawDelete);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Backspace" || e.key === "delete") {
          deleteLastPolygon();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      const handleClickOnMap = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      map.getCanvas().addEventListener("click", handleClickOnMap);

      const handleRightClick = (e: MouseEvent) => {
        e.preventDefault();
        if (isPolygonMode && draw && mapRef.current) {
          updateSelectedFeatures();
          draw.changeMode("simple_select");
        }
      };
      map.getCanvas().addEventListener("contextmenu", handleRightClick);

      return () => {
        map.off("draw.create", handleDrawCreate);
        map.off("draw.update", handleDrawUpdate);
        map.off("draw.delete", handleDrawDelete);
        window.removeEventListener("keydown", handleKeyDown);
        map.getCanvas().removeEventListener("click", handleClickOnMap);
        map.getCanvas().removeEventListener("contextmenu", handleRightClick);
        draw.deleteAll();
        map.removeControl(draw);
      };
    }
  }, [isPolygonMode, mapRef, draw]);

  const togglePolygonMode = () => {
    setIsPolygonMode((prev) => !prev);
  };

  const takeScreenshot = () => {
    if (!draw || !mapRef.current) {
      console.error("Map or draw is not initialized.");
      return;
    }

    const drawnFeatures = draw.getAll()?.features || [];

    if (drawnFeatures.length > 0) {
      const polygon = drawnFeatures[0];
      if (polygon.geometry.type === "Polygon") {
        const bounds = new mapboxgl.LngLatBounds();
        (polygon.geometry as GeoJSON.Polygon).coordinates[0].forEach(
          (coord: any) => {
            bounds.extend(coord);
          }
        );

        mapRef.current!.fitBounds(bounds, { padding: 20 });

        mapRef.current!.once("idle", () => {
          const canvas = mapRef.current!.getCanvas();
          if (!canvas) {
            console.error("Canvas not available");
            return;
          }
          const image = canvas.toDataURL("image/png");
          setScreenshotData(image);
          setIsScreenShotModalOpen(true);
        });
      }
    } else {
      console.error("No polygon to capture for the screenshot.");
    }
  };

  return {
    isPolygonMode,
    togglePolygonMode,
    startPolygonMode,
    isModalOpen,
    setIsModalOpen,
    selectedFeatures,
    takeScreenshot,
    deleteLastPolygon,
    screenshotData,
    isScreenShotModalOpen,
    setIsScreenShotModalOpen,
  };
};
