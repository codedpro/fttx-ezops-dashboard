"use client";

import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_OPERATION_PROGRESS_DATA } from "@/data/fttxOperationProgressData";

// Icons
import {
  MdConstruction,   // For FAT Installations
  MdEventAvailable, // For FAT Visit Requests
  MdVerified,       // For FAT Approvals
  MdGroup,          // For Complex Visit Requests
  MdVerifiedUser,   // For Complex Approvals
  MdCancel          // For Complex Rejections
} from "react-icons/md";
import { FaNetworkWired } from "react-icons/fa";

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
  const isDarkMode = useDarkModeObserver();
  const colors =
    chartColors || ["#feca00", "#007bff", "#28a745", "#dc3545", "#17a2b8"];

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
        distributed: true, // each bar picks the next color from `colors`
        columnWidth: "60%",
        borderRadius: 6,
        dataLabels: {
          position: "top",
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
      offsetY: -15,
      style: {
        fontSize: "12px",
        fontWeight: "600",
        // Match each bar's label color to its color
        colors: colors,
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
          colors: isDarkMode ? "#fff" : "#000",
        },
      },
    },
    yaxis: {
      logBase: useLogScale ? 10 : 0,
      labels: {
        style: {
          fontSize: "12px",
          colors: isDarkMode ? "#fff" : "#000",
        },
      },
    },
    grid: {
      borderColor: isDarkMode ? "#2E2E2E" : "#e7e7e7",
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
 * Renders FAT and Complex charts side by side.
 */
const FATAndComplexCharts: React.FC = () => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* FAT Weekly Operations Chart */}
      <ChartComponent
        title="FAT Installation Approval"
        categories={["Visit Request", "Visited by OPS", "Approved", "Rejected", "Ongoing"]}
        data={[
          FTTX_OPERATION_PROGRESS_DATA.FAT.Weekly.VisitRequest,
          FTTX_OPERATION_PROGRESS_DATA.FAT.Weekly.VisitedByOPS,
          FTTX_OPERATION_PROGRESS_DATA.FAT.Weekly.Approved,
          FTTX_OPERATION_PROGRESS_DATA.FAT.Weekly.Rejected,
          FTTX_OPERATION_PROGRESS_DATA.FAT.Weekly.Ongoing,
        ]}
        additionalStats={[
          {
            icon: <MdConstruction size={24} />,
            label: "FAT Installations",
            value: FTTX_OPERATION_PROGRESS_DATA.FAT.TotalInstallation,
          },
          {
            icon: <MdEventAvailable size={24} />,
            label: "FAT Visit Requests",
            value: FTTX_OPERATION_PROGRESS_DATA.FAT.TotalVisitRequest,
          },
          {
            icon: <MdVerified size={24} />,
            label: "FAT Approvals",
            value: FTTX_OPERATION_PROGRESS_DATA.FAT.TotalApproved,
          },
        ]}
        chartColors={["#feca00", "#007bff", "#28a745", "#dc3545", "#17a2b8"]}
      />

      {/* Complex Weekly Operations Chart */}
      <ChartComponent
        title="Complex Weekly Operations"
        categories={["Request", "Visited", "Approved", "Delivered", "Rejected"]}
        data={[
          FTTX_OPERATION_PROGRESS_DATA.Complex.Weekly.Request,
          FTTX_OPERATION_PROGRESS_DATA.Complex.Weekly.Visited,
          FTTX_OPERATION_PROGRESS_DATA.Complex.Weekly.Approved,
          FTTX_OPERATION_PROGRESS_DATA.Complex.Weekly.Delivered,
          FTTX_OPERATION_PROGRESS_DATA.Complex.Weekly.Rejected,
        ]}
        additionalStats={[
          {
            icon: <MdGroup size={24} />,
            label: "Complex Visit Requests",
            value: FTTX_OPERATION_PROGRESS_DATA.Complex.TotalVisitRequest,
          },
          {
            icon: <FaNetworkWired size={24} />,
            label: "Complex Visits",
            value: FTTX_OPERATION_PROGRESS_DATA.Complex.TotalVisited,
          },
          {
            icon: <MdVerifiedUser size={24} />,
            label: "Complex Approvals",
            value: FTTX_OPERATION_PROGRESS_DATA.Complex.TotalApproved,
          },
          {
            icon: <MdCancel size={24} />,
            label: "Complex Rejections",
            value: FTTX_OPERATION_PROGRESS_DATA.Complex.TotalRejected,
          },
        ]}
        chartColors={["#007bff", "#feca00", "#28a745", "#17a2b8", "#dc3545"]}
      />
    </div>
  );
};

export default FATAndComplexCharts;
