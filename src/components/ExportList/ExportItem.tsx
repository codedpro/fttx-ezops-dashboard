"use client";

import React, { useState, useEffect } from "react";
import { ExportItemType, ExportResponse } from "@/types/exports";
import * as XLSX from "xlsx-js-style";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Select } from "../FormElements/Select";
import { UserService } from "@/services/userService";
import axios from "axios";
import { saveAs } from "file-saver";

interface ExportItemProps {
  exportItem: ExportItemType;
}

const ExportItem: React.FC<ExportItemProps> = ({ exportItem }) => {
  const [city, setCity] = useState<string>("");
  const [numberParameter, setNumberParameter] = useState<number | null>(null);
  const [planStatus, setPlanStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [isDownloadEnabled, setIsDownloadEnabled] = useState<boolean>(false);
  const userservice = new UserService();

  useEffect(() => {
    const cityRequired = exportItem.isCity && city;
    const numberParameterRequired =
      exportItem.isNumberParameter && numberParameter !== null;
    const planStatusRequired = exportItem.isPlanStatus && planStatus;

    setIsDownloadEnabled(
      Boolean(
        (!exportItem.isCity || cityRequired) &&
          (!exportItem.isNumberParameter || numberParameterRequired) &&
          (!exportItem.isPlanStatus || planStatusRequired)
      )
    );
  }, [city, numberParameter, planStatus, exportItem]);

  const handleDownload = async () => {
    const token = userservice.getToken();
    setLoading(true);

    const exportDto = {
      ID: exportItem.id,
      City: exportItem.isCity ? city : "",
      NumberParameter:
        exportItem.isNumberParameter && numberParameter !== null
          ? numberParameter
          : null,
      PlanStatus: exportItem.isPlanStatus ? planStatus : "",
    };

    const config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDynamicExport`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: exportDto,
    };

    try {
      const response = await axios(config);

      if (response.status !== 200) {
        throw new Error("Failed to fetch export data");
      }

      const data = response.data;
      if (Array.isArray(data) && data.length === 0) {
        alert(
          "We don't have any data based on your parameters. Please change your parameters."
        );
        return;
      }
      const xlsxData = generateXLSX(data as any[]);

      const blob = new Blob([s2ab(xlsxData)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

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

      saveAs(blob, `${exportItem.name}_${dateString}.xlsx`);
    } catch (error) {
      console.error("Failed to download export:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateXLSX = (data: any[]): string => {
    if (data.length === 0) {
      console.error("No data provided for export.");
      return "";
    }
  
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
  
    // Calculate column widths dynamically
    const columns = Object.keys(data[0] || {});
    const columnWidths = columns.map((col) => ({
      wch: Math.max(
        ...data.map((row) => (row[col] ? row[col].toString().length : 10)),
        col.length
      ) + 5, // Add padding
    }));
    ws["!cols"] = columnWidths;
  
    // Apply styles to all cells
    Object.keys(ws).forEach((key) => {
      if (key.startsWith("!")) return; // Skip metadata
      ws[key].s = {
        alignment: { horizontal: "center", vertical: "center" },
        font: { bold: false, sz: 11, color: { rgb: "333333" } },
        fill: {
          fgColor: { rgb: "FFFFFF" }, // Standard row background
        },
        border: {
          top: { style: "thin", color: { rgb: "CCCCCC" } },
          bottom: { style: "thin", color: { rgb: "CCCCCC" } },
          left: { style: "thin", color: { rgb: "CCCCCC" } },
          right: { style: "thin", color: { rgb: "CCCCCC" } },
        },
      };
    });
  
    // Apply styles to header row
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[headerCell]) {
        ws[headerCell].s = {
          alignment: { horizontal: "center", vertical: "center" },
          font: { bold: true, sz: 14, color: { rgb: "333333" } }, // Dark text on brand color
          fill: { fgColor: { rgb: "FECA00" } }, // Brand color for header
        };
      }
    }
  
    // Apply alternating row colors
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (ws[cellRef]) {
          ws[cellRef].s.fill = {
            fgColor: {
              rgb: row % 2 === 0 ? "F8F8F2" : "FFFFFF", // Cool complementary colors
            },
          };
        }
      }
    }
  
    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
    // Return the binary string
    return XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  };
  
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  return (
    <div className="export-item mb-4 rounded-lg border border-stroke bg-white shadow-sm dark:border-dark-3 dark:bg-gray-dark">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-xs md:text-lg font-medium text-dark dark:text-white flex items-baseline flex-wrap">
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {exportItem.name}
          </span>
        </h3>
        <div className="flex items-center">
          <span
            dir="rtl"
            className="text-xs md:text-base text-gray-500 opacity-70 mr-2 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {exportItem.persian_Name}
          </span>
          {isCollapsed ? (
            <FaChevronDown className="text-gray-600 dark:text-gray-300" />
          ) : (
            <FaChevronUp className="text-gray-600 dark:text-gray-300" />
          )}
        </div>
      </div>

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
                  value={numberParameter ?? ""}
                  onChange={(e) =>
                    setNumberParameter(
                      e.target.value ? parseInt(e.target.value) : null
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
                disabled={loading || !isDownloadEnabled}
                className={`mt-5 mb-1 lg:mt-0 w-full lg:w-auto flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  loading || !isDownloadEnabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading ? "Generating Report ..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportItem;
