import React from "react";
import fs from "fs/promises";
import path from "path";
import TableAdvanced from "@/components/Tables/Table-Advanced";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { fetchFTTHSalesDetails } from "@/lib/actions";
import { cookies } from "next/headers";

const ParentTable: React.FC = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("AccessToken")?.value;

  const data = await fetchFTTHSalesDetails(token ?? "unAuthorized");

  return (
    <DefaultLayout>
      <TableAdvanced data={data} header="E-shop Sales Details" />
    </DefaultLayout>
  );
};

export default ParentTable;
