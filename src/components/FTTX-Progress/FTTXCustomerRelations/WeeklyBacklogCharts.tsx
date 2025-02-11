"use client";

import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { CUSTOMER_RELATIONS_DATA } from "@/data/fttxCustomerRelationsData";

function useDarkModeObserver() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            setIsDark(document.documentElement.classList.contains("dark"));
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => observer.disconnect();
    }
  }, []);

  return isDark;
}

const WeeklyBacklogCharts: React.FC = () => {
  const isDarkMode = useDarkModeObserver();

  const categories = ["Week1", "Week2", "Week3", "Week4"];
  const colors = {
    BO: "#dc3545", // Red
    Backlog195: "#007bff", // Blue feca00
  };

  // BO Backlog Chart Options
  const boSeries = [
    {
      name: "BO BackLog Tickets",
      data: Object.values(CUSTOMER_RELATIONS_DATA.WeeklyProgress.BO_BackLog_Tickets),
    },
  ];

  const boOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    colors: [colors.BO],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: [colors.BO],
      },
    },
    stroke: { curve: "smooth" },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          colors: isDarkMode ? "#fff" : "#000",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: isDarkMode ? "#fff" : "#000",
        },
      },
    },
    grid: {
      borderColor: isDarkMode ? "#444" : "#e7e7e7",
      strokeDashArray: 5,
    },
  };

  // 195 Backlog Chart Options
  const backlog195Series = [
    {
      name: "195 BackLog Tickets",
      data: Object.values(CUSTOMER_RELATIONS_DATA.WeeklyProgress.BackLog_Tickets_195),
    },
  ];

  const backlog195Options: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    colors: [colors.Backlog195],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: [colors.Backlog195],
      },
    },
    stroke: { curve: "smooth" },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          colors: isDarkMode ? "#fff" : "#000",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: isDarkMode ? "#fff" : "#000",
        },
      },
    },
    grid: {
      borderColor: isDarkMode ? "#444" : "#e7e7e7",
      strokeDashArray: 5,
    },
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* BO Backlog Chart */}
      <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
          BO BackLog Tickets (Weekly)
        </h3>
        <ReactApexChart options={boOptions} series={boSeries} type="area" height={350} />
      </div>

      {/* 195 Backlog Chart */}
      <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
          195 BackLog Tickets (Weekly)
        </h3>
        <ReactApexChart options={backlog195Options} series={backlog195Series} type="area" height={350} />
      </div>
    </div>
  );
};

export default WeeklyBacklogCharts;
