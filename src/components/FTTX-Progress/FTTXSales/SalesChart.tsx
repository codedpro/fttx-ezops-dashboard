"use client";

import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_SALES_PROGRESS_DATA } from "@/data/fttxSalesProgressData";

// Read sales data dynamically
const salesData = FTTX_SALES_PROGRESS_DATA.ChartData;
const categories = Object.keys(salesData);
const data = Object.values(salesData);

// Assign unique colors to each bar based on its label
const chartColors: Record<string, string> = {
  TotalRequests: "#007bff",
  RequestConfirmed: "#28a745",
  RejectedRequests: "#dc3545",
  ActiveUsers: "#feca00",
  ReadyToInstall: "#17a2b8",
  PendingPayment: "#8e44ad",
};

// Extract color values in the same order as the categories
const barColors = categories.map((category) => chartColors[category] || "#666");

// Calculate max value dynamically for better spacing
const maxValue = Math.max(...data);
const yAxisMax = maxValue + maxValue * 0.1; // Adds 10% padding

const options: ApexOptions = {
  chart: {
    type: "bar",
    height: 350,
    toolbar: { show: false },
    stacked: false,
  },
  colors: barColors, // This array will be used when distributed is true.
  plotOptions: {
    bar: {
      distributed: true, // Enable distributed mode so each bar gets a unique color.
      horizontal: false,
      columnWidth: "50%",
      borderRadius: 6,
      dataLabels: { position: "top" },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      shadeIntensity: 0.4,
      opacityFrom: 0.9,
      opacityTo: 0.7,
      stops: [0, 90, 100],
    },
  },
  dataLabels: {
    enabled: true,
    offsetY: -10,
    style: {
      fontSize: "12px",
      fontWeight: 600,
      colors: barColors, // Each data label will also use its corresponding color.
    },
    formatter: (val: number) => val.toLocaleString(),
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
  },
  yaxis: {
    labels: {
      style: { fontSize: "12px" },
    },
    min: 1,
    max: yAxisMax,
    forceNiceScale: true,
  },
  grid: {
    borderColor: "#e7e7e7",
    strokeDashArray: 5,
  },
  legend: { show: false },
};

const series = [
  {
    name: "Sales Data",
    data: data,
  },
];

const SalesChart: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
        Sales Chart Overview
      </h3>
      <div className="relative">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

export default SalesChart;
