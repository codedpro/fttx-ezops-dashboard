"use client";

import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface OperationWeeklyProgressChartProps {
  weeklyProgressData: Record<string, number>;
  title: string;
}

// Dark mode detection hook
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

const OperationWeeklyProgressChart: React.FC<OperationWeeklyProgressChartProps> = ({
  weeklyProgressData,
}) => {
  const isDarkMode = useDarkModeObserver();

  // Create chart categories and series dynamically from the passed data.
  const categories = Object.keys(weeklyProgressData);
  const series = [
    {
      name: "Operation Weekly Progress",
      data: Object.values(weeklyProgressData),
    },
  ];

  // Chart color – you can adjust as desired.
  const chartColors = ["#FEC107"];

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
      offsetY: -5,
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
    },
    xaxis: {
      labels: {
        show: true,
        rotate: 0,
        style: { fontSize: "14px", fontWeight: 600 },
        hideOverlappingLabels: false,
      },
      axisBorder: { show: true, color: "#ccc" },
      axisTicks: { show: true, color: "#ccc" },
    },
    yaxis: {
      labels: { style: { fontSize: "13px" } },
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
        formatter: (val: number) => `${val}`,
      },
      marker: { show: true },
    },
  };

  const getChartOptions = (categories: string[]) => ({
    ...baseOptions,
    xaxis: { ...baseOptions.xaxis, categories },
    grid: { ...baseOptions.grid, borderColor: isDarkMode ? "#2E3945" : "#e7e7e7" },
  });

  return (
    <div
      className={`p-6 shadow-lg rounded-xl border ${
        isDarkMode ? "bg-[#122031] border-gray-700" : "bg-white border-gray-300"
      }`}
    >
      <h3
        className={`text-2xl font-semibold mb-4 text-center ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Operation Weekly Progress
      </h3>
      <ReactApexChart
        options={getChartOptions(categories)}
        series={series}
        type="line"
        height={380}
      />
    </div>
  );
};

export default OperationWeeklyProgressChart;
