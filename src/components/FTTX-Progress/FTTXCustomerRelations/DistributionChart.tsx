"use client";

import React, { useEffect, useRef, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts, { Point } from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import { CUSTOMER_RELATIONS_DATA } from "@/data/fttxCustomerRelationsData";

if (typeof Highcharts3D === "function") {
  Highcharts3D(Highcharts);
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

const DistributionChart: React.FC = () => {
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
              color: String(customPoint.color), // **Ensures label color matches the slice**
              fontWeight: "bold",
            });
          }
        });
      });
    }
  }, []);

  // Extracting Distribution Data
  const distributionData = [
    {
      name: `S&D: Sales & Distribution (${CUSTOMER_RELATIONS_DATA.Distribution.Sales_and_Distribution.Percentage}%)`,
      y: CUSTOMER_RELATIONS_DATA.Distribution.Sales_and_Distribution.Value,
      color: "#f97316", // Orange
    },
    {
      name: `CPG: Capital Program Group (${CUSTOMER_RELATIONS_DATA.Distribution.Capital_Program_Group.Percentage}%)`,
      y: CUSTOMER_RELATIONS_DATA.Distribution.Capital_Program_Group.Value,
      color: "#2563eb", // Blue
    },
    {
      name: `NWG: Network Group (${CUSTOMER_RELATIONS_DATA.Distribution.Network_Group.Percentage}%)`,
      y: CUSTOMER_RELATIONS_DATA.Distribution.Network_Group.Value,
      color: "#9333ea", // Purple
    },
    {
      name: `IT (${CUSTOMER_RELATIONS_DATA.Distribution.IT.Percentage}%)`,
      y: CUSTOMER_RELATIONS_DATA.Distribution.IT.Value,
      color: "#facc15", // Yellow
    },
  ];

  const chartOptions = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 400,
      width: 550,
      spacing: [10, 10, 10, 10],
      options3d: {
        enabled: true,
        alpha: 44, // **3D Effect**
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
        innerSize: "50%", // **Creates the donut effect**
        allowPointSelect: true,
        cursor: "pointer",
        depth: 44, // **Reduced by 1 degree**
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
        name: "Distribution",
        data: distributionData.map((item) => ({
          ...item,
          dataLabels: {
            style: {
              color: String(item.color), // **Ensures labels match slice color**
            },
          },
        })),
      },
    ],
  };

  return (
    <div className="p-4 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      {/* Chart Title */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">
       Pending BO TTS Distribution (Live)
      </h2>

      {/* Donut Chart */}
      <div className="flex justify-center">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />
      </div>
    </div>
  );
};

export default DistributionChart;
