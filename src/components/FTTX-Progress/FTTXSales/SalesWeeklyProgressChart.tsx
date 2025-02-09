"use client";

import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_SALES_PROGRESS_DATA } from "@/data/fttxSalesProgressData";

// Import icons from react-icons
import { FaUsers, FaSchool, FaCheckCircle } from "react-icons/fa";
import { MdFiberNew, MdLocationCity } from "react-icons/md";

// Read Weekly Progress data dynamically
const weeklyProgressData = FTTX_SALES_PROGRESS_DATA.WeeklyProgress;
const statsData = FTTX_SALES_PROGRESS_DATA.Stats;
const schoolsData = FTTX_SALES_PROGRESS_DATA.Schools;

const categories = Object.keys(weeklyProgressData);
const data = Object.values(weeklyProgressData);

// Define colors for each bar and corresponding label
const chartColors = ["#FEC107", "#007bff", "#28a745", "#dc3545", "#17a2b8", "#8e44ad"];

const maxValue = Math.max(...data);
const yAxisMax = maxValue + maxValue * 0.1; // Adds 10% padding
const minDisplayValue = maxValue * 0.02; // Ensure small values are visible

const options: ApexOptions = {
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
    },
    formatter: (val: string | number | number[], { dataPointIndex }) => {
      const numVal = typeof val === "number" ? val : 0; // Ensure numeric type
      return numVal >= minDisplayValue ? numVal.toLocaleString() : numVal.toLocaleString();
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
    categories: categories,
    labels: {
      style: { fontSize: "14px", fontWeight: 600 },
    },
    axisBorder: { show: true, color: "#ccc" },
    axisTicks: { show: true, color: "#ccc" },
  },
  yaxis: {
    labels: { style: { fontSize: "13px" } },
    min: 1,
    max: yAxisMax,
    forceNiceScale: true,
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

const additionalStats = [
  {
    icon: <FaUsers size={24} />,
    label: "Total Connected Users",
    value: statsData.TotalConnectedUsers,
    color: chartColors[0],
  },
  {
    icon: <MdFiberNew size={24} />,
    label: "Weekly Connected",
    value: statsData.WeeklyConnected,
    color: chartColors[1],
  },
  {
    icon: <MdLocationCity size={24} />,
    label: "Active FAT",
    value: statsData.ActiveFAT,
    color: chartColors[2],
  },
  {
    icon: <FaSchool size={24} />,
    label: "Total Connected Schools",
    value: schoolsData.TotalConnected,
    color: chartColors[3],
  },
  {
    icon: <FaCheckCircle size={24} />,
    label: "Schools Ready to Install",
    value: schoolsData.ReadyToInstall,
    color: chartColors[4],
  },
];

const SalesWeeklyProgressChart: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
        Weekly Progress Connected
      </h3>
      <ReactApexChart options={options} series={[{ name: "Sales Weekly Progress", data }]} type="line" height={380} />
      
      {/* Additional Stats */}
      <div className="mt-6 flex flex-wrap justify-around gap-6">
        {additionalStats.map((stat, index) => (
          <div key={stat.label} className="flex flex-col items-center">
            <div className="text-2xl" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="mt-1 text-sm font-semibold" style={{ color: stat.color }}>
              {stat.label}
            </div>
            <div className="mt-1 text-xl font-bold" style={{ color: stat.color }}>
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesWeeklyProgressChart;
