import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ExportList from "@/components/ExportList";
import { fetchFTTHDynamicExportList } from "@/lib/actions";
import { cookies } from "next/headers";
import { ExportData } from "@/types/exports";

const ExportsPage = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("AccessToken")?.value;

  if (!token) {
    return <div className="text-center text-red-600">Unauthorized</div>;
  }

  let categories: ExportData = {};

  try {
    categories = await fetchFTTHDynamicExportList(token);
  } catch (error) {
    console.error("Failed to fetch export list data:", error);
    return (
      <DefaultLayout>
        {" "}
        <div className="text-center text-red-600">
          Failed to load export list data.
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto ">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-6">
          Exports
        </h1>
        <ExportList categories={categories} />
      </div>
    </DefaultLayout>
  );
};

export default ExportsPage;
