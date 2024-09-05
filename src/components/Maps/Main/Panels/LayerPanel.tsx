import React from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

interface Layer {
  id: string;
  visible: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  icon: React.ReactNode;
  type: "point" | "line";
}

interface LayerPanelProps {
  title: string;
  layers: Layer[];
  isMinimized: boolean;
  toggleMinimized: () => void;
  customPosition: "top-left" | "bottom-left";
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  title,
  layers,
  isMinimized,
  toggleMinimized,
  customPosition,
}) => {
  const positionClasses =
    customPosition === "top-left" ? "top-4 left-4" : "bottom-4 left-4";

  const isBottomLeft = customPosition === "bottom-left";

  return (
    <div
      className={`absolute z-30 m-4 p-4 bg-white bg-opacity-30 dark:bg-[#1F2937] dark:text-gray-200 text-black dark:bg-opacity-60 backdrop-blur-lg rounded-lg shadow-xl transition-all ${positionClasses} ${
        isMinimized ? "h-12" : "h-auto"
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold mb-2">{title}</h3>
        <button
          onClick={toggleMinimized}
          className="flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
        >
          {isMinimized ? (
            <IoMdArrowDropdown
              size={20}
              className={`transition-transform duration-200 ${
                isBottomLeft ? "rotate-180" : ""
              }`}
            />
          ) : (
            <IoMdArrowDropup
              size={20}
              className={`transition-transform duration-200 ${
                isBottomLeft ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      </div>
      {!isMinimized && (
        <div className="space-y-3">
          {layers.map((layer) => (
            <div className="flex items-center space-x-2" key={layer.id}>
              {layer.icon}
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => layer.toggle((prev) => !prev)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border-2 border-gray-400 peer-checked:border-primary rounded-sm bg-white dark:bg-gray-700 peer-checked:bg-primary transition-all duration-300 relative">
                  <svg
                    className="absolute inset-0 w-full h-full fill-current text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-300"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.285 5.794l-11.243 11.243-5.657-5.657 1.414-1.414 4.243 4.243 9.829-9.829z" />
                  </svg>
                </div>
                <span
                  className={`ml-2 text-xs font-medium transition-colors duration-300 ${
                    layer.visible ? "text-primary" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {layer.label}
                </span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerPanel;
