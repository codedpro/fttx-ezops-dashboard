"use client";

import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_PROGRESS_DATA } from "@/data/fttxProgressData";

// React Icons
import { FaRoad, FaUsers } from "react-icons/fa";

interface ProgressDetails {
  Plan: number;
  Actual: number;
  Weekly: number;
}

interface SectionData {
  TotalDistance?: string;
  TotalCount?: number;
  Irancell: ProgressDetails;
  FCP: ProgressDetails;
}

/**
 * Custom hook to observe dark mode changes.
 * It checks if the <html> element has a "dark" class,
 * and uses a MutationObserver to update if that class changes.
 */
function useDarkModeObserver() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      // Check initially if dark mode is active.
      setIsDark(document.documentElement.classList.contains("dark"));

      // Create a MutationObserver to watch for attribute changes on <html>.
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && mutation.attributeName === "class") {
            setIsDark(document.documentElement.classList.contains("dark"));
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return isDark;
}

const ChartComponent: React.FC<{ title: string; sectionData: SectionData }> = ({
  title,
  sectionData,
}) => {
  const isDarkMode = useDarkModeObserver();
  // Choose label color based on dark mode.
  const labelColor = isDarkMode ? "#fff" : "#000";

  const series = [
    {
      name: "Plan",
      data: [sectionData.Irancell.Plan, sectionData.FCP.Plan],
    },
    {
      name: "Actual",
      data: [sectionData.Irancell.Actual, sectionData.FCP.Actual],
    },
    {
      name: "Weekly",
      data: [sectionData.Irancell.Weekly, sectionData.FCP.Weekly],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#feca00", "#28a745", "#17a2b8"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
      },
    },
    
    dataLabels: {
      enabled: true,
      offsetY: -18,
      style: {
        fontSize: "12px",
        fontWeight: 600,
        // Use our dynamic labelColor array.
        colors: [labelColor],
      },
      // Add a slight drop shadow for improved contrast.
 
      formatter: function (val: number | string): string | number {
        if (typeof val === "number") {
          return val.toLocaleString();
        }
        return val;
      },
    },
    xaxis: {
      categories: ["Irancell", "FCP"],
      labels: { style: { fontSize: "14px", fontWeight: 600 } },
    },
    yaxis: {
      labels: { style: { fontSize: "12px" } },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
    },
    grid: {
      borderColor: "#e7e7e7",
      strokeDashArray: 5,
    },
  };

  return (
    <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
        {title}
      </h3>
      <div className="relative">
        <ReactApexChart options={options} series={series} type="bar" height={350} />
      </div>

      {/* Display Total Distance or Total Count with an icon, centered */}
      <div className="mt-4 flex items-center justify-center text-gray-600 dark:text-gray-300 text-base">
        {sectionData.TotalDistance ? (
          <>
            <FaRoad className="text-lg mr-2" />
            <span>Total Distance:</span>
            <span className="ml-1 font-bold">{sectionData.TotalDistance}</span>
          </>
        ) : (
          <>
            <FaUsers className="text-lg mr-2" />
            <span>Total Count:</span>
            <span className="ml-1 font-bold">{sectionData.TotalCount}</span>
          </>
        )}
      </div>
    </div>
  );
};

const Excavation: React.FC = () => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Excavation Chart */}
      <ChartComponent
        title="Excavation Progress"
        sectionData={FTTX_PROGRESS_DATA.Excavation as SectionData}
      />

      {/* Fiber Shoot Chart */}
      <ChartComponent
        title="Fiber Shoot Progress"
        sectionData={FTTX_PROGRESS_DATA.FiberShoot as SectionData}
      />

      {/* FAT Installation Chart */}
      <ChartComponent
        title="FAT Installation Progress"
        sectionData={FTTX_PROGRESS_DATA.FATInstallation as SectionData}
      />
    </div>
  );
};

export default Excavation;
