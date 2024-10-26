"use client";

import React, { useState } from "react";
import { ExportData, ExportItemType } from "@/types/exports";
import ExportItem from "./ExportItem";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { Input } from "../FormElements/Input";

interface ExportListProps {
  categories: ExportData;
}

const ExportList: React.FC<ExportListProps> = ({ categories }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () =>
      Object.keys(categories).reduce<Record<string, boolean>>(
        (acc, category) => {
          acc[category] = true;
          return acc;
        },
        {}
      )
  );

  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const filteredCategories = Object.entries(categories).reduce<ExportData>(
    (acc, [category, exports]) => {
      const filteredExports = exports.filter(
        (exportItem) =>
          exportItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredExports.length > 0) {
        acc[category] = filteredExports;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="container mx-auto">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="!p-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(filteredCategories).length > 0 ? (
          Object.entries(filteredCategories).map(([category, exports]) => (
            <div
              key={category}
              className="rounded-lg border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark"
            >
              <div
                className="flex justify-between items-center p-5 cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                <h2 className="text-xl font-semibold text-dark dark:text-white">
                  {category}
                </h2>
                {openCategories[category] ? (
                  <FaChevronUp className="text-gray-600 dark:text-gray-300" />
                ) : (
                  <FaChevronDown className="text-gray-600 dark:text-gray-300" />
                )}
              </div>
              {openCategories[category] && (
                <div className="px-5">
                  {exports.map((exportItem: ExportItemType) => (
                    <ExportItem key={exportItem.id} exportItem={exportItem} />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-300">
            No exports found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportList;
