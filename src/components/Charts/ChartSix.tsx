"use client";

import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { exportToXLSX } from "@/utils/exportToExcel";
import DefaultSelectOption from "@/components/SelectOption/DefaultSelectOption";
import { UserService } from "@/services/userService";

// --------------------
// TYPE DEFINITIONS
// --------------------
interface OnlineCountPayload {
  datetime: string;
  count: number;
}

interface ChartSixProps {
  exportid?: string;
  header: string;
}

// --------------------
// INTERNAL FETCH FUNCTION
// --------------------
async function fetchIBSNGOnlineCount(
  token: string,
  interval: string = "1m",
  rowLimit: number = 10
): Promise<OnlineCountPayload[]> {
  const data = JSON.stringify({
    interval,
    RowLimit: rowLimit,
  });

  const config = {
    method: "post",
    url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/FTTHGetIBSNGOnlineCount`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  try {
    const response = await axios.request<OnlineCountPayload[]>(config);
    return response.data;
  } catch (error) {
    console.error("Error fetching IBSNG online count data:", error);
    throw new Error("Failed to fetch IBSNG online count data");
  }
}

// --------------------
// MAIN COMPONENT
// --------------------
const ChartSix: React.FC<ChartSixProps> = ({ exportid, header }) => {
 

  // --------------------
  // STATE & REFS
  // --------------------
  const [interval, setInterval] = useState<string>("1m");
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [payloadData, setPayloadData] = useState<OnlineCountPayload[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --------------------
  // FETCH DATA WHEN PARAMETERS CHANGE
  // --------------------
  useEffect(() => {
    const fetchData = async () => {
      setIsSearching(true);
      setErrorMessage(null);

      try {
        const userService = new UserService();
        const token = userService.getToken();
        if (!token) {
          setErrorMessage("No AccessToken found in localStorage.");
          setPayloadData(null);
          setIsSearching(false);
          return;
        }

        const result = await fetchIBSNGOnlineCount(token, interval, rowLimit);
        setPayloadData(result);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Failed to fetch online count data");
        setPayloadData(null);
      } finally {
        setIsSearching(false);
      }
    };

    fetchData();
  }, [interval, rowLimit]);

  // --------------------
  // DATA PREPARATION
  // --------------------
  const sortedData = useMemo(() => {
    if (!payloadData) return [];
    return [...payloadData].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
  }, [payloadData]);

  // Format the datetime to include both date and time
  const formatDateForDisplay = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dates = useMemo(
    () => sortedData.map((item) => formatDateForDisplay(item.datetime)),
    [sortedData]
  );

  const series = useMemo(
    () => [
      {
        name: "Online Count",
        data: sortedData.map((item) => ({
          x: formatDateForDisplay(item.datetime),
          y: item.count,
        })),
      },
    ],
    [sortedData]
  );

  const options = useMemo(() => {
    return {
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
        toolbar: { show: false },
      },
      fill: { gradient: { opacityFrom: 0.55, opacityTo: 0 } },
      stroke: { curve: "smooth", width: 2 },
      grid: {
        strokeDashArray: 5,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: "category",
        categories: dates,
        labels: { style: { fontSize: "20px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => value.toString(),
        },
        title: { style: { fontSize: "0px" } },
      },
    };
  }, [dates]);

  // --------------------
  // DOWNLOAD
  // --------------------
  const handleDownload = () => {
    if (!sortedData || sortedData.length === 0) {
      alert("No data available to download.");
      return;
    }

    // Export the full datetime string along with count
    const exportData = sortedData.map((item) => ({
      datetime: item.datetime,
      count: item.count,
    }));
    exportToXLSX(exportData, `OnlineCount_Data_${interval}`);
  };

  // --------------------
  // RENDER
  // --------------------
  return (
    <div className="col-span-12 rounded-[10px] bg-white dark:bg-gray-dark px-7.5 pb-12.5 pt-7.5 shadow-1 dark:shadow-card xl:col-span-7">
      {/* HEADER + FILTERS */}
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            {header}
          </h4>
        </div>
        <div className="relative flex flex-col gap-2.5 sm:flex-row sm:items-center w-full sm:w-auto">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Interval:
          </p>
          <DefaultSelectOption
            options={["1m", "10m", "30m", "1H"]} //1d 1w
            onChange={(val: string) => setInterval(val)}
            defaultValue={interval}
          />

          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Row Limit:
          </p>
          <DefaultSelectOption
            options={["10", "50", "100", "200", "1000"]}
            onChange={(val: string) => setRowLimit(Number(val))}
            defaultValue={rowLimit.toString()}
          />

          {/* DOWNLOAD BUTTON */}
          <button
            className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-md text-xs sm:text-sm hover:bg-primaryhover"
            onClick={handleDownload}
            title="Download"
          >
            <FaCloudDownloadAlt size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* CONTENT / CHART */}
      <div>
        {errorMessage ? (
          <div className="text-red-600 font-medium">{errorMessage}</div>
        ) : isSearching ? (
          <div className="flex justify-center items-center h-32">
            <svg
              className="animate-spin h-10 w-10 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          </div>
        ) : payloadData && payloadData.length > 0 ? (
          <ReactApexChart
            options={options as ApexCharts.ApexOptions}
            series={series}
            type="area"
            height={310}
          />
        ) : (
          <div className="mt-4 text-center text-gray-500">
            No online count data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSix;
