"use client";

import React, { useEffect, useState } from "react";
import { OSS_PROGRESS_DATA } from "@/data/ossProgressData";
import { FaDatabase, FaLink, FaClipboardList, FaCheckCircle } from "react-icons/fa";

// Your Primary Color
const PRIMARY_COLOR = "#FFCC00"; // Yellow for totals
const COMPLETION_COLOR = "#f87171"; // Red for completion rate

// Reusable animated counter
const AnimatedNumber: React.FC<{ target: number; duration?: number }> = ({
  target,
  duration = 800,
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
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
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
};

interface AnimatedIconFillProps {
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  percentage: number; // value from 0 to 100
  size?: number;
  overrideColor?: string;
}

const AnimatedIconFill: React.FC<AnimatedIconFillProps> = ({
  Icon,
  percentage,
  size = 48,
  overrideColor,
}) => {
  const [fill, setFill] = useState(0);

  // Animate fill from 0 to target percentage after a slight delay (500ms)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFill(percentage);
    }, 500);
    return () => clearTimeout(timeout);
  }, [percentage]);

  // Use the override color if provided; otherwise, determine color by percentage.
  const fillColor = overrideColor
    ? overrideColor
    : fill < 50
    ? "#f87171"
    : fill < 75
    ? "#fbbf24"
    : "#22c55e";

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: "relative",
  };

  const iconStyle: React.CSSProperties = {
    width: size,
    height: size,
  };

  return (
    <div style={containerStyle}>
      {/* Base icon in light gray */}
      <Icon
        style={{
          ...iconStyle,
          color: "#e5e7eb",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      {/* Animated overlay showing “fill” */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          overflow: "hidden",
          clipPath: `inset(${100 - fill}% 0 0 0)`,
          transition: "clip-path 2.5s ease-in-out",
        }}
      >
        <Icon
          style={{
            ...iconStyle,
            color: fillColor,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>
    </div>
  );
};

const OSSProgress: React.FC = () => {
  // Progress metrics (displayed as percentages)
  const progressData = [
    {
      label: "Overall Data Entry",
      value: OSS_PROGRESS_DATA.Progress.DataEntry, // assumed percentage
      icon: FaDatabase,
    },
    {
      label: "Overall Fusion Splicing",
      value: OSS_PROGRESS_DATA.Progress.FusionSplicing, // assumed percentage
      icon: FaLink,
    },
  ];

  // Request stats (totals)
  const requestStats = [
    {
      label: "Total Requests on OSS",
      value: OSS_PROGRESS_DATA.Requests.TotalRequests,
      icon: FaClipboardList,
    },
    {
      label: "Total Completed",
      value: OSS_PROGRESS_DATA.Requests.Completed,
      icon: FaCheckCircle,
    },
  ];

  // Compute the completion rate (percentage of requests completed)
  const totalRequests = OSS_PROGRESS_DATA.Requests.TotalRequests;
  const totalCompleted = OSS_PROGRESS_DATA.Requests.Completed;
  const completionRate =
    totalRequests > 0 ? Math.round((totalCompleted / totalRequests) * 100) : 0;

  // Card container classes with hover border animation (using primary color)
  const cardClass = `p-6 bg-white dark:bg-[#122031] rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 flex flex-col items-center hover:border-[${PRIMARY_COLOR}] transition-all duration-300`;

  return (
    <div className="space-y-8">
      {/* Progress Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {progressData.map(({ label, value, icon: Icon }) => (
          <div key={label} className={cardClass}>
            <AnimatedIconFill Icon={Icon} percentage={value} size={48} />
            <h3 className="mt-3 text-xl font-semibold text-gray-800 dark:text-white text-center">
              {label}
            </h3>
            <div className="mt-4 text-3xl font-bold text-gray-800 dark:text-white">
              <AnimatedNumber target={value} duration={800} />
              <span className="ml-1">%</span>
            </div>
          </div>
        ))}
      </div>
      {/* Request Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {requestStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={cardClass}>
            {/* For these cards, the icon is fully filled with the primary color */}
            <AnimatedIconFill
              Icon={Icon}
              percentage={100}
              size={48}
              overrideColor={PRIMARY_COLOR}
            />
            <h3 className="mt-3 text-xl font-semibold text-gray-800 dark:text-white text-center">
              {label}
            </h3>
            <div className="mt-4 text-3xl font-bold text-gray-800 dark:text-white">
              <AnimatedNumber target={value} duration={800} />
            </div>
          </div>
        ))}
        {/* Additional Card: Completion Rate */}
        <div className={cardClass}>
          <AnimatedIconFill
            Icon={FaCheckCircle}
            percentage={completionRate}
            size={48}
            overrideColor={COMPLETION_COLOR} // Use red for Completion Rate
          />
          <h3 className="mt-3 text-xl font-semibold text-gray-800 dark:text-white text-center">
            Completion Rate
          </h3>
          <div className="mt-4 text-3xl font-bold text-gray-800 dark:text-white">
            <span>{completionRate}</span>
            <span className="ml-1">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSSProgress;
