import { useState, useEffect, MutableRefObject } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl from "mapbox-gl";
import { ExtendedFeature } from "@/types/ExtendedFeature";
import * as turf from "@turf/turf";
export const usePolygonSelection = (
  mapRef: MutableRefObject<mapboxgl.Map | null>
) => {
  const [isPolygonMode, setIsPolygonMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScreenShotModalOpen, setIsScreenShotModalOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<ExtendedFeature[]>(
    []
  );
  const [screenshotData, setScreenshotData] = useState<string | null>(null);

  const draw = useState(() => {
    return new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      keybindings: true,
      touchEnabled: true,
    });
  })[0];

  const addDrawControl = () => {
    if (mapRef?.current && draw) {
      mapRef.current.addControl(draw);
      mapRef.current.getCanvas().style.cursor = "crosshair";
    }
  };

  const removeDrawControl = () => {
    if (mapRef?.current && draw) {
      try {
        mapRef.current.removeControl(draw);
        mapRef.current.getCanvas().style.cursor = "";
      } catch (error) {
        console.warn("Error removing draw control: ", error);
      }
    }
  };

  const updateSelectedFeatures = () => {
    if (mapRef?.current && draw) {
      const activeDrawings = draw.getAll()?.features || [];
      if (activeDrawings.length > 0) {
        const polygon = activeDrawings[0];
        if (polygon.geometry.type === "Polygon") {
          // Retrieve all rendered features
          const features = mapRef.current.queryRenderedFeatures();
  
          // Filter out Mapbox default layers and unwanted features
          const filteredFeatures = features.filter((feature) => {
            // Ensure feature.layer is defined
            if (!feature.layer || !feature.layer.source || !feature.layer.id) {
              return false;
            }
  
            const unwantedSources = ["composite", "mapbox"]; // Mapbox default sources
            const unwantedLayerIds = ["place-label", "poi-label", "road-label"]; // Mapbox default layer IDs
            return (
              !unwantedSources.includes(feature.layer.source) &&
              !unwantedLayerIds.includes(feature.layer.id)
            );
          });
  
          // Perform spatial filtering with Turf.js
          const turfPolygon = turf.polygon(polygon.geometry.coordinates);
  
          const selectedFeatures = filteredFeatures.filter((feature) => {
            // Handle different geometry types
            if (feature.geometry.type === "Point") {
              return turf.booleanPointInPolygon(feature.geometry, turfPolygon);
            } else if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
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
              // Handle MultiLineString by treating it as multiple LineStrings
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
  
          console.log(selectedFeatures);
          setSelectedFeatures(selectedFeatures);
        }
      }
    }
  };
  

  const handleClickOnMap = (e: MouseEvent) => {
    if (isPolygonMode) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const addEventListeners = () => {
    if (!mapRef?.current) {
      console.error("Map instance is not initialized.");
      return () => {};
    }

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      const drawControls = document.querySelector(
        ".mapboxgl-draw_ctrl-toolbar"
      );
      if (drawControls) {
        drawControls.classList.add("hidden");
      }

      if (isPolygonMode && draw && mapRef.current) {
        updateSelectedFeatures();
        draw.changeMode("simple_select");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        deleteLastPolygon();
        setSelectedFeatures([]);
      }
    };

    mapRef.current.getCanvas().addEventListener("click", handleClickOnMap);
    mapRef.current
      .getCanvas()
      .addEventListener("contextmenu", handleRightClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (mapRef.current) {
        mapRef.current
          .getCanvas()
          .removeEventListener("contextmenu", handleRightClick);
        mapRef.current
          .getCanvas()
          .removeEventListener("click", handleClickOnMap);
        mapRef.current.off("draw.create", updateSelectedFeatures);
        mapRef.current.off("draw.update", updateSelectedFeatures);
        mapRef.current.off("draw.delete", () => setSelectedFeatures([]));
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  };

  const cleanup = () => {
    if (!mapRef?.current || !draw) return;

    try {
      removeDrawControl();
    } catch (error) {
      console.warn("Error during cleanup: ", error);
    }
  };

  useEffect(() => {
    if (isPolygonMode) {
      addDrawControl();
      const removeListeners = addEventListeners();
      return () => {
        removeListeners();
        cleanup();
      };
    } else {
      cleanup();
    }
  }, [isPolygonMode, mapRef, draw]);

  const startPolygonMode = () => {
    if (!draw) {
      console.error("Draw instance is not initialized.");
      return;
    }

    const existingPolygons = draw.getAll()?.features || [];
    if (existingPolygons.length > 0 && existingPolygons[0].id) {
      draw.delete(existingPolygons[0].id as string);
    }

    draw.changeMode("draw_polygon");
  };

  const togglePolygonMode = () => {
    setIsPolygonMode((prev) => !prev);
  };

  const deleteLastPolygon = () => {
    if (!draw) {
      console.error("Draw instance is not initialized.");
      return;
    }
    const existingPolygons = draw.getAll()?.features || [];
    if (existingPolygons.length > 0 && existingPolygons[0].id) {
      draw.delete(existingPolygons[0].id as string);
    }
  };

  const takeScreenshot = () => {
    if (!draw || !mapRef.current) {
      console.error("Map or draw is not initialized.");
      return;
    }

    const activeDrawings = draw.getAll()?.features || [];

    if (activeDrawings.length > 0) {
      const polygon = activeDrawings[0];
      if (polygon.geometry.type === "Polygon") {
        const bounds = new mapboxgl.LngLatBounds();
        (polygon.geometry as GeoJSON.Polygon).coordinates[0].forEach(
          (coord: any) => {
            bounds.extend(coord);
          }
        );

        mapRef.current.fitBounds(bounds, { padding: 20 });

        mapRef.current.once("idle", () => {
          const canvas = mapRef.current?.getCanvas();
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

  useEffect(() => {
    if (isPolygonMode === true) {
      startPolygonMode();
    }
  }, [isPolygonMode]);

  return {
    isPolygonMode,
    togglePolygonMode,
    isModalOpen,
    setIsModalOpen,
    selectedFeatures,
    takeScreenshot,
    startPolygonMode,
    deleteLastPolygon,
    screenshotData,
    isScreenShotModalOpen,
    setIsScreenShotModalOpen,
  };
};
