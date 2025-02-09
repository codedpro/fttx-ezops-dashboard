"use client";

import React from "react";
import { FaCity } from "react-icons/fa";
import { MdOutlineFiberSmartRecord } from "react-icons/md";
import { FTTX_SALES_PROGRESS_DATA } from "@/data/fttxSalesProgressData";

const FTTHSalesCities: React.FC = () => {
  const cities = FTTX_SALES_PROGRESS_DATA.Cities;
  const cityCount = cities.length;

  return (
    <div
    className="relative h-full p-6 overflow-hidden rounded-lg bg-[#f4f4f5] dark:bg-[#122031] bg-grid-black/[0.05] dark:bg-grid-white/[0.02] shadow-md hover:shadow-lg transform transition-transform group border border-gray-300 dark:border-gray-700"
    >
      {/* Background Overlay (Layer behind content) */}
      <div className="absolute z-0 inset-0 flex items-center justify-center dark:bg-[#122031] bg-[#f4f4f5] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none"></div>

      <div className="relative flex items-center gap-4 mb-5 flex-wrap z-20">
        <MdOutlineFiberSmartRecord className="text-gray-700 dark:text-yellow-400 text-2xl" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-yellow-300 whitespace-nowrap overflow-hidden overflow-ellipsis max-w-full">
          Cities Delivering FTTH Service by Irancell ({cityCount}) :
        </h3>
      </div>

      {/* Cities List */}
      <div className="relative flex flex-wrap gap-3 z-20">
        {cities.map((city) => (
          <div
            key={city}
            className="flex items-center gap-3 px-5 py-3 rounded-lg bg-gray-200 dark:bg-[#243b55] text-base text-gray-800 dark:text-yellow-200 shadow-md max-w-full truncate"
          >
            <FaCity className="text-gray-700 dark:text-yellow-300 text-lg" />
            <span className="truncate">{city}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FTTHSalesCities;
