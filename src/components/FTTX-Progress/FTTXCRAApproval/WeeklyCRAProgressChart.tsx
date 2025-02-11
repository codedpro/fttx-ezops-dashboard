"use client";

import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_CRA_PROGRESS_DATA } from "@/data/fttxCRAprogressData";

// Import icons from react-icons
import { FaUsers, FaCheckCircle } from "react-icons/fa";
import { MdLocationCity } from "react-icons/md";

// Extract data from FTTX_CRA_PROGRESS_DATA
const weeklyProgressData = FTTX_CRA_PROGRESS_DATA.WeeklyProgress;
const statsData = FTTX_CRA_PROGRESS_DATA.Stats;

// Create categories and series data from WeeklyProgress
const categories = Object.keys(weeklyProgressData) as (keyof typeof weeklyProgressData)[];
const visitedData = categories.map((key) => weeklyProgressData[key].Visited);
const approvedData = categories.map((key) => weeklyProgressData[key].Approved);

// Determine the maximum value (from both series) for the y-axis
const allValues = [...visitedData, ...approvedData];
const maxValue = Math.max(...allValues);
const yAxisMax = maxValue + maxValue * 0.1; // adds 10% padding
const minDisplayValue = maxValue * 0.02; // ensure small values are visible

// Define colors for the two series
const chartColors = ["#FEC107", "#007bff"];

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
    formatter: (val: number) => {
      return val >= minDisplayValue ? val.toLocaleString() : val.toLocaleString();
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

// Prepare additional stats from the Stats data
const additionalStats = [
  {
    icon: <FaUsers size={24} />,
    label: "Weekly Visited",
    value: statsData.WeeklyVisited,
  },
  {
    icon: <MdLocationCity size={24} />,
    label: "Weekly Approved CRA Region",
    value: statsData.WeeklyApprovedCRARegion,
  },
  {
    icon: <FaCheckCircle size={24} />,
    label: "Weekly Approved CRA",
    value: statsData.WeeklyApprovedCRA,
  },
];

const WeeklyCRAProgressChart: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
        Weekly CRA Progress Overview
      </h3>
      <ReactApexChart
        options={options}
        series={[
          { name: "Visited", data: visitedData },
          { name: "Approved", data: approvedData },
        ]}
        type="line"
        height={380}
      />

      {/* Additional Stats */}
      <div className="mt-4 flex flex-wrap justify-around gap-6">
        {additionalStats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <div className="text-2xl text-gray-600 dark:text-gray-300">
              {stat.icon}
            </div>
            <div className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
              {stat.label}
            </div>
            <div className="mt-1 text-xl font-bold text-primary">
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCRAProgressChart;
