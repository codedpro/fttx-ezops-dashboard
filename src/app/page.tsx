import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ChartThree from "@/components/Charts/ChartThree";
import {
  fetchFTTHDashboard,
  fetchFTTHDailyChartData,
  fetchFTTHACS,
} from "@/lib/actions";
import { cookies } from "next/headers";
import DashboardCards from "@/components/DataStats/DashboardCards";
import ChartOne from "@/components/Charts/ChartOne";
import Tutorial from "@/components/Tutorial";
import { dashboardTutorialSteps } from "@/tutorials";

const Dashboard = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("AccessToken")?.value;

  if (!token) {
    return <div className="text-center text-red-600">Unauthorized</div>;
  }

  let dashboardData, dailyData, acsData;

  try {
    dashboardData = await fetchFTTHDashboard(token);
    acsData = await fetchFTTHACS(token);
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

  const unwantedValues = ["ARG", "", "MTN", "Greenpacket"];

  const filteredAcsData = acsData.filter(
    (item) => !unwantedValues.includes(item.root_cwmp_GPON)
  );

  const rootCwmpGponCounts = filteredAcsData.reduce(
    (acc: { [key: string]: number }, item) => {
      const key = item.root_cwmp_GPON;
      if (acc[key]) {
        acc[key]++;
      } else {
        acc[key] = 1;
      }
      return acc;
    },
    {}
  );

  const labels_root_cwmp_GPON = Object.keys(rootCwmpGponCounts);

  const series_root_cwmp_GPON = labels_root_cwmp_GPON.map(
    (label) => rootCwmpGponCounts[label]
  );

  const generateColors = (numColors: number) => {
    const randomColors = [];
    for (let i = 0; i < numColors; i++) {
      randomColors.push(
        `#${Math.floor(Math.random() * 16777215).toString(16)}`
      );
    }
    return randomColors;
  };

  const colors_root_cwmp_GPON = [
  //  "#37c3f2",
    //"#c70209",
    "#feca00",
    "#ADBCF2",
    ...generateColors(labels_root_cwmp_GPON.length - 2),
  ];

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
  const labels_Paid_to_modems = ["Delivered", "Not Delivered"];
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
      <div id="dashboard-step1">
        <DashboardCards cardData={cardData} />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <div
          id="dashboard-step3"
          className="col-span-12 md:col-span-6 lg:col-span-6"
        >
          <ChartThree
            header="FTTH Modem Status"
            series={series}
            colors={colors}
            labels={labels}
            apiname="FTTHDashboardExportModemStatus"
            exportid="dashboard-step4"
          />
        </div>
        <div
          id="dashboard-step5"
          className="col-span-12 md:col-span-6 lg:col-span-6"
        >
          <ChartThree
            header="Payment Delivery Status"
            series={series_Paid_to_Modems}
            colors={colors}
            labels={labels_Paid_to_modems}
            apiname="FTTHDashboardExportPreOrder"
          />
        </div>
        <div id="dashboard-step6" className="col-span-12 lg:col-span-4">
          <ChartThree
            header="Manufacturer"
            series={series_root_cwmp_GPON}
            colors={colors_root_cwmp_GPON}
            labels={labels_root_cwmp_GPON}
            apiname="FTTHDashboardExportRootCwmpGpon"
            exportid="dashboard-step8"
          />
        </div>{" "}
        <div
          id="dashboard-root-cwmp-gpon-chart"
          className="col-span-8 "
        >
          <ChartOne
            dailyData={dailyData}
            totalClosed={totalClosed}
            totalRunning={totalRunning}
            exportid="dashboard-step7"
          />
        </div>
      </div>

      {dashboardData && dailyData && (
        <Tutorial
          tutorialKey="DashboardTutorial"
          steps={dashboardTutorialSteps}
          continuous
          showProgress
          showSkipButton
          startOnLoad={true}
        />
      )}
    </DefaultLayout>
  );
};

export default Dashboard;
