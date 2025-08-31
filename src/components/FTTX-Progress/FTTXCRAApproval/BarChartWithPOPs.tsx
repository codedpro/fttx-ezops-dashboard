"use client";

import React, { useRef, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { FTTX_CRA_PROGRESS_DATA } from "@/data/fttxCRAprogressData";

const barChartData = FTTX_CRA_PROGRESS_DATA.BarChartData;
const statsData = FTTX_CRA_PROGRESS_DATA.ChartData;

const categories = [
  "Approved by CRA",
  "Approved by CRA's Region",
  "Visited By CRA Region",
  "FTTX Coverage",
];

const values = [
  barChartData.ApprovedByCRA.Value,
  barChartData.ApprovedByCRARegion.Value,
  barChartData.VisitedByCRARegion.Value,
  barChartData.IranfttxCoverage.Value,
];

const pops = [
  barChartData.ApprovedByCRA.POPs,
  barChartData.ApprovedByCRARegion.POPs,
  barChartData.VisitedByCRARegion.POPs,
  barChartData.IranfttxCoverage.POPs,
];

const colors = ["#00B000", "#90EE90", "#007BFF", "#FFD700"];

/**
 * A function to force all annotation labels (text & tspan) to fill white.
 * Call this after the chart updates.
 */
function forceWhiteAnnotationLabels() {
  // 1. Select <text.apexcharts-annotation-label>
  const annotationTexts = document.querySelectorAll(
    "text.apexcharts-annotation-label"
  );
  annotationTexts.forEach((textEl) => {
    textEl.setAttribute("fill", "#fff");
    (textEl as HTMLElement).style.fill = "#fff";
  });

  // 2. Also select any nested <tspan> elements within annotation labels
  const annotationTspans = document.querySelectorAll(
    "text.apexcharts-annotation-label tspan"
  );
  annotationTspans.forEach((tspan) => {
    tspan.setAttribute("fill", "#fff");
    (tspan as HTMLElement).style.fill = "#fff";
  });
}

const options: ApexOptions = {
  chart: {
    type: "bar",
    height: 380,
    toolbar: { show: false },
    events: {
      mounted: (chartContext, config) => {
        // Run a short delay so the SVG is fully in the DOM
        setTimeout(() => {
          forceWhiteAnnotationLabels();
        }, 50);
      },
      updated: (chartContext, config) => {
        setTimeout(() => {
          forceWhiteAnnotationLabels();
        }, 50);
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      barHeight: "75%",
      borderRadius: 5,
    },
  },
  colors,
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      shadeIntensity: 0.4,
      opacityFrom: 0.9,
      opacityTo: 0.7,
      stops: [0, 90, 100],
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val.toLocaleString(),
    style: {
      fontSize: "14px",
      
      fontWeight: "bold",
    },
    offsetX: 0,
  },
  annotations: {
    // @ts-expect-error string is not type of the number
    points: values.map((val, index) => ({
      x: val + val * 0.02,
      y: categories[index],
      marker: { size: 0 },
      label: {
        text: `${pops[index]} POPs`,
        offsetX: 10,
        offsetY: 10,
        textAnchor: "start",
        borderColor: colors[index],
        borderWidth: "2",

        style: {
          fontSize: "14px",
          fontWeight: "bold",
          background: "transparent",
          // Attempt both:
          color: "#fff", // ApexCharts 'color' property
          fill: "#fff", // The actual SVG fill
        },
      },
    })),
  },
  background: {
    enabled: true,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fff",
    dropShadow: {
      enabled: true,
      top: 1,
      left: 1,
      blur: 2,
      color: "#999",
      opacity: 0.4,
    },
  },
  xaxis: {
    categories,
    labels: { style: { fontSize: "14px", fontWeight: 600 } },
  },
  yaxis: {
    labels: { style: { fontSize: "14px", fontWeight: 600 } },
  },
  grid: {
    borderColor: "#e7e7e7",
    strokeDashArray: 5,
  },
  legend: { show: false },
};

const BarChartWithPOPs: React.FC = () => {
  // OPTIONAL: If the chart re-renders in some weird loop
  // and still resets the color to gray, you can absolutely
  // brute force it by enabling a recurring check:

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     forceWhiteAnnotationLabels();
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="p-6 bg-white dark:bg-[#122031] shadow-lg rounded-xl border border-gray-300 dark:border-gray-700">
      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
        CRA Approval & Coverage Statistics
      </h3>
      <div className="relative">
        <ReactApexChart
          options={options}
          series={[{ name: "Value", data: values }]}
          type="bar"
          height={350}
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-around gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Total Incentive Coverage (MIRR)
            <div className="mt-1 text-xs font-A text-gray-400 ">(If totally test and delivered to CRA & approved)</div>          </div>
          <div className="mt-1 text-xl font-bold text-primary">
            {statsData.TotalIncentiveCoverage.toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Approved Incentive Coverage Amount (MIRR)
          </div>
          <div className="mt-1 text-xl font-bold text-primary">
            {statsData.ApprovedIncentiveCoverage.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChartWithPOPs;
