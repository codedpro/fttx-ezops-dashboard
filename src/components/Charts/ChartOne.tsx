"use client";
import { ApexOptions } from "apexcharts";
import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import DefaultSelectOption from "@/components/SelectOption/DefaultSelectOption";
import { FaCloudDownloadAlt } from "react-icons/fa";
import axios from "axios";
import { exportToXLSX } from "@/utils/exportToExcel";
import { UserService } from "@/services/userService";

interface ChartOneProps {
  dailyData: {
    Date: string;
    Total_Created: number;
    Closed_or_Resolved: number;
  }[];
  totalClosed: number;
  totalRunning: number;
}

const ChartOne: React.FC<ChartOneProps> = ({
  dailyData,
  totalClosed,
  totalRunning,
}) => {
  const [filter, setFilter] = useState<string>("Week");

  const filteredData = dailyData.slice(filter === "Week" ? -7 : -30);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const dates = filteredData.map((item) => formatDate(item.Date));
  const createdData = filteredData.map((item) => item.Total_Created);
  const resolvedData = filteredData.map((item) => item.Closed_or_Resolved);

  const series = [
    {
      name: "Total Created",
      data: createdData,
    },
    {
      name: "Closed or Resolved",
      data: resolvedData,
    },
  ];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#feca00", "#fff18a"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    stroke: {
      curve: "smooth",
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: dates,
      labels: {
        style: {
          fontSize: "20px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const userService = new UserService();

  const handleDownload = async () => {
    const end = filter === "Week" ? 7 : 30;
    const start = 0;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHDashboardExportUTTicketDaily`,
        {
          Start: start,
          End: end,
        },
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

      exportToXLSX(data, "UT_Complains_Overview");
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data. Please try again.");
    }
  };

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            UT Complains Overview
          </h4>
        </div>
        <div className="relative z-20 flex items-center gap-2.5">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Filter by:
          </p>
          <DefaultSelectOption
            options={["Week", "Month"]}
            onChange={(value: string) => setFilter(value)}
          />
          <button
            className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-primaryhover"
            onClick={handleDownload}
            title="Download"
          >
            <FaCloudDownloadAlt size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
      <div>
        <div className="-ml-4 -mr-5">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={310}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 text-center xsm:flex-row xsm:gap-0 mt-4">
        <div className="border-stroke dark:border-dark-3 xsm:w-1/2 xsm:border-r">
          <p className="font-medium">Total Closed UT Tickets</p>
          <h4 className="mt-1 text-xl font-bold text-dark dark:text-white">
            {totalClosed}
          </h4>
        </div>
        <div className="xsm:w-1/2">
          <p className="font-medium">Total Running UT Tickets</p>
          <h4 className="mt-1 text-xl font-bold text-dark dark:text-white">
            {totalRunning}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
