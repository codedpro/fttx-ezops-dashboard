"use client";
import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FaCloudDownloadAlt } from "react-icons/fa";
import axios from "axios";
import { exportToXLSX } from "@/utils/exportToExcel";
import { UserService } from "@/services/userService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartThreeProps {
  series: number[];
  colors: string[];
  labels: string[];
  header: string;
  apiname: string;
}

const ChartThree: React.FC<ChartThreeProps> = ({
  series,
  colors,
  labels,
  header,
  apiname,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const total = series.reduce((a, b) => a + b, 0);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
      background: "transparent",
    },
    theme: {
      mode: "dark",
    },
    colors: colors,
    labels: labels,
    legend: {
      show: false,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          labels: {
            show: false,
            total: {
              show: false,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val, { seriesIndex }) =>
          `${series[seriesIndex]} (${((val / total) * 100).toFixed(2)}%)`,
      },
    },
    states: {
      hover: {
        filter: {
          type: "lighten",
          value: 0.15,
        },
      },
    },
    responsive: [
      {
        breakpoint: 640, // Small screens
        options: {
          chart: {
            width: 300, // Increase chart size for small screens
          },
        },
      },
      {
        breakpoint: 1024, // Medium screens
        options: {
          chart: {
            width: 350,
          },
        },
      },
      {
        breakpoint: 2600, // Large screens
        options: {
          chart: {
            width: 415,
          },
        },
      },
    ],
  };

  const userService = new UserService();

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/${apiname}`,
        {
          headers: {
            Authorization: `Bearer ${userService.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;

      if (data.length === 0) {
        alert("No data available to download.");
        return;
      }

      exportToXLSX(data, apiname);
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data. Please try again.");
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="col-span-12 relative rounded-[12px] bg-white dark:bg-gray-dark p-4 sm:p-6 md:p-8 shadow-lg dark:shadow-dark-lg xl:col-span-5 hover:shadow-2xl">
      <div className="mb-4 md:mb-6 flex  flex-row justify-between gap-2 sm:gap-4">
        <div>
          <h4 className="text-md sm:text-xl font-bold text-gray-800 dark:text-white">
            {header}
          </h4>
        </div>
        <button
          className="flex items-center justify-center gap-1 bg-primary text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-primaryhover"
          onClick={handleDownload}
          title="Download"
        >
          <FaCloudDownloadAlt size={16} className="sm:mr-2" />
          <span className=" sm:inline">Export</span>
        </button>
      </div>

      <div className="relative mb-6 md:mb-8">
        <div className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-center">
            <p className="text-gray-800 dark:text-white text-base sm:text-lg font-medium">
              Total
            </p>
            <p className="text-gray-800 dark:text-white text-2xl sm:text-3xl font-bold">
              {total}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[350px]">
        <div className="flex flex-wrap sm:flex-nowrap sm:flex-row  items-center justify-center gap-3 sm:gap-5">
          {labels.map((label, index) => {
            const percentage = ((series[index] / total) * 100).toFixed(2);

            return (
              <div
                key={index}
                className="w-full sm:w-1/2 text-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 p-2 sm:p-3 rounded-lg"
              >
                <div className="flex w-full items-center justify-center space-x-2">
                  <span
                    className="inline-block h-2 w-2 sm:h-3 sm:w-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  ></span>
                  <p className="text-xs sm:text-base font-medium text-gray-800 dark:text-white">
                    {label}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {series[index]} ({percentage}%)
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartThree;
