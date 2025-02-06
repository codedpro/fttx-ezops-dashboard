"use client";

import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_PROGRESS_DATA } from "@/data/fttxProgressData";

// Dark mode detection
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

const WeeklyProgressChart: React.FC = () => {
  const isDarkMode = useDarkModeObserver();

  // Extract weekly data keys
  const excavationWeeks = Object.keys(
    FTTX_PROGRESS_DATA.Excavation.Irancell.WeeklyData
  );
  const fiberShootWeeks = Object.keys(
    FTTX_PROGRESS_DATA.FiberShoot.Irancell.WeeklyData
  );

  // Series data
  const excavationSeries = [
    {
      name: "Irancell Excavation",
      data: Object.values(FTTX_PROGRESS_DATA.Excavation.Irancell.WeeklyData),
    },
    {
      name: "FCP Excavation",
      data: Object.values(FTTX_PROGRESS_DATA.Excavation.FCP.WeeklyData),
    },
  ];

  const fiberShootSeries = [
    {
      name: "Irancell Fiber Shoot",
      data: Object.values(FTTX_PROGRESS_DATA.FiberShoot.Irancell.WeeklyData),
    },
    {
      name: "FCP Fiber Shoot",
      data: Object.values(FTTX_PROGRESS_DATA.FiberShoot.FCP.WeeklyData),
    },
  ];

  // Use yellow & blue for the two data lines
  const chartColors = ["#FEC107", "#007BFF"];

  // Base chart options (with minimal toolbar)
  const baseOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 380,
      toolbar: {
        show: false, // Removes export, zoom, etc.
      },
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
      hover: {
        sizeOffset: 2,
      },
    },
    dataLabels: {
      enabled: true,
      // Use the same color as each series line for both label text & background
      // If you specifically want the label text to be the same color as the line,
      // set 'style.colors' to chartColors as well.
      // If you'd like the text to be near black/gray, do colors: ["#333", "#333"].
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        // Each label's text color = line color:
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
      offsetY: -5, // Slight offset to reduce overlap
    },
    xaxis: {
      labels: {
        show: true,
        rotate: 0,
        style: {
          fontSize: "14px",
          fontWeight: 600,
        },
        hideOverlappingLabels: false,
      },
      axisBorder: {
        show: true,
        color: "#ccc",
      },
      axisTicks: {
        show: true,
        color: "#ccc",
      },
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
      // *Matches* your snippet (switches light/dark automatically)
      theme: "light", // We'll override in getChartOptions below if isDarkMode
      x: { show: true },
      y: {
        formatter: (val) => `${val}`, // or add .toLocaleString() if needed
      },
      marker: { show: true },
    },
  };

  // Create final chart options based on dark/light mode
  const getChartOptions = (categories: string[]) => ({
    ...baseOptions,
    xaxis: {
      ...baseOptions.xaxis,
      categories,
    },
    grid: {
      ...baseOptions.grid,
      // Darker grid lines in dark mode
      borderColor: isDarkMode ? "#2E3945" : "#e7e7e7",
    },
    tooltip: {
      ...baseOptions.tooltip,
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Excavation Weekly Progress */}
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
          Excavation Weekly Progress
        </h3>
        <ReactApexChart
          options={getChartOptions(excavationWeeks)}
          series={excavationSeries}
          type="line"
          height={380}
        />
      </div>

      {/* Fiber Shoot Weekly Progress */}
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
