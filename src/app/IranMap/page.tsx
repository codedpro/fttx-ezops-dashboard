import React from "react";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import IranMap from "@/components/Maps/Iran";

interface DashboardProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// List of available tabs (default active: "FTTX Progress")
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

const Dashboard = async ({ searchParams }: DashboardProps) => {
  // Determine activeTab from searchParams; default to "FTTX Progress" if invalid.
  const activeTab =
    typeof searchParams.activeTab === "string" &&
    availableTabs.includes(searchParams.activeTab)
      ? searchParams.activeTab
      : "FTTX Progress";

  // Prepare search parameters for tab links (only activeTab is used here)
  const baseParams = new URLSearchParams();

  return (
    <DefaultLayout className="p-0 md:p-0">
      {/* Render the IranMap */}
      <IranMap />

      {/* Tabs Section */}
      <div className="mt-6">
        {/* Tab Navigation */}
        <div className="tab-list flex flex-wrap gap-4 mb-4">
          {availableTabs.map((tab) => {
            // Create URL search parameters for each tab link.
            const params = new URLSearchParams(baseParams);
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

        {/* Tab Content */}
        <div className="tab-content p-4 border rounded shadow 
          bg-white dark:bg-gray-dark border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            {activeTab}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Content for <strong>{activeTab}</strong> goes here.
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
