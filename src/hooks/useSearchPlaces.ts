import { useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { NominatimResponse } from "@/types/nominatim";
import { fetchLocationData } from "@/lib/fetchLocationData";

// Define a type for unique key based on coordinates
type MarkerKey = string;

const useSearchPlaces = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) => {
  // Use a Map to store markers with a unique key (e.g., "lat,lon")
  const markersMap = useRef<Map<MarkerKey, mapboxgl.Marker>>(new Map());

  // Ref to store the previous query for detecting changes
  const previousQuery = useRef<string | null>(null);

  // Function to generate a unique key for a marker based on its coordinates
  const getMarkerKey = (lat: number, lon: number): MarkerKey => {
    return `${lat.toFixed(6)},${lon.toFixed(6)}`; // Using fixed decimal places for precision
  };

  /**
   * Adds points to the map as markers and updates the GeoJSON layer.
   * Prevents adding duplicate markers based on their coordinates.
   */
  const addPointLayer = async (
    places: NominatimResponse[],
    icons: Record<string, string>
  ) => {
    const map = mapRef.current;

    if (!map) {
      console.error("Map is not available.");
      return;
    }

    const features: Feature<Point, GeoJsonProperties>[] = places.map(
      (place) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
        },
        properties: {
          title: place.display_name,
          icon: place.icon ? `icon-${place.place_id}` : "default-icon",
        },
      })
    );

    // Load new icons that are not already in the map
    const newIcons = Object.entries(icons).filter(
      ([key]) => !map.hasImage(key)
    );

    const iconPromises = newIcons.map(([key, url]) => {
      return new Promise<void>((resolve) => {
        map.loadImage(url, (error, image) => {
          if (error) {
            console.error(`Error loading icon ${key}:`, error);
          } else if (image) {
            map.addImage(key, image);
          }
          resolve();
        });
      });
    });

    await Promise.all(iconPromises);

    if (!map.getSource("places")) {
      map.addSource("places", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features,
        } as FeatureCollection,
      });
    } else {
      // If source exists, update the data by merging existing features with new ones
      const existingSource = map.getSource("places") as mapboxgl.GeoJSONSource;
      const existingData = existingSource._data as FeatureCollection;
      existingData.features.push(...features);
      existingSource.setData(existingData);
    }

    if (!map.getLayer("places")) {
      map.addLayer({
        id: "places",
        type: "symbol",
        source: "places",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": 0.4,
          "icon-allow-overlap": true,
        },
      });
    }

    // Iterate through each place and add markers if they don't already exist
    places.forEach((place) => {
      const latNum = parseFloat(place.lat);
      const lonNum = parseFloat(place.lon);
      if (!isNaN(latNum) && !isNaN(lonNum)) {
        const key = getMarkerKey(latNum, lonNum);
        if (!markersMap.current.has(key)) {
          const marker = new mapboxgl.Marker()
            .setLngLat([lonNum, latNum])
            .setPopup(new mapboxgl.Popup().setText(place.display_name))
            .addTo(map);
          markersMap.current.set(key, marker);
        }
      }
    });
  };

  /**
   * Handles searching for places based on the query.
   * If the query has changed, it clears all existing markers before performing the new search.
   */
  const handleSearchPlaces = async (query: string) => {
    const map = mapRef.current;

    if (map) {
      // Check if the query has changed
      if (previousQuery.current !== null && previousQuery.current !== query) {
        removeAllMarkers();
      }
      // Update the previous query
      previousQuery.current = query;

      const bounds = map.getBounds();

      if (bounds) {
        const viewbox = `${bounds.getSouthWest().lng},${bounds.getSouthWest().lat},${bounds.getNorthEast().lng},${bounds.getNorthEast().lat}`;

        try {
          const places: NominatimResponse[] = await fetchLocationData(
            query,
            viewbox,
            true
          );
          console.log("Fetched places:", places);

          const icons: Record<string, string> = {
            "default-icon": "/images/map/marker.png",
          };

          places.forEach((place) => {
            if (place.icon) {
              const iconName = `icon-${place.place_id}`;
              if (!(iconName in icons)) {
                icons[iconName] = place.icon;
              }
            }
          });

          await addPointLayer(places, icons);
        } catch (error) {
          console.error("Error fetching places:", error);
        }
      } else {
        console.error("Bounds are not valid.");
      }
    } else {
      console.error("Map instance is not available.");
    }
  };

  /**
   * Removes all markers from the map and clears the markers map.
   * Also removes the GeoJSON source and layer associated with the markers.
   */
  const removeAllMarkers = () => {
    const map = mapRef.current;
    if (!map) {
      console.error("Map is not available.");
      return;
    }

    // Remove all markers
    markersMap.current.forEach((marker) => marker.remove());
    markersMap.current.clear();

    // Remove the GeoJSON source and layer
    if (map.getLayer("places")) {
      map.removeLayer("places");
    }

    if (map.getSource("places")) {
      map.removeSource("places");
    }

    // Optionally, remove all custom images/icons
    const style = map.getStyle();
    if (style?.sprite) {
      // Manually handle image removal (since images property is not available in TypeScript)
      const imagesToRemove = Array.from(markersMap.current.keys()).map(
        (key) => `icon-${key}`
      );
      imagesToRemove.forEach((image) => {
        if (map.hasImage(image)) {
          map.removeImage(image);
        }
      });
    }

    // Reset previous query
    previousQuery.current = null;
  };

  /**
   * Optional: Removes markers that are outside the current map bounds.
   * This helps in keeping the map clean and relevant.
   */
  const removeMarkersOutsideBounds = () => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    markersMap.current.forEach((marker, key) => {
      const [lon, lat] = marker.getLngLat().toArray();
      if (!bounds?.contains([lon, lat])) {
        marker.remove();
        markersMap.current.delete(key);
      }
    });
  };

  return { handleSearchPlaces, removeMarkersOutsideBounds, removeAllMarkers };
};

export default useSearchPlaces;
