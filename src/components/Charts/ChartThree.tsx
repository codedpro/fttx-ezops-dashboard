"use client";
import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartThreeProps {
  series: number[];
  colors: string[];
  labels: string[];
}

const ChartThree: React.FC<ChartThreeProps> = ({ series, colors, labels }) => {
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
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="col-span-12 relative rounded-[12px] bg-white dark:bg-gray-dark p-8 shadow-lg dark:shadow-dark-lg xl:col-span-5 hover:shadow-2xl">
      <div className="mb-9 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-bold text-gray-800 dark:text-white">
            FTTH Modem Status
          </h4>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-center">
            <p className="text-gray-800 dark:text-white text-xl font-medium">
              Total
            </p>
            <p className="text-gray-800 dark:text-white text-3xl font-bold">
              {total}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[350px]">
        <div className="flex flex-wrap items-center justify-center gap-y-5">
          {labels.map((label, index) => {
            const percentage = ((series[index] / total) * 100).toFixed(2);

            return (
              <div
                key={index}
                className="w-full sm:w-1/2 text-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-lg"
              >
                <div className="flex w-full items-center justify-center space-x-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  ></span>
                  <p className="text-base font-medium text-gray-800 dark:text-white">
                    {label}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
