import { useState, useEffect } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import mapboxgl from "mapbox-gl";

export const usePolygonSelection = (mapRef: any) => {
  const [isPolygonMode, setIsPolygonMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const draw = useState(() => {
    return new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      keybindings: true,
      touchEnabled: true,
    });
  })[0];

  useEffect(() => {
    console.log(selectedFeatures);
  }, [selectedFeatures]);

  useEffect(() => {
    if (!mapRef.current || !draw) return;

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      const drawControls = document.querySelector(
        ".mapboxgl-draw_ctrl-toolbar"
      );
      if (drawControls) {
        drawControls.classList.add("hidden");
      }

      if (isPolygonMode && draw && mapRef.current) {
        const activeDrawings = draw.getAll()?.features || [];

        if (activeDrawings.length > 0) {
          const polygon = activeDrawings[0];
          if (polygon.geometry.type === "Polygon") {
            const features = mapRef.current.queryRenderedFeatures({
              filter: ["within", polygon.geometry],
            });
            setSelectedFeatures(features);
            draw.changeMode("simple_select");
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        deleteLastPolygon();
        setSelectedFeatures([]);
      }
    };

    if (isPolygonMode) {
      if (mapRef.current) {
        mapRef.current.addControl(draw);
        mapRef.current.getCanvas().style.cursor = "crosshair";

        mapRef.current
          .getCanvas()
          .addEventListener("contextmenu", handleRightClick);
        window.addEventListener("keydown", handleKeyDown);

        mapRef.current.on("draw.create", (e: any) => {
          const existingPolygons = draw.getAll()?.features || [];
          if (existingPolygons.length > 1 && existingPolygons[0].id) {
            draw.delete(existingPolygons[0].id as string);
          }

          const polygon = e.features[0];
          if (polygon.geometry.type === "Polygon") {
            const features = mapRef.current.queryRenderedFeatures({
              filter: ["within", polygon.geometry],
            });
            setSelectedFeatures(features);
          }
        });
      }
    } else {
      if (mapRef.current && draw && mapRef.current !== undefined) {
        mapRef.current.removeControl(draw);
        mapRef.current.getCanvas().style.cursor = "";
      }
    }

    return () => {
      if (mapRef.current) {
        const canvas = mapRef.current.getCanvas();
        if (canvas) {
          canvas.removeEventListener("contextmenu", handleRightClick);
        }
        window.removeEventListener("keydown", handleKeyDown);

        if (draw && mapRef.current && mapRef.current.off) {
          mapRef.current.off("draw.create");
        }

        if (
          isPolygonMode &&
          mapRef.current &&
          draw &&
          mapRef.current !== undefined
        ) {
          mapRef.current.removeControl(draw);
        }
      }
    };
  }, [isPolygonMode, mapRef, draw]);

  const togglePolygonMode = () => {
    setIsPolygonMode((prev) => !prev);
  };

  useEffect(() => {
    if (isPolygonMode) {
      startPolygonMode();
    }
  }, [isPolygonMode]);

  const takeScreenshot = () => {
    if (draw && mapRef.current) {
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
            const canvas = mapRef.current.getCanvas();
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "map-screenshot.png";
            link.click();
          });
        }
      } else {
        console.error("No polygon to capture for the screenshot.");
      }
    } else {
      console.error("Map or draw is not initialized.");
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const customDrawControls = document.createElement("div");
    customDrawControls.className = "custom-draw-controls";
    document.body.appendChild(customDrawControls);

    const drawControls = document.querySelector(
      ".mapbox-gl-draw_ctrl-top-right"
    );
    if (drawControls) {
      customDrawControls.appendChild(drawControls);
    }

    return () => {
      document.body.removeChild(customDrawControls);
    };
  }, [mapRef.current]);

  const startPolygonMode = () => {
    setIsPolygonMode(true);
    if (draw) {
      draw.changeMode("draw_polygon");
    }
  };

  const deleteLastPolygon = () => {
    const existingPolygons = draw.getAll()?.features || [];
    if (existingPolygons.length > 0 && existingPolygons[0].id) {
      draw.delete(existingPolygons[0].id as string);
    }
  };

  const openDetailsModal = () => {
    setIsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsModalOpen(false);
  };

  return {
    isPolygonMode,
    togglePolygonMode,
    isModalOpen,
    setIsModalOpen,
    selectedFeatures,
    takeScreenshot,
    startPolygonMode,
    deleteLastPolygon,
    openDetailsModal,
    closeDetailsModal,
  };
};
