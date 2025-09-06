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
  import type { FeatureCollection, Geometry, Position, Feature, MultiPolygon, Polygon } from "geojson";
  import { REGIONS } from "@/lib/map-data";
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
    };

    // --- NL Provinces + Region Borders (always on) ---
    const normalizeProvinceName = (raw: any) => {
      if (!raw) return null as string | null;
      const val = String(raw).toLowerCase().trim();
      const clean = val
        .replace(/^provincie\s+/i, "")
        .replace(/\s*province$/i, "")
        .replace(/-/g, "-")
        .replace(/\s+/g, " ");
      const canonical: Record<string, string> = {
        "groningen": "Groningen",
        "friesland": "Friesland",
        "fryslân": "Friesland",
        "drenthe": "Drenthe",
        "overijssel": "Overijssel",
        "gelderland": "Gelderland",
        "flevoland": "Flevoland",
        "utrecht": "Utrecht",
        "noord-holland": "Noord-Holland",
        "noord holland": "Noord-Holland",
        "zuid-holland": "Zuid-Holland",
        "zuid holland": "Zuid-Holland",
        "zeeland": "Zeeland",
        "noord-brabant": "Noord-Brabant",
        "noord brabant": "Noord-Brabant",
        "limburg": "Limburg",
      };
      if (canonical[clean]) return canonical[clean];
      const titled = clean.replace(/\b\w/g, (m) => m.toUpperCase());
      if (canonical[titled.toLowerCase()]) return canonical[titled.toLowerCase()];
      return titled;
    };

    const addRegionsOverlay = async () => {
      if (!mapRef.current) return;
      try {
        const res = await fetch("/netherlands-provinces.json");
        if (!res.ok) return;
        const raw = (await res.json()) as FeatureCollection<Geometry>;
        const processed: FeatureCollection<Geometry> = {
          type: "FeatureCollection",
          features: raw.features.map((f: any) => {
            const props = f.properties || {};
            const provRaw = props.name || props.NAME_1 || props.prov_name || props.Province || props.provincie || props.provincienaam || props.NAME;
            const provName = normalizeProvinceName(provRaw);
            let regionName: string | null = null;
            if (provName) {
              for (const [rName, cfg] of Object.entries(REGIONS)) {
                if (cfg.provinces.some((p) => normalizeProvinceName(p)?.toLowerCase() === provName.toLowerCase())) {
                  regionName = rName;
                  break;
                }
              }
            }
            return { ...f, properties: { ...props, name: provName || props.name, region: regionName || "" } } as any;
          }),
        };

        if (!mapRef.current.getSource("provinces")) {
          mapRef.current.addSource("provinces", { type: "geojson", data: processed });
        }

        const regionColorExpr: any = ["match", ["get", "region"]];
        const regionPalette: Record<string, string> = {
          "Noord-Nederland": "#4ade80",
          "Oost-Nederland": "#60a5fa",
          "Midden-Nederland": "#f59e0b",
          "Randstad-Noord": "#f472b6",
          "Randstad-Zuid": "#22d3ee",
          "Zuid-Nederland": "#a78bfa",
        };
        Object.keys(REGIONS).forEach((name) => {
          regionColorExpr.push(name, regionPalette[name] || "#cccccc");
        });
        regionColorExpr.push("#cccccc");

        if (!mapRef.current.getLayer("provinces-fill")) {
          mapRef.current.addLayer({ id: "provinces-fill", type: "fill", source: "provinces", paint: { "fill-color": regionColorExpr, "fill-opacity": 0.18 } });
        }
        if (!mapRef.current.getLayer("provinces-outline")) {
          mapRef.current.addLayer({ id: "provinces-outline", type: "line", source: "provinces", paint: { "line-color": "#666", "line-width": 1.2, "line-opacity": 0.7 } });
        }

        // Regions outline as MultiPolygon per region
        const regionsFC: FeatureCollection<Geometry> = { type: "FeatureCollection", features: [] };
        for (const [regionName, cfg] of Object.entries(REGIONS)) {
          const feats = processed.features.filter((f: any) => f.properties?.region === regionName);
          if (!feats.length) continue;
          const polys: Position[][][] = [];
          for (const f of feats as any[]) {
            if (f.geometry?.type === "Polygon") polys.push(f.geometry.coordinates);
            else if (f.geometry?.type === "MultiPolygon") for (const p of f.geometry.coordinates) polys.push(p);
          }
          if (!polys.length) continue;
          const geom: MultiPolygon = { type: "MultiPolygon", coordinates: polys };
          const asFeature: Feature<MultiPolygon> = { type: "Feature", geometry: geom, properties: { name: regionName } };
          regionsFC.features.push(asFeature);
        }
        if (!mapRef.current.getSource("regions")) {
          mapRef.current.addSource("regions", { type: "geojson", data: regionsFC });
        }
        if (!mapRef.current.getLayer("regions-outline")) {
          mapRef.current.addLayer({ id: "regions-outline", type: "line", source: "regions", paint: { "line-color": "#ffffff", "line-width": 3, "line-opacity": 0.9 } });
        }
      } catch (e) {
        console.warn("Provinces overlay load failed", e);
      }
    };

    useEffect(() => {
      if (!mapContainerRef.current) return;

      const initializeMap = () => {
        if (mapRef.current === null && mapContainerRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: mapStyle,
            center: [5.2913, 52.1326],
            zoom: 6,
            maxZoom: 18,
          });

          mapRef.current.on("load", () => {
            setMapIsLoaded(true);
            // Add provinces/regions first so they sit beneath other layers
            addRegionsOverlay().finally(() => {
              addLayersToMap();
              dynamicZoom(mapRef, layers as LayerType[]);
              setIsStyleloaded(true);
            });
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
  
