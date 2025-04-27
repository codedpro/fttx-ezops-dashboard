"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  interval: string = "10m",
  rowLimit: number = 1000
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
    timeout: 150000,
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
  const [interval, setIntervalState] = useState<string>("10m");
  const [rowLimit, setRowLimit] = useState<number>(1000);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [payloadData, setPayloadData] = useState<OnlineCountPayload[] | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --------------------
  // DATA FETCH FUNCTION
  // --------------------
  const fetchData = useCallback(
    async (showLoading: boolean = true) => {
      if (showLoading) {
        setIsSearching(true);
      }
      setErrorMessage(null);

      try {
        const userService = new UserService();
        const token = userService.getToken();
        if (!token) {
          setErrorMessage("No AccessToken found in localStorage.");
          setPayloadData(null);
          if (showLoading) setIsSearching(false);
          return;
        }

        const result = await fetchIBSNGOnlineCount(token, interval, rowLimit);
        setPayloadData(result);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Failed to fetch online count data");
        setPayloadData(null);
      } finally {
        if (showLoading) {
          setIsSearching(false);
        }
      }
    },
    [interval, rowLimit]
  );

  // --------------------
  // INITIAL DATA FETCH ON PARAMETER CHANGE
  // --------------------
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // --------------------
  // BACKGROUND POLLING FOR LIVE UPDATES
  // --------------------
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchData(false);
    }, 60000); // 60000 ms = 1 minute
    return () => clearInterval(pollingInterval);
  }, [fetchData]);

  // --------------------
  // DATA PREPARATION
  // --------------------
  const sortedData = useMemo(() => {
    if (!payloadData) return [];
    return [...payloadData].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
  }, [payloadData]);

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
        type: "area",
        toolbar: { show: false },
        // Ensure the chart doesn’t impose a high z-index:
        background: "transparent",
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
        labels: { style: { fontSize: "16px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => value.toString(),
        },
        title: { style: { fontSize: "0px" } },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 250,
            },
            xaxis: {
              labels: { style: { fontSize: "12px" } },
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 220,
            },
            xaxis: {
              labels: { style: { fontSize: "10px" } },
            },
          },
        },
      ],
    };
  }, [dates]);

  // --------------------
  // DOWNLOAD HANDLER
  // --------------------
  const handleDownload = () => {
    if (!sortedData || sortedData.length === 0) {
      alert("No data available to download.");
      return;
    }

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
      {/* Top-level container */}
      <div>
        {/* HEADER + FILTERS */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-bold text-dark dark:text-white">
            {header}
          </h4>
          <div className="flex flex-wrap items-center gap-3 z-10">
            {/* Interval dropdown container */}
            <div className="flex items-center gap-2">
              <p className="font-medium uppercase text-dark dark:text-dark-6">
                Interval:
              </p>
              <div className="relative z-50">
                {/* Ensures the dropdown is above the chart */}
                <DefaultSelectOption
                  options={["1m", "10m", "30m", "1H"]}
                  onChange={(val: string) => setIntervalState(val)}
                  defaultValue={interval}
                />
              </div>
            </div>
            {/* RowLimit dropdown container */}
            <div className="flex items-center gap-2">
              <p className="font-medium uppercase text-dark dark:text-dark-6">
                Row Limit:
              </p>
              <div className="relative z-50">
                <DefaultSelectOption
                  options={["10", "50", "100", "200", "1000"]}
                  onChange={(val: string) => setRowLimit(Number(val))}
                  defaultValue={rowLimit.toString()}
                />
              </div>
            </div>
            {/* DOWNLOAD BUTTON */}
            <button
              className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded hover:bg-primaryhover"
              onClick={handleDownload}
              title="Download"
            >
              <FaCloudDownloadAlt size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* CONTENT / CHART */}
        <div className="w-full overflow-visible">
          {errorMessage ? (
            <div className="text-center text-red-600 font-medium">
              {errorMessage}
            </div>
          ) : isSearching && (!payloadData || payloadData.length === 0) ? (
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
              className="relative z-0"
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
    </div>
  );
};

export default ChartSix;
