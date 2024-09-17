export const addPointLayer = async (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  id: string,
  source: any,
  icons: any,
  visible: boolean
) => {
  const iconPromises = Object.keys(icons).map((key) => {
    return new Promise<void>((resolve) => {
      if (!mapRef.current?.hasImage(key)) {
        mapRef.current?.loadImage(icons[key], (error, image) => {
          if (error) {
            console.error(`Error loading icon ${key}:`, error);
          } else if (image) {
            mapRef.current?.addImage(key, image);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });

  await Promise.all(iconPromises);

  if (!mapRef.current?.getLayer(id)) {
    mapRef.current?.addLayer({
      id,
      type: "symbol",
      source: id,
      layout: {
        "icon-image": ["get", "icon"],
        "icon-size": ["get", "iconSize"],
        "icon-allow-overlap": true,
      },
    });
    mapRef.current?.setLayoutProperty(
      id,
      "visibility",
      visible ? "visible" : "none"
    );
  }
};

export const addLineLayer = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  id: string,
  source: any,
  paint: any,
  visible: boolean
) => {
  if (!mapRef.current?.getLayer(id)) {
    mapRef.current?.addLayer({
      id,
      type: "line",
      source: id,
      paint: {
        "line-color": paint?.["line-color"] || "#ff0000",
        "line-width": paint?.["line-width"] || 5,
        "line-opacity": paint?.["line-opacity"] || 0.8,
      },
    });
    mapRef.current?.setLayoutProperty(
      id,
      "visibility",
      visible ? "visible" : "none"
    );
  }
};

export const addHeatmapLayer = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  id: string,
  source: any,
  paint: any,
  visible: boolean
) => {
  if (!mapRef.current?.getLayer(id)) {
    mapRef.current?.addLayer({
      id,
      type: "heatmap",
      source: id,
      paint: paint,
    });
    mapRef.current?.setLayoutProperty(
      id,
      "visibility",
      visible ? "visible" : "none"
    );
  }
};

export const addFillLayer = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>,
  id: string,
  source: any,
  paint: any,
  visible: boolean
) => {
  if (!mapRef.current?.getLayer(id)) {
    mapRef.current?.addLayer({
      id,
      type: "fill",
      source: id,
      paint: paint,
    });
    mapRef.current?.setLayoutProperty(
      id,
      "visibility",
      visible ? "visible" : "none"
    );
  }
};
