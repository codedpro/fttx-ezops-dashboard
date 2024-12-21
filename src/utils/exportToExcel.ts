import * as XLSX from "xlsx-js-style";
import { ExtendedFeature } from "@/types/ExtendedFeature";
import { saveAs } from "file-saver";

export const exportToExcel = (groupedFeatures: {
  [key: string]: ExtendedFeature[];
}) => {
  const workbook = XLSX.utils.book_new();

  Object.keys(groupedFeatures).forEach((source) => {
    const features = groupedFeatures[source];

    // Filter and map data to be exported
    const dataToExport = features.map((feature) => {
      const filteredProperties = { ...feature.properties };
      delete filteredProperties.ID;
      delete filteredProperties.icon;
      delete filteredProperties.iconSize;
      return filteredProperties;
    });

    // Create worksheet from JSON
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Calculate column widths dynamically
    const columns = Object.keys(dataToExport[0] || {});
    const columnWidths = columns.map((col) => ({
      wch:
        Math.max(
          ...dataToExport.map((row) =>
            row[col] ? row[col].toString().length : 10
          ),
          col.length
        ) + 5, // Add padding
    }));
    worksheet["!cols"] = columnWidths;

    // Apply styles to all cells
    Object.keys(worksheet).forEach((key) => {
      if (key.startsWith("!")) return; // Skip metadata
      worksheet[key].s = {
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
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[headerCell]) {
        worksheet[headerCell].s = {
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
        if (worksheet[cellRef]) {
          worksheet[cellRef].s.fill = {
            fgColor: {
              rgb: row % 2 === 0 ? "F8F8F2" : "FFFFFF", // Cool complementary colors
            },
          };
        }
      }
    }

    // Append sheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, source);
  });

  // Generate file name with timestamp
  const now = new Date();
  const formattedDateTime = now.toISOString().replace(/[:.-]/g, "_");
  const fileName = `MTN_Irancell_FTTX_${formattedDateTime}.xlsx`;

  // Save workbook
  XLSX.writeFile(workbook, fileName);
};

export const exportToXLSX = (data: any[], fileName: string) => {
  if (data.length === 0) {
    console.error("No data provided for export.");
    return;
  }

  // Create worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Calculate column widths dynamically
  const columns = Object.keys(data[0] || {});
  const columnWidths = columns.map((col) => ({
    wch:
      Math.max(
        ...data.map((row) => (row[col] ? row[col].toString().length : 10)),
        col.length
      ) + 5, // Add padding
  }));
  worksheet["!cols"] = columnWidths;

  // Apply styles to all cells
  Object.keys(worksheet).forEach((key) => {
    if (key.startsWith("!")) return; // Skip metadata
    worksheet[key].s = {
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
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[headerCell]) {
      worksheet[headerCell].s = {
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
      if (worksheet[cellRef]) {
        worksheet[cellRef].s.fill = {
          fgColor: {
            rgb: row % 2 === 0 ? "F8F8F2" : "FFFFFF", // Cool complementary colors
          },
        };
      }
    }
  }

  // Create workbook and append the styled worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Convert workbook to buffer and create a blob
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  // Format file name with date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").replace(/\//g, "-");
  const formattedTime = now
    .toLocaleTimeString("en-GB", { hour12: false })
    .replace(/:/g, "-");
  const fileNameWithTime = `${fileName} ${formattedDate} ${formattedTime}`;

  // Save the file
  saveAs(blob, `${fileNameWithTime}.xlsx`);
};
