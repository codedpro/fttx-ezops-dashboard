"use client";

import React, { useState } from "react";
import { ExportItemType, ExportParams, ExportResponse } from "@/types/exports";
import * as XLSX from "xlsx";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Select } from "../FormElements/Select";

interface ExportItemProps {
  exportItem: ExportItemType;
}

const ExportItem: React.FC<ExportItemProps> = ({ exportItem }) => {
  const [city, setCity] = useState<string>("");
  const [numberParameter, setNumberParameter] = useState<number | "">("");
  const [planStatus, setPlanStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true); // Collapsible state

  const handleDownload = async () => {
    setLoading(true);

    const params: ExportParams = { id: exportItem.id };
    if (exportItem.isCity) params.city = city;
    if (exportItem.isNumberParameter && typeof numberParameter === "number") {
      params.numberParameter = numberParameter;
    }
    if (exportItem.isPlanStatus) params.planStatus = planStatus;

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch export data");
      }

      const data: ExportResponse = await response.json();

      // Generate XLSX file
      const xlsxData = generateXLSX(data);

      // Create a blob and trigger download
      const blob = new Blob([xlsxData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const date = new Date();
      const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}_${date
        .getHours()
        .toString()
        .padStart(
          2,
          "0"
        )}-${date.getMinutes().toString().padStart(2, "0")}-${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

      a.download = `${exportItem.name}_${dateString}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to download export");
    } finally {
      setLoading(false);
    }
  };

  const generateXLSX = (data: ExportResponse): ArrayBuffer => {
    const wb = XLSX.utils.book_new();

    for (const sheetName in data) {
      const wsData = data[sheetName];
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const xlsxData = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return xlsxData;
  };

  return (
    <div className="export-item mb-4 rounded-lg border border-stroke bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
      {/* Collapsible Header */}
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-medium text-dark dark:text-white">
          {exportItem.name}
        </h3>
        {isCollapsed ? (
          <FaChevronDown className="text-gray-600 dark:text-gray-300" />
        ) : (
          <FaChevronUp className="text-gray-600 dark:text-gray-300" />
        )}
      </div>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="p-4 ">
          <div className="space-y-4 lg:space-y-0 lg:flex lg:space-x-4 lg:items-end">
            {exportItem.isCity && exportItem.cities && (
              <div className="w-full lg:w-1/4">
                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                  City:
                </label>
                <Select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className=""
                >
                  <option value="">Select City</option>
                  {exportItem.cities.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {exportItem.isNumberParameter && exportItem.numberParameters && (
              <div className="w-full lg:w-1/4">
                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                  Radius Distance:
                </label>
                <Select
                  value={numberParameter}
                  onChange={(e) =>
                    setNumberParameter(
                      e.target.value ? parseInt(e.target.value) : ""
                    )
                  }
                  className=""
                >
                  <option value="">Select Distance</option>
                  {exportItem.numberParameters.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {exportItem.isPlanStatus && exportItem.planStatus && (
              <div className="w-full lg:w-1/4">
                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                  Plan Status:
                </label>
                <Select
                  value={planStatus}
                  onChange={(e) => setPlanStatus(e.target.value)}
                  className=""
                >
                  <option value="">Select Status</option>
                  {exportItem.planStatus.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="w-full lg:w-1/4">
              <button
                onClick={handleDownload}
                disabled={loading}
                className={`mt-5  mb-1 lg:mt-0 w-full lg:w-auto flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportItem;
