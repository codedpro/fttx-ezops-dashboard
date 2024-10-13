import React, { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdSearch } from "react-icons/io";
import PlacesSearchInput from "../../DesignDesk/Panels/PlacesSearchInput";

interface CityPanelProps {
  onCityClick: (city: { lat: number; lng: number; zoom: number }) => void;
  onSearch?: (query: string) => void;
}

const CityPanel: React.FC<CityPanelProps> = ({ onCityClick, onSearch }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSearchMinimized, setIsSearchMinimized] = useState(true);
  const cities = [
    { name: "Sadra", lat: 29.7998890028609, lng: 52.5047688858196, zoom: 14 },
    { name: "Babol", lat: 36.538, lng: 52.6771, zoom: 13 },
    {
      name: "Tehran",
      lat: 35.7579336107014,
      lng: 51.4701567993049,
      zoom: 16.5,
    },
    {
      name: "Arak",
      lat: 34.0862719,
      lng: 49.6893884,
      zoom: 14,
    },
    {
      name: "Tabriz",
      lat: 38.0575953,
      lng: 46.3000285,
      zoom: 11.5,
    },
  ];

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  const toggleSearchMinimized = () => {
    setIsSearchMinimized((prev) => !prev);
  };

  return (
    <>
      <div className="reletive">
        <div className="absolute top-4 right-4 flex items-start space-x-4 z-50">
          <button
            onClick={toggleSearchMinimized}
            className={`p-2 rounded-full mt-4 transition duration-200 bg-white bg-opacity-50 dark:bg-[#1F2937]  dark:bg-opacity-60 backdrop-blur-lg  text-4xl shadow-md 
              ${isSearchMinimized ? "text-black dark:text-gray-200 hover:text-black/85 dark:text-gray-200/85 " : "text-primary hover:text-primary/85"}`}
          >
            <IoMdSearch size={22} />
          </button>

          <div
            className={`z-30 m-2 p-2 bg-white bg-opacity-50 dark:bg-[#1F2937] dark:text-gray-200 text-black dark:bg-opacity-60 backdrop-blur-lg rounded-lg shadow-xl transition-all ${
              isMinimized
                ? "w-10 h-10 p-0 flex items-center justify-center"
                : "w-24"
            }`}
          >
            <div
              className={`flex justify-between items-center ${
                isMinimized ? "hidden" : ""
              }`}
            >
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
                    onClick={() =>
                      onCityClick({
                        lat: city.lat,
                        lng: city.lng,
                        zoom: city.zoom,
                      })
                    }
                    className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
                  >
                    <span className="text-xs font-medium">{city.name}</span>
                  </li>
                ))}
              </ul>
            )}

            {isMinimized && (
              <button
                onClick={toggleMinimized}
                className="flex items-center justify-center"
              >
                <IoMdArrowDropdown size={20} />
              </button>
            )}
          </div>
        </div>

        {/* PlacesSearchInput remains unaffected by the positioning */}
        {onSearch && !isSearchMinimized && (
          <PlacesSearchInput onSearch={onSearch} />
        )}
      </div>
    </>
  );
};

export default CityPanel;
