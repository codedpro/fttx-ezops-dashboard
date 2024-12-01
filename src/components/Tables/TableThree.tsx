// components/Tables/TableThree.tsx

"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { FaLightbulb } from "react-icons/fa";
import * as XLSX from "xlsx";

interface Column {
  key: string;
  label: string;
  isClickable?: boolean;
  formatter?: (value: any) => string | JSX.Element;
}

interface TableThreeProps {
  data: any[];
  columns: Column[]; // Updated to use Column interface
  header: string;
  emoji: string;
  initialLimit?: number;
  excludeFilterColumns?: string[]; // Columns to exclude from filtering
}

const TableThree: React.FC<TableThreeProps> = ({
  data,
  columns,
  header,
  emoji,
  initialLimit = 5,
  excludeFilterColumns = ["ID", "FTTH_ID", "User_ID"], // Default excluded columns
}) => {
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  const renderCellContent = (col: Column, value: any) => {
    if (col.formatter) {
      return col.formatter(value);
    } else if (col.isClickable) {
      return (
        <Link href={`/modem/${value}`} target="_blank" className="text-primary hover:underline">
          {value}
        </Link>
      );
    } else {
      return value?.toString() || "N/A";
    }
  };

  const filteredColumns = useMemo(
    () => columns.filter((col) => !excludeFilterColumns.includes(col.key)),
    [columns, excludeFilterColumns]
  );

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return filteredColumns.every((col) => {
        const value = row[col.key]?.toString().toLowerCase() || ""; // Ensure value is a string
        const filter = filters[col.key]?.toLowerCase();
        if (!filter) return true;
        return value.includes(filter);
      });
    });
  }, [data, filteredColumns, filters]);

  const displayedData = useMemo(
    () => filteredData.slice(0, limit),
    [filteredData, limit]
  );

  const handleLoadMore = () => {
    setLimit(limit + 20);
  };

  const exportToExcel = () => {
    // Export all filtered data instead of just displayedData
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${header.replace(/\s+/g, "_")}.xlsx`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-[#1F2B37] dark:bg-[#122031] dark:shadow-card sm:p-7.5 hover:shadow-lg">
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-xl font-bold dark:text-[#E2E8F0] flex items-center">
          <span className="mr-2">{emoji}</span>
          {header}
        </h3>
        <button
          onClick={exportToExcel}
          className="px-3 py-2 text-sm bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
        >
          Export
        </button>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-[#F7F9FC] text-left dark:bg-[#1A2735] dark:border-b dark:border-[#1F2B37]">
              {filteredColumns.map((col) => (
                <th
                  key={col.key}
                  className="min-w-[150px] px-3 py-2 font-semibold text-center text-dark dark:text-[#E2E8F0] border-b text-nowrap border-[#eee] dark:border-[#2F3A47] text-xs md:text-sm lg:text-base transition-all hover:text-primary"
                >
                  {col.label}
                  <div className="flex justify-center mt-2 w-full">
                    <input
                      type="text"
                      placeholder={"Filter " + col.label}
                      onChange={(e) =>
                        handleFilterChange(col.key, e.target.value)
                      }
                      className="px-2 py-1 text-xs bg-transparent placeholder:text-center w-full placeholder:text-xs placeholder:ellipsis focus:outline-none focus:border-b focus:border-primary"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => (
              <tr
                key={item.ftth_id || index} // Prefer unique identifier
                className="hover:bg-[#F1F5F9] dark:hover:bg-[#1C2C3A] transition-colors"
              >
                {filteredColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`border-[#eee] px-6 py-4 dark:border-[#1F2B37] ${
                      index === displayedData.length - 1
                        ? "border-b-0"
                        : "border-b"
                    }`}
                  >
                    <div className="text-dark text-center dark:text-[#E2E8F0] text-xs md:text-sm lg:text-base flex items-center justify-center space-x-2">
                      <p className="text-ellipsis text-nowrap overflow-hidden">
                        {renderCellContent(col, item[col.key])}
                      </p>
                      {col.key === "Sub_Service" && (
                        <FaLightbulb className="text-primary" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {limit < filteredData.length && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full shadow-lg transform transition-all duration-300 hover:bg-primary-dark hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-light"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default TableThree;
