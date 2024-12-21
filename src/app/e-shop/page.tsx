import React from "react";
import fs from "fs/promises";
import path from "path";
import TableAdvanced from "@/components/Tables/Table-Advanced";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

interface Confirmed {
  "Main Value": number;
  "Paid & installation": number;
  "Paid (Pending)": number;
  Unpaid: number;
}

interface TableData {
  City: string;
  Request: number;
  Confirmed: Confirmed;
  "Install / Confirmed": number | string;
  "Install / Request": number | string;
  Pending: number;
  "Cancelled (customer's request)": number;
  Rejected: number;
}

async function fetchTableData(): Promise<TableData[]> {
  const filePath = path.join(process.cwd(), "public", "final_table_data.json");
  const jsonData = await fs.readFile(filePath, "utf-8");
  return JSON.parse(jsonData) as TableData[];
}

const ParentTable: React.FC = async () => {
  const data = await fetchTableData();

  return (
    <DefaultLayout>
      <TableAdvanced data={data} header="E-shop Sales Details" />
    </DefaultLayout>
  );
};

export default ParentTable;
