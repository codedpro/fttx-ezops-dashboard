export type LngLat = [number, number];

async function fetchOSRMRoute(points: LngLat[]): Promise<LngLat[] | null> {
  try {
    // Limit the number of waypoints to keep URL safe; subsample if too many
    const maxPts = 100; // OSRM demo server limit safeguard
    let pts = points;
    if (points.length > maxPts) {
      const step = Math.ceil(points.length / maxPts);
      pts = points.filter((_, i) => i % step === 0);
      if (pts[pts.length - 1] !== points[points.length - 1]) pts.push(points[points.length - 1]);
    }
    const coords = pts.map((p) => `${p[0]},${p[1]}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0]?.geometry?.coordinates;
    if (Array.isArray(route)) return route as LngLat[];
    return null;
  } catch {
    return null;
  }
}

export async function snapChainsToStreets(features: any[]): Promise<any[]> {
  const snapped: any[] = [];
  for (const f of features) {
    if (f?.geometry?.type !== "LineString" || !Array.isArray(f.geometry.coordinates)) {
      snapped.push(f);
      continue;
    }
    const coords = f.geometry.coordinates as LngLat[];
    const routed = await fetchOSRMRoute(coords);
    if (routed && routed.length > 1) {
      snapped.push({
        ...f,
        geometry: { type: "LineString", coordinates: routed },
      });
    } else {
      snapped.push(f);
    }
  }
  return snapped;
}

