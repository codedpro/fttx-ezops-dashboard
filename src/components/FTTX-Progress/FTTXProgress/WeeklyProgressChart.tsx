"use client";

import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FaRoad, FaUsers } from "react-icons/fa";

interface ProgressDetails {
  Plan: number;
  Actual: number;
  Weekly: number;
}

interface BranchData {
  Irancell: { WeeklyData: Record<string, number> };
  FCP: { WeeklyData: Record<string, number> };
}

interface WeeklyProgressChartProps {
  excavation: BranchData;
  fiberShoot: BranchData;
}

function useDarkModeObserver() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          setIsDark(
            document.documentElement.classList.contains("dark")
          );
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  excavation,
  fiberShoot
}) => {
  const isDarkMode = useDarkModeObserver();

  const excavationWeeks = Object.keys(
    excavation.Irancell.WeeklyData
  );
  const fiberShootWeeks = Object.keys(
    fiberShoot.Irancell.WeeklyData
  );
 useEffect(() => {
  console.log(excavation,fiberShoot)
 },[excavation,fiberShoot])
  const excavationSeries = [
    {
      name: "Irancell Excavation",
      data: Object.values(excavation.Irancell.WeeklyData),
    },
    {
      name: "FCP Excavation",
      data: Object.values(excavation.FCP.WeeklyData),
    },
  ];

  const fiberShootSeries = [
    {
      name: "Irancell Fiber Shoot",
      data: Object.values(fiberShoot.Irancell.WeeklyData),
    },
    {
      name: "FCP Fiber Shoot",
      data: Object.values(fiberShoot.FCP.WeeklyData),
    },
  ];

  const chartColors = ["#FEC107", "#007BFF"];

  const baseOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 380,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    stroke: {
      width: 3,
      curve: "smooth",
    },
    colors: chartColors,
    markers: {
      size: 6,
      strokeWidth: 2,
      hover: { sizeOffset: 2 },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: chartColors,
      },
      background: {
        enabled: true,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          color: "#999",
          opacity: 0.4,
        },
      },
      offsetY: -5,
    },
    xaxis: {
      labels: {
        show: true,
        rotate: 0,
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      axisBorder: { show: true, color: "#ccc" },
      axisTicks: { show: true, color: "#ccc" },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "13px",
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "14px",
      fontWeight: 600,
    },
    grid: {
      show: true,
      borderColor: "#e7e7e7",
      strokeDashArray: 5,
    },
    tooltip: {
      theme: "light",
      x: { show: true },
      y: {
        formatter: val =>
          typeof val === "number" ? val.toLocaleString() : `${val}`,
      },
      marker: { show: true },
    },
  };

  const getChartOptions = (categories: string[]) => ({
    ...baseOptions,
    xaxis: { ...baseOptions.xaxis, categories },
    grid: {
      ...baseOptions.grid,
      borderColor: isDarkMode ? "#2E3945" : "#e7e7e7",
    },
    tooltip: baseOptions.tooltip,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        className={`p-6 shadow-lg rounded-xl border ${
          isDarkMode
            ? "bg-[#122031] border-gray-700"
            : "bg-white border-gray-300"
        }`}
      >
        <h3
          className={`text-2xl font-semibold mb-4 text-center ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Excavation Weekly Progress
        </h3>
        <ReactApexChart
          options={getChartOptions(excavationWeeks)}
          series={excavationSeries}
          type="line"
          height={380}
        />
      </div>

      <div
        className={`p-6 shadow-lg rounded-xl border ${
          isDarkMode
            ? "bg-[#122031] border-gray-700"
            : "bg-white border-gray-300"
        }`}
      >
        <h3
          className={`text-2xl font-semibold mb-4 text-center ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Fiber Shoot Weekly Progress
        </h3>
        <ReactApexChart
          options={getChartOptions(fiberShootWeeks)}
          series={fiberShootSeries}
          type="line"
          height={380}
        />
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
