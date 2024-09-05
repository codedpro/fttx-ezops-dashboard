import React, { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

interface CityPanelProps {
  onCityClick: (city: { lat: number; lng: number }) => void;
}

const CityPanel: React.FC<CityPanelProps> = ({ onCityClick }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const cities = [
    { name: "Shiraz", lat: 29.5918, lng: 52.5836 },
    { name: "Babol", lat: 36.538, lng: 52.6771 },
    { name: "Tehran", lat: 35.6892, lng: 51.389 },
  ];

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div
      className={`absolute top-4 right-4 z-30 m-2 p-2 bg-white bg-opacity-50 dark:bg-[#1F2937] dark:text-gray-200 text-black dark:bg-opacity-60 backdrop-blur-lg rounded-lg shadow-xl transition-all ${
        isMinimized ? "w-10 h-10 p-0 flex items-center justify-center" : "w-24"
      }`}
    >
      <div className={`flex justify-between items-center ${isMinimized ? "hidden" : ""}`}>
        <h3 className="font-bold mb-2">Cities</h3>
        <button
          onClick={toggleMinimized}
          className="flex items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
        >
          {isMinimized ? (
            <IoMdArrowDropdown size={20} />
          ) : (
            <IoMdArrowDropup size={20} />
          )}
        </button>
      </div>

      {!isMinimized && (
        <ul className="space-y-2">
          {cities.map((city) => (
            <li
              key={city.name}
              onClick={() => onCityClick({ lat: city.lat, lng: city.lng })}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
            >
              <span className="text-xs font-medium">{city.name}</span>
            </li>
          ))}
        </ul>
      )}

      {isMinimized && (
        <button onClick={toggleMinimized} className="flex items-center justify-center">
          <IoMdArrowDropdown size={20} />
        </button>
      )}
    </div>
  );
};

export default CityPanel;
