import React, { useState, useRef, useEffect } from "react";
import { FaMap, FaSatellite, FaMountain, FaSun, FaMoon } from "react-icons/fa";
import { gsap } from "gsap";
import ClickOutside from "@/components/ClickOutside";

const mapStyles = [
  {
    id: "streets",
    name: "Streets",
    style: "mapbox://styles/mapbox/streets-v12",
    icon: <FaMap />,
  },
  {
    id: "satellite",
    name: "Satellite",
    style: "mapbox://styles/mapbox/satellite-v9",
    icon: <FaSatellite />,
  },
  {
    id: "outdoors",
    name: "Outdoors",
    style: "mapbox://styles/mapbox/outdoors-v11",
    icon: <FaMountain />,
  },
  {
    id: "light",
    name: "Light",
    style: "mapbox://styles/mapbox/light-v10",
    icon: <FaSun />,
  },
  {
    id: "dark",
    name: "Dark",
    style: "mapbox://styles/mapbox/dark-v10",
    icon: <FaMoon />,
  },
];

interface StylePanelProps {
  onStyleChange: (style: string) => void;
  selectedStyle: string;
}

const StylePanel: React.FC<StylePanelProps> = ({ onStyleChange, selectedStyle }) => {
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
                      selectedStyle === style.style
                        ? "bg-primary text-white border border-primary scale-105"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => onStyleChange(style.style)}
                >
                  <span className="w-8 h-8 rounded-full mr-3 flex justify-center items-center text-2xl">
                    {style.icon}
                  </span>
                  <span
                    className={`flex-grow ${
                      selectedStyle === style.style
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
