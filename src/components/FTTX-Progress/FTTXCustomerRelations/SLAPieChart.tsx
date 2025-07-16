"use client";

import React, { useEffect, useRef, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts, { Point } from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import { CUSTOMER_RELATIONS_DATA } from "@/data/fttxCustomerRelationsData";

// Register the 3D module. The exported types do not reflect that the module is
// a function, so we cast to `any` before invoking it.
if (typeof (Highcharts3D as any) === "function") {
  (Highcharts3D as any)(Highcharts);
}

// Function to detect dark mode
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

interface CustomPoint extends Point {
  dataLabel?: Highcharts.SVGElement;
}

const SLAPieChart: React.FC = () => {
  const isDarkMode = useDarkModeObserver();
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (chart) {
      chart.series.forEach((series) => {
        series.points.forEach((point) => {
          const customPoint = point as CustomPoint;
          if (customPoint.dataLabel) {
            customPoint.dataLabel.css({
              color: String(customPoint.color), // **Fix Type Error by Ensuring String**
              fontWeight: "bold",
            });
          }
        });
      });
    }
  }, []);

  // Extracting SLA Data
  const slaData = [
    {
      name: `OUTSLA (${CUSTOMER_RELATIONS_DATA.SLA_Status.OUTSLA.Percentage}%)`,
      y: CUSTOMER_RELATIONS_DATA.SLA_Status.OUTSLA.Value,
      color: "#feca00", // Yellow
    },
    {
      name: `INSLA (${CUSTOMER_RELATIONS_DATA.SLA_Status.INSLA.Percentage}%)`,
      y: CUSTOMER_RELATIONS_DATA.SLA_Status.INSLA.Value,
      color: "#228B22", // Green
    },
  ];

  const chartOptions = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 400, // Balanced size
      width: 550, // Balanced size
      spacing: [10, 10, 10, 10],
      options3d: {
        enabled: true,
        alpha: 44, // **Reduced 1 degree from 45 to 44**
        beta: 0,
      },
    },
    title: {
      text: null, // **Title fully disabled**
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      backgroundColor: isDarkMode ? "#222" : "#ffffff",
      borderColor: "#000000",
      style: {
        color: isDarkMode ? "#ffffff" : "#000000",
        fontSize: "12px",
      },
      useHTML: true,
      formatter(this: { point: { name: string; y: number } }) {
        return `<div style="text-align: right;">
            <b>${this.point.name}</b>: ${this.point.y.toLocaleString()}
          </div>`;
      },
    },
    legend: {
      align: "center",
      layout: "horizontal",
      itemStyle: {
        color: isDarkMode ? "#ffffff" : "#000000",
        fontSize: "14px",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        depth: 44, // **Reduced 1 degree**
        dataLabels: {
          enabled: true,
          format: `{point.name}: {point.y}`,
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            textOutline: "none",
            color: undefined, // **Ensures text color matches slice color**
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: "SLA Status",
        data: slaData.map((item) => ({
          ...item,
          dataLabels: {
            style: {
              color: String(item.color), // **Fix Type Error by Forcing String**
            },
          },
        })),
      },
    ],
  };

  return (
    <div className="p-4 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
       <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center ">
        SLA Status Distribution
      </h2>
      <div className="flex justify-center">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};

export default SLAPieChart;
