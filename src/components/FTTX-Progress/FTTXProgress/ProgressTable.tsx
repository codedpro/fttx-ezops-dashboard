"use client";

import React from "react";
import { FTTX_PROGRESS_DATA } from "@/data/fttxProgressData";

// Define a type for progress data
type ProgressCategory = {
  Inhouse: string;
  FTK: string;
  ServCo: string;
  FCP: string;
};

// Extract progress data with proper TypeScript typing
const { Excavation, FiberShoot, FATInstallation } =
  FTTX_PROGRESS_DATA.Progress as Record<string, ProgressCategory>;

// Order of models
const models: (keyof ProgressCategory)[] = ["Inhouse", "FTK", "ServCo", "FCP"];

/* Tailwind styles updated to match your deployment cards palette */

// Table container
const tableClasses =
  "w-full border-collapse rounded-lg shadow overflow-hidden bg-white dark:bg-[#122031] border border-gray-200 dark:border-gray-700";

// Merged header: using primary background for a bold statement
const mergedHeader =
  "px-6 py-4 text-center font-bold uppercase bg-primary text-gray-800   border-b border-gray-200 dark:border-gray-700";

// Table header cells: also using the primary color for consistency
const thHeader =
  "px-6 py-4 text-center font-bold uppercase bg-primary text-gray-800  border border-gray-200 dark:border-gray-700";
const thModel = thHeader;

// Data cells styling
const tdClasses =
  "px-6 py-4 text-center text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors duration-300";

// Model column: styled similarly to data cells for a uniform look
const modelColumnClasses =
  "px-6 py-4 text-center font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors duration-300";

// Row hover effect
const rowHoverEffect =
  "hover:bg-gray-100 dark:hover:bg-[#1c2734] transition-colors duration-300";

const ProgressTable: React.FC = () => {
  return (
    <div className="overflow-x-auto flex justify-center">
      <table className={tableClasses}>
        <thead>
          {/* Merged Header Row */}
          <tr>
            <th colSpan={4} className={mergedHeader}>
              Progress
            </th>
          </tr>
          {/* Main Table Header */}
          <tr>
            <th className={thModel}>Model</th>
            <th className={thHeader}>Excavation</th>
            <th className={thHeader}>Fiber Shoot</th>
            <th className={thHeader}>FAT Installation</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {models.map((model, index) => (
            <tr
              key={model}
              className={`${rowHoverEffect} ${
                index % 2 === 0
                  ? "bg-white dark:bg-[#122031]"
                  : "bg-gray-50 dark:bg-[#1a2a3a]"
              }`}
            >
              <td className={modelColumnClasses}>{model}</td>
              <td className={tdClasses}>{Excavation[model]}</td>
              <td className={tdClasses}>{FiberShoot[model]}</td>
              <td className={tdClasses}>{FATInstallation[model]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgressTable;
