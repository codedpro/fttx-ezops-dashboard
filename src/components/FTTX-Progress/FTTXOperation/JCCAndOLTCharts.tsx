"use client";

import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_OPERATION_PROGRESS_DATA } from "@/data/fttxOperationProgressData";

// Icons
import {
  MdRequestQuote,  // For JCC Requests
  MdVerified,      // For JCC Approvals
  MdCancel,        // For JCC Rejections
  MdEngineering,   // For OLT Installations
  MdGroup,         // For OLT Visits
  MdDoneAll        // For OLT Approvals
} from "react-icons/md";
import { FaNetworkWired } from "react-icons/fa";

interface AdditionalStat {
  icon: JSX.Element;
  label: string;
  value: number;
}

interface ChartProps {
  title: string;
  categories: string[];
  data: number[];
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
  // Default or user-provided colors
  const colors =
    chartColors || ["#feca00", "#007bff", "#28a745", "#dc3545", "#17a2b8"];

  // Single series: one array of data
  const series = [
    {
      name: title,
      data,
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
        horizontal: false,
        distributed: true,   // each bar gets a color from `colors`
        columnWidth: "60%",
        borderRadius: 6,
        dataLabels: {
          position: "top",   // place labels near the top of bars
        },
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
      // Negative offset lifts labels above the bars
      offsetY: -15,
      style: {
        fontSize: "12px",
        fontWeight: "600",
        // Match label text color to bar color
        colors: colors,  
      },
      formatter: (val) => {
        if (val == null) return "";
        const num = Number(val);
        // Show "0" explicitly
        if (num === 0) return "0";
        // Small decimals
        if (num > 0 && num < 1) {
          return num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        // Larger values
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
      // Optionally use a log scale
      logBase: useLogScale ? 10 : 0,
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#e7e7e7",
      strokeDashArray: 5,
    },
    // Only one series => no legend needed
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
            <div className="mt-1 text-xl font-bold text-[#007bff] dark:text-[#feca00]">
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Parent component for JCC and OLT charts.
 */
const JCCAndOLTCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* JCC Weekly Operations */}
      <ChartComponent
        title="JCC Weekly Progress (Km)"
        categories={["Request", "Visited", "Approved", "Rejected", "Ongoing"]}
        data={[
          FTTX_OPERATION_PROGRESS_DATA.JCC.Weekly.Request,
          FTTX_OPERATION_PROGRESS_DATA.JCC.Weekly.Visited,
          FTTX_OPERATION_PROGRESS_DATA.JCC.Weekly.Approved,
          FTTX_OPERATION_PROGRESS_DATA.JCC.Weekly.Rejected,
          FTTX_OPERATION_PROGRESS_DATA.JCC.Weekly.Ongoing,
        ]}
        additionalStats={[
          {
            icon: <MdRequestQuote size={24} />,
            label: "JCC Requests",
            value: FTTX_OPERATION_PROGRESS_DATA.JCC.TotalRequest,
          },
          {
            icon: <MdVerified size={24} />,
            label: "JCC Approvals",
            value: FTTX_OPERATION_PROGRESS_DATA.JCC.TotalApproved,
          },
          {
            icon: <MdCancel size={24} />,
            label: "JCC Rejections",
            value: FTTX_OPERATION_PROGRESS_DATA.JCC.TotalRejected,
          },
        ]}
        // Provide exactly 5 colors for 5 categories
        chartColors={["#007bff", "#feca00", "#28a745", "#dc3545", "#17a2b8"]}
      />

      {/* OLT Weekly Operations */}
      <ChartComponent
        title="OLT Installation Approval"
        categories={["Visit Request", "Visited by OPS", "Approved", "Rejected", "Ongoing"]}
        data={[
          FTTX_OPERATION_PROGRESS_DATA.OLT.Weekly.VisitRequest,
          FTTX_OPERATION_PROGRESS_DATA.OLT.Weekly.VisitedByOPS,
          FTTX_OPERATION_PROGRESS_DATA.OLT.Weekly.Approved,
          FTTX_OPERATION_PROGRESS_DATA.OLT.Weekly.Rejected,
          FTTX_OPERATION_PROGRESS_DATA.OLT.Weekly.Ongoing,
        ]}
        additionalStats={[
          {
            icon: <FaNetworkWired size={24} />,
            label: "OLT Plan",
            value: FTTX_OPERATION_PROGRESS_DATA.OLT.Plan,
          },
          {
            icon: <MdEngineering size={24} />,
            label: "OLT Installations",
            value: FTTX_OPERATION_PROGRESS_DATA.OLT.TotalInstallation,
          },
          {
            icon: <MdGroup size={24} />,
            label: "OLT Visits",
            value: FTTX_OPERATION_PROGRESS_DATA.OLT.TotalVisitByOPS,
          },
          {
            icon: <MdDoneAll size={24} />,
            label: "OLT Approvals",
            value: FTTX_OPERATION_PROGRESS_DATA.OLT.TotalApproved,
          },
        ]}
        chartColors={["#feca00", "#007bff", "#28a745", "#dc3545", "#17a2b8"]}
      />
    </div>
  );
};

export default JCCAndOLTCharts;
