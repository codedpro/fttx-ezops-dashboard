"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts, { Point } from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import { CUSTOMER_RELATIONS_DATA } from "@/data/fttxCustomerRelationsData";

// Initialize Highcharts 3D if available
if (typeof Highcharts3D === "function") {
  Highcharts3D(Highcharts);
}

// Custom hook to detect large devices (≥1024px)
function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLarge(window.innerWidth >= 1024);
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isLarge;
}

// Custom hook to detect 2xl devices (≥1536px)
function useIs2xlScreen() {
  const [is2xl, setIs2xl] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIs2xl(window.innerWidth >= 1536);
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return is2xl;
}

// Dark Mode Detection Hook
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

interface BreakdownItem {
  Value: number;
  Percentage: number;
}

interface CustomPoint extends Point {
  dataLabel?: Highcharts.SVGElement;
}

const Pending195TTs: React.FC = () => {
  const isDarkMode = useDarkModeObserver();
  const isLarge = useIsLargeScreen();
  const is2xl = useIs2xlScreen();
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const pendingData = CUSTOMER_RELATIONS_DATA.Pending_195_TTs_Live;

  // Process the breakdown data for Highcharts
  const distributionData = useMemo(() => {
    return Object.entries(pendingData.Breakdown).map(
      ([key, value]: [string, BreakdownItem]) => ({
        name: `${key.replace(/_/g, " ")} (${value.Percentage}%)`,
        y: value.Value,
        color:
          key === "MTN_SND_FTTH"
            ? "#ff4500"
            : key === "MTN_CPG_Fiber"
            ? "#ffd700"
            : key === "CRA"
            ? "#32cd32"
            : key === "MTN_OPS_FTTH"
            ? "#1e90ff"
            : key === "MTN_TX_Infrastructure"
            ? "#8a2be2"
            : "#ff1493",
      })
    );
  }, [pendingData]);

  // Tooltip formatter function
  const tooltipFormatter = useCallback(function (
    this: { point: { name: string; y: number } }
  ) {
    return `<div style="text-align: right;">
              <b>${this.point.name}</b>: ${this.point.y.toLocaleString()}
            </div>`;
  }, []);

  // Chart options including responsive rules for legend and data labels
  const chartOptions = useMemo(() => {
    return {
      chart: {
        type: "pie",
        backgroundColor: "transparent",
        height: 400,
        spacing: [10, 10, 10, 10],
        options3d: {
          enabled: true,
          alpha: 44,
          beta: 0,
        },
      },
      title: { text: null },
      credits: { enabled: false },
      tooltip: {
        backgroundColor: isDarkMode ? "#222" : "#ffffff",
        borderColor: "#000000",
        style: {
          color: isDarkMode ? "#ffffff" : "#000000",
          fontSize: "12px",
        },
        useHTML: true,
        formatter: tooltipFormatter,
      },
      // Default legend: at the bottom (horizontal) on small devices.
      legend: {
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
        itemStyle: {
          color: isDarkMode ? "#ffffff" : "#000000",
          fontSize: "14px",
        },
      },
      plotOptions: {
        pie: {
          innerSize: "50%", // Donut appearance
          allowPointSelect: true,
          cursor: "pointer",
          depth: 64,
          dataLabels: {
            enabled: true, // Enabled by default (disabled on smaller devices via responsive rules)
            distance: 20,
            allowOverlap: false,
            format: "{point.name}: {point.y}",
            style: {
              fontSize: "14px",
              fontWeight: "bold",
              textOutline: "none",
            },
          },
          showInLegend: true,
        },
      },
      series: [
        {
          name: "Pending 195 TTs",
          center: ["50%", "50%"],
          size: "80%",
          data: distributionData.map((item) => ({
            ...item,
            dataLabels: {
              style: {
                color: String(item.color),
              },
            },
          })),
        },
      ],
      responsive: {
        rules: [
          // For small devices (maxWidth: 768), disable data labels.
          {
            condition: {
              maxWidth: 768,
            },
            chartOptions: {
              plotOptions: {
                pie: {
                  dataLabels: {
                    enabled: false,
                  },
                },
              },
              legend: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
              },
            },
          },
          // For large devices (minWidth: 1024), move the legend to the right and enable data labels.
          {
            condition: {
              minWidth: 1024,
            },
            chartOptions: {
              legend: {
                align: "right",
                layout: "vertical",
                verticalAlign: "middle",
                x: -50,
              },
              plotOptions: {
                pie: {
                  dataLabels: {
                    enabled: true,
                  },
                },
              },
            },
          },
        ],
      },
    };
  }, [distributionData, isDarkMode, tooltipFormatter]);

  // Optional: adjust data label style after render.
  useEffect(() => {
    const chart = chartRef.current?.chart;
    if (chart) {
      chart.series.forEach((series) => {
        series.points.forEach((point) => {
          const customPoint = point as CustomPoint;
          if (customPoint.dataLabel) {
            customPoint.dataLabel.css({
              color: String(customPoint.color),
              fontWeight: "bold",
            });
          }
        });
      });
    }
  }, []);

  // Calculate the number of red bars:
  // On 2xl devices (≥1536px): use the real number (pendingData.Total)
  // On large devices (≥1024px and <1536px): use ⌊Total / 2⌋
  // On smaller devices: use ⌊Total / 4⌋
  const sampleBarCount =
    pendingData.Total !== undefined
      ? is2xl
        ? pendingData.Total
        : isLarge
        ? Math.floor(pendingData.Total / 2)
        : Math.floor(pendingData.Total / 4)
      : 10;

  return (
    <div className="p-4 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      {/* Header Section */}
      <div className="w-full flex flex-col items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Pending 195 TTs Distribution (Live)
        </h2>

        {/* Bars and Total Number Container */}
        <div className="w-full flex flex-row items-center mt-4 px-4 gap-4">
          {/* Red Bars Container: display in one line without scrolling */}
          <div className="flex flex-1 flex-nowrap gap-1 items-center overflow-hidden">
            {Array.from({ length: sampleBarCount }).map((_, i) => (
              <div key={i} className="w-2 h-8 bg-red-500 rounded-md"></div>
            ))}
          </div>
          {/* Total Number always at the right */}
          <p className="text-4xl font-extrabold text-red-600">
            {pendingData.Total || sampleBarCount}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex justify-center mt-4">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
          containerProps={{ className: "w-full overflow-hidden" }}
        />
      </div>
    </div>
  );
};

export default Pending195TTs;
