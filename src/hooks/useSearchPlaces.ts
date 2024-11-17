import { useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { NominatimResponse } from "@/types/nominatim";
import { fetchLocationData } from "@/lib/fetchLocationData";

type MarkerKey = string;

const useSearchPlaces = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) => {
  const markersMap = useRef<Map<MarkerKey, mapboxgl.Marker>>(new Map());

  const previousQuery = useRef<string | null>(null);

  const getMarkerKey = (lat: number, lon: number): MarkerKey => {
    return `${lat.toFixed(6)},${lon.toFixed(6)}`;
  };

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
        } as FeatureCollection<Point, GeoJsonProperties>,
      });
    } else {
      const existingSource = map.getSource("places") as mapboxgl.GeoJSONSource;
      const existingData = existingSource._data as FeatureCollection<
        Point,
        GeoJsonProperties
      >;

      const existingKeys = new Set(
        existingData.features
          .map((feature) => {
            if (feature.geometry.type === "Point") {
              return getMarkerKey(
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0]
              );
            }
            return null;
          })
          .filter((key): key is MarkerKey => key !== null)
      );

      const newFeatures = features.filter(
        (feature) =>
          !existingKeys.has(
            getMarkerKey(
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0]
            )
          )
      );

      existingData.features.push(...newFeatures);
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
          "icon-ignore-placement": true,
        },
      });

      map.on("click", "places", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["places"],
        });

        if (features.length) {
          const feature = features[0] as Feature<Point, GeoJsonProperties>;
          const coordinates = feature.geometry.coordinates.slice();
          const title = feature.properties?.title;

          if (title) {
            new mapboxgl.Popup()
              .setLngLat(coordinates as [number, number])
              .setHTML(`<h3>${title}</h3>`)
              .addTo(map);
          }
        }
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

    if (map) {
      if (previousQuery.current !== null && previousQuery.current !== query) {
        removeAllMarkers();
      }

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

  const removeAllMarkers = () => {
    const map = mapRef.current;
    if (!map) {
      console.error("Map is not available.");
      return;
    }

    if (map.getLayer("places")) {
      map.removeLayer("places");
    }

    if (map.getSource("places")) {
      map.removeSource("places");
    }

    const style = map.getStyle();
    if (style?.sprite) {
      const imagesToRemove = Array.from(markersMap.current.keys()).map(
        (key) => `icon-${key}`
      );
      imagesToRemove.forEach((image) => {
        if (map.hasImage(image)) {
          map.removeImage(image);
        }
      });
    }

    markersMap.current.clear();

    previousQuery.current = null;
  };

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
