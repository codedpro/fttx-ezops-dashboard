import Image from "next/image";
import React from "react";
import { FaDrawPolygon } from "react-icons/fa";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

interface Layer {
  id: string;
  visible: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  icon: string;
  type: "point" | "line" | "heatmap" | "fill" | "polygon";
}

// For tiles, you only have a toggle() without setState, so define a simpler type:
interface Tile {
  id: string;
  visible: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
  label: string;
  icon: string;
}

interface LayerPanelProps {
  title: string;
  layers: Layer[];
  tiles?: Tile[];
  isMinimized: boolean;
  toggleMinimized: () => void;
  customPosition: "top-left" | "bottom-left";
  isPolygonMode?: boolean;
  togglePolygonMode?: () => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  title,
  layers,
  tiles,
  isMinimized,
  toggleMinimized,
  customPosition,
  isPolygonMode,
  togglePolygonMode,
}) => {
  const positionClasses =
    customPosition === "top-left" ? "top-4 left-4" : "bottom-4 left-4";

  const ArrowIcon = () =>
    isMinimized ? <IoMdArrowDropdown size={20} /> : <IoMdArrowDropup size={20} />;

  const visibleLayers = layers.filter((layer) => layer.label !== "");
  const visibleTiles = tiles?.filter((tile) => tile.label !== "");

  return (
    <div className={`absolute z-30 ${positionClasses} flex flex-col space-y-2`}>
      <div
        className={`m-2 p-2 bg-white bg-opacity-50 dark:bg-[#1F2937] dark:text-gray-200 text-black dark:bg-opacity-60 backdrop-blur-lg rounded-lg shadow-xl transition-all duration-200 ease-in-out transform ${
          isMinimized ? "w-10 h-10 p-0 flex items-center justify-center" : ""
        }`}
      >
        <button
          onClick={toggleMinimized}
          className={`${
            isMinimized
              ? "w-full h-full flex items-center justify-center"
              : "flex justify-between items-center w-full"
          } transition-opacity duration-100`}
        >
          {!isMinimized && <h3 className="font-bold mb-2">{title}</h3>}
          <ArrowIcon />
        </button>

        {!isMinimized && (
          <div className="space-y-3 transition-all duration-100 ease-in-out transform">
            {/* Vector Layers */}
            {visibleLayers.map((layer) => (
              <div className="flex items-center space-x-2" key={layer.id}>
                {/* If it's point/heatmap/fill, show an icon image, else a color circle */}
                {layer.type === "point" ||
                layer.type === "heatmap" ||
                layer.type === "fill" ? (
                  <Image
                    src={layer.icon}
                    alt={layer.label}
                    width={24}
                    height={24}
                    className="w-4 h-4"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: layer.icon }}
                    className="w-4 h-4 rounded-full"
                  ></div>
                )}

                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={() => layer.toggle((prev) => !prev)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border-2 border-gray-400 peer-checked:border-primary rounded-sm bg-white dark:bg-gray-700 peer-checked:bg-primary transition-all duration-300 relative">
                    <svg
                      className="absolute inset-0 w-full h-full fill-current text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-100"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.285 5.794l-11.243 11.243-5.657-5.657 1.414-1.414 4.243 4.243 9.829-9.829z" />
                    </svg>
                  </div>
                  <span
                    className={`ml-2 text-xs font-medium transition-colors duration-0 whitespace-nowrap overflow-hidden text-ellipsis ${
                      layer.visible
                        ? "text-primary"
                        : "text-gray-300 dark:text-gray-400"
                    }`}
                  >
                    {layer.label}
                  </span>
                </label>
              </div>
            ))}

            {/* Raster Tiles (if provided) */}
            {visibleTiles &&
              visibleTiles.map((tile) => (
                <div className="flex items-center space-x-2" key={tile.id}>
                  <Image
                    src={tile.icon}
                    alt={tile.label}
                    width={24}
                    height={24}
                    className="w-4 h-4"
                  />
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tile.visible}
                      onChange={() =>
                        typeof tile.toggle === "function"
                          ? tile.toggle((prev: any) => !prev) // or just tile.toggle()
                          : null
                      }
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 border-2 border-gray-400 peer-checked:border-primary rounded-sm bg-white dark:bg-gray-700 peer-checked:bg-primary transition-all duration-300 relative">
                      <svg
                        className="absolute inset-0 w-full h-full fill-current text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-100"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.285 5.794l-11.243 11.243-5.657-5.657 1.414-1.414 4.243 4.243 9.829-9.829z" />
                      </svg>
                    </div>
                    <span
                      className={`ml-2 text-xs font-medium transition-colors duration-0 whitespace-nowrap overflow-hidden text-ellipsis ${
                        tile.visible
                          ? "text-primary"
                          : "text-gray-300 dark:text-gray-400"
                      }`}
                    >
                      {tile.label}
                    </span>
                  </label>
                </div>
              ))}
          </div>
        )}
      </div>

      {customPosition === "top-left" && isPolygonMode !== undefined ? (
        <div className="flex ml-2">
          <FaDrawPolygon
            className={`cursor-pointer transition-colors duration-300 ${
              isPolygonMode ? "text-green-500" : "dark:text-red-500"
            }`}
            size={30}
            onClick={togglePolygonMode}
            title="Select Area"
          />
        </div>
      ) : null}
    </div>
  );
};

export default LayerPanel;
