import React, { useState } from "react";
import {
  FaCity,
  FaMapMarkerAlt,
  FaRoad,
  FaBuilding,
  FaClipboard,
  FaDoorOpen,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

export interface ClosestBlockItem {
  id: number;
  blockId: number;
  stateName: string;
  parish: string;
  avenueTypeName: string;
  avenue: string;
  preAvenTypeName: string;
  preAven: string;
  floorNo: number;
  locationType: string;
  locationName: string;
  plateNo: string | null;
  unit: string | null;
  activity: string | null;
  buildingName: string | null;
  buildingType: string | null;
  entrance: string | null;
  address: string;
}

interface DataCardsClosestBlockProps {
  data: ClosestBlockItem[];
}

export const DataCardsClosestBlock: React.FC<DataCardsClosestBlockProps> = ({ data }) => {
  // Sort the data by floor number (ascending)
  const sortedData = [...data].sort((a, b) => a.floorNo - b.floorNo);
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = sortedData.length;

  // Track which field was recently copied
  const [copied, setCopied] = useState<{ field: string; id: number } | null>(null);

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + total) % total);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % total);

  const handleCopy = async (field: string, value: string, id: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied({ field, id });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const item = sortedData[currentIndex];

  return (
    <div className="w-full">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4 px-4">
        <button
          onClick={handlePrev}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full shadow-md"
        >
          <FaArrowLeft size={20} />
        </button>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Household {currentIndex + 1} of {total}
        </span>
        <button
          onClick={handleNext}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full shadow-md"
        >
          <FaArrowRight size={20} />
        </button>
      </div>

      {/* Card Container with full address as the title attribute */}
      <div
        className="max-w-3xl mx-auto bg-gradient-to-r from-blue-100 to-white dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-xl"
        title={item.address}
      >
        {/* Header displays the full address */}
        <h3
          className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4"
          title={item.address}
        >
          {item.address}
        </h3>

        {/* Data Grid for remaining details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* State */}
          <div className="flex items-center">
            <FaCity className="text-xl text-green-500 mr-2" />
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">State:</span>
              <p
                className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                onClick={() => handleCopy("stateName", item.stateName, item.id)}
              >
                {item.stateName}
                {copied?.field === "stateName" && copied.id === item.id && (
                  <span className="ml-2 text-xs text-green-500">Copied!</span>
                )}
              </p>
            </div>
          </div>

          {/* Parish */}
          <div className="flex items-center">
            <FaCity className="text-xl text-purple-500 mr-2" />
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Parish:</span>
              <p
                className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                onClick={() => handleCopy("parish", item.parish, item.id)}
              >
                {item.parish}
                {copied?.field === "parish" && copied.id === item.id && (
                  <span className="ml-2 text-xs text-green-500">Copied!</span>
                )}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-xl text-red-500 mr-2" />
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Location:</span>
              <p
                className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                onClick={() =>
                  handleCopy(
                    "location",
                    `${item.locationType} - ${item.locationName}`,
                    item.id
                  )
                }
              >
                {item.locationType} - {item.locationName}
                {copied?.field === "location" && copied.id === item.id && (
                  <span className="ml-2 text-xs text-green-500">Copied!</span>
                )}
              </p>
            </div>
          </div>

          {/* Avenue */}
          <div className="flex items-center">
            <FaRoad className="text-xl text-yellow-500 mr-2" />
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Avenue:</span>
              <p
                className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                onClick={() =>
                  handleCopy("avenue", `${item.avenueTypeName} ${item.avenue}`, item.id)
                }
              >
                {item.avenueTypeName} {item.avenue}
                {copied?.field === "avenue" && copied.id === item.id && (
                  <span className="ml-2 text-xs text-green-500">Copied!</span>
                )}
              </p>
            </div>
          </div>

          {/* Pre Avenue */}
          <div className="flex items-center">
            <FaRoad className="text-xl text-indigo-500 mr-2" />
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Pre Avenue:</span>
              <p
                className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                onClick={() =>
                  handleCopy("preAvenue", `${item.preAvenTypeName} ${item.preAven}`, item.id)
                }
              >
                {item.preAvenTypeName} {item.preAven}
                {copied?.field === "preAvenue" && copied.id === item.id && (
                  <span className="ml-2 text-xs text-green-500">Copied!</span>
                )}
              </p>
            </div>
          </div>

          {/* Floor Number */}
          <div className="flex items-center">
            <FaBuilding className="text-xl text-teal-500 mr-2" />
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Floor No:</span>
              <p
                className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                onClick={() => handleCopy("floorNo", item.floorNo.toString(), item.id)}
              >
                {item.floorNo}
                {copied?.field === "floorNo" && copied.id === item.id && (
                  <span className="ml-2 text-xs text-green-500">Copied!</span>
                )}
              </p>
            </div>
          </div>

          {/* Plate Number */}
          <div className="flex items-center">
            <FaClipboard className="text-xl text-orange-500 mr-2" />
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Plate No:</span>
              <p
                className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                onClick={() => handleCopy("plateNo", item.plateNo ?? "N/A", item.id)}
              >
                {item.plateNo ?? "N/A"}
                {copied?.field === "plateNo" && copied.id === item.id && (
                  <span className="ml-2 text-xs text-green-500">Copied!</span>
                )}
              </p>
            </div>
          </div>

          {/* Optional: Building Name */}
          {item.buildingName && (
            <div className="flex items-center">
              <FaBuilding className="text-xl text-pink-500 mr-2" />
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Building Name:</span>
                <p
                  className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                  onClick={() => handleCopy("buildingName", item.buildingName ?? "N/A", item.id)}
                >
                  {item.buildingName}
                  {copied?.field === "buildingName" && copied.id === item.id && (
                    <span className="ml-2 text-xs text-green-500">Copied!</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Optional: Building Type */}
          {item.buildingType && (
            <div className="flex items-center">
              <FaBuilding className="text-xl text-indigo-500 mr-2" />
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Building Type:</span>
                <p
                  className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                  onClick={() =>
                    handleCopy("buildingType", item.buildingType ?? "N/A", item.id)
                  }
                >
                  {item.buildingType}
                  {copied?.field === "buildingType" && copied.id === item.id && (
                    <span className="ml-2 text-xs text-green-500">Copied!</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Optional: Entrance */}
          {item.entrance && (
            <div className="flex items-center">
              <FaDoorOpen className="text-xl text-blue-600 mr-2" />
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Entrance:</span>
                <p
                  className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                  onClick={() =>
                    handleCopy("entrance", item.entrance ?? "N/A", item.id)
                  }
                >
                  {item.entrance}
                  {copied?.field === "entrance" && copied.id === item.id && (
                    <span className="ml-2 text-xs text-green-500">Copied!</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
