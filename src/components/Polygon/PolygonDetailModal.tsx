import React from "react";
import TableThree from "../Tables/TableThree";
import { FaMapMarkerAlt } from "react-icons/fa";
import * as XLSX from "xlsx";

interface Feature {
  source: string;
  properties: { [key: string]: any };
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

  const exportToExcel = () => {
    const dataToExport = filteredFeatures.map(
      (feature: Feature) => feature.properties
    );
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Polygon Features");
    XLSX.writeFile(workbook, "polygon_features.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
      <div className="bg-white dark:bg-[#122031] p-6 rounded-lg w-full max-w-4xl space-y-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">
          Polygon Feature Details
        </h2>

        <div className="flex justify-end mb-4">
          <button
            onClick={exportToExcel}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
          >
            Export to Excel
          </button>
        </div>

        {Object.keys(groupedFeatures).map((source) => {
          const features = groupedFeatures[source];

          if (features.length > 0) {
            const columns = Object.keys(features[0].properties).map((key) => ({
              key,
              label: key.replace(/_/g, " ").toUpperCase(),
            }));

            return (
              <div key={source} className="mb-6 max-h-[300px] overflow-y-auto">
                <TableThree
                  data={features.map((feature) => feature.properties)}
                  columns={columns}
                  header={`Source: ${source}`}
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
  );
};

export default PolygonDetailModal;
