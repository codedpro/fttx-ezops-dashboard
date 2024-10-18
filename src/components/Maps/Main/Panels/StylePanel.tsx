import React, { useState, useRef, useEffect } from "react";
import { FaMap, FaSatellite, FaMountain } from "react-icons/fa";
import { gsap } from "gsap";
import ClickOutside from "@/components/ClickOutside";
import {
  StyleSpecification,
  RasterSourceSpecification,
  RasterLayerSpecification,
} from "mapbox-gl";

const lightStyle: StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const DarkStyle: StyleSpecification = {
  version: 8,
  sources: {
    "grayscale-tiles": {
      type: "raster",
      tiles: [
        "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "Irancell",
    } as RasterSourceSpecification,
  },
  layers: [
    {
      id: "grayscale-layer",
      type: "raster",
      source: "grayscale-tiles",
      minzoom: 0,
      maxzoom: 20,
    } as RasterLayerSpecification,
  ],
};
const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    "stadia-satellite-tiles": {
      type: "raster",
      tiles: [
        "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg",
      ],
      tileSize: 256,
      attribution:
        "© CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | " +
        '© <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> | ' +
        '© <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> | ' +
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    } as RasterSourceSpecification,
  },
  layers: [
    {
      id: "stadia-satellite-layer",
      type: "raster",
      source: "stadia-satellite-tiles",
      minzoom: 0,
      maxzoom: 20,
    } as RasterLayerSpecification,
  ],
};

/* const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    "satellite-tiles": {
      type: "raster",
      tiles: ["http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
      tileSize: 256,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "Irancell",
    } as RasterSourceSpecification,
  },
  layers: [
    {
      id: "satellite-layer",
      type: "raster",
      source: "satellite-tiles",
      minzoom: 0,
      maxzoom: 20,
    } as RasterLayerSpecification,
  ],
}; */

interface MapStyle {
  id: string;
  name: string;
  style: StyleSpecification;
  icon: React.ReactNode;
}

const mapStyles: MapStyle[] = [
  {
    id: "Light",
    name: "Light",
    style: lightStyle,
    icon: <FaMap />,
  },
  {
    id: "Dark",
    name: "Dark",
    style: DarkStyle,
    icon: <FaMap />,
  },
  {
    id: "satellite",
    name: "satellite",
    style: satelliteStyle,
    icon: <FaMountain />,
  },
  //  {
  //   id: "satellite",
  //  name: "Satellite",
  // style: satelliteStyle,
  //  icon: <FaSatellite />,
  //},
];

interface StylePanelProps {
  onStyleChange: (style: StyleSpecification, id: string) => void;
  selectedStyleId: string;
}

const StylePanel: React.FC<StylePanelProps> = ({
  onStyleChange,
  selectedStyleId,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isPanelOpen && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [isPanelOpen]);

  const handleButtonHover = (scale: number) => {
    gsap.to(buttonRef.current, { scale, duration: 0.2, ease: "power1.out" });
  };

  return (
    <div className="absolute bottom-4 right-4 z-40">
      <button
        ref={buttonRef}
        className="p-4 bg-primary rounded-full shadow-lg map-toggle-btn hover:bg-primary-dark transition-all duration-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        onMouseEnter={() => handleButtonHover(1.1)}
        onMouseLeave={() => handleButtonHover(1)}
      >
        <FaMap size={24} className="text-white" />
      </button>

      {isPanelOpen && (
        <ClickOutside
          onClick={() => setIsPanelOpen(false)}
          exceptionRef={buttonRef}
        >
          <div
            ref={panelRef}
            className="mt-3 p-5 bg-white dark:bg-gray-900 rounded-lg shadow-2xl transition-transform origin-bottom-right"
          >
            <h4 className="text-sm font-bold mb-4 dark:text-gray-200 text-primary">
              Choose Map Style
            </h4>
            <div className="space-y-3">
              {mapStyles.map((style) => (
                <div
                  key={style.id}
                  className={`p-3 flex items-center rounded-lg cursor-pointer transition-transform duration-300 transform
                    ${
                      selectedStyleId === style.id
                        ? "bg-primary text-white border border-primary scale-105"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => {
                    onStyleChange(style.style, style.id);
                    setIsPanelOpen(false);
                  }}
                >
                  <span className="w-8 h-8 rounded-full mr-3 flex justify-center items-center text-2xl">
                    {style.icon}
                  </span>
                  <span
                    className={`flex-grow ${
                      selectedStyleId === style.id
                        ? "text-white dark:text-gray-300"
                        : "text-gray-700 dark:text-gray-300"
                    } text-sm`}
                  >
                    {style.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ClickOutside>
      )}
    </div>
  );
};

export default StylePanel;
