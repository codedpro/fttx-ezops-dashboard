import { useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { NominatimResponse } from "@/types/nominatim";
import { fetchLocationData } from "@/lib/fetchLocationData";

const useSearchPlaces = (
  mapRef: React.MutableRefObject<mapboxgl.Map | null>
) => {
  const markers = useRef<mapboxgl.Marker[]>([]);

  const clearExistingMarkers = () => {
    if (mapRef.current?.getSource("places")) {
      mapRef.current?.removeLayer("places");
      mapRef.current?.removeSource("places");
    }

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
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
        } as FeatureCollection,
      });
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

    places.forEach((place) => {
      const latNum = parseFloat(place.lat);
      const lonNum = parseFloat(place.lon);
      if (!isNaN(latNum) && !isNaN(lonNum)) {
        const marker = new mapboxgl.Marker()
          .setLngLat([lonNum, latNum])
          .setPopup(new mapboxgl.Popup().setText(place.display_name))
          .addTo(map);
        markers.current.push(marker);
      }
    });
  };

  const handleSearchPlaces = async (query: string) => {
    const map = mapRef.current;

    if (map) {
      const bounds = map.getBounds();

      if (bounds) {
        const viewbox = `${bounds.getSouthWest().lng},${bounds.getSouthWest().lat},${bounds.getNorthEast().lng},${bounds.getNorthEast().lat}`;

        clearExistingMarkers();

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



  return { handleSearchPlaces,  clearExistingMarkers };
};

export default useSearchPlaces;
