import React, { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdSearch } from "react-icons/io";
import PlacesSearchInput from "../../DesignDesk/Panels/PlacesSearchInput";
import { useFTTHCitiesStore } from "@/store/FTTHCitiesStore";

interface CityPanelProps {
  onCityClick: (city: { lat: number; lng: number; zoom: number }) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}

const CityPanel: React.FC<CityPanelProps> = ({
    onCityClick,
    onSearch,
    onClear,
  }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isSearchMinimized, setIsSearchMinimized] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { cities: cityList } = useFTTHCitiesStore((state) => ({
      cities: state.cities,
      isLoading: state.isLoading,
      error: state.error,
    }));
  
    const initialCities = ["Babol", "Tehran", "ARAK", "Tabriz"];
  
    const cities = cityList.map((city) => ({
      name: city.Full_Name,
      farsiName: city.Farsi,
      lat: city.Lat,
      lng: city.Long,
      zoom: 12,
    }));
  
    const filteredCities = searchQuery
      ? cities
          .filter((city) =>
            city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.farsiName.includes(searchQuery)
          )
          .slice(0, 4)
      : cities.filter((city) => initialCities.includes(city.name)).slice(0, 4);
  
    const toggleMinimized = () => {
      setIsMinimized((prev) => !prev);
    };
  
    const toggleSearchMinimized = () => {
      if (onClear) {
        setIsSearchMinimized((prev) => !prev);
        onClear();
      }
    };
  
    return (
      <>
        <div className="relative">
          <div className="absolute top-4 right-4 flex items-start space-x-4 z-50">
            {onSearch && onClear && (
              <button
                onClick={toggleSearchMinimized}
                className={`p-2 rounded-full mt-4 transition duration-200 bg-white bg-opacity-50 dark:bg-[#1F2937] dark:bg-opacity-60 backdrop-blur-lg text-4xl shadow-md ${
                  isSearchMinimized
                    ? "text-black dark:text-gray-200 hover:text-black/85 dark:text-gray-200/85"
                    : "text-primary hover:text-primary/85"
                }`}
              >
                <IoMdSearch size={22} />
              </button>
            )}
  
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
                <>
                  <input
                    type="text"
                    placeholder="Search city"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-1 text-xs bg-transparent border-b border-gray-300 dark:border-gray-600 text-black dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-0 mb-2"
                  />
  
                  <ul className="space-y-2">
                    {filteredCities.map((city) => (
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
                        <span
                          className={`font-medium ${
                            (city.farsiName.length > 10 || city.name.length > 10)
                              ? "text-[10px]"
                              : "text-xs"
                          }`}
                        >
                          {searchQuery && city.farsiName.includes(searchQuery)
                            ? city.farsiName
                            : city.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
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
  
          {onSearch && !isSearchMinimized && (
            <PlacesSearchInput onSearch={onSearch} />
          )}
        </div>
      </>
    );
  };
  
  export default CityPanel;
  