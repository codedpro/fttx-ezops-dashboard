"use client";

import { useState } from "react";
import { FaLightbulb } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Input } from "../FormElements/Input";

interface TableThreeProps {
  data: any[];
  columns: { key: string; label: string }[];
  header: string;
  emoji: string;
  initialLimit?: number;
}

const TableThree: React.FC<TableThreeProps> = ({
  data,
  columns,
  header,
  emoji,
  initialLimit = 20,
}) => {
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  const filteredColumns = columns.filter(
    (col) => col.key !== "ID" && col.key !== "FTTH_ID" && col.key !== "User_ID"
  );

  const filteredData = data.filter((row) => {
    return filteredColumns.every((col) => {
      const value = row[col.key]?.toString().toLowerCase();
      const filter = filters[col.key]?.toLowerCase();
      if (!filter) return true;
      return value.includes(filter);
    });
  });

  const displayedData = filteredData.slice(0, limit);

  const handleLoadMore = () => {
    setLimit(limit + 20);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(displayedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "table_data.xlsx");
  };

  // Handle string-based filtering
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-[#1F2B37] dark:bg-[#122031] dark:shadow-card sm:p-7.5 hover:shadow-lg">
      <h3 className="text-xl font-bold mb-4 dark:text-[#E2E8F0]">
        <span className="mr-2">{emoji}</span>
        {header}
      </h3>

      {/* Export to Excel Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
        >
          Export to Excel
        </button>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-[#F7F9FC] text-left dark:bg-[#1A2735] dark:border-b dark:border-[#1F2B37]">
              {filteredColumns.map((col) => (
                <th
                  key={col.key}
                  className="min-w-[150px] px-6 py-4 font-semibold text-center text-dark dark:text-[#E2E8F0] border-b text-nowrap border-[#eee] dark:border-[#2F3A47] text-xs md:text-sm lg:text-base transition-all hover:text-primary"
                >
                  {col.label}
                  <div className="mt-1 text-white">
                    {" "}
                    <Input
                      type="text"
                      placeholder={"Filter " + col.label}
                      onChange={(e) =>
                        handleFilterChange(col.key, e.target.value)
                      }
                      className=""
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item, index) => (
              <tr
                key={index}
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
                        {item[col.key]?.toString()}
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

      {limit < data.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-full shadow-lg transform transition-all duration-300 hover:bg-primary-dark hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary-light"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default TableThree;
