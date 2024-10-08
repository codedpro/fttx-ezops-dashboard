import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

interface PlacesSearchInputProps {
  onSearch: (query: string) => void;
}

const PlacesSearchInput: React.FC<PlacesSearchInputProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = () => {
    if (searchQuery && searchQuery !== "") {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full flex justify-center p-4 absolute top-0 z-50">
      <div className="flex items-center bg-white bg-opacity-50 dark:bg-gray-700 dark:bg-opacity-60 backdrop-blur-lg p-2 rounded-2xl shadow-md w-full max-w-sm sm:max-w-xs transition-transform duration-300 ease-in-out hover:scale-105 mx-2">
        <input
          type="text"
          placeholder="Search places..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-grow p-2 bg-transparent border-none outline-none placeholder:text-gray-600 dark:placeholder:text-gray-400 text-gray-800 dark:text-white transition-opacity duration-300 ease-in-out opacity-90 focus:opacity-100 text-sm sm:text-base"
        />
        <FaSearch
          className="text-gray-700 dark:text-gray-300 mr-2 cursor-pointer transition-transform duration-300 ease-in-out transform hover:scale-110"
          onClick={handleSearch}
        />
      </div>
    </div>
  );
};

export default PlacesSearchInput;
