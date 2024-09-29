import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import mapboxgl, { GeoJSONSourceSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Modal } from "./Panels/Modal";
import { useEditFeature } from "@/hooks/useEditFeature";
import { useSuggestFATLine } from "@/hooks/useSuggestFATLine";
import {
  addPointLayer,
  addLineLayer,
  addHeatmapLayer,
  addFillLayer,
} from "@/utils/mapLayers";

import { FTTHMapProps, LayerType } from "@/types/FTTHMapProps";
mapboxgl.accessToken = "Dummy" ?? "???";
import { dynamicZoom } from "@/utils/dynamicZoom";
const PreOrdersMap = forwardRef<
  {
    handleEditPoint: (data: any) => void;
    mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  },
  FTTHMapProps
>(
  (
    {
      layers,
      mapStyle,
      zoomLocation,
      onEdit,
      isEditMode,
      onCoordinatesChange,
      onPathPanelChange,
    },
    ref
  ) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [mapIsLoaded, setMapIsLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const isEditModeRef = useRef(isEditMode);
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
            default:
              console.error("Unknown layer type", type);
              break;
          }
        }
      });
    };

    useEffect(() => {
      if (!mapContainerRef.current) return;

      const initializeMap = () => {
        if (!mapRef.current && mapContainerRef.current) {
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: mapStyle,
            center: [52.6771, 36.538],
            zoom: 13.5,
            maxZoom: 18,
          });

          mapRef.current.on("load", () => {
            setMapIsLoaded(true);

            setTimeout(() => {
              addLayersToMap();
              dynamicZoom(mapRef, layers as LayerType[]);
              setIsStyleloaded(true);
            }, 50);
          });
          mapRef.current.on("zoom", () =>
            dynamicZoom(mapRef, layers as LayerType[])
          );

          mapRef.current.on("mouseenter", "suggestedFATSGrayFill", (e) => {
            mapRef.current!.getCanvas().style.cursor = "pointer";

            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              const coordinates = e.lngLat;

              new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
              })
                .setLngLat(coordinates)
                .setHTML(
                  `<strong>Count: </strong> ${feature.properties?.Count}`
                )
                .addTo(mapRef.current!);
            }
          });

          mapRef.current.on("mouseleave", "suggestedFATSGrayFill", () => {
            mapRef.current!.getCanvas().style.cursor = "";

            const popups = document.getElementsByClassName("mapboxgl-popup");
            if (popups.length > 0) {
              Array.from(popups).forEach((popup) => popup.remove());
            }
          });

          if (isEditMode) {
            return;
          }
        }
      };

      initializeMap();
    }, []);

    useEffect(() => {
      if (!mapRef.current) return;

      const handleClick = (e: mapboxgl.MapMouseEvent) => {
        if (isEditMode) {
          return;
        }

        const features = mapRef.current?.queryRenderedFeatures(e.point);
        if (features && features.length > 0) {
          const clickedFeature = features.find(
            (feature) =>
              feature.layer &&
              layers.map((layer) => layer.id).includes(feature.layer.id)
          );

          if (clickedFeature) {
            setModalData(clickedFeature.properties);
            setIsModalOpen(true);
          }
        }
      };

      mapRef.current.on("click", handleClick);

      return () => {
        if (mapRef.current) {
          mapRef.current.off("click", handleClick);
        }
      };
    }, [isEditMode, layers]);

    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.setStyle(mapStyle);
        mapRef.current.once("styledata", () => {
          if (mapIsLoaded) {
            setTimeout(() => {
              addLayersToMap();
            }, 50);
          }
        });
      }
    }, [mapStyle, mapIsLoaded]);

    useEffect(() => {
      if (mapRef.current && zoomLocation && isStyleloaded) {
        mapRef.current.flyTo({
          center: [zoomLocation.lng, zoomLocation.lat],
          zoom: zoomLocation.zoom,
          essential: true,
        });

        const url = new URL(window.location.href);
        url.search = "";
        window.history.replaceState({}, "", url.toString());
      }
    }, [zoomLocation, isStyleloaded]);

    useEffect(() => {
      if (mapRef.current && mapIsLoaded) {
        layers.forEach(({ id, source, visible }) => {
          const layerExists = mapRef.current?.getLayer(id);
          const existingSource = mapRef.current?.getSource(id);

          if (existingSource && source) {
            (existingSource as mapboxgl.GeoJSONSource).setData(
              source.data as GeoJSON.FeatureCollection<GeoJSON.Geometry>
            );
          }
          if (!layerExists) {
            addLayersToMap();
          } else {
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

      layers.forEach(({ id }) => {
        if (mapRef.current?.getLayer(id)) {
          mapRef.current.on("mouseenter", id, () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = "pointer";
            }
          });

          mapRef.current.on("mouseleave", id, () => {
            if (mapRef.current) {
              mapRef.current.getCanvas().style.cursor = "";
            }
          });
        }
      });

      return () => {
        layers.forEach(({ id }) => {
          if (mapRef.current?.getLayer(id)) {
            mapRef.current?.on("mouseenter", id, () => {
              /* ... */
            });
            mapRef.current?.on("mouseleave", id, () => {
              /* ... */
            });
          }
        });
      };
    }, [layers, mapIsLoaded]);

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

    const closeModal = () => {
      setIsModalOpen(false);
      setModalData(null);
    };

    const {
      currentCoordinates,
      handleEditPoint,
      handleSubmitEdit,
      handleCancelEdit,
      handleMovePoint,
    } = useEditFeature(mapRef, addLayersToMap, setIsModalOpen);

    const {
      handleSuggestFATLine,
      handleSavePath,
      handleCancelPath,
      isPathPanelOpen,
      selectedPath,
      removeSuggestedPaths,
    } = useSuggestFATLine(mapRef);

    useEffect(() => {
      if (onCoordinatesChange) {
        onCoordinatesChange(currentCoordinates);
      }
    }, [currentCoordinates, onCoordinatesChange]);

    useEffect(() => {
      if (onPathPanelChange) {
        onPathPanelChange(isPathPanelOpen, selectedPath);
      }
    }, [isPathPanelOpen, selectedPath, onPathPanelChange]);

    useImperativeHandle(ref, () => ({
      handleEditPoint: (data: any) => {
        if (handleEditPoint) {
          handleEditPoint(data);
        }
      },
      handleSubmitPointEdit: () => {
        if (handleSubmitEdit) {
          handleSubmitEdit();
        }
      },
      handleCancelPointEdit: () => {
        handleCancelEdit();
      },
      handleSuggestFATLine: (data: any) => {
        handleSuggestFATLine(data);
      },
      handleSaveSuggestedPath: () => {
        handleSavePath();
      },
      handleCancelSuggestedPath: () => {
        handleCancelPath();
      },
      handleCancelEditPath: () => {
        removeSuggestedPaths();
      },
      handlemoveEditPoint: (newCoordinates: { lat: number; lng: number }) => {
        handleMovePoint(newCoordinates);
      },
      mapRef,
    }));

    return (
      <div className="w-full h-screen relative ">
        <div ref={mapContainerRef} className="w-full h-screen" />
        {isModalOpen && modalData && (
          <Modal data={modalData} onClose={closeModal} onEdit={onEdit} />
        )}
      </div>
    );
  }
);

export default PreOrdersMap;
