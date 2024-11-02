import * as XLSX from "xlsx";
import { ExtendedFeature } from "@/types/ExtendedFeature";
import { saveAs } from "file-saver";

export const exportToExcel = (groupedFeatures: {
  [key: string]: ExtendedFeature[];
}) => {
  const workbook = XLSX.utils.book_new();

  Object.keys(groupedFeatures).forEach((source) => {
    const features = groupedFeatures[source];
    const dataToExport = features.map((feature) => {
      const filteredProperties = { ...feature.properties };
      delete filteredProperties.ID;
      delete filteredProperties.icon;
      delete filteredProperties.iconSize;
      return filteredProperties;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(workbook, worksheet, source);
  });

  const now = new Date();
  const formattedDateTime = now.toISOString().replace(/[:.-]/g, "_");
  const fileName = `MTN_Irancell_FTTX_Time_${formattedDateTime}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
export const exportToXLSX = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  const columns = Object.keys(data[0] || {});
  const columnWidths = columns.map((col) => ({
    wch:
      Math.max(
        ...data.map((row) => (row[col] ? row[col].toString().length : 10))
      ) + 5,
  }));
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-GB").replace(/\//g, "-");
  const formattedTime = now
    .toLocaleTimeString("en-GB", { hour12: false })
    .replace(/:/g, "-");

  const fileNameWithTime = `${fileName} ${formattedDate} ${formattedTime}`;

  saveAs(blob, `${fileNameWithTime}.xlsx`);
};
