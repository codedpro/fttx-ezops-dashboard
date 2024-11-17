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

  const rootCwmpGponCounts = acsData.reduce(
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

  const sortedRootCwmpGponCounts = Object.entries(rootCwmpGponCounts).sort(
    ([, countA], [, countB]) => countB - countA
  );

  const topRootCwmpGponCountsEntries = sortedRootCwmpGponCounts.slice(0, 2);
  const topRootCwmpGponCounts = Object.fromEntries(
    topRootCwmpGponCountsEntries
  );

  const othersCount = sortedRootCwmpGponCounts
    .slice(2)
    .reduce((sum, [, count]) => sum + count, 0);

  if (othersCount > 0) {
    topRootCwmpGponCounts["Others"] = othersCount;
  }

  const labels_root_cwmp_GPON = Object.keys(topRootCwmpGponCounts);
  const series_root_cwmp_GPON = Object.values(topRootCwmpGponCounts);

  const RXPowerRange = { min: -28, max: -8 };

  const rxPowerCounts = acsData.reduce(
    (acc: { [key: string]: number }, item) => {
      const rxPower = item.RXPower;
      if (rxPower === null || rxPower === undefined) {
        acc["Null"] = (acc["Null"] || 0) + 1;
      } else if (rxPower >= RXPowerRange.min && rxPower <= RXPowerRange.max) {
        acc["In Range"] = (acc["In Range"] || 0) + 1;
      } else {
        acc["Out of Range"] = (acc["Out of Range"] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  const ordered_RXPowerLabels = ["In Range", "Out of Range", "Null"];
  const labels_RXPower = ordered_RXPowerLabels.filter((label) =>
    Object.keys(rxPowerCounts).includes(label)
  );
  const series_RXPower = labels_RXPower.map(
    (label) => rxPowerCounts[label] || 0
  );

  const predefinedColors = [
    "#feca00",
    "#ADBCF2",
    "#4caf50",
    "#673ab7",
    "#ff9800",
    "#37c3f2",
    "#2196f3",
    "#ff0003",
    "#8bc34a",
    "#00bcd4",
  ];

  const assignColors = (labels: string[]) => {
    const colors = predefinedColors.slice(0, labels.length);
    while (colors.length < labels.length) {
      const randomColor = `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;
      colors.push(randomColor);
    }
    return colors;
  };

  const colors_root_cwmp_GPON = assignColors(labels_root_cwmp_GPON);
  const colors_RXPower = assignColors(labels_RXPower);

  const unwantedModelNames = ["", "Unknown"];
  const filteredModelNameData = acsData.filter(
    (item) => !unwantedModelNames.includes(item.modelName)
  );

  const modelNameCounts = filteredModelNameData.reduce(
    (acc: { [key: string]: number }, item) => {
      const key = item.modelName;
      if (acc[key]) {
        acc[key]++;
      } else {
        acc[key] = 1;
      }
      return acc;
    },
    {}
  );

  const sortedModelNames = Object.entries(modelNameCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);

  const topModelNameCounts = Object.fromEntries(sortedModelNames);

  const othersCountModel = Object.entries(modelNameCounts)
    .filter(([key]) => !topModelNameCounts[key])
    .reduce((sum, [, count]) => sum + count, 0);

  if (othersCountModel > 0) {
    topModelNameCounts["Others"] = othersCountModel;
  }

  const labels_modelName = Object.keys(topModelNameCounts);
  const series_modelName = Object.values(topModelNameCounts);

  const colors_modelName = assignColors(labels_modelName);

  const series = [
    dashboardData?.online_Count || 2,
    dashboardData?.offline_Count || 1,
  ];
  const series_Paid_to_Modems = [
    dashboardData.modem_Delivered || 2,
    dashboardData.modem_Not_Delivered || 1,
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
          className="col-span-12 md:col-span-6 lg:col-span-6 "
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
          className="col-span-12 md:col-span-6 lg:col-span-6 "
        >
          <ChartThree
            header="Payment Delivery Status"
            series={series_Paid_to_Modems}
            colors={colors}
            labels={labels_Paid_to_modems}
            apiname="FTTHDashboardExportPreOrder"
          />
        </div>

        <div
          id="dashboard-root-cwmp-gpon-chart"
          className="col-span-12 md:col-span-12 lg:col-span-4"
        >
          <ChartThree
            header="Manufacturer"
            series={series_root_cwmp_GPON}
            colors={colors_root_cwmp_GPON}
            labels={labels_root_cwmp_GPON}
            apiname="FTTHDashboardExportRootCwmpGpon"
            exportid=""
          />
        </div>

        <div
          id="dashboard-step6"
          className="col-span-12 md:col-span-12 lg:col-span-8 "
        >
          <ChartOne
            dailyData={dailyData}
            totalClosed={totalClosed}
            totalRunning={totalRunning}
            exportid=""
          />
        </div>

        <div
          id="dashboard-step9"
          className="col-span-12 md:col-span-12 lg:col-span-4 "
        >
          <ChartThree
            header="RXPower Status"
            series={series_RXPower}
            colors={colors_RXPower}
            labels={labels_RXPower}
            apiname="FTTHDashboardExportRXPowerStatus"
            exportid="dashboard-step9"
          />
        </div>

        <div
          id="dashboard-step10"
          className="col-span-12 md:col-span-12 lg:col-span-8 "
        >
          <ChartThree
            header="FTTH Modem Model Names"
            series={series_modelName}
            colors={colors_modelName}
            labels={labels_modelName}
            apiname="FTTHDashboardExportModelName"
            exportid="dashboard-step10"
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
