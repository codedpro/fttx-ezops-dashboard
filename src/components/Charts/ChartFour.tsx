"use client";

import { ApexOptions } from "apexcharts";
import React, { useState, useMemo, useCallback } from "react";
import ReactApexChart from "react-apexcharts";
import DefaultSelectOption from "@/components/SelectOption/DefaultSelectOption";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { exportToXLSX } from "@/utils/exportToExcel";
import { UserService } from "@/services/userService";
import PayloadDayModal from "@/components/PayloadDayModal";

interface ChartFourProps {
  dailyData: {
    Date: string;
    Value: number;
  }[];
  exportid?: string;
  header: string;
}

const ChartFour: React.FC<ChartFourProps> = ({
  dailyData,
  exportid,
  header,
}) => {
  const [filter, setFilter] = useState<string>("Week");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const userService = new UserService();

  const sortedData = useMemo(
    () =>
      [...dailyData].sort(
        (a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
      ),
    [dailyData]
  );

  const filteredData = useMemo(
    () => sortedData.slice(-1 * (filter === "Week" ? 7 : 30)),
    [sortedData, filter]
  );

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  const formatDateForModal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };

  const dates = useMemo(
    () => filteredData.map((item) => formatDateForDisplay(item.Date)),
    [filteredData]
  );

  const series = useMemo(
    () => [
      {
        name: "Network Payload",
        data: filteredData.map((item) => ({
          x: formatDateForDisplay(item.Date),
          y: item.Value,
        })),
      },
    ],
    [filteredData]
  );

  const options: ApexOptions = useMemo(
    () => ({
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
        events: {
          markerClick: function (
            event: any,
            chartContext: any,
            { seriesIndex, dataPointIndex }: any
          ) {
            const selectedData = series[seriesIndex].data[dataPointIndex];
            if (selectedData && selectedData.x) {
              const originalDate = filteredData[dataPointIndex].Date;
              const formattedDate = formatDateForModal(originalDate);
              setSelectedDay(formattedDate);
              setIsModalOpen(true);
            } else {
              console.error("Selected data point is invalid:", selectedData);
            }
          },
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
        width: 2,
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
        labels: {
          formatter: (value: number) => {
            const units = ["MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
            let unitIndex = 0;
            while (value >= 1000 && unitIndex < units.length - 1) {
              value /= 1000;
              unitIndex++;
            }
            return `${value.toFixed(2)} ${units[unitIndex]}`;
          },
        },
        title: {
          style: {
            fontSize: "0px",
          },
        },
      },
    }),
    [dates, series, filteredData]
  );

  const handleDownload = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const exportData = filteredData.map((item) => ({
      Date: item.Date.split("T")[0],
      Value: item.Value,
    }));

    exportToXLSX(exportData, `Filtered_Data_${filter}`);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDay(null);
  }, []);

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-12.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            {header}
          </h4>
        </div>
        <div className="relative z-20 flex items-center gap-2.5">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Filter by:
          </p>
          <div id={exportid}>
            <DefaultSelectOption
              options={["Week", "Month"]}
              onChange={(value: string) => setFilter(value)}
            />
          </div>

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
      <div>
        <div className="-ml-4 -mr-5">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>

      {/* Render the Modal */}
      {isModalOpen && selectedDay && (
        <PayloadDayModal date={selectedDay} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ChartFour;
