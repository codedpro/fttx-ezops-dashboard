import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ChartThree from "@/components/Charts/ChartThree";
import { fetchFTTHDashboard, fetchFTTHDailyChartData } from "@/lib/actions";
import { cookies } from "next/headers";
import DashboardCards from "@/components/DataStats/DashboardCards";
import ChartOne from "@/components/Charts/ChartOne";

const Dashboard = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("AccessToken")?.value;

  if (!token) {
    return <div className="text-center text-red-600">Unauthorized</div>;
  }

  let dashboardData, dailyData;

  try {
    dashboardData = await fetchFTTHDashboard(token);
    dashboardData = dashboardData[0];

    dailyData = await fetchFTTHDailyChartData(token);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return (
      <div className="text-center text-red-600">
        Failed to load dashboard data.
      </div>
    );
  }

  const series = [
    dashboardData?.online_Count || 2,
    dashboardData?.offline_Count || 1,
  ];
  const series_Paid_to_Modems = [
    dashboardData?.online_Count + dashboardData?.offline_Count || 2,
    dashboardData?.preorder_Paid -
      (dashboardData?.online_Count + dashboardData?.offline_Count) || 1,
  ];
  const colors = ["#feca00", "#ADBCF2"];
  const labels = ["Online", "Offline"];
  const labels_Paid_to_modems = ["Delivered", "ٔNot Delivered"];
  const totalClosed = dashboardData?.uT_Closed || 0;
  const totalRunning = dashboardData?.uT_Open || 0;

  const cardData = [
    {
      label: "Preorder Not Paid",
      value: dashboardData?.preorder_Notpaid || 0,
      id: "preorder_Notpaid",
    },
    {
      label: "Preorder Paid",
      value: dashboardData?.preorder_Paid || 0,
      id: "preorder_Paid",
    },

    { label: "SFAT", value: dashboardData?.sfaT_Count || 0, id: "sfat" },
    { label: "MFAT", value: dashboardData?.mfaT_Count || 0, id: "mfat" },
    { label: "OLT", value: dashboardData?.olT_Count || 0, id: "olt" },
    { label: "Hand Hole", value: dashboardData?.hH_Count || 0, id: "hh" },
    { label: "ODC", value: dashboardData?.odC_Count || 0, id: "odc" },
    { label: "TC", value: dashboardData?.tC_Count || 0, id: "tc" },
  ];

  return (
    <DefaultLayout>
      <DashboardCards cardData={cardData} />

      <div className="mt-4 md:mt-6 2xl:mt-9 md:flex md:flex-col lg:flex-row items-center  justify-around mx-4 gap-4">
        <div>
          {" "}
          <ChartThree
            header="FTTH Modem Status"
            series={series}
            colors={colors}
            labels={labels}
            apiname="FTTHDashboardExportModemStatus"
          />
        </div>
        <div className="mt-4">
          <ChartThree
            header="Payment Delivery Status"
            series={series_Paid_to_Modems}
            colors={colors}
            labels={labels_Paid_to_modems}
            apiname="FTTHDashboardExportPreOrder"
          />
        </div>
      </div>

      <div className="mt-4 w-full gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <ChartOne
          dailyData={dailyData}
          totalClosed={totalClosed}
          totalRunning={totalRunning}
        />
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
