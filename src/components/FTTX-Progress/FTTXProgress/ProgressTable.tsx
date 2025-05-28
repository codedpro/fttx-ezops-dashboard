"use client";

import React from "react";

type ProgressCategory = {
  Inhouse: string;
  FTK: string;
  ServCo: string;
  FCP: string;
};

const models: (keyof ProgressCategory)[] = ["Inhouse", "FTK", "ServCo", "FCP"];

const tableClasses =
  "w-full border-collapse rounded-lg shadow overflow-hidden bg-white dark:bg-[#122031] border border-gray-200 dark:border-gray-700";

const mergedHeader =
  "px-6 py-4 text-center font-bold uppercase bg-primary text-gray-800 border-b border-gray-200 dark:border-gray-700";

const thHeader =
  "px-6 py-4 text-center font-bold uppercase bg-primary text-gray-800 border border-gray-200 dark:border-gray-700";

const thModel = thHeader;

const tdClasses =
  "px-6 py-4 text-center text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors duration-300";

const modelColumnClasses =
  "px-6 py-4 text-center font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-colors duration-300";

const rowHoverEffect =
  "hover:bg-gray-100 dark:hover:bg-[#1c2734] transition-colors duration-300";

interface ProgressTableProps {
  data: Record<string, ProgressCategory>;
}

const ProgressTable: React.FC<ProgressTableProps> = ({ data }) => {
  const { Excavation, FiberShoot, FATInstallation } = data;

  return (
    <div className="overflow-x-auto flex justify-center">
      <table className={tableClasses}>
        <thead>
          <tr>
            <th colSpan={4} className={mergedHeader}>
              Progress
            </th>
          </tr>
          <tr>
            <th className={thModel}>Model</th>
            <th className={thHeader}>Excavation</th>
            <th className={thHeader}>Fiber Shoot</th>
            <th className={thHeader}>FAT Installation</th>
          </tr>
        </thead>
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
