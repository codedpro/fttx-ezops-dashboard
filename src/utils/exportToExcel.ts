import * as XLSX from "xlsx";
import { ExtendedFeature } from "@/types/ExtendedFeature"; // Import the correct type

// Update the function to accept ExtendedFeature
export const exportToExcel = (groupedFeatures: { [key: string]: ExtendedFeature[] }) => {
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
