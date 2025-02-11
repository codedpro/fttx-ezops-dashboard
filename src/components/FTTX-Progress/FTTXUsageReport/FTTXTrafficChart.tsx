"use client";

import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_TRAFFIC_DATA } from "@/data/fttxTrafficData";
import { FaUsers, FaNetworkWired, FaChartBar } from "react-icons/fa";

interface AdditionalStat {
  icon: JSX.Element;
  label: string;
  value: number;
}

// Declare categories and data as readonly arrays to match your data source.
interface ChartProps {
  title: string;
  categories: readonly string[];
  data: readonly number[];
  additionalStats: AdditionalStat[];
  chartColors?: string[];
  useLogScale?: boolean;
}

const ChartComponent: React.FC<ChartProps> = ({
  title,
  categories,
  data,
  additionalStats,
  chartColors,
  useLogScale = false,
}) => {
  // All bars will be green.
  const colors = chartColors || ["#28a745"];
  // Spread the data array to convert it from read‑only to mutable.
  const series = [
    {
      name: title,
      data: [...data],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        distributed: false, // all bars share the same color
        columnWidth: "60%",
        borderRadius: 6,
        dataLabels: { position: "top" },
      },
    },
    colors,
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
      offsetY: -15,
      style: {
        fontSize: "12px",
        fontWeight: "600",
        colors, // label text uses the same green
      },
      formatter: (val) => {
        if (val == null) return "";
        const num = Number(val);
        if (num === 0) return "0";
        if (num > 0 && num < 1) {
          return num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        return num.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      },
      background: {
        enabled: true,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#fff",
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
      categories,
      labels: {
        style: {
          fontSize: "14px",
          fontWeight: "600",
        },
      },
    },
    yaxis: {
      logBase: useLogScale ? 10 : 0,
      labels: { style: { fontSize: "12px" } },
    },
    grid: {
      borderColor: "#e7e7e7",
      strokeDashArray: 5,
    },
    legend: { show: false },
  };

  return (
    <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
        {title}
      </h3>
      <div className="relative">
        <ReactApexChart options={options} series={series} type="bar" height={350} />
      </div>
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

const FTTHTrafficChart: React.FC = () => {
  const categories = FTTX_TRAFFIC_DATA.WeeklyTraffic.Dates;
  const data = FTTX_TRAFFIC_DATA.WeeklyTraffic.TrafficGB;

  const additionalStats: AdditionalStat[] = [
    {
      icon: <FaUsers size={24} />,
      label: "Highest User Count",
      value: FTTX_TRAFFIC_DATA.TrafficSummary.HighestUserCount,
    },
    {
      icon: <FaNetworkWired size={24} />,
      label: "Maximum Throughput",
      value: FTTX_TRAFFIC_DATA.TrafficSummary.MaximumThroughput,
    },
    {
      icon: <FaChartBar size={24} />,
      label: "Peak FTTH User Traffic",
      value: FTTX_TRAFFIC_DATA.TrafficSummary.PeakUserTraffic,
    },
  ];

  return (
    <ChartComponent
      title="FTTH Traffic (GB)"
      categories={categories}
      data={data}
      additionalStats={additionalStats}
      chartColors={["#FFCC00"]}
    />
  );
};

export default FTTHTrafficChart;
