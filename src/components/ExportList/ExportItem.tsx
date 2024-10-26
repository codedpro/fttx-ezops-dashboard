"use client";

import React, { useState, useEffect } from "react";
import { ExportItemType, ExportResponse } from "@/types/exports";
import * as XLSX from "xlsx";
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
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

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
        <h3 className="text-lg font-medium text-dark dark:text-white">
          {exportItem.name}
        </h3>
        {isCollapsed ? (
          <FaChevronDown className="text-gray-600 dark:text-gray-300" />
        ) : (
          <FaChevronUp className="text-gray-600 dark:text-gray-300" />
        )}
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
