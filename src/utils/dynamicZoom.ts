import { LayerType } from "@/types/FTTHMapProps";

export const dynamicZoom = (mapRef: any, layers: LayerType[]) => {
  if (!mapRef.current) return;
  const zoomLevel = mapRef.current.getZoom();

  let sizeMultiplier = 0.6;
  if (zoomLevel >= 17) {
    /*     sizeMultiplier = 0.75;
  } else if (zoomLevel >= 16 && zoomLevel < 17) {
    sizeMultiplier = 0.85;
  } else if (zoomLevel >= 17) { */
    sizeMultiplier = 0.95;
  }
  layers.forEach(({ id, type }) => {
    if (
      type === "point" &&
      id !== "OLTLayer" &&
      id !== "olt-layer" &&
      id !== "odc-layer"
    ) {
      const baseSize = 20;
      const newSize = baseSize * sizeMultiplier;
      mapRef.current?.setLayoutProperty(id, "icon-size", newSize / 20);
    }
  });
};
