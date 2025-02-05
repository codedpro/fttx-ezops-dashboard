import React from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import IranMap from "@/components/Maps/Iran";

import FTTXProgress from "@/components/FTTX-Progress/FTTXProgress";
import FTTXOperation from "@/components/FTTX-Progress/FTTXOperation";
import FTTXSales from "@/components/FTTX-Progress/FTTXSales";
import FTTXCRAApproval from "@/components/FTTX-Progress/FTTXCRAApproval";
import FTTXCustomerRelations from "@/components/FTTX-Progress/FTTXCustomerRelations";
import SiteEntryProgress from "@/components/FTTX-Progress/SiteEntryProgress";
import OSSProgress from "@/components/FTTX-Progress/OSSProgress";
import FTTXContractsMunicipality from "@/components/FTTX-Progress/FTTXContractsMunicipality";
import FTTXUsageReport from "@/components/FTTX-Progress/FTTXUsageReport";

interface DashboardProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const availableTabs = [
  "FTTX Progress",
  "FTTX Operation",
  "FTTX Sales",
  "FTTX CRA Approval",
  "FTTX Customer Relations",
  "Site Entry Progress",
  "OSS Progress",
  "FTTX Contracts municipality",
  "FTTX Usage Report",
];

const tabComponents: { [key: string]: React.FC<any> } = {
  "FTTX Progress": FTTXProgress,
  "FTTX Operation": FTTXOperation,
  "FTTX Sales": FTTXSales,
  "FTTX CRA Approval": FTTXCRAApproval,
  "FTTX Customer Relations": FTTXCustomerRelations,
  "Site Entry Progress": SiteEntryProgress,
  "OSS Progress": OSSProgress,
  "FTTX Contracts municipality": FTTXContractsMunicipality,
  "FTTX Usage Report": FTTXUsageReport,
};

const Dashboard = ({ searchParams }: DashboardProps) => {
  const activeTab =
    typeof searchParams.activeTab === "string" &&
    availableTabs.includes(searchParams.activeTab)
      ? searchParams.activeTab
      : "FTTX Progress";

  const initialCity =
    typeof searchParams.city === "string" ? searchParams.city : undefined;
  const initialRegion =
    typeof searchParams.region === "string" ? searchParams.region : undefined;
    const regionName =
    typeof searchParams.regionName === "string" ? searchParams.regionName : undefined;


  const ActiveComponent = tabComponents[activeTab] || FTTXProgress;

  return (
    <DefaultLayout className="p-0 md:p-0">
      <IranMap initialRegion={initialRegion} initialCity={initialCity} />

      <div className="mt-6">
        <div className="tab-list flex flex-wrap gap-4 mb-4">
          {availableTabs.map((tab) => {
            const params = new URLSearchParams();
            params.set("activeTab", tab);
            return (
              <Link
                key={tab}
                href={`?${params.toString()}`}
                className={`px-4 py-2 border rounded transition-colors duration-75 
                  ${
                    activeTab === tab
                      ? "bg-primary text-white"
                      : "bg-white dark:bg-gray-dark text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  } border-gray-300 dark:border-gray-700`}
              >
                {tab}
              </Link>
            );
          })}
        </div>

        <ActiveComponent region={regionName ?? initialCity ?? "Iran"} />
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
