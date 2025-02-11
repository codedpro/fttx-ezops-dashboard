"use client";

import React, { useEffect, useState } from "react";
import { SITE_ENTRY_PROGRESS_DATA } from "@/data/siteEntryProgress";
import {
  FaBroadcastTower,
  FaSatelliteDish,
  FaTools,
  FaCheckCircle,
} from "react-icons/fa";

// Define the type properly to prevent TypeScript errors
interface SiteData {
  label: string;
  value: number;
  icon: React.ElementType;
  description?: string;
}

const siteProgressData: { title: string; data: SiteData[] }[] = [
  {
    title: "In-House Progress",
    data: [
      {
        label: "Total Sites",
        value: SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.TotalSitesInHouse,
        icon: FaBroadcastTower,
      },
      {
        label: "Go Live",
        value: SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.GoLiveInHouse,
        icon: FaSatelliteDish,
      },
      {
        label: "Cut Over",
        value: SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.CutOverInHouse,
        icon: FaTools,
      },
      {
        label: "OPS Approval",
        value:
          SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.OPSApprovalInHouse.Value,
        description: `(Go Live: ${SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.OPSApprovalInHouse.Value})`,
        icon: FaCheckCircle,
      },
    ],
  },
  {
    title: "FCPs Progress",
    data: [
      {
        label: "Total Sites",
        value: SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.TotalSitesFCPs,
        icon: FaBroadcastTower,
      },
      {
        label: "Go Live",
        value: SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.GoLiveFCPs,
        icon: FaSatelliteDish,
      },
      {
        label: "Cut Over",
        value: SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.CutOverFCPs,
        icon: FaTools,
      },
      {
        label: "OPS Approval",
        value: SITE_ENTRY_PROGRESS_DATA.SiteEntryProgress.OPSApprovalFCPs,
        icon: FaCheckCircle,
      },
    ],
  },
];

// Random animation duration (3-5s)
const getRandomDuration = () =>
  Math.floor(Math.random() * (3000 - 3000 + 1) + 1000);

// Animated counter logic
const AnimatedNumber: React.FC<{ target: number }> = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = getRandomDuration();
    const increment = target / (duration / 16); // Approximate frames

    const updateCounter = () => {
      start += increment;
      if (start >= target) {
        setCount(target);
      } else {
        setCount(Math.floor(start));
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [target]);

  return <span>{count}</span>;
};

const SiteEntryCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {siteProgressData.map(({ title, data }) => (
        <div
          key={title}
          className="relative p-6 overflow-hidden rounded-lg bg-white dark:bg-[#122031]  absolute inset-0 z-0 animate-grid-move bg-grid-black/[0.1] dark:bg-grid-white/[0.05]
          "
         >
          {/* Background Overlay */}
          <div
            className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-[#122031] bg-white 
            [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
          ></div>

          {/* Card Title */}
          <h3 className="relative z-10 text-center text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {title}
          </h3>

          {/* Data Items */}
          <div className="relative z-10 space-y-4">
            {data.map(({ label, value, description, icon: Icon }) => (
              // Added "group" class here so that its children can use group-hover
              <div
                key={label}
                className="group flex items-center justify-between p-4 rounded-lg shadow-sm bg-gray-100/50 dark:bg-gray-900/50 transition-colors hover:bg-gray-200/70 dark:hover:bg-gray-800/70"
              >
                <div className="flex items-center gap-3">
                  {/* The icon will rotate on group hover */}
                  <div className="transition-transform duration-500 group-hover:animate-rotate-shine">
                    <Icon className="text-primary text-3xl" />
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {label}{" "}
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {description || ""}
                    </span>
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  <AnimatedNumber target={value} />
                </div>
              </div>
            ))}
          </div>

          {/* Hover Border Effect */}
          <div className="absolute inset-0 border-2 border-transparent rounded-lg transition-colors group-hover:border-primary"></div>
        </div>
      ))}
    </div>
  );
};

export default SiteEntryCards;
