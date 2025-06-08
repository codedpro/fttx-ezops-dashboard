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

export const DataCardsClosestBlock: React.FC<DataCardsClosestBlockProps> = ({
  data,
}) => {
  // Helpers
  const humanize = (key: string) =>
    key
      // split camelCase or PascalCase
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      // uppercase first letter
      .replace(/^./, (s) => s.toUpperCase());

  // Map each field key to a nice label/icon/value extractor
  const fieldConfigs: Record<
    string,
    {
      label?: string;
      icon: JSX.Element;
      getValue?: (item: ClosestBlockItem) => string;
    }
  > = {
    stateName: { label: "State", icon: <FaCity className="text-green-500" /> },
    parish: { label: "Parish", icon: <FaCity className="text-purple-500" /> },
    locationType: {
      label: "Location",
      icon: <FaMapMarkerAlt className="text-red-500" />,
      getValue: (it) => `${it.locationType} – ${it.locationName}`,
    },
    avenue: {
      label: "Avenue",
      icon: <FaRoad className="text-yellow-500" />,
      getValue: (it) => `${it.avenueTypeName} ${it.avenue}`,
    },
    preAven: {
      label: "Pre Avenue",
      icon: <FaRoad className="text-indigo-500" />,
      getValue: (it) => `${it.preAvenTypeName} ${it.preAven}`,
    },
    floorNo: { label: "Floor No", icon: <FaBuilding className="text-teal-500" /> },
    plateNo: {
      label: "Plate No",
      icon: <FaClipboard className="text-orange-500" />,
      getValue: (it) => it.plateNo ?? "N/A",
    },
    unit: { label: "Unit", icon: <FaDoorOpen className="text-blue-600" /> },
    activity: { label: "Activity", icon: <FaClipboard className="text-red-400" /> },
    buildingName: {
      label: "Building Name",
      icon: <FaBuilding className="text-pink-500" />,
    },
    buildingType: {
      label: "Building Type",
      icon: <FaBuilding className="text-indigo-500" />,
    },
    entrance: { label: "Entrance", icon: <FaDoorOpen className="text-blue-600" /> },
    // address is handled as header/title
  };

  // Sort & navigation
  const sorted = [...data].sort((a, b) => a.floorNo - b.floorNo);
  const [idx, setIdx] = useState(0);
  const total = sorted.length;
  const item = sorted[idx];

  const handlePrev = () => setIdx((i) => (i - 1 + total) % total);
  const handleNext = () => setIdx((i) => (i + 1) % total);

  // Copy feedback
  const [copied, setCopied] = useState<{ field: string; id: number } | null>(
    null
  );
  const handleCopy = async (
    field: string,
    value: string,
    id: number
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied({ field, id });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* swallow */
    }
  };

  // Build list of fields to display
  const fields = (Object.keys(item) as (keyof typeof item)[])
    .filter((k) => !["id", "blockId", "address"].includes(k))
    .map((key) => {
      const cfg = fieldConfigs[key];
      const raw = cfg?.getValue ? cfg.getValue(item) : (item[key] ?? "N/A");
      return {
        key,
        label: cfg?.label || humanize(key),
        icon: cfg?.icon || <FaClipboard className="text-gray-400" />,
        value: String(raw),
      };
    });

  return (
    <div className="w-full">
      {/* Pager */}
      <div className="flex justify-between items-center mb-4 px-4">
        <button
          onClick={handlePrev}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full shadow-md"
        >
          <FaArrowLeft size={20} />
        </button>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Household {idx + 1} of {total}
        </span>
        <button
          onClick={handleNext}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full shadow-md"
        >
          <FaArrowRight size={20} />
        </button>
      </div>

      {/* Card */}
      <div
        className="max-w-3xl mx-auto bg-gradient-to-r from-blue-100 to-white dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-xl"
        title={item.address}
      >
        <h3
          className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4"
          title={item.address}
        >
          {item.address}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ key, label, icon, value }) => (
            <div key={key} className="flex items-center">
              {React.cloneElement(icon, { className: `${icon.props.className} mr-2 text-xl` })}
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {label}:
                </span>
                <p
                  className="cursor-pointer hover:underline text-gray-800 dark:text-gray-100"
                  onClick={() => handleCopy(key, value, item.id)}
                >
                  {value}
                  {copied?.field === key && copied.id === item.id && (
                    <span className="ml-2 text-xs text-green-500">Copied!</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
