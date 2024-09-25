import React from "react";
import exportToKMZ from "@/utils/exportToKMZ";
import { exportToExcel } from "@/utils/exportToExcel";
import ClickOutside from "@/components/ClickOutside";
import TableFour from "../Tables/TableFour";

interface Feature {
  source: string;
  properties: { [key: string]: any };
  geometry: any;
}

interface PolygonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFeatures: Feature[];
}

const PolygonDetailModal: React.FC<PolygonDetailModalProps> = ({
  isOpen,
  onClose,
  selectedFeatures,
}) => {
  if (!isOpen) return null;

  const filteredFeatures = selectedFeatures.filter(
    (feature: Feature) =>
      feature.source !== "composite" && !feature.source.startsWith("mapbox")
  );

  const groupedFeatures = filteredFeatures.reduce(
    (acc: { [key: string]: Feature[] }, feature: Feature) => {
      const source = feature.source;
      if (!acc[source]) acc[source] = [];
      acc[source].push(feature);
      return acc;
    },
    {}
  );

  const statistics = Object.keys(groupedFeatures).map((source) => ({
    source,
    count: groupedFeatures[source].length,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 custom-scrollbar">
      <ClickOutside onClick={onClose} className="w-full max-w-5xl">
        <div className="bg-white dark:bg-[#122031] p-6 rounded-lg w-full max-w-5xl space-y-6 max-h-[80vh] overflow-hidden">
          <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">
            Polygon Area Details
          </h2>

          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => exportToExcel(groupedFeatures)}
              className="w-full sm:w-auto bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
            >
              Export to Excel
            </button>
            <button
              onClick={() => exportToKMZ(filteredFeatures)}
              className="w-full sm:w-auto bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
            >
              Export to KMZ
            </button>
          </div>

          <div className=" overflow-y-auto max-h-[60vh] custom-scrollbar overflow-x-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
              {statistics.map(({ source, count }, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1b2a3c] bg-grid-black/[0.01] dark:bg-grid-white/[0.01]  p-5 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  <p className="text-sm dark:text-gray-400 mb-1">{source}</p>
                  <p className="font-semibold text-lg dark:text-[#E2E8F0]">
                    Count: {count}
                  </p>
                </div>
              ))}
            </div>

            {Object.keys(groupedFeatures).map((source) => {
              const features = groupedFeatures[source];

              if (features.length > 0) {
                const columns = Object.keys(features[0].properties)
                  .filter(
                    (key) =>
                      key !== "ID" && key !== "icon" && key !== "iconSize"
                  )
                  .map((key) => ({
                    key,
                    label: key.replace(/_/g, " ").toUpperCase(),
                  }));

                return (
                  <div key={source} className="mb-6 mt-6 ">
                    <TableFour
                      data={features.map((feature) => {
                        const filteredProperties = { ...feature.properties };
                        delete filteredProperties.ID;
                        delete filteredProperties.icon;
                        delete filteredProperties.iconSize;
                        return filteredProperties;
                      })}
                      columns={columns}
                      header={source}
                      emoji="📍"
                    />
                  </div>
                );
              }
              return null;
            })}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default PolygonDetailModal;
