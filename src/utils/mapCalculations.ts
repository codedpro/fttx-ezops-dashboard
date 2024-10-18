export const getBoundingBox = (points: { lat: number; lng: number }[]) => {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return { minLat, maxLat, minLng, maxLng };
};

export const getCenterPoint = (
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
) => {
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const latShift = (maxLat - minLat) * -0.2;
  const shiftedCenterLat = centerLat + latShift;

  return { centerLat: shiftedCenterLat, centerLng };
};

export const getZoomLevel = (
  minLat: number,
  maxLat: number,
  minLng: number,
  maxLng: number
) => {
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  if (maxDiff < 0.001) return 19;
  if (maxDiff < 0.01) return 17;
  if (maxDiff < 0.1) return 13.5;
  if (maxDiff < 1) return 10;

  return 8;
};

export const isValidLayer = async (
  map: mapboxgl.Map,
  layerId: string
): Promise<boolean> => {
  if (!map.getLayer(layerId)) return false;

  const features = map.queryRenderedFeatures({ layers: [layerId] });
  return features && features.length > 0;
};
