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
  const colors = ["#5750F1", "#ADBCF2"];
  const labels = ["Online", "Offline"];

  const totalClosed = dashboardData?.uT_Closed || 0;
  const totalRunning = dashboardData?.uT_Open || 0;

  const cardData = [
    { label: "Preorder Not Paid", value: dashboardData?.preorder_Notpaid || 0 },
    { label: "Preorder Paid", value: dashboardData?.preorder_Paid || 0 },
    // { label: "UT Closed", value: totalClosed },
    // { label: "UT Open", value: totalRunning },
    { label: "SFAT", value: dashboardData?.sfaT_Count || 0 },
    { label: "MFAT", value: dashboardData?.mfaT_Count || 0 },
    { label: "OLT", value: dashboardData?.olT_Count || 0 },
    { label: "Hand Hole", value: dashboardData?.hH_Count || 0 },
    { label: "ODC", value: dashboardData?.odC_Count || 0 },
    { label: "TC", value: dashboardData?.tC_Count || 0 },
  ];

  return (
    <DefaultLayout>
      <DashboardCards cardData={cardData} />
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <ChartThree series={series} colors={colors} labels={labels} />

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
