import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ExportList from "@/components/ExportList";
import data from "@/data/exports.json";
import { ExportItemType, ExportData } from "@/types/exports";

const ExportsPage: React.FC = () => {
  const exportsData: ExportItemType[] = data;

  const categories: ExportData = exportsData.reduce<ExportData>((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = [];
    }
    acc[exp.category].push(exp);
    return acc;
  }, {});

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Exports</h1>
        <ExportList categories={categories} />
      </div>
    </DefaultLayout>
  );
};

export default ExportsPage;
