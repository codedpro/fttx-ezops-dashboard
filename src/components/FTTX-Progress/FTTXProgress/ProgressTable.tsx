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

// Tailwind styles
const tableClasses =
  "w-full border-collapse rounded-lg shadow-lg overflow-hidden";
const mergedHeader =
  "px-6 py-4 text-center font-bold uppercase bg-primary text-black border border-gray-600 dark:text-gray-900";
const thHeader =
  "px-6 py-4 text-center font-bold uppercase bg-primary text-black border border-gray-600 dark:text-gray-900";
const thModel =
  "px-6 py-4 text-center font-bold uppercase bg-primary text-black border border-gray-600 dark:text-gray-900";
const tdClasses =
  "px-6 py-4 text-center text-gray-800 dark:text-gray-300 border border-gray-400 dark:border-gray-700 transition-colors duration-300";
const modelColumnClasses =
  "px-6 py-4 text-center font-semibold bg-primary text-black dark:text-gray-900 border border-gray-600 dark:border-gray-700 transition-colors duration-300";

// **Hover Effect: ONLY color change** 
// (Using a darker shade from the same palette).
const rowHoverEffect =
  "hover:bg-gray-200 dark:hover:bg-[#1E2A39] transition-colors duration-300";

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
              // Alternate row colors in light mode and use two close shades in dark mode
              className={`${rowHoverEffect} ${
                index % 2 === 0
                  ? // Even row
                    "bg-gray-100 dark:bg-[#0F1A28]"
                  : // Odd row
                    "bg-white dark:bg-[#122031]"
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
