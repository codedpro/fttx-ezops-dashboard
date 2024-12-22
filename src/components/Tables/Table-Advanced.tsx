"use client";

import { TableData } from "@/types/SalesDetails";
import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

import XLSX from "xlsx-js-style";



interface TableAdvancedProps {
  data: TableData[];
  header: string;
}

const TableAdvanced: React.FC<TableAdvancedProps> = ({ data, header }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const exportToExcelWithMerge = () => {
    const headerRow1: (string | number | null)[] = [
      "City",
      "Request",
      "Confirmed",
      null,
      null,
      "Install / Confirmed",
      "Install / Request",
      "Pending",
      "Cancelled (customer's request)",
      "Rejected",
    ];
    const headerRow2: (string | number | null)[] = [
      null,
      null,
      "Paid & installation",
      "Paid (Pending)",
      "Unpaid",
      null,
      null,
      null,
      null,
      null,
    ];

    const wsData: (string | number | null)[][] = [headerRow1, headerRow2];

    data.forEach((row) => {
      const row1: (string | number | null)[] = [
        row.City,
        row.Request,
        row.Confirmed["Main Value"],
        null,
        null,
        row["Install / Confirmed"],
        row["Install / Request"],
        row.Pending,
        row["Cancelled (customer's request)"],
        row.Rejected,
      ];
      const row2: (string | number | null)[] = [
        null,
        null,
        row.Confirmed["Paid & installation"],
        row.Confirmed["Paid (Pending)"],
        row.Confirmed.Unpaid,
        null,
        null,
        null,
        null,
        null,
      ];

      wsData.push(row1, row2);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    const merges: XLSX.Range[] = [];
    merges.push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }); // City rowSpan=2
    merges.push({ s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }); // Request rowSpan=2
    merges.push({ s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }); // Confirmed colSpan=3
    merges.push({ s: { r: 0, c: 5 }, e: { r: 1, c: 5 } }); // Install / Confirmed rowSpan=2
    merges.push({ s: { r: 0, c: 6 }, e: { r: 1, c: 6 } }); // Install / Request rowSpan=2
    merges.push({ s: { r: 0, c: 7 }, e: { r: 1, c: 7 } }); // Pending rowSpan=2
    merges.push({ s: { r: 0, c: 8 }, e: { r: 1, c: 8 } }); // Cancelled rowSpan=2
    merges.push({ s: { r: 0, c: 9 }, e: { r: 1, c: 9 } }); // Rejected rowSpan=2

    data.forEach((_, i) => {
      const rowTop = 2 + i * 2;
      const rowBottom = rowTop + 1;

      merges.push({ s: { r: rowTop, c: 0 }, e: { r: rowBottom, c: 0 } }); // City
      merges.push({ s: { r: rowTop, c: 1 }, e: { r: rowBottom, c: 1 } }); // Request
      merges.push({ s: { r: rowTop, c: 2 }, e: { r: rowTop, c: 4 } }); // Confirmed (Main Value)
      merges.push({ s: { r: rowTop, c: 5 }, e: { r: rowBottom, c: 5 } }); // Install / Confirmed
      merges.push({ s: { r: rowTop, c: 6 }, e: { r: rowBottom, c: 6 } }); // Install / Request
      merges.push({ s: { r: rowTop, c: 7 }, e: { r: rowBottom, c: 7 } }); // Pending
      merges.push({ s: { r: rowTop, c: 8 }, e: { r: rowBottom, c: 8 } }); // Cancelled
      merges.push({ s: { r: rowTop, c: 9 }, e: { r: rowBottom, c: 9 } }); // Rejected
    });

    worksheet["!merges"] = merges;

    worksheet["!cols"] = [
      { wch: 16 },
      { wch: 16 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 30 },
      { wch: 16 },
    ];

    Object.keys(worksheet).forEach((key) => {
      if (key[0] === "!") return;
      worksheet[key].s = {
        alignment: { horizontal: "center", vertical: "center" },
      };
    });

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 10; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "FECA00" } },
            font: { bold: true, sz: 12 },
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `Report.xlsx`);
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 sm:p-7.5 hover:shadow-lg transition-all duration-300 dark:border-[#1F2B37] dark:bg-[#122031] dark:shadow-card">
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="ml-2 text-3xl font-bold flex items-center dark:text-[#E2E8F0]">
          <span className="mr-3 text-4xl text-primary hover:animate-rotate-shine flex items-center justify-center rounded-full animation:f p-2">
            <FaShoppingCart />
          </span>
          {header}
        </h3>

        <button
          onClick={exportToExcelWithMerge}
          className="px-4 py-2 text-lg bg-green-500 text-white  hover:animate-blink font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300"
        >
          Export
        </button>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <table className="w-full table-auto border-collapse text-center">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>

          <thead>
            <tr className="text-xs md:text-sm font-semibold bg-[#F7F9FC] dark:bg-[#1A2735] dark:border-b dark:border-[#1F2B37] dark:text-[#E2E8F0]">
              <th
                rowSpan={2}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                City
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                Request
              </th>
              <th
                colSpan={3}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                Confirmed
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                Install / Confirmed
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                Install / Request
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                Pending
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                Cancelled (customer&apos;s request)
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]"
              >
                Rejected
              </th>
            </tr>

            <tr className="text-xs md:text-sm font-semibold bg-[#F7F9FC] dark:bg-[#1A2735] dark:border-b dark:border-[#1F2B37] dark:text-[#E2E8F0]">
              <th className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]">
                Paid &amp; installation
              </th>
              <th className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]">
                Paid (Pending)
              </th>
              <th className="px-3 py-2 border-b border-[#eee] dark:border-[#2F3A47]">
                Unpaid
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => {
              const isHovered = hoveredIndex === index;
              const groupColor =
                index % 2 < 1
                  ? "bg-[#F2F6FA] dark:bg-[#122031]"
                  : "bg-[#F6F9FC] dark:bg-[#142234]";

              const hoverClass = isHovered
                ? "bg-[#FABB00] dark:bg-[#243847]"
                : groupColor;

              return (
                <React.Fragment key={index}>
                  <tr
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`transition-colors ${hoverClass}`}
                  >
                    <td
                      rowSpan={2}
                      className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]"
                    >
                      {row.City}
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]"
                    >
                      {row.Request}
                    </td>
                    <td
                      colSpan={3}
                      className="border border-[#eee] px-3 py-2 font-medium text-center dark:border-[#2F3A47]"
                    >
                      {row.Confirmed["Main Value"]}
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]"
                    >
                      {row["Install / Confirmed"]}
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]"
                    >
                      {row["Install / Request"]}
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]"
                    >
                      {row.Pending}
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]"
                    >
                      {row["Cancelled (customer's request)"]}
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]"
                    >
                      {row.Rejected}
                    </td>
                  </tr>

                  <tr
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`transition-colors ${hoverClass}`}
                  >
                    <td className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]">
                      {row.Confirmed["Paid & installation"]}
                    </td>
                    <td className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]">
                      {row.Confirmed["Paid (Pending)"]}
                    </td>
                    <td className="border border-[#eee] px-3 py-2 text-center dark:border-[#2F3A47]">
                      {row.Confirmed.Unpaid}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableAdvanced;
