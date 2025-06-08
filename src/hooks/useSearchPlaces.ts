// hooks/useSearchPlaces.tsx
import { useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { fetchPOISearch } from "@/lib/fetchPOISearch";
import { POISearchResponse } from "@/types/poisearch";

type MarkerKey = string;

const useSearchPlaces = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) => {
  const previousQuery = useRef<string | null>(null);

  const getMarkerKey = (lat: number, lon: number): MarkerKey =>
    `${lat.toFixed(6)},${lon.toFixed(6)}`;

  const addPointLayer = async (places: POISearchResponse[]) => {
    const map = mapRef.current;
    if (!map) {
      console.error("Map is not available.");
      return;
    }

    // build GeoJSON features
    const features: Feature<Point, GeoJsonProperties>[] = places.map(
      (place) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [place.location.lon, place.location.lat],
        },
        properties: {
          title: place.activity,
          icon: "default-icon",
        },
      })
    );

    // ensure our default marker icon is loaded
    if (!map.hasImage("default-icon")) {
      await new Promise<void>((resolve) => {
        map.loadImage("/images/map/marker.png", (err, img) => {
          if (!err && img) map.addImage("default-icon", img);
          resolve();
        });
      });
    }

    // add or update the GeoJSON source
    if (!map.getSource("places")) {
      map.addSource("places", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        } as FeatureCollection<Point, GeoJsonProperties>,
      });
    } else {
      const source = map.getSource("places") as mapboxgl.GeoJSONSource;
      const data = source._data as FeatureCollection<Point, GeoJsonProperties>;

      // dedupe by lat/lon
      const existingKeys = new Set(
        data.features.map((f) =>
          getMarkerKey(f.geometry.coordinates[1], f.geometry.coordinates[0])
        )
      );
      const newFeatures = features.filter(
        (f) =>
          !existingKeys.has(
            getMarkerKey(f.geometry.coordinates[1], f.geometry.coordinates[0])
          )
      );

      data.features.push(...newFeatures);
      source.setData(data);
    }

    // add layer & interactions once
    if (!map.getLayer("places")) {
      map.addLayer({
        id: "places",
        type: "symbol",
        source: "places",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": 0.4,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      map.on("click", "places", (e) => {
        const [feat] = map.queryRenderedFeatures(e.point, {
          layers: ["places"],
        });
        if (!feat) return;

        const coords = (feat.geometry as any).coordinates as [
          number,
          number
        ];
        const title = feat.properties?.title as string;
        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(`<h3>${title}</h3>`)
          .addTo(map);
      });

      map.on("mouseenter", "places", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "places", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  };

  const handleSearchPlaces = async (query: string) => {
    const map = mapRef.current;
    if (!map) {
      console.error("Map instance is not available.");
      return;
    }

    // if new query, clear old results
    if (previousQuery.current !== null && previousQuery.current !== query) {
      removeAllMarkers();
    }
    previousQuery.current = query;

    const bounds = map.getBounds();
    if (!bounds) {
      console.error("Bounds are not valid.");
      return;
    }

    // build the new-API request body
    const params = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      west: bounds.getWest(),
      east: bounds.getEast(),
      q: query,
    };

    try {
      const places = await fetchPOISearch(params);
      await addPointLayer(places);
    } catch (err) {
      console.error("Error fetching POIs:", err);
    }
  };

  const removeAllMarkers = () => {
    const map = mapRef.current;
    if (!map) {
      console.error("Map is not available.");
      return;
    }
    if (map.getLayer("places")) map.removeLayer("places");
    if (map.getSource("places")) map.removeSource("places");
    // remove default icon if desired
    if (map.hasImage("default-icon")) {
      map.removeImage("default-icon");
    }
    previousQuery.current = null;
  };

  const removeMarkersOutsideBounds = () => {
    const map = mapRef.current;
    if (!map || !map.getSource("places")) return;

    const source = map.getSource("places") as mapboxgl.GeoJSONSource;
    const data = source._data as FeatureCollection<Point, GeoJsonProperties>;
    const bounds = map.getBounds();

    const filtered = data.features.filter((f) =>
      bounds?.contains([f.geometry.coordinates[0], f.geometry.coordinates[1]])
    );
    source.setData({ type: "FeatureCollection", features: filtered });
  };

  return { handleSearchPlaces, removeMarkersOutsideBounds, removeAllMarkers };
};

export default useSearchPlaces;
