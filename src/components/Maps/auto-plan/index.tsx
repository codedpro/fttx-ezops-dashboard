import React, {
    useRef,
    useEffect,
    useState,
    useImperativeHandle,
    forwardRef,
  } from "react";
  import mapboxgl, {
    GeoJSONSourceSpecification,
    Marker,
    StyleSpecification,
  } from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
  
  import { dynamicZoom } from "@/utils/dynamicZoom";
  import { LayerType } from "@/types/FTTHMapProps";
  import {
    addFillLayer,
    addHeatmapLayer,
    addLineLayer,
    addPointLayer,
  } from "@/utils/mapLayers";
  import { Modal } from "@/components/Modal-Info";
  
  mapboxgl.accessToken = "Dummy";
  
  interface FTTHMapProps {
    layers: Array<{
      id: string;
      source: GeoJSONSourceSpecification | null;
      visible: boolean;
      type: "point" | "line" | "heatmap" | "fill" | "polygon";
      icons?: { [key: string]: string };
      paint?: {
        "line-color"?: string;
        "line-width"?: number;
        "line-opacity"?: number;
      };
    }>;
    mapStyle: StyleSpecification;
    zoomLocation: { lat: number; lng: number; zoom: number } | null;
  }
  
  const FTTHMap = forwardRef<
    { mapRef: React.MutableRefObject<mapboxgl.Map | null> },
    FTTHMapProps
  >(({ layers, mapStyle, zoomLocation }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapIsLoaded, setMapIsLoaded] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [isStyleloaded, setIsStyleloaded] = useState<boolean>(false);
  
    const addLayersToMap = () => {
      if (!mapRef.current) return;
  
      layers.forEach(({ id, source, visible, type, icons = {}, paint }) => {
        const layerExists = mapRef.current?.getLayer(id);
        const sourceExists = mapRef.current?.getSource(id);
  
        if (!sourceExists && source) {
          mapRef.current?.addSource(id, {
            ...source,
          });
        }
  
        if (!layerExists && mapRef.current?.getSource(id)) {
          switch (type) {
            case "point":
              addPointLayer(mapRef, id, source, icons, visible);
              break;
            case "line":
              addLineLayer(mapRef, id, source, paint, visible);
              break;
            case "heatmap":
              addHeatmapLayer(mapRef, id, source, paint, visible);
              break;
            case "fill":
              addFillLayer(mapRef, id, source, paint, visible);
              break;
            case "polygon":
              addFillLayer(mapRef, id, source, paint, visible);
              break;
            default:
              console.error("Unknown layer type", type);
              break;
          }
        } else if (layerExists) {
          mapRef.current?.setLayoutProperty(
            id,
            "visibility",
            visible ? "visible" : "none"
          );
        }
      });
    };
  
    useEffect(() => {
      if (!mapContainerRef.current) return;
  
      const initializeMap = () => {
        if (mapRef.current === null && mapContainerRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: mapStyle,
            center: [52.6771, 36.538],
            zoom: 13.5,
            maxZoom: 18,
          });
  
          mapRef.current.on("load", () => {
            setMapIsLoaded(true);
            addLayersToMap();
            dynamicZoom(mapRef, layers as LayerType[]);
            setIsStyleloaded(true);
          });
  
          mapRef.current.on("zoom", () =>
            dynamicZoom(mapRef, layers as LayerType[])
          );
        }
      };
  
      initializeMap();
    }, []);
  
    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.setStyle(mapStyle);
  
        mapRef.current.once("styledata", () => {
          addLayersToMap();
        });
      }
    }, [mapStyle]);
  
    useEffect(() => {
        if (mapRef.current && zoomLocation && isStyleloaded) {
          mapRef.current.flyTo({
            center: [zoomLocation.lng, zoomLocation.lat],
            zoom: zoomLocation.zoom,
            essential: true,
          });
  
          const marker = new Marker()
            .setLngLat([zoomLocation.lng, zoomLocation.lat])
            .addTo(mapRef.current);
  
          const url = new URL(window.location.href);
          url.search = "";
          window.history.replaceState({}, "", url.toString());
  
          return () => {
            marker.remove();
          };
        }
      }, [zoomLocation, isStyleloaded]);
  
    useEffect(() => {
      if (mapRef.current && mapIsLoaded) {
        layers.forEach(({ id, source, visible, type, icons = {}, paint }) => {
          const layerExists = mapRef.current?.getLayer(id);
          const sourceExists = mapRef.current?.getSource(id);
  
          if (!sourceExists && source) {
            mapRef.current?.addSource(id, {
              ...source,
            });
          }
  
          if (!layerExists && mapRef.current?.getSource(id)) {
            switch (type) {
              case "point":
                addPointLayer(mapRef, id, source, icons, visible);
                break;
              case "line":
                addLineLayer(mapRef, id, source, paint, visible);
                break;
              case "heatmap":
                addHeatmapLayer(mapRef, id, source, paint, visible);
                break;
              case "fill":
                addFillLayer(mapRef, id, source, paint, visible);
                break;
              case "polygon":
                addFillLayer(mapRef, id, source, paint, visible); // Corrected
                break;
              default:
                console.error("Unknown layer type", type);
                break;
            }
          } else if (layerExists) {
            mapRef.current?.setLayoutProperty(
              id,
              "visibility",
              visible ? "visible" : "none"
            );
          }
        });
      }
    }, [layers, mapIsLoaded]);
  
    useEffect(() => {
      if (!mapRef.current) return;
  
      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        const features = mapRef.current?.queryRenderedFeatures(e.point);
        if (features && features.length > 0) {
          const clickedFeature = features.find(
            (feature) =>
              feature.layer &&
              layers.map((layer) => layer.id).includes(feature.layer.id)
          );
  
          // If a valid feature is clicked
          if (clickedFeature) {
            // Extract and set modal data from the clicked feature
            const geometryType = clickedFeature.geometry.type;
            const featureData = {
              ...clickedFeature.properties,
              geometryType,
            };
            setModalData(featureData); // Set modal data only
          }
        }
      };
  
      mapRef.current.on("click", handleClick);
  
      // Cleanup event listener on component unmount
      return () => {
        if (mapRef.current) {
          mapRef.current.off("click", handleClick);
        }
      };
    }, [layers]);
  
    function debounce(func: (...args: any[]) => void, delay: number) {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    }
  
    const resizeMap = debounce(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 100);
  
    useEffect(() => {
      const observer = new ResizeObserver(() => {
        resizeMap();
      });
  
      if (mapContainerRef.current) {
        observer.observe(mapContainerRef.current);
      }
  
      return () => {
        if (mapContainerRef.current) {
          observer.unobserve(mapContainerRef.current);
        }
      };
    }, []);
  
    useImperativeHandle(ref, () => ({
      mapRef,
    }));
  
    return (
      <>
        <div ref={mapContainerRef} className="w-full h-screen" />
        {modalData && (
          <Modal data={modalData} onClose={() => setModalData(null)} />
        )}
      </>
    );
  });
  
  export default FTTHMap;
  